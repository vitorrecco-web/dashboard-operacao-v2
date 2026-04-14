# Deploy na Railway

## Recomendacao

Para este projeto, a Railway e a melhor opcao de beta interno porque:

- executa bem Next.js
- aceita volume persistente
- permite chamadas HTTP agendadas
- funciona com SQLite e anexos locais sem refatoracao imediata

## O que precisa existir

### 1. Repositorio com o projeto

Suba o projeto para GitHub.

### 2. Projeto na Railway

Na Railway:

1. Crie um novo projeto
2. Conecte ao repositório
3. Configure o serviço web principal

## Comandos esperados

Build:

```text
npm install && npm run build
```

Start:

```text
npm start
```

O projeto ja foi preparado para iniciar com:

```text
next start -H 0.0.0.0
```

## Volume persistente

Crie um volume e monte no container em:

```text
/app/data
```

Depois configure a variavel:

```env
DATA_DIR=/app/data
```

Isso garante persistencia para:

- `painel.db`
- `email-attachments/`

## Variaveis de ambiente

Configure na Railway:

```env
NODE_ENV=production
AUTH_SECRET=defina-um-segredo-forte
SUPERVISOR_PASSWORD=supervisor
ADMIN_PASSWORD=admin

SUPERVISAO_EMAIL=supervisao@shopper.com.br
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_REDIRECT_URI=https://SEU-DOMINIO/api/emails/oauth/callback

EMAIL_SYNC_INTERVAL_MINUTES=5
EMAIL_CRON_TOKEN=defina-um-token-forte
DATA_DIR=/app/data
```

## Dominio publico

Quando a Railway gerar a URL publica do projeto:

1. copie a URL
2. atualize `GOOGLE_REDIRECT_URI`
3. adicione essa URL no Google Cloud Console como redirect autorizado

Exemplo:

```env
GOOGLE_REDIRECT_URI=https://painel-operacao.up.railway.app/api/emails/oauth/callback
```

## Cron de sincronizacao

A rota pronta para cron e:

```text
GET /api/emails/cron
```

Ela aceita:

- `Authorization: Bearer <EMAIL_CRON_TOKEN>`
- ou `?token=<EMAIL_CRON_TOKEN>`

## Formas de agendar

Voce pode usar:

- cron da propria plataforma, se disponivel
- UptimeRobot
- EasyCron
- outro agendador HTTP externo

Intervalo recomendado:

```text
a cada 5 minutos
```

## Fluxo de publicacao sugerido

1. Subir o projeto
2. Configurar volume
3. Configurar variaveis
4. Publicar
5. Ajustar `GOOGLE_REDIRECT_URI`
6. Revalidar conexao do Gmail
7. Configurar cron HTTP
8. Testar com 1 admin e 1 supervisor

## Checklist de beta interno

- login de supervisor funciona
- login de admin funciona
- admin acessa todos os setores
- supervisor nao acessa admin
- comunicados gerais funcionam
- comunicados por setor funcionam
- e-mails sincronizam
- anexos abrem
- volume realmente persiste apos restart
