# Dokploy Deployment

Deploy RouterDone as a Docker Compose application.

## Required Settings

Use `docker-compose.yml` as the compose file.

Set these environment variables:

```text
JWT_SECRET=replace-with-openssl-rand-hex-32
INITIAL_PASSWORD=replace-with-a-long-admin-password
API_KEY_SECRET=replace-with-openssl-rand-hex-32
MACHINE_ID_SALT=replace-with-openssl-rand-hex-32
NODE_ENV=production
PORT=20128
TZ=UTC
DATA_DIR=/app/data
BASE_URL=https://your-routerdone-domain.example
NEXT_PUBLIC_BASE_URL=https://your-routerdone-domain.example
AUTH_COOKIE_SECURE=true
REQUIRE_API_KEY=true
```

## Persistent Volumes

Persist both paths:

```text
/app/data
/app/data-home
```

## Verify

After deploy:

```bash
curl https://your-routerdone-domain.example/api/health
```

Then sign in, add a provider, create a combo, and call `/v1/chat/completions`.
