# Rifa ATUE

Sistema de **rifa com fins pedagógicos** da **ATUE**, plataforma de conformidade digital que ajuda pequenas e médias empresas a entender e organizar sua adequação à LGPD. A renda da rifa apoia o projeto e a participação no Demoday.

A interface usa a identidade visual do `atue-web`: mesma paleta, tipografia (Fraunces + Geist), primitivos shadcn/Radix e padrões de layout plano.

## O que tem

- Grade de 500 números com estados (disponível, selecionado, reservado e pago) e busca.
- Escolha automática de bilhetes (+5, +10, +50, +100 ou quantidade livre).
- Preço promocional: 1 número por R$ 3,00 ou 5 por R$ 12,00.
- Reserva com nome, WhatsApp e indicação, com revisão antes de finalizar.
- Página de pagamento com chave PIX, resumo dos números e instruções.
- Painel admin (acesso por `/admin`) com login, indicadores, progresso, arrecadação por mês, ranking de indicações, confirmação/cancelamento de reservas, exportação CSV e sorteio do prêmio de R$ 200,00.
- Rifa encerrada exibe os vencedores na página pública.

## Arte da rifa

A coluna ao lado do texto principal exibe a imagem `public/rifa-art.webp` em um quadro de até 320 px. Enquanto o arquivo não existir, aparece um placeholder. Recomenda-se WebP ou JPG quadrado (por exemplo, 1200 × 1200 px).

A navbar usa o lockup horizontal em `public/atue-logo.svg` (texto escuro, tema claro) e `public/atue-logo-dark.svg` (texto claro, tema escuro).

## Rodando

```bash
npm install
npm run dev
```

Build de produção: `npm run build` · Lint: `npm run lint` · Formatação: `npm run format:check`.

## Acesso admin (demonstração)

- Endereço: `/admin`
- E-mail: `admin@atue.local`
- Senha: `rifa123`

O painel não é divulgado na página de compra; o acesso é direto pela URL.

## Persistência

Os dados são salvos em `localStorage` (chave `rifa-state-v1`), o que permite testar o fluxo completo em um único navegador. Não há backend nem atualização em tempo real entre dispositivos. No painel admin, use **Reabrir rifa** para desfazer o encerramento ou **Reiniciar demonstração** para apagar reservas, pagamentos e vencedores.

A chave PIX e as credenciais de demonstração ficam em `src/content/raffle.ts`.

## Estrutura

```text
src/
  components/
    layout/    header, footer, tema e shell
    raffle/    grade, reserva, vencedores e confirmação
    ui/        primitivos shadcn/Radix no padrão ATUE
  content/     textos e configuração da rifa (pt-BR)
  contexts/    estado da rifa + persistência local
  lib/         preço, máscara, ocupação e sorteio
  pages/       início, pagamento e administração
  types/       contratos de reserva, vencedor e estado
```
