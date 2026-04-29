# Deploy com Vercel e Render

## Arquitetura

- `apps/frontend`: publicado na Vercel
- `apps/backend`: publicado no Render
- frontend continua chamando `/api/*`
- a Vercel reescreve `/api/*` para o backend usando `BACKEND_URL`

## Frontend na Vercel

### Root directory

```text
apps/frontend
```

### Variaveis

```env
AUTH_SECRET=mesmo-valor-do-backend
BACKEND_URL=https://SEU-BACKEND.onrender.com
```

## Backend no Render

### Root directory

```text
apps/backend
```

### Variaveis

```env
AUTH_SECRET=mesmo-valor-do-frontend
ADMIN_USERNAME=
ADMIN_PASSWORD=
DATA_DIR=/var/data
SUPERVISAO_EMAIL=supervisao@shopper.com.br
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://SEU-BACKEND.onrender.com/api/emails/oauth/callback
EMAIL_CRON_TOKEN=
FRONTEND_URL=https://SEU-FRONTEND.vercel.app
```

## Fluxo recomendado

1. Publicar o backend no Render
2. Anotar a URL publica do backend
3. Publicar o frontend na Vercel com `BACKEND_URL`
4. Validar login e comunicados
5. Configurar o OAuth do Gmail com `GOOGLE_REDIRECT_URI` do backend
6. Testar sincronizacao de e-mails

## Observacoes

- `AUTH_SECRET` deve ser exatamente o mesmo no frontend e no backend
- o backend deve manter disco persistente para SQLite e anexos
- o callback do Gmail volta para o frontend usando `FRONTEND_URL`
