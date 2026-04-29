# Backend

Aplicacao Next.js destinada ao Render.

Estado atual:

- `app/api` migrado para este app
- `lib`, `data` e `types` copiados do projeto original como base de transicao
- ainda existe duplicacao temporaria de codigo entre frontend e backend

Proximo objetivo:

- mover utilitarios compartilhados para `packages/shared`
- trocar o frontend para consumir este backend publicado
