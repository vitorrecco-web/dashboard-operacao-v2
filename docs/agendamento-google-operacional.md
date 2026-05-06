# Agendamento de KPIs e documentos do Google

## Objetivo

Manter o cache de KPIs e PDFs dos setores atualizado sem clique manual de supervisor.

## Endpoint

`GET /api/google-cache/cron`

Autenticacao:

- header `Authorization: Bearer <GOOGLE_CACHE_CRON_TOKEN>`
- ou query string `?token=<GOOGLE_CACHE_CRON_TOKEN>`

Se `GOOGLE_CACHE_CRON_TOKEN` nao existir, a rota tambem aceita `EMAIL_CRON_TOKEN`.

## Intervalo recomendado

Para operacao interna, configure a chamada automatica a cada 60 minutos.

## Variaveis obrigatorias no backend

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_KPI_SPREADSHEET_ID=
GOOGLE_CACHE_CRON_TOKEN=
```

Tambem mantenha as variaveis `GOOGLE_DRIVE_FOLDER_*` dos setores que devem listar PDFs.

## Observacao importante

O `GOOGLE_REFRESH_TOKEN` deve ficar salvo no ambiente do backend. Sem ele, o sistema nao consegue consultar Google Sheets ou Google Drive, mesmo com agendamento ativo.
