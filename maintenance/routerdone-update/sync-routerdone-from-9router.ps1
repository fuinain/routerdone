# sync-routerdone-from-9router.ps1
# Update RouterDone source from a new upstream 9Router release.
#
# Usage:
#   .\sync-routerdone-from-9router.ps1                          # latest npm version
#   .\sync-routerdone-from-9router.ps1 -UpstreamVersion 0.5.9   # specific version
#   .\sync-routerdone-from-9router.ps1 -DryRun                  # clone+patch only, no copy

param(
  [string]$UpstreamVersion = "",
  [string]$UpstreamRepo = "https://github.com/decolua/9router.git",
  [string]$TempDir = "$env:TEMP\routerdone-upstream-sync",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot          # routerdone/
$PatchesDir = Join-Path $RepoRoot "patches"

if (!$UpstreamVersion) {
  Write-Host "Fetching latest 9router version from npm..." -ForegroundColor Cyan
  $UpstreamVersion = (npm view 9router version 2>$null).Trim()
  if (!$UpstreamVersion) { throw "Cannot determine latest 9router version." }
}
Write-Host "Upstream version: $UpstreamVersion" -ForegroundColor Green

# 1. Clone fresh upstream
if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir }
Write-Host "Cloning upstream v$UpstreamVersion..." -ForegroundColor Cyan
git clone --depth 1 --branch "v$UpstreamVersion" $UpstreamRepo $TempDir 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "git clone failed for v$UpstreamVersion" }
Remove-Item -Recurse -Force (Join-Path $TempDir ".git") -ErrorAction SilentlyContinue

# 2. Apply main patch
Write-Host "Applying routerdone-custom.patch..." -ForegroundColor Cyan
Push-Location $TempDir
git apply (Join-Path $PatchesDir "routerdone-custom.patch") 2>&1
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "Main patch failed. Rebase against v$UpstreamVersion." }

# 3. Apply feature patches in order (zzz-scored BEFORE zzza-progressive)
$ordered = @(
  "console-log-retention.patch",
  "force-stream-fix.patch",
  "provider-auto-heal.patch",
  "quota-auto-manage.patch",
  "z-adaptive-timeout-v2.patch",
  "zz-runtime-observability.patch",
  "zzz-scored-rtk.patch",
  "zzza-progressive-rtk.patch",
  "zzzzb-quota-default-provider.patch",
  "zzzzc-stream-error-fallback.patch",
  "zzzzd-redirect-gpt54mini-to-combo.patch",
  "zzzze-model-redirect-ui.patch",
  "zzzzf-sanitize-tool-call-arguments.patch",
  "zzzzg-normalize-output-text-content.patch",
  "zzzzh-gmt7-console-timestamps.patch",
  "zzzzi-compatible-custom-model-selector.patch"
)
foreach ($name in $ordered) {
  $p = Join-Path $PatchesDir "features\$name"
  if (!(Test-Path $p)) { Write-Host "  SKIP (not found): $name" -ForegroundColor Yellow; continue }
  Write-Host "Applying $name..." -NoNewline -ForegroundColor Cyan
  git apply $p 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { Write-Host " OK" -ForegroundColor Green }
  else { Write-Host " FAILED" -ForegroundColor Red; Pop-Location; throw "Patch failed: $name. Rebase against v$UpstreamVersion." }
}
Pop-Location

# 4. Rebrand (see REBRAND_RULES.md)
Write-Host "Rebranding 9Router -> RouterDone..." -ForegroundColor Cyan
$rebrandFiles = Get-ChildItem $TempDir -Recurse -File -Include "*.js","*.json","*.mjs","*.md","*.yml","*.sh","*.svg" |
  Where-Object { $_.FullName -notmatch "node_modules|\.next" }
foreach ($f in $rebrandFiles) {
  $t = Get-Content -LiteralPath $f.FullName -Raw
  $t = $t.Replace("https://llm.biz100m.com", "http://localhost:20128")
  $t = $t.Replace("llm.biz100m.com", "localhost:20128")
  $t = $t.Replace("Biz100M LLM Gateway", "RouterDone")
  $t = $t.Replace("Biz100M Gateway", "RouterDone")
  $t = $t.Replace("Biz100M customers", "RouterDone users")
  $t = $t.Replace("Biz100M", "RouterDone")
  $t = $t.Replace("llmGateway", "routerdone")
  $t = $t.Replace("llmgateway", "routerdone")
  $t = $t.Replace("thoa100m", "routerdone")
  $t = $t.Replace("9Router", "RouterDone")
  $t = $t.Replace("9router", "routerdone")
  $t = $t.Replace("gpt-5.5.fallback", "helper.fallback")
  $t = $t.Replace("9ROUTER", "ROUTERDONE")
  Set-Content -LiteralPath $f.FullName -Value $t -NoNewline -Encoding UTF8
}

# 5. Update package.json port + scripts
$pkgPath = Join-Path $TempDir "package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.scripts.dev = "next dev --webpack --port 20128"
$pkg.scripts.build = "next build --webpack"
$pkg.scripts.start = "next start -p 20128"
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8

if ($DryRun) {
  Write-Host "DryRun: source ready at $TempDir. Review then re-run without -DryRun." -ForegroundColor Yellow
  return
}

# 6. Copy updated source into routerdone
Write-Host "Copying updated source to $RepoRoot..." -ForegroundColor Cyan
$copyDirs = @("src", "open-sse", "public", "tests")
foreach ($d in $copyDirs) {
  $src = Join-Path $TempDir $d
  $dst = Join-Path $RepoRoot $d
  if (Test-Path $src) {
    if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
    Copy-Item -Recurse -Force $src $dst
  }
}
foreach ($f in @("package.json", "next.config.mjs", "postcss.config.mjs", "jsconfig.json", "eslint.config.mjs", "custom-server.js")) {
  $src = Join-Path $TempDir $f
  if (Test-Path $src) { Copy-Item -Force $src (Join-Path $RepoRoot $f) }
}

Write-Host "Done. Run verify checklist: maintenance/routerdone-update/VERIFY_CHECKLIST.md" -ForegroundColor Green
