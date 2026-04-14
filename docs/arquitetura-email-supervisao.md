# Arquitetura de Integracao de E-mails

## Objetivo

Integrar futuramente a caixa `supervisao@shopper.com.br` ao painel dos supervisores para exibir e-mails recebidos dentro da aplicacao, sem depender da leitura direta no navegador.

Esta etapa e apenas arquitetural. Nenhuma integracao com provedor de e-mail foi implementada neste momento.

## Recomendacao

Usar uma integracao server-side com a caixa `supervisao@shopper.com.br`, persistindo os e-mails em banco local e exibindo o resultado no painel por meio de uma API interna.

## Arquitetura recomendada

### 1. Origem dos e-mails

Caixa monitorada:

- `supervisao@shopper.com.br`

Provedor sugerido:

- Google Workspace via Gmail API, caso a conta esteja hospedada no Google

Alternativas, se nao estiver no Google:

- Microsoft Graph, se a conta estiver no Microsoft 365
- IMAP seguro, apenas se nao houver API moderna disponivel

### 2. Coletor server-side

Criar um processo interno para buscar e-mails novos periodicamente.

Responsabilidades do coletor:

- autenticar na conta `supervisao@shopper.com.br`
- buscar e-mails nao processados
- extrair remetente, assunto, data e conteudo util
- persistir os dados no banco
- evitar duplicidade por `message_id`

Forma recomendada de execucao:

- job agendado
- ou rota administrativa protegida que aciona a sincronizacao manualmente

## Estrutura sugerida no projeto

### Componentes futuros

- `lib/email-provider.ts`
  - adaptador para Gmail API ou outro provedor
- `lib/email-sync.ts`
  - servico que sincroniza mensagens e grava no banco
- `app/api/emails/route.ts`
  - API de leitura dos e-mails no painel
- `app/api/emails/sync/route.ts`
  - endpoint administrativo para sincronizacao manual
- `app/supervisao/emails/page.tsx`
  - tela do painel com a lista de e-mails recebidos

### Variaveis de ambiente futuras

Se a conta `supervisao@shopper.com.br` estiver no Google:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `SUPERVISAO_EMAIL=supervisao@shopper.com.br`

Se for usar um processo tecnico separado:

- `EMAIL_SYNC_PROVIDER=gmail`

## Estrutura minima no banco

Tabela sugerida: `emails_recebidos`

Campos:

- `id`
- `message_id`
- `thread_id`
- `mailbox`
- `from_email`
- `from_name`
- `subject`
- `snippet`
- `body_text`
- `body_html`
- `received_at`
- `processed_at`
- `status`
- `has_attachments`
- `created_at`

Tabela opcional: `email_attachments`

Campos:

- `id`
- `email_id`
- `filename`
- `mime_type`
- `storage_path`
- `created_at`

## Fluxo recomendado

1. O job autentica na caixa `supervisao@shopper.com.br`.
2. Busca mensagens novas desde a ultima sincronizacao.
3. Normaliza os dados recebidos.
4. Salva no banco com controle de duplicidade por `message_id`.
5. Disponibiliza os dados para o painel via API interna.
6. O supervisor visualiza a lista de e-mails no painel sem falar direto com o provedor de e-mail.

## Regra de acesso recomendada

- `admin` pode sincronizar e visualizar todos os e-mails
- `supervisor` pode apenas visualizar os e-mails no painel
- a integracao com o provedor deve acontecer apenas no servidor

## Estrategia de exibicao no painel

No painel dos supervisores, a tela pode mostrar:

- assunto
- remetente
- data de recebimento
- resumo da mensagem
- marcador de nao lido
- status de triagem

Depois, em uma segunda etapa:

- filtros por remetente
- filtros por status
- detalhe completo do e-mail
- anexos
- transformacao de e-mails relevantes em comunicado interno

## Estrategia de sincronizacao

### Opcao recomendada

Sincronizacao server-side por job com persistencia no banco.

Vantagens:

- nao expoe credenciais no front-end
- evita limite de API no navegador
- deixa historico local no painel
- simplifica filtros e auditoria

### Opcao complementar

Manter tambem uma rota manual protegida para sincronizacao sob demanda.

Uso:

- teste inicial
- suporte operacional
- reprocessamento quando necessario

## Cuidados importantes

- nao renderizar tokens OAuth no cliente
- nao buscar Gmail diretamente em componentes React
- tratar HTML de e-mail com sanitizacao antes de exibir
- limitar volume por sincronizacao para evitar travamentos
- registrar ultima sincronizacao bem-sucedida
- impedir duplicidade por `message_id`

## Como isso se conecta ao painel atual

Hoje o projeto ja possui:

- controle de acesso por perfil
- banco local SQLite para comunicados

Por isso, a extensao natural e:

1. criar novas tabelas para e-mails no mesmo banco local
2. criar a sincronizacao server-side
3. adicionar uma nova area no painel operacional para leitura de e-mails

## Proxima implementacao sugerida

Quando esta fase for iniciada de fato, a ordem recomendada e:

1. criar tabelas `emails_recebidos` e `email_attachments`
2. criar adaptador do provedor da conta `supervisao@shopper.com.br`
3. implementar sincronizacao manual protegida para admin
4. adicionar listagem no painel dos supervisores
5. depois automatizar com job agendado
