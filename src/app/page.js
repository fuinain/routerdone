import { APP_CONFIG } from "@/shared/constants/config";

const endpoints = [
  { path: "/v1/models", label: "List models" },
  { path: "/v1/chat/completions", label: "Chat completions" },
  { path: "/v1/messages", label: "Anthropic-compatible messages" },
  { path: "/api/health", label: "Health check" },
];

const curlExample = `curl http://localhost:20128/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

export default function PublicGatewayPage() {
  return (
    <main className="min-h-screen bg-bg text-text-main">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              API Gateway
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-text-main sm:text-4xl">
              {APP_CONFIG.name}
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-main shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
            Operational
          </div>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-lg leading-8 text-text-muted">
              OpenAI-compatible endpoint for authorized RouterDone customers.
              Use the base URL below with your issued API key.
            </p>

            <div className="mt-8 rounded-lg border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm font-medium text-text-muted">Base URL</p>
              <code className="mt-3 block break-all rounded-md bg-surface-2 px-4 py-3 text-base font-semibold text-primary">
                http://localhost:20128/v1
              </code>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {endpoints.map((endpoint) => (
                <div key={endpoint.path} className="rounded-md border border-border bg-surface p-4">
                  <p className="text-sm text-text-muted">{endpoint.label}</p>
                  <code className="mt-2 block break-all text-sm font-semibold text-text-main">
                    {endpoint.path}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-[#101010] p-5 shadow-elevated dark:bg-surface">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Quick test</p>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70">
                v{APP_CONFIG.gatewayVersion}
              </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-gray-100">
              <code>{curlExample}</code>
            </pre>
          </div>
        </div>

        <footer className="border-t border-border pt-5 text-sm text-text-muted">
          For API access, use the key and model names provided by RouterDone.
        </footer>
      </section>
    </main>
  );
}
