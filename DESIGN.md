---
name: ATUE
description: Sistema de design institucional — bento modular, papel branco, um accent azul
colors:
  paper: '#FFFFFF'
  ink: '#0A0A0A'
  ink-soft: '#161616'
  registry-blue: '#2563EB'
  registry-blue-hover: '#1D4ED8'
  gray: '#777777'
  gray-soft: '#A0A0A0'
  line: '#CACACA'
  muted-surface: 'rgb(202 202 202 / 0.18)'
  muted-text: 'rgb(10 10 10 / 0.72)'
  muted-text-dark: 'rgb(255 255 255 / 0.66)'
  state-success: '#22C55E'
  state-warning: '#EAB308'
  state-critical: '#EF4444'
  destructive: '#DC2626'
typography:
  display:
    fontFamily: 'Archivo Variable, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 5.4vw, 4rem)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Archivo Variable, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Archivo Variable, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Archivo Variable, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Archivo Variable, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '0.01em'
rounded:
  control: '16px'
  card: '24px'
  panel: '28px'
  pill: '999px'
spacing:
  unit: '4px'
  grid-gap: '20px'
  card-padding: '24px'
  section-gap: '80px'
  container: '1280px'
components:
  button-primary:
    backgroundColor: '{colors.registry-blue}'
    textColor: '{colors.paper}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '0 24px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.registry-blue-hover}'
    textColor: '{colors.paper}'
    rounded: '{rounded.control}'
  button-outline:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0 24px'
    height: '44px'
  card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.card}'
    padding: '24px'
  field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0 16px'
    height: '44px'
  chip:
    backgroundColor: '{colors.muted-surface}'
    textColor: '{colors.muted-text}'
    rounded: '{rounded.pill}'
    padding: '4px 10px'
  stamp:
    backgroundColor: 'transparent'
    textColor: '{colors.registry-blue}'
    rounded: '{rounded.control}'
    padding: '6px 12px'
---

# Design System: ATUE

Documento único e normativo. Tokens no frontmatter são obrigatórios; a prosa explica **onde** e **por que** cada um é usado. Se o código divergir deste arquivo, o código é o defeito.

## Overview

**Creative North Star: "A Malha Modular"**

A interface é uma malha de cards com pesos diferentes sobre papel branco. Não é uma grade uniforme de caixinhas: é um bento — um card grande que carrega a informação principal, cards menores que a sustentam, e vazio suficiente para o olho descansar. Cada card contém uma coisa só e a contém bem.

O que dá personalidade não é cor nem efeito: é a **hierarquia por tamanho de card** e a disciplina de ter um único accent. O azul aparece onde existe ação ou dado de destaque, e em nenhum outro lugar. Quando tudo é card branco, o que separa é o filete de 1px, a sombra suave e o espaço — nunca uma segunda cor de fundo.

Densidade baixa a média, ritmo vertical constante, movimento que responde a dado e a estado. O produto deve parecer organizado, previsível e adulto: é uma ferramenta de conformidade, não um produto de entretenimento.

**Key Characteristics:**

- Papel branco puro, card branco, filete `#CACACA` de 1px e sombra suave.
- Raio de 16px em controles e 24px em cards. Nunca acima de 28px.
- Uma família tipográfica (Archivo), três pesos de trabalho: 400, 600, 700.
- Um accent (azul `#2563EB`) reservado a ação e dado de destaque.
- Cards com spans variados; nunca três colunas de largura igual.
- Movimento só como resposta: entrada, dado que muda, hover.

## Colors

Paleta institucional fechada: papel, tinta, azul e três neutros. Nada é adicionado para resolver um problema local.

### Primary

