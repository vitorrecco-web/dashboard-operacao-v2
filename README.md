# Painel da Operacao Monorepo

Repositorio reorganizado para separar frontend e backend.

## Estrutura

```text
apps/
  frontend/   Next.js para Vercel
  backend/    API para Render
packages/
  shared/     Tipos e utilitarios compartilhados
docs/
```

## Estado atual

- o projeto Next.js foi movido para `apps/frontend`
- a API foi movida para `apps/backend`
- o backend ainda esta em fase de transicao e possui codigo duplicado temporariamente

## Comandos principais

```bash
npm run dev:local
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run build:backend
npm run lint:frontend
npm run lint:backend
npm run typecheck:frontend
```

## Variaveis de ambiente importantes

### Frontend

Em `apps/frontend/.env.local`:

```env
AUTH_SECRET=
BACKEND_URL=http://localhost:4000
```

`BACKEND_URL` permite que o Next do frontend reescreva `/api/*` para o backend separado.
No ambiente local, use `http://localhost:4000`.

### Backend

Em `apps/backend/.env.local`:

```env
AUTH_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
DATA_DIR=./data
SUPERVISAO_EMAIL=supervisao@shopper.com.br
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
EMAIL_CRON_TOKEN=
FRONTEND_URL=http://localhost:3000
```

`FRONTEND_URL` e usado pelo backend para redirecionar o fluxo OAuth do Gmail de volta para a interface publicada na Vercel.
No ambiente local, use `http://localhost:3000`.

## Proximos passos

1. Fazer o frontend consumir `NEXT_PUBLIC_API_BASE_URL` ou rewrites da Vercel
2. Remover duplicacao de `lib`, `data` e `types` entre apps
3. Mover autenticacao e contratos compartilhados para `packages/shared`
4. Configurar Vercel para o frontend e Render para o backend
