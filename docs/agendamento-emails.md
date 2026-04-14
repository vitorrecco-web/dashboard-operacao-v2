# Agendamento de Sincronizacao de E-mails

## Estrategia atual

O projeto agora combina dois mecanismos:

- auto-sync ao abrir a caixa de e-mails, respeitando um intervalo minimo
- endpoint seguro para agendamento externo via cron HTTP

## Variaveis de ambiente

Defina no ambiente de execucao:

```env
EMAIL_SYNC_INTERVAL_MINUTES=5
EMAIL_CRON_TOKEN=troque-por-um-token-forte
```

## Endpoint de cron

Rota:

`GET /api/emails/cron`

Autenticacao aceita:

- header `Authorization: Bearer <EMAIL_CRON_TOKEN>`
- ou query string `?token=<EMAIL_CRON_TOKEN>`

## Recomendacao de uso em ambiente online

Se o painel for hospedado em uma plataforma online, configure um job externo para chamar:

`https://seu-dominio.com/api/emails/cron`

Intervalo recomendado:

- a cada 5 minutos

## Exemplo de chamada

Header:

```bash
curl -H "Authorization: Bearer SEU_TOKEN" https://seu-dominio.com/api/emails/cron
```

Query string:

```bash
curl https://seu-dominio.com/api/emails/cron?token=SEU_TOKEN
```

## Comportamento

- se a ultima sincronizacao ainda estiver recente, o endpoint nao refaz o sync
- se estiver vencida, executa a sincronizacao
- se outro sync estiver em andamento, a rotina e ignorada temporariamente por lock

## Onde configurar o cron

Algumas opcoes comuns:

- Vercel Cron Jobs
- UptimeRobot com chamadas HTTP agendadas
- EasyCron
- cron do servidor ou container
- Render cron jobs
- Railway scheduled jobs

## Observacao

Mesmo com cron ativo, o painel continua sincronizando ao abrir a caixa se detectar dados desatualizados. Isso evita atrasos caso o cron falhe em algum momento.
