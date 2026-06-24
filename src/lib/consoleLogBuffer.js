import { EventEmitter } from "events";
import { CONSOLE_LOG_CONFIG } from "@/shared/constants/config.js";

const consoleLevels = ["log", "info", "warn", "error", "debug"];
const DEFAULT_RETENTION_MS = CONSOLE_LOG_CONFIG.defaultRetentionMs;

if (!global._consoleLogBufferState) {
  global._consoleLogBufferState = {
    logs: [],
    patched: false,
    originals: {},
    emitter: new EventEmitter(),
    retentionMs: DEFAULT_RETENTION_MS,
    pruneTimer: null,
  };
  global._consoleLogBufferState.emitter.setMaxListeners(50);
}

const state = global._consoleLogBufferState;

// Ensure emitter exists (handles hot reload with stale global)
if (!state.emitter) {
  state.emitter = new EventEmitter();
  state.emitter.setMaxListeners(50);
}
if (state.retentionMs === undefined) state.retentionMs = DEFAULT_RETENTION_MS;

function normalizeLogEntries() {
  const now = Date.now();
  state.logs = state.logs.map((entry) => typeof entry === "string" ? { line: entry, createdAt: now } : entry);
}

normalizeLogEntries();

function toLogLine(level, args) {
  return args.map(formatArg).join(" ");
}

// Strip ANSI escape codes so terminal colors don't bleed into UI
const ANSI_RE = /\x1b\[[0-9;]*m/g;

function stripAnsi(str) {
  return str.replace(ANSI_RE, "");
}

function formatArg(arg) {
  if (typeof arg === "string") return stripAnsi(arg);
  if (arg instanceof Error) return stripAnsi(arg.stack || arg.message || String(arg));
  try {
    return stripAnsi(JSON.stringify(arg));
  } catch {
    return stripAnsi(String(arg));
  }
}

function appendLine(line) {
  pruneExpiredLogs(false);
  state.logs.push({ line, createdAt: Date.now() });
  const maxLines = CONSOLE_LOG_CONFIG.maxLines;
  if (state.logs.length > maxLines) {
    state.logs = state.logs.slice(-maxLines);
  }
  state.emitter.emit("line", line);
}

function getLogLines() {
  return state.logs.map((entry) => entry.line);
}

function pruneExpiredLogs(emit = true) {
  const retentionMs = Number(state.retentionMs) || 0;
  if (retentionMs <= 0) return 0;

  const cutoff = Date.now() - retentionMs;
  const before = state.logs.length;
  state.logs = state.logs.filter((entry) => {
    return entry.createdAt >= cutoff;
  });

  const removed = before - state.logs.length;
  if (removed > 0 && emit) {
    state.emitter.emit("prune", getLogLines());
  }
  return removed;
}

function ensurePruneTimer() {
  if (state.pruneTimer) return;
  state.pruneTimer = setInterval(() => pruneExpiredLogs(true), CONSOLE_LOG_CONFIG.pruneIntervalMs);
  if (typeof state.pruneTimer.unref === "function") state.pruneTimer.unref();
}

export function initConsoleLogCapture() {
  ensurePruneTimer();
  if (state.patched) return;

  for (const level of consoleLevels) {
    state.originals[level] = console[level];
    console[level] = (...args) => {
      appendLine(toLogLine(level, args));
      state.originals[level](...args);
    };
  }

  state.patched = true;
}

export function getConsoleLogs() {
  pruneExpiredLogs(false);
  return getLogLines();
}

export function clearConsoleLogs() {
  const cutoff = Date.now() - CONSOLE_LOG_CONFIG.clearPreserveMs;
  state.logs = state.logs.filter((entry) => typeof entry !== "string" && entry.createdAt >= cutoff);
  if (state.logs.length > 0) {
    state.emitter.emit("prune", getLogLines());
  } else {
    state.emitter.emit("clear");
  }
}

export function setConsoleLogRetentionMs(retentionMs) {
  const next = Math.max(0, Number(retentionMs) || 0);
  state.retentionMs = next;
  ensurePruneTimer();
  pruneExpiredLogs(true);
}

export function getConsoleEmitter() {
  return state.emitter;
}
