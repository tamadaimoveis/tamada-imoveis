import type { Metadata } from 'next'
import { getImoveis, getBairros } from '@/lib/queries'
import Efeitos from '@/components/Efeitos'
import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import TabBar from '@/components/TabBar'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Imóveis — Tamada Imóveis',
  description: 'Imóveis para comprar e alugar em São Paulo e região — Tamada Imóveis.',
}

export default async function ImoveisPage() {
  const [imoveis, bairros] = await Promise.all([getImoveis(), getBairros()])

  return (
    <>
      {/* Leaflet só carregava o JS, nunca o CSS — sem isso o mapa não tem
          posicionamento absoluto e os tiles empilham soltos na página. */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script src="/hero-copy.js" strategy="beforeInteractive" />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.TAMADA_CATALOG=${JSON.stringify(imoveis)};window.TAMADA_BAIRROS=${JSON.stringify(bairros)};`,
        }}
      />

      <Header catalogo active="imoveis" />
      <MobileMenu />

      {/* Cabeçalho sticky só do mobile — substitui a logo/header padrão nessa
          tela (o mockup não mostra marca aqui, só voltar+busca+filtro). Tem
          seu próprio campo de busca (mobileCatalogQuery) sincronizado por JS
          com o #catalogQuery real (o do form desktop), pra não duplicar a
          lógica de filtro que já lê/escreve só um input. */}
      <div className="catalog-mobile-bar">
        <div className="catalog-mobile-bar-row">
          <a className="catalog-mobile-back" href="/" aria-label="Voltar ao início">
            <iconify-icon icon="solar:arrow-left-linear" />
          </a>
          <label className="catalog-mobile-search">
            <iconify-icon icon="solar:magnifer-linear" />
            <input id="mobileCatalogQuery" type="search" placeholder="Localização ou código" autoComplete="off" />
          </label>
          <button className="mobile-filter-button" id="mobileFilterButtonTop" type="button">
            <iconify-icon icon="solar:tuning-2-linear" />
          </button>
        </div>
      </div>

      <main id="catalogContent">
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/assets/images/hero-comprar.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>Imóveis</span>
            </nav>
            <div className="catalog-hero-grid">
              <div>
                <p className="eyebrow">
                  <span /> <span id="heroEyebrow">Catálogo Tamada</span>
                </p>
                <h1 id="heroTitle">
                  Encontre um lugar
                  <br />
                  <em>para chamar de seu.</em>
                </h1>
              </div>
              <div className="catalog-hero-aside">
                <p id="heroSubtitle">
                  Compra, locação e imóveis comerciais reunidos em uma busca que começa pela sua vida — não apenas pelos
                  filtros.
                </p>
                <dl>
                  <div>
                    <dt id="heroResultCount">{imoveis.length}</dt>
                    <dd>imóveis disponíveis</dd>
                  </div>
                  <div>
                    <dt>{bairros.length}</dt>
                    <dd>regiões em destaque</dd>
                  </div>
                  <div>
                    <dt>100%</dt>
                    <dd>atendimento dedicado</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var p=new URLSearchParams(location.search).get('purpose');var c=(window.HERO_COPY&&(window.HERO_COPY[p]||window.HERO_COPY.all))||null;if(!c)return;document.getElementById('heroEyebrow').textContent=c.eyebrow;document.getElementById('heroTitle').innerHTML=c.title;document.getElementById('heroSubtitle').textContent=c.sub;var img=document.querySelector('.catalog-hero-media img');if(img)img.src=c.img;})();`,
            }}
          />
        </section>

        <section className="catalog-search" aria-label="Busca de imóveis">
          <form className="shell catalog-search-form" id="catalogSearch">
            <div className="catalog-purpose" role="group" aria-label="Finalidade">
              <button type="button" data-purpose="sale">
                Comprar
              </button>
              <button type="button" data-purpose="rent">
                Alugar
              </button>
              <button type="button" data-purpose="commercial">
                Comercial
              </button>
            </div>
            <div className="catalog-mobile-chips" id="mobileFilterChips" aria-label="Filtros aplicados" />
            <label className="catalog-query">
              <span>Localização ou código</span>
              <div>
                <iconify-icon icon="solar:map-point-linear" />
                <input id="catalogQuery" type="search" placeholder="Ex.: Tatuapé, Arujá ou AP7842-EIU" autoComplete="off" />
              </div>
            </label>
            <label>
              <span>Tipo</span>
              <select id="catalogType" data-elegant="">
                <option value="">Todos os tipos</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="TWO_STORY_HOUSE">Sobrado</option>
                <option value="LAND">Terreno</option>
                <option value="HALL">Salão comercial</option>
                <option value="ROOM">Sala comercial</option>
                <option value="BUILDING">Prédio</option>
                <option value="OUTHOUSE">Galpão</option>
                <option value="SMALL_FARM">Chácara</option>
              </select>
            </label>
            <label>
              <span>Valor máximo</span>
              <select id="catalogMaxPrice" data-elegant="">
                <option value="">Sem limite</option>
                <option value="260000">R$ 260 mil</option>
                <option value="500000">R$ 500 mil</option>
                <option value="900000">R$ 900 mil</option>
                <option value="2000000">R$ 2 milhões</option>
                <option value="5000000">R$ 5 milhões</option>
              </select>
            </label>
            <button className="catalog-submit" type="submit">
              <span>Buscar</span>
              <iconify-icon icon="solar:magnifer-linear" />
            </button>
          </form>
        </section>

        <section className="catalog-results-section">
          <div className="shell catalog-toolbar">
            <div>
              <p>
                <strong id="resultCount">0</strong> imóveis encontrados
              </p>
              <span id="activeSummary">Todos os imóveis</span>
            </div>
            <div>
              <button className="mobile-filter-button" id="mobileFilterButton" type="button">
                <iconify-icon icon="solar:tuning-2-linear" /> Filtros{' '}
                <b id="filterBadge" hidden>
                  0
                </b>
              </button>
              <label className="sort-field">
                <span>Ordenar</span>
                <select id="catalogSort">
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="area-desc">Maior área</option>
                  <option value="recent">Mais recentes</option>
                </select>
              </label>
              <div className="view-switch" role="group" aria-label="Modo de visualização">
                <button className="active" type="button" data-view="grid" aria-label="Visualização em grade">
                  <iconify-icon icon="solar:widget-4-linear" />
                </button>
                <button type="button" data-view="map" aria-label="Visualização no mapa">
                  <iconify-icon icon="solar:map-linear" />
                </button>
              </div>
            </div>
          </div>

          <div className="shell catalog-layout">
            <aside className="filter-panel" id="filterPanel" aria-label="Filtros avançados">
              <div className="filter-panel-head">
                <div>
                  <span>Busca avançada</span>
                  <strong>Refine sua escolha</strong>
                </div>
                <button type="button" id="closeFilters" aria-label="Fechar filtros">
                  <iconify-icon icon="solar:close-circle-linear" />
                </button>
              </div>
              <fieldset>
                <legend>Região, bairro ou cidade</legend>
                <input className="filter-panel-search" id="sideQuery" type="search" placeholder="Ex.: Tatuapé, São Paulo" />
              </fieldset>
              <fieldset>
                <legend>Finalidade</legend>
                <div className="filter-purpose">
                  <label>
                    <input type="radio" name="sidePurpose" value="all" defaultChecked />
                    <span>Todos</span>
                  </label>
                  <label>
                    <input type="radio" name="sidePurpose" value="sale" />
                    <span>Comprar</span>
                  </label>
                  <label>
                    <input type="radio" name="sidePurpose" value="rent" />
                    <span>Alugar</span>
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Tipo de imóvel</legend>
                <select id="sideType" data-elegant="">
                  <option value="">Todos</option>
                  <option value="APARTMENT">Apartamento</option>
                  <option value="HOUSE">Casa</option>
                  <option value="TWO_STORY_HOUSE">Sobrado</option>
                  <option value="LAND">Terreno</option>
                  <option value="HALL">Salão comercial</option>
                  <option value="ROOM">Sala comercial</option>
                  <option value="BUILDING">Prédio</option>
                  <option value="OUTHOUSE">Galpão</option>
                  <option value="SMALL_FARM">Chácara</option>
                </select>
              </fieldset>
              <fieldset>
                <legend>Quartos</legend>
                <div className="side-number-chips" id="sideBedrooms">
                  <button className="active" type="button" data-value="0">
                    Todos
                  </button>
                  <button type="button" data-value="1">
                    1
                  </button>
                  <button type="button" data-value="2">
                    2
                  </button>
                  <button type="button" data-value="3">
                    3
                  </button>
                  <button type="button" data-value="4" data-min="">
                    4+
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <legend>Vagas</legend>
                <div className="side-number-chips" id="sideGarages">
                  <button className="active" type="button" data-value="0">
                    Todas
                  </button>
                  <button type="button" data-value="1">
                    1
                  </button>
                  <button type="button" data-value="2">
                    2
                  </button>
                  <button type="button" data-value="3" data-min="">
                    3+
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <legend>Valores</legend>
                <select id="sideMaxPrice" data-elegant="">
                  <option value="">Sem limite</option>
                </select>
              </fieldset>
              <fieldset>
                <legend>Faixa de área</legend>
                <div className="range-grid">
                  <label>
                    <span>Mínima</span>
                    <input id="minArea" type="number" min={0} step={10} placeholder="0 m²" />
                  </label>
                  <label>
                    <span>Máxima</span>
                    <input id="maxArea" type="number" min={0} step={10} placeholder="Qualquer" />
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Características</legend>
                <div className="side-checks">
                  <label>
                    <input id="onlyAffordable" type="checkbox" />
                    <span>
                      <i />
                      <b id="affordableLabel">Até R$ 260 mil</b>
                    </span>
                  </label>
                  <label>
                    <input id="onlyCommercial" type="checkbox" />
                    <span>
                      <i />
                      Uso comercial
                    </span>
                  </label>
                  <label>
                    <input id="onlyGarage" type="checkbox" />
                    <span>
                      <i />
                      Com vaga
                    </span>
                  </label>
                </div>
              </fieldset>
              <button className="clear-all" id="clearCatalogFilters" type="button">
                <iconify-icon icon="solar:restart-linear" /> Limpar todos os filtros
              </button>
              <div className="filter-contact">
                <iconify-icon icon="solar:chat-round-dots-linear" />
                <p>
                  <strong>Busca muito específica?</strong>
                  <span>Um corretor pode procurar por você.</span>
                </p>
                <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                  Conversar
                </a>
              </div>
            </aside>

            <div className="catalog-content">
              <div className="catalog-grid-view" id="gridView">
                <div className="catalog-grid" id="catalogGrid" aria-live="polite" />
                <button className="load-catalog" id="loadCatalog" type="button">
                  <span>Mostrar mais imóveis</span>
                  <iconify-icon icon="solar:add-circle-linear" />
                </button>
              </div>

              <div className="catalog-map-view" id="mapView" hidden>
                <div className="map-results-list" id="mapResultsList" />
                <div className="catalog-map-stage">
                  <div id="catalogMap" className="catalog-map" aria-label="Mapa de imóveis com localização aproximada" />
                  <div className="catalog-map-fallback" id="catalogMapFallback" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="catalog-map-note">
                    <i /> Posições aproximadas
                  </div>
                  <article className="floating-map-card" id="floatingMapCard" hidden>
                    <img id="floatingImage" src="" alt="" />
                    <div>
                      <p id="floatingLocation" />
                      <h2 id="floatingTitle" />
                      <strong id="floatingPrice" />
                      <a id="floatingLink" href="#" target="_blank" rel="noopener">
                        Ver imóvel <iconify-icon icon="solar:arrow-up-right-linear" />
                      </a>
                    </div>
                    <button id="closeMapCard" type="button" aria-label="Fechar card">
                      <iconify-icon icon="solar:close-circle-linear" />
                    </button>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="catalog-cta">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-light">
                <span /> Busca personalizada
              </p>
              <h2>
                Não apareceu aqui?
                <br />
                <em>A gente procura com você.</em>
              </h2>
            </div>
            <div>
              <p>Conte bairro, faixa de preço e o que é indispensável. A equipe Tamada continua a busca fora dos filtros.</p>
              <a
                className="button button-red button-large"
                href="https://wa.me/5511965935749?text=Ol%C3%A1%21%20N%C3%A3o%20encontrei%20no%20site%20o%20im%C3%B3vel%20que%20procuro.%20Podem%20me%20ajudar%20na%20busca%3F"
                target="_blank"
                rel="noopener"
              >
                Falar com a equipe <iconify-icon icon="solar:arrow-up-right-linear" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer catalog-footer">
        <div className="shell footer-top">
          <a className="footer-brand" href="/">
            <img src="/assets/images/tamada-logo-white.png" alt="Tamada Imóveis" width={400} height={148} />
            <span>
              Venda, locação e administração
              <br />
              de imóveis em São Paulo e região.
            </span>
          </a>
          <div className="footer-columns">
            <div>
              <h3>Encontrar</h3>
              <a href="/imoveis?purpose=sale">Comprar</a>
              <a href="/imoveis?purpose=rent">Alugar</a>
              <a href="/imoveis?view=map">Buscar no mapa</a>
              <a href="#catalogSearch">Busca avançada</a>
            </div>
            <div>
              <h3>Serviços</h3>
              <a href="/anuncie">Anuncie seu imóvel</a>
              <a href="https://tmdconsultoriai.superlogica.net/clients/areadocliente" target="_blank" rel="noopener">
                2ª via de boleto
              </a>
              <a href="/trabalhe-conosco">Trabalhe conosco</a>
            </div>
            <div>
              <h3>Contato</h3>
              <a href="tel:01126822320">(11) 2682-2320</a>
              <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                WhatsApp novos clientes
              </a>
              <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                Locação e proprietários
              </a>
              <a href="/sobre">A Tamada</a>
            </div>
          </div>
        </div>
        <div className="shell footer-bottom">
          <p>© {new Date().getFullYear()} Tamada Imóveis · CRECI 21745-J</p>
          <a href="/">
            Voltar ao início <iconify-icon icon="solar:arrow-up-right-linear" />
          </a>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href="https://wa.me/5511965935749"
        target="_blank"
        rel="noopener"
        aria-label="Falar com a Tamada no WhatsApp"
      >
        <span />
        <iconify-icon icon="mdi:whatsapp" />
      </a>
      {/* No nível raiz (não dentro de .catalog-layout) — um ancestral ali
          tem transform/contenção que quebrava o position:fixed. */}
      <button className="catalog-view-toggle" type="button" data-view="map">
        <iconify-icon icon="solar:map-linear" />
        <span>Ver no mapa</span>
      </button>
      <button className="catalog-view-toggle" type="button" data-view="grid">
        <iconify-icon icon="solar:widget-4-linear" />
        <span>Ver lista</span>
      </button>

      <TabBar active="imoveis" />
      <div className="filter-backdrop" id="filterBackdrop" />

      <Efeitos
        scripts={[
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
          '/nav-dropdown.js',
          '/common.js',
          '/elegant-select.js',
          '/imoveis.js',
        ]}
      />
    </>
  )
}
