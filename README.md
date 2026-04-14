# Painel da Operacao

Painel interno para supervisores e administradores com:

- login por perfil (`supervisor` e `admin`)
- comunicados gerais
- comunicados por setor
- caixa de e-mails da supervisao
- sincronizacao com Gmail
- anexos armazenados localmente

## Rodando localmente

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Variaveis de ambiente principais

Preencha no `.env`:

```env
AUTH_SECRET=
SUPERVISOR_PASSWORD=
ADMIN_PASSWORD=

SUPERVISAO_EMAIL=supervisao@shopper.com.br
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/emails/oauth/callback

EMAIL_SYNC_INTERVAL_MINUTES=5
EMAIL_CRON_TOKEN=
```

Opcional para deploy:

```env
DATA_DIR=/app/data
```

## Estrutura de persistencia

O projeto usa:

- SQLite em `data/painel.db`
- anexos de e-mail em `data/email-attachments/`

Em ambiente online, esse diretório precisa estar em um volume persistente.

## Deploy recomendado

Para o estado atual do projeto, a opcao recomendada e Railway com volume persistente.

Leia:

- [docs/agendamento-emails.md](./docs/agendamento-emails.md)
- [docs/deploy-railway.md](./docs/deploy-railway.md)
