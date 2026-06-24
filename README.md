# RouterDone

RouterDone is an OpenAI-compatible local AI gateway and routing dashboard. It lets you add upstream providers, create routing combos, expose `/v1/*` endpoints, and route helper models through a neutral fallback combo.

This repository is intended to be a clean public export. It contains no prior git history from the private `llmGateway` source repository.

## Quick Start With Docker Compose

1. Create an `.env` file:

```bash
cp .env.example .env
```

2. Replace the required secrets:

```bash
JWT_SECRET=$(openssl rand -hex 32)
INITIAL_PASSWORD=change-this-admin-password
API_KEY_SECRET=$(openssl rand -hex 32)
MACHINE_ID_SALT=$(openssl rand -hex 32)
```

On Windows PowerShell:

```powershell
$env:JWT_SECRET = -join ((1..64) | ForEach-Object { "{0:x}" -f (Get-Random -Max 16) })
```

3. Start RouterDone:

```bash
docker compose up --build -d
```

4. Open:

```text
http://localhost:20128
```

5. Health check:

```bash
curl http://localhost:20128/api/health
```

## Local Development

```bash
npm install
npm run dev
```

Default dev URL:

```text
http://localhost:20128
```

Production build:

```bash
npm run build
npm run start
```

## Basic API Flow

1. Sign in with `INITIAL_PASSWORD`.
2. Open the dashboard.
3. Add a provider and credentials.
4. Create a combo.
5. Create or copy an API key.
6. Call the OpenAI-compatible endpoint:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ROUTERDONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-provider/your-model",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Model Redirect

RouterDone supports model redirects for helper or auxiliary model names. A redirect maps one incoming model name to another model or combo.

Public default:

```text
gpt-5.4-mini -> helper.fallback
```

Recommended setup:

1. Add one or more providers.
2. Create a combo named `helper.fallback`.
3. Put a cheap, available helper model in that combo.
4. Open `Dashboard -> Profile -> Model Redirect`.
5. Keep or add redirects that point auxiliary models to `helper.fallback`.

Do not hardcode private combo names in a public deployment. Use neutral names such as `helper.fallback`, `coding.fallback`, or `vision.fallback`.

## Docker Compose

The included `docker-compose.yml` persists:

```text
/app/data
/app/data-home
```

Required env vars:

```text
JWT_SECRET
INITIAL_PASSWORD
API_KEY_SECRET
MACHINE_ID_SALT
```

Common env vars:

```text
PORT=20128
NODE_ENV=production
TZ=UTC
BASE_URL=http://localhost:20128
NEXT_PUBLIC_BASE_URL=http://localhost:20128
REQUIRE_API_KEY=false
ENABLE_REQUEST_LOGS=false
OBSERVABILITY_ENABLED=true
```

## Dokploy

Use the repository as a Docker Compose app in Dokploy.

1. Create a new Dokploy application.
2. Select Docker Compose.
3. Use `docker-compose.yml`.
4. Set environment variables from `.env.example`.
5. Set `BASE_URL` and `NEXT_PUBLIC_BASE_URL` to your public app URL.
6. Use persistent volumes for `/app/data` and `/app/data-home`.
7. Deploy, then verify `/api/health`.

For public HTTPS deployments:

```text
AUTH_COOKIE_SECURE=true
REQUIRE_API_KEY=true
BASE_URL=https://your-domain.example
NEXT_PUBLIC_BASE_URL=https://your-domain.example
```

## Data And Privacy

Do not commit:

```text
.env
data/
logs/
.next/
node_modules/
*.sqlite
*.db
downloads/
screenshots/
```

Before publishing, run:

```bash
rg -n -i "biz100m|llmgateway|thoa100m|llm\.biz100m|gpt-5\.5\.fallback" .
rg -n -i "sk-[a-z0-9_-]{16,}|api[_-]?key|oauth.*secret|password|token" .
```

Expected result: no private owner names, no real secrets, no private domains.

## Build

```bash
docker build -t routerdone .
docker run --rm -p 20128:20128 --env-file .env \
  -v routerdone-data:/app/data \
  -v routerdone-data-home:/app/data-home \
  routerdone
```

Smoke test:

```bash
curl http://localhost:20128/api/health
curl http://localhost:20128/v1/models -H "Authorization: Bearer YOUR_ROUTERDONE_API_KEY"
```

## Updating From Upstream

RouterDone keeps update rules in one place:

```text
maintenance/routerdone-update/
```

When upstream 9Router releases a new version, start with:

```powershell
.\maintenance\routerdone-update\sync-routerdone-from-9router.ps1 -DryRun
```

Then follow `README.md`, `PATCH_ORDER.md`, `REBRAND_RULES.md`, and `VERIFY_CHECKLIST.md` in that folder before publishing.

## License

MIT. Keep upstream attribution in `LICENSE`.
