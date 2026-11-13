# Rifa ATUE

Sistema de **rifa com fins pedagógicos** da **ATUE**, plataforma de conformidade digital que ajuda pequenas e médias empresas a entender e organizar sua adequação à LGPD. A renda da rifa apoia o projeto e a participação no Demoday.

A interface usa a identidade visual do `atue-web`: mesma paleta, tipografia (Fraunces + Geist), primitivos shadcn/Radix e padrões de layout plano.

## Stack

- **Frontend:** React 19 + Vite + Tailwind v4 (Cloudflare Pages).
- **API:** Cloudflare Worker em `worker/` (rotas `/api/*`).
- **Banco:** Cloudflare D1 (SQLite), migrações em `worker/migrations/`.
- **Admin:** `/admin` protegido por chave (`x-admin-key`) e, em produção, por Cloudflare Access.

## O que tem

- Grade de 500 números com estados (disponível, selecionado, reservado e pago) e busca.
- Escolha automática de bilhetes (+5, +10, +50, +100 ou quantidade livre).
- Preço promocional: 1 número por R$ 3,00 ou 5 por R$ 12,00.
- Reserva com nome, WhatsApp e indicação, com revisão antes de finalizar.
- Página de pagamento com chave PIX, resumo dos números e instruções.
- Painel admin com indicadores, progresso, arrecadação por mês, ranking de indicações, confirmação/cancelamento de reservas, exportação CSV e sorteio do prêmio de R$ 200,00.
- Rifa encerrada exibe os vencedores na página pública.

A grade é atualizada automaticamente a cada 15 segundos.

## Arte e marca

A coluna ao lado do texto principal exibe `public/rifa-art.webp` em um quadro de até 320 px. Enquanto o arquivo não existir, aparece um placeholder. Recomenda-se WebP ou JPG quadrado (por exemplo, 1200 × 1200 px).

A navbar usa o lockup horizontal em `public/atue-logo.svg` (tema claro) e `public/atue-logo-dark.svg` (tema escuro).

## Rodando localmente

```bash
npm install
cp worker/.dev.vars.example worker/.dev.vars   # troque ADMIN_KEY
npm run db:migrate:local
npm run dev:api                                # API em :8787
npm run dev                                    # Vite em :5173 (proxy de /api)
```

Acesse `http://localhost:5173`. O painel fica em `/admin` e pede a `ADMIN_KEY` configurada em `worker/.dev.vars`.

Scripts: `npm run build` · `npm run lint` · `npm run format:check` · `npm run worker:check`.

## Deploy na Cloudflare

| Serviço  | URL                            |
| -------- | ------------------------------ |
| Frontend | `https://rifa.atue.tech`       |
| API      | `https://api-raffle.atue.tech` |

1. **Criar o banco:** `npx wrangler d1 create atue-raffle` e coloque o `database_id` em `worker/wrangler.jsonc`.
2. **Aplicar as migrações:** `npm run db:migrate`.
3. **Definir a chave do admin:** `npx wrangler secret put ADMIN_KEY --config worker/wrangler.jsonc`.
4. **Publicar a API:** `npm run deploy:api`. O domínio está em `routes` no `worker/wrangler.jsonc`.
5. **Publicar o frontend:** `npm run build` e `npm run deploy:web`. O `wrangler.frontend.jsonc` publica `dist/` como assets do Worker, com fallback de SPA via `not_found_handling`.
6. **Configuração de produção:** a URL da API é `https://api-raffle.atue.tech` (padrão em `src/services/api.ts`); `VITE_API_URL` pode sobrescrever. O `ALLOWED_ORIGIN` fica em `worker/wrangler.jsonc`.
7. **Proteger o painel:** crie uma aplicação no **Cloudflare Access** para `rifa.atue.tech/admin*` (Zero Trust). A chave do admin continua sendo validada pelo Worker.

O fallback de SPA é nativo dos assets (`not_found_handling: single-page-application`), então não há `_redirects`.

## API

| Rota                                  | Método | Acesso                 |
| ------------------------------------- | ------ | ---------------------- |
| `/api/raffle`                         | GET    | público                |
| `/api/reservations`                   | POST   | público                |
| `/api/reservations/:id`               | GET    | público                |
| `/api/admin/data`                     | GET    | chave/cookie do Access |
| `/api/admin/reservations/:id/confirm` | POST   | chave/cookie do Access |
| `/api/admin/reservations/:id/cancel`  | POST   | chave/cookie do Access |
| `/api/admin/close`                    | POST   | chave/cookie do Access |
| `/api/admin/reopen`                   | POST   | chave/cookie do Access |
| `/api/admin/reset`                    | POST   | chave/cookie do Access |

A chave do admin é digitada no painel e guardada apenas no `sessionStorage`; ela não vai no bundle.

## Estrutura

```text
src/
  components/   layout, raffle e primitivos ui
  content/      textos e configuração da rifa (pt-BR)
  contexts/     estado público + polling da API
  lib/          preço, máscara e formatação
  pages/        início, pagamento e administração
  services/     cliente da API
  types/        contratos de reserva, vencedor e snapshot
worker/
  src/          API (reservas, pagamentos, sorteio)
  migrations/   schema do D1
```
