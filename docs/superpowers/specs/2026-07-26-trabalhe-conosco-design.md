# Design — Página "Trabalhe Conosco"

## Contexto

O site (redesign-atlas-urbano) tem 12 links "Trabalhe conosco" espalhados em 6 arquivos (dropdown Institucional + rodapé de `index.html`, `imoveis.html`, `imovel.html`, `anuncie.html`, `financiamento.html`, `sobre.html`), todos apontando pra `https://www.tamadaimoveis.com.br/trabalhe-conosco` — a página antiga, externa.

Verificação direta da página antiga (curl): é só um formulário nu de upload de currículo, sem copy, sem contexto sobre a empresa, sem fotos — herda apenas o rodapé genérico do portal imobiliário. Zero conteúdo real reaproveitável, mas também zero amarra — a proposta abaixo é inteiramente nova.

## Decisões de negócio já validadas (não reabrir)

- **Público-alvo**: recrutar corretores autônomos (parceiros comissionados sob o CRECI da Tamada), não vagas administrativas fixas.
- **Vagas**: sem vaga/região específica agora — página evergreen, sem lista de posições em aberto pra manter atualizada.
- **Canal de candidatura**: formulário fica **placeholder/"fake"** — mesmo padrão já usado em `anuncie.js` (`localStorage.setItem` com comentário "hook pra CRM futuro" + mensagem de sucesso na tela). **Não** usa o padrão form→WhatsApp do resto do site. Quando o Sanity CMS for plugado ao projeto (ver memória `tamada-plano-sanity-futuro`), o formulário passa a gravar lá como documento — trabalho futuro, fora do escopo deste plano.
- **Ângulo criativo**: "Vitrine de resultados" — página data-forward/racional, prova concreta em vez de storytelling emocional. Descartadas as opções "bairro + carreira" (storytelling) e "direto ao ponto" (lean/genérico).
- **Sem fabricação de dado**: nenhum ano-de-mercado, depoimento de funcionário ou % de comissão inventados. Números usados são computados direto de `catalog-data.js` (ver abaixo). % de comissão fica com copy honesta genérica até o Tarcisio confirmar o número real.

## Números reais (computados de `catalog-data.js`, não reciclados de outra página)

| Métrica | Valor |
|---|---|
| Total de imóveis na carteira | 93 |
| À venda | 57 |
| Pra alugar | 37 |
| Bairros distintos com presença | 55 |
| Cidades atendidas | São Paulo, Arujá, Itaquaquecetuba, Santo André |
| Ticket médio de venda | R$ 805.623 |

Usados no hero: 93 / 55 / R$ 805 mil (os 3 mais fortes pro ângulo "vitrine").

## Arquitetura — seção por seção, componente reusado

| # | Seção | Componente reusado | Conteúdo novo |
|---|---|---|---|
| 1 | Hero | `.catalog-hero` (idêntico às outras páginas internas) | Eyebrow "Corretor autônomo" (sem número, padrão dot como em anuncie.html). H1: "A carteira já existe.<br><em>Falta o corretor.</em>". Aside `dl` com os 3 stats reais da tabela acima (sem `id`, estático — mesmo padrão do sobre.html). Foto nova: 1 imagem (ver "Assets novos"). |
| 2 | "O catálogo que você vai vender" | `.catalog-card` (componente do `imoveis.html`, reaproveita o grid `.catalog-grid`) | 3-4 imóveis reais puxados de `catalog-data.js` (critério de seleção a definir na fase de plano: pode ser maior ticket, ou mix por tipo/cidade). Abaixo do grid, CTA "Ver catálogo completo" → `imoveis.html`. Prova concreta, diferencial da página. |
| 3 | "Como funciona a parceria" | `.steps-grid` (componente do `anuncie.html`) | 4 passos: 01 candidatura → 02 conversa + validação de CRECI (ou apoio pra quem tá tirando) → 03 acesso à carteira + leads que já chegam pelo site/WhatsApp → 04 primeiras vendas com retaguarda do escritório. |
| 4 | "O que você ganha" | `.benefit-grid`/`.benefit-card` (componente do `anuncie.html`) | 4 cards: Carteira pronta (não começa do zero) · Marca em 55 bairros · Suporte administrativo/jurídico + CRECI da empresa · Autonomia com estrutura por trás. Ícones solar: `case-minimalistic-linear`, `medal-ribbon-star-linear`, `shield-check-linear`, `routing-2-linear` (confirmar disponibilidade na fase de implementação). |
| 5 | Formulário de candidatura | `.announce-form`/`.af-field` (estilo do `anuncie.html`, campos e comportamento novos) | Nome*, telefone/WhatsApp*, e-mail*, "já é corretor?" (select: tenho CRECI / quero me tornar / tenho experiência sem CRECI), CRECI (opcional), região de interesse (campo de texto livre — não trava num select das 4 cidades atuais, porque candidato pode mirar região onde a Tamada ainda não atua), experiência (textarea opcional), consentimento LGPD (checkbox, mesmo texto padrão do `af-consent`). Submit: valida campos obrigatórios, salva em `localStorage` (chave nova, ex. `tamada_recruit`, comentário "hook pra Sanity futuro"), substitui o form por mensagem de sucesso. **Sem** redirecionamento pro WhatsApp. |
| 6 | Footer | `.site-footer.catalog-footer` | Padrão das outras páginas. |

Todas as seções levam `class="reveal"` (padrão do resto do site, resolvido automaticamente pelo `common.js` já compartilhado).

## Assets novos

1 foto nova (`hero-trabalhe.jpg` ou nome similar): flat-lay/vista de cima de mesa de corretor — pastas de imóveis, molho de chaves, laptop com mapa de pins abertos. Sem pessoa (mesma política do resto do site — fotos de ambiente/objeto, nunca simulando um funcionário real). Gerada via Magnific, mesmo fluxo já usado pro `sobre.html`.

Nenhuma outra foto nova é necessária — a seção "vitrine da carteira" reaproveita fotos já existentes em `assets/images/catalog/` (imóveis reais do catálogo).

## Gap de conteúdo (não bloqueia o plano, sinalizado pro Tarcisio)

% de comissão real: não inventado. Copy da seção "o que você ganha" usa frase genérica honesta ("estrutura de comissão competitiva, detalhamos na conversa") até receber o número real, se ele quiser deixar explícito na página.

## Fora de escopo (explicitamente)

- Integração com Sanity (armazenamento real de candidatura) — depende do CMS ainda não estar plugado ao projeto ([[tamada-plano-sanity-futuro]]).
- Upload de arquivo (currículo em PDF) — mesma razão; exigiria serviço externo que o projeto não tem hoje.
- Qualquer lista de vagas/regiões específicas — página é evergreen por decisão de negócio.

## Arquivos tocados (previsão — detalhamento fica pro plano de implementação)

**Novos**: `trabalhe-conosco.html`, `trabalhe-conosco.js`, 1 imagem em `assets/images/`.
**Editados**: `index.html`, `imoveis.html`, `imovel.html`, `anuncie.html`, `financiamento.html`, `sobre.html` (retarget dos 12 links + `<script src="common.js">` na nova página + bump de cache-busting `?v=18`).
**CSS**: nenhuma classe nova prevista — página é 100% composta de componentes já existentes (`.catalog-hero`, `.catalog-card`, `.steps-grid`, `.benefit-grid`, `.announce-form`/`.af-field`). Se a fase de implementação encontrar necessidade pontual (ex. ajuste de grid pra 3-4 cards de imóvel em vez do grid de catálogo completo), documentar no plano.
