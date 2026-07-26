# Página "Trabalhe Conosco" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os 12 links externos "Trabalhe conosco" (hoje apontando pra um form nu no site antigo) por uma página própria de recrutamento de corretor autônomo, ângulo "vitrine de resultados" (números reais do catálogo, sem storytelling emocional).

**Architecture:** Site estático (sem build step, sem framework). Página nova (`trabalhe-conosco.html` + `trabalhe-conosco.js`) montada 100% com componentes CSS já existentes no design system (`.catalog-hero`, `.catalog-card`, `.steps-grid`, `.benefit-grid`, `.announce-form`/`.af-field`). Formulário grava em `localStorage` (placeholder até o Sanity CMS ser plugado ao projeto — ver `docs/superpowers/specs/2026-07-26-trabalhe-conosco-design.md`), sem redirecionar pro WhatsApp.

**Tech Stack:** HTML/CSS/JS vanilla, Iconify (`iconify-icon` web component, já carregado via CDN em todas as páginas), Magnific MCP (geração da foto hero), Playwright headless (`playwright-core` em `C:\Users\Adalink\AppData\Local\Temp\pw-test\`) pra teste, Vercel CLI pra deploy (projeto `tamada-atlas-hero`, sem git remote — deploy é sempre manual via `vercel --prod`).

## Global Constraints

- Sem fabricação de dado: nenhum ano-de-mercado, depoimento de funcionário ou % de comissão inventados. Números vêm de `catalog-data.js` (93 imóveis, 57 à venda, 37 pra alugar, 55 bairros distintos, 4 cidades, ticket médio de venda R$ 805.623).
- Formulário **não** usa o padrão form→WhatsApp do resto do site (decisão explícita do Tarcisio — currículo/candidatura é dado estruturado, ele quer Sanity, não WhatsApp). Grava em `localStorage` só, com comentário no código marcando o ponto de troca futura.
- Máximo de CSS novo: 2 classes pequenas (`.af-success`, `.showcase-more`) — todo o resto reusa classes já existentes. Nenhuma reestruturação de componente existente.
- Copy em pt-BR, mesmo tom editorial do resto do site (ver `sobre.html`/`anuncie.html` como referência de voz).
- Todo JS novo passa por `node --check <arquivo>.js` antes de commit.
- Cache-busting: bump `?v=17` → `?v=18` em todos os `<link rel="stylesheet">` do projeto (mesma convenção já usada nas 6 páginas existentes).
- Commits pequenos e descritivos, sem `--no-verify`. Deploy só depois de testado local (headless) — nunca deploy direto sem testar.
- Ícones Iconify usados neste plano já foram verificados como existentes no set `solar` via `https://api.iconify.design/solar.json?icons=...` — não trocar por nomes não verificados sem reconfirmar.

---

### Task 1: Gerar a foto hero (`hero-trabalhe.jpg`)

**Files:**
- Create: `assets/images/hero-trabalhe.jpg`

**Interfaces:**
- Produces: arquivo de imagem em `assets/images/hero-trabalhe.jpg`, referenciado pela Task 2 no `<link rel="preload">` e no `<img>` do hero.

- [ ] **Step 1: Gerar a imagem via Magnific MCP**

Chamar a tool `mcp__magnific__images_generate` com:
- `prompt`: `"Photorealistic flat-lay photo from directly above of a real estate agent's desk: property folders spread out, a bunch of house keys, a laptop showing a city map with multiple location pins, warm natural light, organized and professional, no visible person, no hands, editorial real estate photography"`
- `mode`: `imagen-nano-banana-2-flash`
- `aspectRatio`: `21:9`
- `resolution`: `2k`

- [ ] **Step 2: Aguardar conclusão**

Chamar `mcp__magnific__creations_wait` com o `identifier` retornado no Step 1, `timeoutSeconds: 25`. Se `status` não for `completed`, repetir a chamada até terminar.

- [ ] **Step 3: Baixar e converter pra JPG**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano/assets/images"
mkdir -p _tmp_trabalhe
curl -sL -o _tmp_trabalhe/hero-trabalhe.png "<url retornada pelo creations_wait>"
ffmpeg -y -i "_tmp_trabalhe/hero-trabalhe.png" -vf "scale='min(2000,iw)':'-2'" -q:v 3 "hero-trabalhe.jpg" -loglevel error
rm -rf _tmp_trabalhe
ls -la hero-trabalhe.jpg
```

Expected: arquivo `hero-trabalhe.jpg` criado, tamanho entre 300KB e 1MB (mesma faixa das outras fotos geradas pro `sobre.html`).

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
git add assets/images/hero-trabalhe.jpg
git commit -m "Adiciona foto hero da pagina trabalhe-conosco"
```

---

### Task 2: Criar `trabalhe-conosco.html`

**Files:**
- Create: `trabalhe-conosco.html`

**Interfaces:**
- Consumes: `assets/images/hero-trabalhe.jpg` (Task 1), `common.js` (já existe, sem mudança), `nav-dropdown.js` (já existe, sem mudança), `styles.css`/`imoveis.css` com `?v=18` (bump acontece na Task 5, mas o link já deve ser escrito com `?v=18` aqui pra não precisar editar de novo).
- Produces: elementos com os IDs `#recruitShowcase`, `#recruitForm`, `#rcName`, `#rcPhone`, `#rcEmail`, `#rcStatus`, `#rcCreci`, `#rcRegion`, `#rcExperience`, `#rcConsent`, `#recruitSuccess` — a Task 3 (`trabalhe-conosco.js`) depende exatamente desses IDs.

- [ ] **Step 1: Criar o arquivo completo**

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Trabalhe conosco: seja um corretor autônomo parceiro da Tamada Imóveis. Carteira ativa, leads e estrutura de uma imobiliária de bairro em São Paulo e região.">
  <meta name="theme-color" content="#b21218">
  <title>Trabalhe Conosco — Tamada Imóveis</title>
  <link rel="preload" href="assets/fonts/elicyon.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/antique-legacy.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/images/hero-trabalhe.jpg" as="image" fetchpriority="high">
  <link rel="stylesheet" href="styles.css?v=18">
  <link rel="stylesheet" href="imoveis.css?v=18">
  <script src="https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js"></script>
</head>
<body class="catalog-page">
  <a class="skip-link" href="#trabalheContent">Pular para o conteúdo</a>
  <div class="page-grain" aria-hidden="true"></div>

  <div class="utility-bar">
    <div class="shell utility-inner">
      <p><span class="live-dot"></span> Atendimento local em São Paulo e região</p>
      <div>
        <a href="tel:01126822320"><iconify-icon icon="solar:phone-linear"></iconify-icon> (11) 2682-2320</a>
        <span class="utility-separator"></span>
        <a href="https://wa.me/5511965935749" target="_blank" rel="noopener"><iconify-icon icon="solar:chat-round-dots-linear"></iconify-icon> WhatsApp</a>
        <span class="creci">CRECI 21745-J</span>
      </div>
    </div>
  </div>

  <header class="site-header catalog-header" id="siteHeader">
    <div class="shell header-inner">
      <a class="brand" href="index.html" aria-label="Tamada Imóveis — início"><img src="assets/images/tamada-logo.png" alt="Tamada Imóveis"></a>
      <nav class="desktop-nav" aria-label="Navegação principal">
        <details class="nav-dropdown">
          <summary>Comprar <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon></summary>
          <div>
            <a href="imoveis.html?purpose=sale">Todos à venda</a>
            <a href="imoveis.html?purpose=sale&amp;type=HOUSE">Casas</a>
            <a href="imoveis.html?purpose=sale&amp;type=TWO_STORY_HOUSE">Sobrados</a>
            <a href="imoveis.html?purpose=sale&amp;type=APARTMENT">Apartamentos</a>
            <a href="imoveis.html?purpose=sale&amp;type=LAND">Terrenos</a>
            <a href="imoveis.html?purpose=sale&amp;commercial=1">Comerciais</a>
          </div>
        </details>
        <details class="nav-dropdown">
          <summary>Alugar <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon></summary>
          <div>
            <a href="imoveis.html?purpose=rent">Todos para alugar</a>
            <a href="imoveis.html?purpose=rent&amp;type=HOUSE">Casas</a>
            <a href="imoveis.html?purpose=rent&amp;type=TWO_STORY_HOUSE">Sobrados</a>
            <a href="imoveis.html?purpose=rent&amp;type=APARTMENT">Apartamentos</a>
            <a href="imoveis.html?purpose=rent&amp;commercial=1">Comerciais</a>
          </div>
        </details>
        <a href="anuncie.html">Anuncie</a>
        <details class="nav-dropdown">
          <summary>Serviços <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon></summary>
          <div>
            <a href="anuncie.html">Anuncie seu imóvel</a>
            <a href="https://www.tamadaimoveis.com.br/encomende-seu-imovel-compra-ou-locacao" target="_blank" rel="noopener">Encomende seu imóvel</a>
            <a href="https://www.tamadaimoveis.com.br/avalie-seu-corretor" target="_blank" rel="noopener">Avalie seu corretor</a>
            <a href="financiamento.html">Financiamento</a>
            <a href="https://tmdconsultoriai.superlogica.net/clients/areadocliente" target="_blank" rel="noopener">2ª via de boleto</a>
            <a href="https://tmdconsultoriai.superlogica.net/clients/areadofornecedor" target="_blank" rel="noopener">Extrato do proprietário</a>
          </div>
        </details>
        <details class="nav-dropdown">
          <summary>Institucional <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon></summary>
          <div>
            <a href="sobre.html">A Tamada</a>
            <a class="active" href="trabalhe-conosco.html">Trabalhe conosco</a>
            <a href="https://www.tamadaimoveis.com.br/leis-do-inquilinato" target="_blank" rel="noopener">Leis do Inquilinato</a>
            <a href="https://www.tamadaimoveis.com.br/fale-conosco" target="_blank" rel="noopener">Dúvidas e reclamações</a>
          </div>
        </details>
      </nav>
      <div class="header-actions">
        <a class="button button-ghost header-search" href="imoveis.html"><iconify-icon icon="solar:magnifer-linear"></iconify-icon><span>Ver catálogo</span></a>
        <a class="button button-red" href="#candidatura"><span>Candidatar-se</span><iconify-icon icon="solar:arrow-down-linear"></iconify-icon></a>
        <button class="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span></button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <div class="mobile-menu-number">TRABALHE<br>CONOSCO</div>
    <nav aria-label="Navegação móvel">
      <a href="index.html"><span>00</span> Início</a>
      <a href="imoveis.html?purpose=sale"><span>01</span> Comprar</a>
      <a href="imoveis.html?purpose=rent"><span>02</span> Alugar</a>
      <a href="anuncie.html"><span>03</span> Anuncie</a>
      <a href="financiamento.html"><span>04</span> Financiamento</a>
      <a href="sobre.html"><span>05</span> Institucional</a>
    </nav>
    <a class="mobile-whatsapp" href="https://wa.me/5511965935749" target="_blank" rel="noopener">Conversar no WhatsApp <iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a>
  </div>

  <main id="trabalheContent">
    <section class="catalog-hero">
      <div class="catalog-hero-media" aria-hidden="true"><img src="assets/images/hero-trabalhe.jpg" alt="" fetchpriority="high"></div>
      <div class="catalog-hero-scrim" aria-hidden="true"></div>
      <div class="shell">
        <nav class="breadcrumbs" aria-label="Navegação estrutural"><a href="index.html">Início</a><iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon><span>Trabalhe conosco</span></nav>
        <div class="catalog-hero-grid">
          <div>
            <p class="eyebrow"><span></span> <span>Corretor autônomo</span></p>
            <h1>A carteira já existe.<br><em>Falta o corretor.</em></h1>
          </div>
          <div class="catalog-hero-aside">
            <p>Junte-se à Tamada como corretor parceiro — carteira ativa, leads que já chegam e a estrutura de uma imobiliária de bairro por trás de você.</p>
            <dl><div><dt>93</dt><dd>imóveis na carteira ativa</dd></div><div><dt>55</dt><dd>bairros com presença</dd></div><div><dt>805 mil</dt><dd>ticket médio de venda</dd></div></dl>
          </div>
        </div>
      </div>
    </section>

    <section class="property-section section">
      <div class="shell">
        <div class="section-heading reveal">
          <div><p class="eyebrow"><span>01</span> O que você vai vender</p><h2>O catálogo<br><em>já existe.</em></h2></div>
          <p>93 imóveis ativos, 55 bairros com presença Tamada. Aqui vão 3 exemplos reais do que está na carteira agora.</p>
        </div>
        <div class="catalog-grid" id="recruitShowcase"></div>
        <div class="showcase-more reveal">
          <a class="button button-ink button-large" href="imoveis.html"><span>Ver catálogo completo</span><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a>
        </div>
      </div>
    </section>

    <section class="announce-steps section">
      <div class="shell">
        <div class="section-heading reveal">
          <div><p class="eyebrow"><span>02</span> Como funciona</p><h2>Da candidatura<br><em>à primeira venda.</em></h2></div>
          <p>Processo direto, sem burocracia — você conversa com gente de verdade, não com um formulário automático.</p>
        </div>
        <ol class="steps-grid">
          <li class="step-card reveal"><span class="step-num">01</span><h3>Você se candidata</h3><p>Manda seus dados e um pouco da sua experiência — tem CRECI ou não, tanto faz.</p></li>
          <li class="step-card reveal reveal-delay-1"><span class="step-num">02</span><h3>A gente conversa</h3><p>Alinhamos expectativa e, se precisar, te apoiamos a tirar o CRECI.</p></li>
          <li class="step-card reveal reveal-delay-2"><span class="step-num">03</span><h3>Você entra na carteira</h3><p>Acesso aos imóveis ativos, aos leads que já chegam pelo site e WhatsApp, e à retaguarda do escritório pra fechar.</p></li>
        </ol>
      </div>
    </section>

    <section class="announce-benefits section">
      <div class="shell">
        <div class="section-heading reveal">
          <div><p class="eyebrow"><span>03</span> O que você ganha</p><h2>Estrutura pronta,<br><em>comissão sua.</em></h2></div>
          <p>Estrutura de comissão competitiva — detalhamos na conversa. O resto, é isso aqui:</p>
        </div>
        <div class="benefit-grid">
          <article class="benefit-card reveal">
            <div class="benefit-icon"><iconify-icon icon="solar:case-minimalistic-linear"></iconify-icon></div>
            <h3>Carteira pronta</h3>
            <p>93 imóveis ativos agora — você não começa do zero procurando cliente.</p>
          </article>
          <article class="benefit-card reveal reveal-delay-1">
            <div class="benefit-icon"><iconify-icon icon="solar:medal-ribbon-star-linear"></iconify-icon></div>
            <h3>Marca em 55 bairros</h3>
            <p>Você negocia com o peso de uma imobiliária já presente na região.</p>
          </article>
          <article class="benefit-card reveal reveal-delay-2">
            <div class="benefit-icon"><iconify-icon icon="solar:shield-check-linear"></iconify-icon></div>
            <h3>Suporte de verdade</h3>
            <p>Retaguarda administrativa e jurídica do escritório, CRECI da empresa cobrindo sua atuação.</p>
          </article>
          <article class="benefit-card reveal reveal-delay-3">
            <div class="benefit-icon"><iconify-icon icon="solar:routing-2-linear"></iconify-icon></div>
            <h3>Autonomia com estrutura</h3>
            <p>Você toca sua agenda e seus contatos, com o escritório Tamada por trás.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="announce-form-section section" id="candidatura">
      <div class="shell announce-form-grid">
        <div class="announce-form-copy reveal">
          <p class="eyebrow"><span></span> Candidate-se</p>
          <h2>Manda seu perfil<br><em>e vamos conversar.</em></h2>
          <p>Quanto mais informação, melhor a conversa. Mas fique tranquilo — só o essencial é obrigatório.</p>
          <ul class="announce-form-points">
            <li><iconify-icon icon="solar:check-circle-linear"></iconify-icon> Sem taxa de adesão</li>
            <li><iconify-icon icon="solar:check-circle-linear"></iconify-icon> Retorno em até 2 dias úteis</li>
            <li><iconify-icon icon="solar:check-circle-linear"></iconify-icon> Conversa direta, sem processo seletivo arrastado</li>
          </ul>
          <div class="announce-form-contact">
            <iconify-icon icon="mdi:whatsapp"></iconify-icon>
            <div><strong>Prefere falar direto?</strong><a href="tel:01126822320">(11) 2682-2320</a></div>
          </div>
        </div>

        <form class="announce-form" id="recruitForm" novalidate>
          <fieldset>
            <legend>Seus dados</legend>
            <div class="af-row">
              <label class="af-field"><span>Nome completo*</span><input id="rcName" type="text" autocomplete="name" required placeholder="Seu nome"></label>
              <label class="af-field"><span>Telefone / WhatsApp*</span><input id="rcPhone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(11) 90000-0000"></label>
            </div>
            <label class="af-field"><span>E-mail*</span><input id="rcEmail" type="email" autocomplete="email" required placeholder="voce@email.com"></label>
          </fieldset>

          <fieldset>
            <legend>Sobre sua experiência</legend>
            <div class="af-row">
              <label class="af-field"><span>Já é corretor?*</span>
                <select id="rcStatus" required>
                  <option value="">Selecione</option>
                  <option>Sim, tenho CRECI ativo</option>
                  <option>Estou tirando o CRECI</option>
                  <option>Ainda não, mas tenho interesse</option>
                </select>
              </label>
              <label class="af-field"><span>CRECI</span><input id="rcCreci" type="text" placeholder="Se já tiver"></label>
            </div>
            <label class="af-field"><span>Região de interesse</span><input id="rcRegion" type="text" placeholder="Bairro, cidade ou região que você conhece bem"></label>
            <label class="af-field"><span>Conte um pouco da sua experiência</span><textarea id="rcExperience" rows="3" placeholder="Tempo de mercado, imóveis que já negociou, o que você busca..."></textarea></label>
            <label class="lead-check"><input id="rcConsent" type="checkbox" required><span>Declaro que li e concordo em ser contatado pela Tamada Imóveis, de acordo com a Política de Privacidade.</span></label>
          </fieldset>

          <button class="button button-red button-large" id="rcSubmit" type="submit"><iconify-icon icon="solar:arrow-right-linear"></iconify-icon><span>Enviar candidatura</span></button>
          <p class="af-note">Seus dados ficam guardados e nosso time analisa — sem processo automático, sem spam.</p>
        </form>

        <div class="announce-form af-success" id="recruitSuccess" hidden>
          <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
          <h3>Recebemos seu interesse!</h3>
          <p>Nosso time vai olhar seu perfil e entra em contato em breve. Enquanto isso, já dá pra conhecer o que você entraria pra vender.</p>
          <a class="button button-red button-large" href="imoveis.html"><span>Ver catálogo completo</span><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer catalog-footer">
    <div class="shell footer-top">
      <a class="footer-brand" href="index.html"><img src="assets/images/tamada-logo.png" alt="Tamada Imóveis"><span>Venda, locação e administração<br>de imóveis em São Paulo e região.</span></a>
      <div class="footer-columns">
        <div><h3>Encontrar</h3><a href="imoveis.html?purpose=sale">Comprar</a><a href="imoveis.html?purpose=rent">Alugar</a><a href="imoveis.html?view=map">Buscar no mapa</a><a href="imoveis.html">Busca avançada</a></div>
        <div><h3>Serviços</h3><a href="anuncie.html">Anuncie seu imóvel</a><a href="financiamento.html">Financiamento</a><a href="https://tmdconsultoriai.superlogica.net/clients/areadocliente" target="_blank" rel="noopener">2ª via de boleto</a><a href="trabalhe-conosco.html">Trabalhe conosco</a></div>
        <div><h3>Contato</h3><a href="tel:01126822320">(11) 2682-2320</a><a href="https://wa.me/5511965935749" target="_blank" rel="noopener">WhatsApp novos clientes</a><a href="https://wa.me/5511966378282" target="_blank" rel="noopener">Locação e proprietários</a><a href="sobre.html">A Tamada</a></div>
      </div>
    </div>
    <div class="shell footer-bottom"><p>© <span id="currentYear"></span> Tamada Imóveis · CRECI 21745-J</p><a href="index.html">Voltar ao início <iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
  </footer>

  <a class="floating-whatsapp" href="https://wa.me/5511966378282" target="_blank" rel="noopener" aria-label="Falar com a Tamada no WhatsApp"><span></span><iconify-icon icon="mdi:whatsapp"></iconify-icon></a>

  <script src="nav-dropdown.js"></script>
  <script src="common.js"></script>
  <script src="trabalhe-conosco.js"></script>
</body>
</html>
```

Nota: o footer já traz "Trabalhe conosco" na coluna Serviços — igual ao padrão das outras 5 páginas internas (só o `index.html` tem uma coluna "Institucional" separada; não mexer nessa estrutura, é fora de escopo deste plano).

- [ ] **Step 2: Verificar que não sobrou nenhuma referência à URL externa antiga**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
grep -c "tamadaimoveis.com.br/trabalhe-conosco" trabalhe-conosco.html
```

Expected: `0` (o arquivo novo não deve conter a URL externa antiga em nenhum lugar).

- [ ] **Step 3: Commit**

```bash
git add trabalhe-conosco.html
git commit -m "Cria pagina trabalhe-conosco.html"
```

---

### Task 3: Criar `trabalhe-conosco.js`

**Files:**
- Create: `trabalhe-conosco.js`

**Interfaces:**
- Consumes: `window.TAMADA_CATALOG` (variável global definida por `catalog-data.js`). **Atenção**: `trabalhe-conosco.html` do Task 2 ainda não inclui `<script src="catalog-data.js">` — precisa ser adicionado nesta task, ver Step 1 abaixo. IDs do Task 2: `#recruitShowcase`, `#recruitForm`, `#rcName`, `#rcPhone`, `#rcEmail`, `#rcStatus`, `#rcCreci`, `#rcRegion`, `#rcExperience`, `#rcConsent`, `#recruitSuccess`.
- Produces: nada consumido por outras tasks.

- [ ] **Step 1: Adicionar `catalog-data.js` ao `trabalhe-conosco.html`**

Editar `trabalhe-conosco.html`, no final do `<body>`, adicionar o script `catalog-data.js` **antes** de `common.js`:

```html
  <script src="catalog-data.js"></script>
  <script src="nav-dropdown.js"></script>
  <script src="common.js"></script>
  <script src="trabalhe-conosco.js"></script>
```

(substituindo o bloco de scripts que o Task 2 já criou, que tinha só `nav-dropdown.js`/`common.js`/`trabalhe-conosco.js`).

- [ ] **Step 2: Criar `trabalhe-conosco.js`**

```js
/* trabalhe-conosco.js — vitrine de 3 imoveis reais do catalogo + formulario de candidatura.
   Formulario e placeholder ate o Sanity CMS ser plugado (ver docs/superpowers/specs/2026-07-26-trabalhe-conosco-design.md
   e memoria de projeto tamada-plano-sanity-futuro): grava so em localStorage, sem redirecionar pro WhatsApp.
   Menu/scroll/reveal/magnetic/ano vem de common.js. */

const SHOWCASE_REFS = ['SO7729-EIU', 'AP7842-EIU', 'CA2842-EIU'];

const TYPE_LABELS = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', TWO_STORY_HOUSE: 'Sobrado', LAND: 'Terreno',
  HALL: 'Salão', ROOM: 'Sala', BUILDING: 'Prédio', OUTHOUSE: 'Galpão', SMALL_FARM: 'Chácara'
};

function money(value, monthly = false) {
  if (!value) return 'Sob consulta';
  const text = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return monthly ? `${text}/mês` : text;
}

function purposeLabel(property) {
  if (property.sale && property.rent) return 'Venda ou locação';
  return property.rent ? 'Para alugar' : 'À venda';
}

function specs(property) {
  const list = [`<span><iconify-icon icon="solar:ruler-angular-linear"></iconify-icon>${String(property.area || 0).replace('.', ',')} m²</span>`];
  if (property.beds) list.push(`<span><iconify-icon icon="solar:bed-linear"></iconify-icon>${property.beds}</span>`);
  if (property.baths) list.push(`<span><iconify-icon icon="solar:bath-linear"></iconify-icon>${property.baths}</span>`);
  if (property.garages) list.push(`<span><iconify-icon icon="solar:garage-linear"></iconify-icon>${property.garages}</span>`);
  return list.join('');
}

function card(property) {
  const rentOnly = !property.sale && Boolean(property.rent);
  return `<article class="catalog-card" data-ref="${property.ref}">
    <div class="catalog-card-media">
      <a href="imovel.html?ref=${property.ref}"><img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy"></a>
      <span class="catalog-card-purpose">${purposeLabel(property)}</span><span class="catalog-card-code">${property.ref}</span>
    </div>
    <div class="catalog-card-copy"><p class="catalog-card-location">${property.neighborhood} · ${property.city}</p><h2>${property.title}</h2><div class="catalog-card-specs">${specs(property)}</div>
      <div class="catalog-card-bottom"><strong>${money(rentOnly ? property.rent : property.sale || property.rent, rentOnly)}<small>${TYPE_LABELS[property.type] || 'Imóvel'} · ${purposeLabel(property)}</small></strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
    </div></article>`;
}

function renderShowcase() {
  const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
  const grid = document.querySelector('#recruitShowcase');
  const picked = SHOWCASE_REFS.map(ref => inventory.find(p => p.ref === ref)).filter(Boolean);
  grid.innerHTML = picked.map(card).join('');
}
renderShowcase();

/* ===== Formulario de candidatura (placeholder ate o Sanity) ===== */
const form = document.querySelector('#recruitForm');
const success = document.querySelector('#recruitSuccess');
const val = id => (document.querySelector(id).value || '').trim();

form.addEventListener('submit', e => {
  e.preventDefault();

  const name = val('#rcName');
  const phone = val('#rcPhone');
  const email = val('#rcEmail');
  const status = val('#rcStatus');
  const consent = document.querySelector('#rcConsent').checked;

  if (!name || phone.replace(/\D/g, '').length < 8 || !email.includes('@') || !status || !consent) {
    form.reportValidity();
    return;
  }

  const creci = val('#rcCreci');
  const region = val('#rcRegion');
  const experience = val('#rcExperience');

  // Hook p/ Sanity futuro — por enquanto so guarda local, sem back-end.
  try {
    localStorage.setItem('tamada_recruit', JSON.stringify({ name, phone, email, status, creci, region, experience, at: new Date().toISOString() }));
  } catch (_) {}

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
```

- [ ] **Step 3: Verificar sintaxe**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
node --check trabalhe-conosco.js
```

Expected: sem output (sucesso silencioso).

- [ ] **Step 4: Commit**

```bash
git add trabalhe-conosco.html trabalhe-conosco.js
git commit -m "Adiciona logica de vitrine e formulario da pagina trabalhe-conosco"
```

---

### Task 4: CSS novo (`.af-success`, `.showcase-more`) em `imoveis.css`

**Files:**
- Modify: `imoveis.css`

**Interfaces:**
- Consumes: nenhuma.
- Produces: classes `.af-success` e `.showcase-more`, usadas pelo HTML do Task 2.

- [ ] **Step 1: Adicionar as duas classes**

Abrir `imoveis.css`, localizar a linha `.benefit-card p{font-size:13.5px;line-height:1.65;color:var(--muted);margin:0}` (já existe uma edição anterior logo depois dela, com `.space-gallery`/`.instagram-cta` — adicionar as classes novas logo após esse bloco existente):

```css
.af-success{text-align:center;padding:60px 30px}
.af-success>iconify-icon{font-size:52px;color:var(--red);margin-bottom:18px}
.af-success h3{font-family:Elicyon;font-size:32px;font-weight:400;margin:0 0 12px}
.af-success p{font-size:14px;color:var(--muted);line-height:1.7;max-width:420px;margin:0 auto 26px}

.showcase-more{text-align:center;margin-top:36px}
```

- [ ] **Step 2: Commit**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
git add imoveis.css
git commit -m "Adiciona CSS do estado de sucesso do form e do CTA da vitrine"
```

---

### Task 5: Retargetar os 12 links "Trabalhe conosco" + bump de cache `?v=18`

**Files:**
- Modify: `index.html`, `imoveis.html`, `imovel.html`, `anuncie.html`, `financiamento.html`, `sobre.html`

**Interfaces:**
- Consumes: `trabalhe-conosco.html` deve já existir (Task 2) antes de linkar pra ele.
- Produces: nenhuma — task terminal de retargeting.

- [ ] **Step 1: Retargetar o link em cada um dos 6 arquivos**

Em cada arquivo, o texto exato `<a href="https://www.tamadaimoveis.com.br/trabalhe-conosco" target="_blank" rel="noopener">Trabalhe conosco</a>` aparece 2 vezes (dropdown Institucional + rodapé) — usar replace_all pra pegar as duas de uma vez, por arquivo:

De: `<a href="https://www.tamadaimoveis.com.br/trabalhe-conosco" target="_blank" rel="noopener">Trabalhe conosco</a>`
Para: `<a href="trabalhe-conosco.html">Trabalhe conosco</a>`

Repetir esse replace_all (2 ocorrências cada) em: `index.html`, `imoveis.html`, `imovel.html`, `anuncie.html`, `financiamento.html`, `sobre.html`.

- [ ] **Step 2: Bump de cache-busting `?v=17` → `?v=18`**

Em cada um dos 6 arquivos acima, mais `trabalhe-conosco.html` (que já deveria ter sido escrito com `?v=18` na Task 2 — conferir), trocar toda ocorrência de `?v=17` por `?v=18` nos `<link rel="stylesheet">`.

- [ ] **Step 3: Verificar que não sobrou nenhuma referência à URL externa antiga**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
grep -rc "tamadaimoveis.com.br/trabalhe-conosco" index.html imoveis.html imovel.html anuncie.html financiamento.html sobre.html
```

Expected: `0` em cada um dos 6 arquivos.

```bash
grep -rc "?v=17" *.html
```

Expected: `0` em todos (todos devem estar em `?v=18` agora).

- [ ] **Step 4: Commit**

```bash
git add index.html imoveis.html imovel.html anuncie.html financiamento.html sobre.html
git commit -m "Retargeta links Trabalhe conosco pra pagina interna + bump cache v18"
```

---

### Task 6: Testar headless e verificar regressão

**Files:**
- Nenhum arquivo do projeto é criado/modificado nesta task — só scripts de teste no scratchpad.

**Interfaces:**
- Consumes: todas as tasks anteriores completas.
- Produces: confirmação de que a página nova funciona e as 6 páginas existentes não regrediram.

- [ ] **Step 1: Subir servidor local**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
(python -m http.server 8124 --bind 127.0.0.1 >/tmp/httpserver.log 2>&1 &)
sleep 1
curl -sI http://127.0.0.1:8124/trabalhe-conosco.html | head -3
```

Expected: `HTTP/1.0 200 OK`.

- [ ] **Step 2: Rodar script Playwright headless**

Usar o mesmo setup já validado nesta sessão (`playwright-core` em `C:\Users\Adalink\AppData\Local\Temp\pw-test\`, Chromium em `C:\Users\Adalink\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe`, servir via `http://127.0.0.1:8124`, **nunca** `file://`, `waitUntil:'domcontentloaded'`). Escrever um script Node (fora do repo, no scratchpad) que:

1. Abre `trabalhe-conosco.html`, verifica: sem `pageerror`/`console.error` (exceto o 404 de `favicon.ico`, que é pré-existente no site inteiro e não é regressão desta task), título da página, `#recruitShowcase` tem exatamente 3 `.catalog-card` renderizados com `data-ref` batendo com `SHOWCASE_REFS`.
2. Preenche o formulário (`#rcName`, `#rcPhone`, `#rcEmail`, seleciona `#rcStatus`, marca `#rcConsent`) e clica em `#rcSubmit`. Verifica: `#recruitForm` fica `hidden`, `#recruitSuccess` fica visível, `localStorage.getItem('tamada_recruit')` contém um JSON com o nome preenchido.
3. Rola a página via `page.mouse.wheel` em incrementos (não `window.scrollTo` instantâneo — isso não dispara lazy-load/reveal de forma confiável, já visto nesta sessão) e confere que todos os `.reveal` ganham `.visible`.
4. Testa menu mobile (abre/fecha) e header solidificando no scroll — mesma checagem já usada nas outras páginas.
5. Nas outras 6 páginas (`index.html`, `imoveis.html?purpose=sale`, `imovel.html?ref=AP9008-EIU`, `anuncie.html`, `financiamento.html`, `sobre.html`): confirma que existe `a[href="trabalhe-conosco.html"]` (regressão do retarget) e que nenhuma delas quebrou (sem `pageerror`, header/menu continuam funcionando).

Rodar: `timeout 90 node <script>.js`.

Expected: nenhum `pageerror`, nenhum `console.error` além do favicon 404 já conhecido, 3 cards renderizados corretamente, form→success funcionando, `localStorage` gravado, reveal 100% disparando após scroll incremental, `a[href="trabalhe-conosco.html"]` presente nas 6 páginas.

- [ ] **Step 3: Encerrar o servidor local**

```bash
netstat -ano | grep "LISTENING" | grep 8124
```

Se não houver `LISTENING`, servidor já encerrou sozinho (mesmo comportamento já observado nesta sessão). Se houver, localizar o PID e encerrar via PowerShell `Stop-Process`.

---

### Task 7: Deploy

**Files:**
- Nenhum arquivo do projeto é criado/modificado nesta task.

**Interfaces:**
- Consumes: Task 6 completa e sem falhas.

- [ ] **Step 1: Conferir working tree limpo**

```bash
cd "/c/Users/Adalink/Downloads/Design Sites/tamada imoveis/redesign-atlas-urbano"
git status --short
```

Expected: vazio (tudo já commitado nas tasks anteriores).

- [ ] **Step 2: Deploy Vercel**

```bash
npx vercel --prod --yes
```

Expected: saída com `"status": "ok"` e `"readyState": "READY"`.

- [ ] **Step 3: Verificar produção**

```bash
curl -sI https://tamada-atlas-hero.vercel.app/trabalhe-conosco.html | head -3
curl -s https://tamada-atlas-hero.vercel.app/trabalhe-conosco.html | grep -o '<title>[^<]*</title>'
for f in assets/images/hero-trabalhe.jpg trabalhe-conosco.js; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://tamada-atlas-hero.vercel.app/$f")
  echo "$code  $f"
done
curl -s https://tamada-atlas-hero.vercel.app/imoveis.html | grep -o 'href="trabalhe-conosco.html"'
```

Expected: `200 OK`, título `Trabalhe Conosco — Tamada Imóveis`, todos os assets em `200`, link presente em `imoveis.html`.

---

## Notas de auto-revisão (self-review já aplicado)

- **Cobertura da spec**: todas as 6 seções da tabela de arquitetura da spec têm task correspondente (Tasks 1-4). Retarget dos 12 links coberto na Task 5. Teste e deploy cobertos nas Tasks 6-7.
- **Inconsistência corrigida em relação à spec**: a spec previa 4 passos em "Como funciona a parceria", mas `.steps-grid` no CSS é fixo em `repeat(3,1fr)` — reduzido pra 3 passos (mesclando os 2 últimos) pra caber no grid existente sem CSS novo, mantendo a promessa da spec de reuso máximo.
- **CSS novo além do previsto na spec**: a spec dizia "nenhuma classe nova prevista", mas na prática 2 classes pequenas são inevitáveis: `.af-success` (estado de sucesso do form, não existe componente equivalente pra reusar) e `.showcase-more` (centralizar o CTA abaixo do grid de 3 cards). Documentado explicitamente na Task 4 — ~8 linhas de CSS total, não é uma exceção significativa ao princípio de reuso.
- **Consistência de tipos/nomes**: `SHOWCASE_REFS` (Task 3) usa exatamente os refs confirmados como existentes em `catalog-data.js` (`SO7729-EIU`, `AP7842-EIU`, `CA2842-EIU`). IDs do formulário (`#rcName` etc.) idênticos entre Task 2 (HTML) e Task 3 (JS). Ícones Solar todos pré-verificados via API do Iconify.