- **Registry Blue** (#2563EB): ação primária, link, foco, dado de destaque e o carimbo de demonstração. No máximo dois usos por tela. Hover escurece para `#1D4ED8`.

### Neutral

- **Paper** (#FFFFFF): fundo da página **e** superfície de card. A separação vem do filete e da sombra, não de um segundo fundo.
- **Ink** (#0A0A0A): texto principal; no tema escuro, o fundo.
- **Ink Soft** (#161616): card no tema escuro.
- **Gray** (#777777): borda de campo e ícone neutro.
- **Gray Soft** (#A0A0A0): texto auxiliar sobre fundo escuro.
- **Line** (#CACACA): filete de card, divisor de tabela e borda de chip.
- **Muted Surface** (`rgb(202 202 202 / 0.18)`): fundo de chip, faixa secundária e barra de escala vazia.
- **Muted Text** (`rgb(10 10 10 / 0.72)` no claro, `rgb(255 255 255 / 0.66)` no escuro): texto de apoio, rótulo e metadado.
- **Destructive** (#DC2626): erro de campo e ação irreversível. Nunca como decoração.

### Named Rules

**The One Accent Rule.** Azul só em ação, foco e dado de destaque. Se uma tela tem três áreas azuis, duas estão erradas. Azul nunca preenche um card inteiro.

**The State-on-a-Label Rule.** Verde, amarelo e vermelho comunicam estado e sempre vêm acompanhados de texto. Cor nunca é o único indicador — em severidade, o ponto colorido vem com a palavra.

**The Semaphore Rule.** O índice de conformidade usa exatamente três faixas, nestas cores: `< 50` crítico (`#EF4444`), `50–74` atenção (`#EAB308`), `≥ 75` conforme (`#22C55E`). O número, o rótulo do índice e a barra herdam a cor da faixa; o rótulo textual sempre acompanha. Nenhuma quarta cor entra na escala.

**The No-Pure-Black Rule.** Texto é `#0A0A0A`, nunca `#000000`. Fundo escuro é `#0A0A0A`, card escuro é `#161616`.

## Typography

**Fonte única:** Archivo Variable, auto-hospedada (`@fontsource-variable/archivo`), fallback `system-ui, sans-serif`.

**Character:** grotesca neutra com personalidade nos títulos. Uma família faz o trabalho inteiro; a distinção vem de escala, peso e espaço, nunca de uma segunda fonte. Não existe fonte decorativa, serifada ou monoespaçada decorativa neste sistema.

### Hierarchy

- **Display** (700, `clamp(2rem, 5.4vw, 4rem)`, 1.05, tracking −0.02em): hero de landing. **Não** é usada dentro do app.
- **Headline** (600, 1.5rem, 1.25): título de seção.
- **Title** (600, 1.125rem, 1.35): título de card, item de lista e etapa.
- **Body** (400, 1rem, 1.6): leitura, com medida de 55–75ch.
- **Label** (500, 0.875rem): nome de campo, rótulo de card e metadado.

### Named Rules

**The No-Kicker Rule.** Nenhum rótulo, eyebrow ou "sobrancelha" acima de um título. O título carrega o próprio peso; se ele não basta, o texto está errado. Rótulo existe para nomear **campo**, nunca para decorar seção.

**The Scale-Jump Rule.** Dois níveis de título na mesma tela precisam de salto visível (≥1,5×). Se o h2 parece um h3, a hierarquia não existe.

**The Tabular Rule.** Todo número comparável — score, valor, contagem, data — usa `tabular-nums`.

## Layout

Malha de 12 colunas em `lg`, container de **1280px** com 24px de margem lateral, `gap` de 20px entre cards.

Cada tela abre com um bloco de identificação (h1 + ação primária) e segue com cards que ocupam spans diferentes: **7/5**, **8/4**, **12**, **4/4/4 com um card em destaque**. Três colunas de largura igual são proibidas.

Ritmo vertical: 80px entre seções (`pb-20`), 24–32px de padding dentro do card (`p-6 sm:p-8`). Espaço acima de um título é sempre maior que o espaço abaixo.

Mobile é composição própria, não redução: cards empilham em uma coluna, tabelas escondem a coluna menos essencial (`hidden sm:table-cell`), a ação primária vira botão de largura total. Validar em 320, 390, 768, 1024 e 1440 sem rolagem horizontal.

## Elevation & Depth

O sistema é plano por padrão e usa **uma** sombra para elevar o card da página:

- Repouso: `0 2px 12px rgb(10 10 10 / 0.08)`.
- Hover (só card clicável): `0 12px 28px -12px rgb(10 10 10 / 0.18)` + `scale(1.02)`.

Nada de `backdrop-filter` decorativo, vidro, brilho ou sombra colorida. O cabeçalho pode ser translúcido com blur porque flutua sobre o conteúdo; isso é a exceção, não o padrão.

### Named Rules

**The Hover-Only-When-Clickable Rule.** Card estático não reage ao mouse. Se ele levanta no hover, ele abre algo.

**The Flat-Background Rule.** O fundo da página não tem gradiente, textura, padrão ou blob. É papel branco.

## Shapes

Raio de **16px** em controles (botão, campo, chip de ação) e **24px** em cards. Superfícies grandes podem chegar a 28px. Pílula (`rounded-full`) é permitida apenas em badge de estado e avatar — nunca em botão de ação.

Bordas são sempre 1px. Campo de formulário tem borda completa + anel de foco; não existe campo com apenas linha embaixo.

## Components

### Buttons

- **Primary:** fundo `#2563EB`, texto branco, altura 44px, padding 0 24px, raio 16px, peso 600. Hover `#1D4ED8`; ativo desloca 1px; foco com anel de 2px azul e offset.
- **Outline:** fundo branco, borda `#CACACA`, texto `#0A0A0A`. É a ação alternativa.
- **Ghost:** sem fundo nem borda; texto de apoio. Ação terciária.
- **Link:** texto em tinta com sublinhado no hover e `underline-offset-4`.
- Toda ação visível precisa de `cursor-pointer` e transição de 150–200ms.

### Cards

Raio 24px, fundo branco, borda `#CACACA` de 1px, sombra de repouso, padding 24px (32px em telas grandes). Card interativo adiciona hover de sombra + escala. **Nunca** card dentro de card: para agrupar, use filete e espaço.

### Inputs / Fields

Borda 1px `#777777`, raio 16px, fundo branco, altura 44–48px, rótulo **visível acima**. Foco: borda azul + anel `rgba(37,99,235,.4)` de 2px. Erro: borda e mensagem em `#DC2626` com `aria-invalid` e `role="alert"`. Placeholder nunca substitui rótulo.

### Tables

Cabeçalho em `0.75–0.875rem`, texto de apoio, `border-b` de 1px. Linhas com `border-b` e `last:border-b-0`. Primeira coluna é o identificador; números alinham à direita com `tabular-nums`. Em telas estreitas, esconda a coluna menos essencial — não crie rolagem horizontal na página.

### Chips & Badges

Pílula, fundo `muted-surface`, texto `0.75rem/500`, ponto colorido + palavra quando comunica estado. Chip não substitui botão e não recebe `cursor-pointer` sem ação real.

### Navigation

Barra fixa translúcida (blur), 64px de altura, alinhada ao container. Links em `0.875rem`, cor de apoio, hover em tinta. A ação de conta é o único botão azul do cabeçalho. Em mobile, menu em folha lateral com os mesmos destinos.

## Do's and Don'ts

### Do:

- **Do** usar grid de 12 colunas com spans variados (7/5, 8/4, 12).
- **Do** manter raio de 16px em controles e 24px em cards.
- **Do** usar o azul apenas em ação, foco e dado de destaque — no máximo dois por tela.
- **Do** dar sombra de card e filete de 1px a toda superfície branca.
- **Do** rotular toda simulação dentro do artefato ("Demonstração", "Exemplo").
- **Do** usar ícones Lucide, sempre com `aria-hidden` quando decorativos.
- **Do** validar 320px sem rolagem horizontal e alvos de toque de 44px.
- **Do** usar `min-h-dvh`, nunca `h-screen`.
- **Do** usar `tabular-nums` em qualquer número comparável.

### Don't:

- **Don't** colocar kicker ou rótulo acima de um título.
- **Don't** usar três colunas de largura igual.
- **Don't** aninhar cards, nem transformar cada seção em card.
- **Don't** usar emoji como ícone, nem SVG solto no lugar de ícone de biblioteca.
- **Don't** usar preto puro, gradiente de texto, sombra colorida, vidro decorativo ou borda lateral colorida dentro de card.
- **Don't** passar de 28px de raio, nem usar pílula em botão de ação.
- **Don't** usar accent com saturação acima de 80%.
- **Don't** inventar depoimentos, clientes, logos de terceiros, preços, benchmarks ou certificações.
- **Don't** usar `lorem ipsum`, imagem externa que possa quebrar, ou clichê de copy de IA ("Eleve", "Perfeito", "Revolucione", "Next-gen").
- **Don't** esconder conteúdo essencial atrás de animação: se o JS falhar, a tela precisa estar legível.

## Movimento

Movimento é resposta, não decoração. Orçamento por tela:

- **Entrada de seção:** `transform: translateY(16px) → 0`, 420ms, `power3.out`, uma vez.
- **Cascata de lista:** 60–90ms entre itens, máximo 6 itens animados.
- **Contagem de número:** 700–900ms, `power2.out`, com o valor final já no DOM.
- **Hover:** 150–200ms, só `transform` e `box-shadow`.
- **Troca de dado:** cross-fade curto (200–300ms) para deixar claro que o resultado mudou.
- **Scrub de scroll:** apenas em composição (cards de uma seção), nunca em texto.

Regras: só `transform`, `opacity` e `scaleX`. Nunca animar `height`, `width`, `top` ou `margin`. Nada essencial começa invisível. `prefers-reduced-motion: reduce` desliga tudo e mantém o estado final. Uma timeline autoral por página; o resto é reação a estado.

## Conteúdo e honestidade

- Idioma: português brasileiro. Tom direto, executivo, sem hype.
- Sentence case em títulos e botões. Caixa alta só em rótulo de campo curto.
- Botões nomeiam a ação: "Gerar diagnóstico", "Salvar alterações", "Atualizar análise".
- Erro nomeia o problema e o próximo passo, sem culpar o usuário.
- Toda simulação é rotulada **na própria tela**, não em nota de rodapé.
- Nunca afirmar garantia de conformidade, certificação ou substituição de auditoria.
- Dados de demonstração precisam ser determinísticos e reconhecíveis como exemplo.
- Não inventar depoimento, cliente, logo, preço, métrica ou prêmio. Se não existe, não aparece.

## Aplicação em outro repositório

1. Copie este arquivo para a raiz do repositório como `DESIGN.md` (e para cada app, se for monorepo — as cópias devem ser idênticas; valide com `cmp`).
2. Instale a fonte: `npm i @fontsource-variable/archivo`.
3. Cole o bloco abaixo no CSS global do projeto (Tailwind v4, `src/index.css`) e remova tokens antigos de raio, fonte e fundo que conflitem.

```css
@import '@fontsource-variable/archivo';

@theme inline {
  --font-sans: 'Archivo Variable', system-ui, sans-serif;
  --font-heading: 'Archivo Variable', system-ui, sans-serif;
}

:root {
  --atue-ink: #0a0a0a;
  --atue-surface-dark: #161616;
  --atue-blue: #2563eb;
  --atue-gray: #777777;
  --atue-gray-soft: #a0a0a0;
  --atue-line: #cacaca;
  --atue-white: #ffffff;

  --radius: 1rem; /* controles: 16px */
  --card-radius: 1.5rem; /* cards: 24px */
  --shadow-card: 0 2px 12px rgb(10 10 10 / 0.08);
  --shadow-card-hover: 0 12px 28px -12px rgb(10 10 10 / 0.18);
}

@layer utilities {
  .text-display {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5.4vw, 4rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  .text-section {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .text-label {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .card-surface {
    border-radius: var(--card-radius);
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-card);
  }
  .card-interactive {
    cursor: pointer;
    transition: all 200ms ease-out;
  }
  .card-interactive:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-card-hover);
  }
  .card-interactive:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgb(37 99 235 / 0.45);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-interactive,
  .card-interactive:hover {
    transform: none;
    transition: none;
  }
}
```

4. Ajuste as primitivas: `Button` (raio 16px, 44px de altura, 600), `Input` (borda 1px, raio 16px, anel de foco 2px), `Card` (24px + filete + sombra).
5. Troque `rounded-lg/xl/2xl` antigos que dependiam de outro `--radius` e revise `bg-white` fixos (com página branca, card branco precisa de filete e sombra).
6. Valide: `npm run lint`, `npx tsc -b`, `npm run format:check`; e confira 1440, 768, 390 e 320 nos dois temas.

**Repositórios com paleta própria:** mantenha a paleta daquele produto e aplique apenas as regras estruturais (grid, spans, raio, sombra, tipografia, movimento, conteúdo). Registre a exceção no topo do `DESIGN.md` daquele repositório.
