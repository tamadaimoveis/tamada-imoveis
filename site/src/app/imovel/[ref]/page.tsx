import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getImovel, getImoveis } from '@/lib/queries'
import Efeitos from '@/components/Efeitos'

export const dynamicParams = true

// 4.429 imóveis — gerar a lista inteira no build estoura o limite da Vercel
// (o Imobueno, com 184, já levava 8min). Só os destaques nascem prontos;
// o resto é gerado sob demanda na primeira visita e fica em cache (ISR).
export async function generateStaticParams() {
  const imoveis = await getImoveis()
  return imoveis
    .filter((p) => p.featured)
    .slice(0, 24)
    .map((p) => ({ ref: p.ref }))
}

type Props = { params: Promise<{ ref: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params
  const imovel = await getImovel(ref.toUpperCase())
  if (!imovel) return { title: 'Imóvel não encontrado — Tamada Imóveis' }
  return {
    title: `${imovel.title} — ${imovel.neighborhood} · Tamada Imóveis`,
    description: (imovel.descricao || `${imovel.title} em ${imovel.neighborhood}, ${imovel.city}.`).slice(0, 160),
  }
}

export default async function ImovelPage({ params }: Props) {
  const { ref } = await params
  const imovel = await getImovel(ref.toUpperCase())
  if (!imovel) notFound()

  const parecidos = (await getImoveis()).slice(0, 400) // base pra "imóveis parecidos" (pickSimilar em imovel.js)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.title,
    description: imovel.descricao,
    url: `https://www.tamadaimoveis.com.br${imovel.url}`,
    address: { '@type': 'PostalAddress', addressLocality: imovel.neighborhood, addressRegion: imovel.city },
  }

  return (
    <>
      {/* Dados do imóvel injetados server-side — imovel.js (legado, injetado
          abaixo via Efeitos) lê window.__TAMADA_PROPERTY__ em vez de fazer
          fetch: sem waterfall, sem CORS, mesmo formato de sempre. */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.__TAMADA_PROPERTY__=${JSON.stringify(imovel)};window.TAMADA_CATALOG=${JSON.stringify(parecidos)};`,
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Leaflet só carregava o JS, nunca o CSS — sem isso o mapa não tem
          posicionamento absoluto e os tiles empilham soltos na página. */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <header className="site-header catalog-header" id="siteHeader">
        <div className="shell header-inner">
          <a className="brand" href="/" aria-label="Tamada Imóveis — início">
            <img src="/assets/images/tamada-logo.png" alt="Tamada Imóveis" width={400} height={148} />
            <img className="brand-logo-white" src="/assets/images/tamada-logo-white.png" alt="" aria-hidden="true" />
          </a>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <details className="nav-dropdown">
              <summary>
                Comprar <iconify-icon icon="solar:alt-arrow-down-linear" />
              </summary>
              <div>
                <a href="/imoveis?purpose=sale">Todos à venda</a>
                <a href="/imoveis?purpose=sale&type=HOUSE">Casas</a>
                <a href="/imoveis?purpose=sale&type=TWO_STORY_HOUSE">Sobrados</a>
                <a href="/imoveis?purpose=sale&type=APARTMENT">Apartamentos</a>
                <a href="/imoveis?purpose=sale&type=LAND">Terrenos</a>
                <a href="/imoveis?purpose=sale&commercial=1">Comerciais</a>
              </div>
            </details>
            <details className="nav-dropdown">
              <summary>
                Alugar <iconify-icon icon="solar:alt-arrow-down-linear" />
              </summary>
              <div>
                <a href="/imoveis?purpose=rent">Todos para alugar</a>
                <a href="/imoveis?purpose=rent&type=HOUSE">Casas</a>
                <a href="/imoveis?purpose=rent&type=TWO_STORY_HOUSE">Sobrados</a>
                <a href="/imoveis?purpose=rent&type=APARTMENT">Apartamentos</a>
                <a href="/imoveis?purpose=rent&commercial=1">Comerciais</a>
              </div>
            </details>
            <details className="nav-dropdown">
              <summary>
                Serviços <iconify-icon icon="solar:alt-arrow-down-linear" />
              </summary>
              <div>
                <a href="/anuncie">Anuncie seu imóvel</a>
                <a href="https://tmdconsultoriai.superlogica.net/clients/areadocliente" target="_blank" rel="noopener">
                  2ª via de boleto
                </a>
                <a href="https://tmdconsultoriai.superlogica.net/clients/areadofornecedor" target="_blank" rel="noopener">
                  Extrato do proprietário
                </a>
              </div>
            </details>
            <details className="nav-dropdown">
              <summary>
                Institucional <iconify-icon icon="solar:alt-arrow-down-linear" />
              </summary>
              <div>
                <a href="/sobre">A Tamada</a>
                <a href="/trabalhe-conosco">Trabalhe conosco</a>
                <a href="https://www.planalto.gov.br/ccivil_03/leis/l8245.htm" target="_blank" rel="noopener">
                  Leis do Inquilinato
                </a>
                <a href="https://www.tamadaimoveis.com.br/fale-conosco" target="_blank" rel="noopener">
                  Dúvidas e reclamações
                </a>
              </div>
            </details>
          </nav>
          <div className="header-actions">
            <a className="button button-ghost header-search" href="/imoveis">
              <iconify-icon icon="solar:magnifer-linear" />
              <span>Ver catálogo</span>
            </a>
            <a className="button button-red" href="/anuncie">
              <span>Anuncie seu imóvel</span>
              <iconify-icon icon="solar:arrow-up-right-linear" />
            </a>
            <button className="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
        <div className="mobile-menu-number" id="mobileMenuRef">
          IMÓVEL
          <br />
          {imovel.ref}
        </div>
        <nav aria-label="Navegação móvel">
          <a href="/">
            <span>00</span> Início
          </a>
          <a href="/imoveis?purpose=sale">
            <span>01</span> Comprar
          </a>
          <a href="/imoveis?purpose=rent">
            <span>02</span> Alugar
          </a>
          <a href="/anuncie">
            <span>03</span> Anuncie
          </a>
          <a href="/sobre">
            <span>04</span> Institucional
          </a>
        </nav>
        <a className="mobile-whatsapp" href="https://wa.me/5511965935749" target="_blank" rel="noopener">
          Conversar no WhatsApp <iconify-icon icon="solar:arrow-up-right-linear" />
        </a>
      </div>

      <main id="detailContent">
        <div id="detailFound">
          <section className="detail-hero">
            <div className="detail-filmstrip" id="detailStrip" aria-label="Fotos do imóvel" />
            <button className="gallery-arrow gallery-prev" id="galleryPrev" type="button" aria-label="Fotos anteriores">
              <iconify-icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button className="gallery-arrow gallery-next" id="galleryNext" type="button" aria-label="Próximas fotos">
              <iconify-icon icon="solar:alt-arrow-right-linear" />
            </button>
            <div className="strip-badges">
              <button className="strip-chip" id="galleryOpen" type="button">
                <iconify-icon icon="solar:camera-linear" /> <span id="galleryCount">Fotos</span>
              </button>
              <button className="strip-chip strip-chip-video" id="videoOpen" type="button" hidden>
                <iconify-icon icon="solar:play-circle-linear" /> Vídeo
              </button>
              <button className="strip-chip" id="tourOpen" type="button" hidden>
                <iconify-icon icon="solar:rotate-right-linear" /> Tour 360°
              </button>
              <a className="strip-chip" href="#detailMapSection">
                <iconify-icon icon="solar:map-linear" /> Mapa
              </a>
            </div>
          </section>

          <section className="detail-intro">
            <div className="shell detail-intro-grid">
              <div className="detail-intro-left">
                <div className="detail-pricebar" id="detailPriceCard">
                  <div>
                    <span className="pc-label" id="detailPriceLabel">
                      À venda por
                    </span>
                    <strong className="pc-value" id="detailPrice" />
                  </div>
                  <span className="pc-note">* Os valores podem variar sem data prevista.</span>
                </div>

                <nav className="breadcrumbs" aria-label="Navegação estrutural">
                  <a href="/">Início</a>
                  <iconify-icon icon="solar:alt-arrow-right-linear" />
                  <a href="/imoveis">Imóveis</a>
                  <iconify-icon icon="solar:alt-arrow-right-linear" />
                  <span id="crumbRef" />
                </nav>
                <p className="detail-badges">
                  <span className="detail-purpose" id="detailPurpose" />
                  <span className="detail-type" id="detailType" />
                </p>
                <h1 id="detailTitle" />
                <p className="detail-location">
                  <iconify-icon icon="solar:map-point-linear" /> <span id="detailLocation" />
                </p>

                <div className="detail-share">
                  <span>Compartilhe</span>
                  <div className="share-buttons" id="shareButtons" />
                </div>

                <div className="detail-specs" id="detailSpecs" />
              </div>

              <aside className="detail-intro-form">
                <div className="lead-inline">
                  <p className="detail-contact-kicker">Entre em contato</p>
                  <p className="lead-inline-sub">
                    Preencha e um corretor retorna com todas as informações — direto no seu WhatsApp.
                  </p>
                  <form id="leadForm">
                    <div className="lead-row">
                      <label className="lead-field">
                        <span>Nome*</span>
                        <input id="leadName" name="name" type="text" autoComplete="name" required placeholder="Seu nome" />
                      </label>
                      <label className="lead-field">
                        <span>Telefone / WhatsApp*</span>
                        <input
                          id="leadPhone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          placeholder="(11) 90000-0000"
                        />
                      </label>
                    </div>
                    <label className="lead-field">
                      <span>
                        E-mail <small>(opcional)</small>
                      </span>
                      <input id="leadEmail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
                    </label>
                    <label className="lead-check">
                      <input id="leadConsent" type="checkbox" required />
                      <span>Concordo em ser contatado pela Tamada Imóveis sobre este imóvel.</span>
                    </label>
                    <button className="button button-red button-large" id="leadSubmit" type="submit">
                      <iconify-icon icon="mdi:whatsapp" />
                      <span>Continuar no WhatsApp</span>
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </section>

          <section className="detail-body">
            <div className="shell detail-columns">
              <div className="detail-main">
                <div className="detail-block">
                  <p className="eyebrow">
                    <span /> Sobre este imóvel
                  </p>
                  <h2 id="aboutTitle">
                    Um imóvel com
                    <br />
                    <em>a cara do bairro.</em>
                  </h2>
                  <p id="detailAbout" className="detail-about" />
                </div>

                <div className="detail-block" id="amenitiesBlock">
                  <p className="eyebrow">
                    <span /> O que este imóvel oferece
                  </p>
                  <h2>
                    Características
                    <br />
                    <em>e diferenciais.</em>
                  </h2>
                  <ul className="amenity-grid" id="amenityGrid" />
                </div>

                <div className="detail-block">
                  <p className="eyebrow">
                    <span /> Ficha técnica
                  </p>
                  <h2>
                    Os números
                    <br />
                    <em>do imóvel.</em>
                  </h2>
                  <dl className="detail-facts" id="detailFacts" />
                </div>

                <div className="detail-block" id="detailMapSection">
                  <p className="eyebrow">
                    <span /> Onde fica
                  </p>
                  <h2>
                    Região do imóvel
                    <br />
                    <em id="mapNeighborhood" />
                  </h2>
                  <div className="detail-map-stage">
                    <div id="detailMap" className="detail-map" aria-label="Mapa com localização aproximada do imóvel" />
                    <div className="catalog-map-note">
                      <i /> Posição aproximada — o endereço exato é informado no atendimento
                    </div>
                  </div>
                </div>
              </div>

              <aside className="detail-aside">
                <div className="detail-contact-card">
                  <p className="detail-contact-kicker">Fale sobre este imóvel</p>
                  <strong className="detail-contact-price" id="asidePrice" />
                  <span className="detail-contact-purpose" id="asidePurpose" />
                  <a className="button button-red button-large magnetic" id="asideWhats" href="#leadForm" data-scroll-form>
                    <iconify-icon icon="mdi:whatsapp" />
                    <span>Agendar visita</span>
                  </a>
                  <a className="button button-ghost button-large" href="tel:01126822320">
                    <iconify-icon icon="solar:phone-linear" />
                    <span>(11) 2682-2320</span>
                  </a>
                  <a className="detail-official" id="officialLink" href="#" target="_blank" rel="noopener">
                    Ver anúncio completo com todas as fotos <iconify-icon icon="solar:arrow-up-right-linear" />
                  </a>
                  <p className="detail-contact-note">
                    Atendimento local · CRECI 21745-J
                    <br />
                    Av. Amador Bueno da Veiga, 4389 — São Paulo
                  </p>
                </div>
              </aside>
            </div>
          </section>

          <section className="detail-similar" aria-label="Imóveis semelhantes">
            <div className="shell">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span /> Continue explorando
                  </p>
                  <h2>
                    Semelhantes
                    <br />
                    <em>por perto.</em>
                  </h2>
                </div>
                <p>Outras opções na mesma região ou do mesmo tipo, direto do catálogo local.</p>
              </div>
              <div className="catalog-grid detail-similar-grid" id="similarGrid" />
            </div>
          </section>
        </div>

        <div className="media-modal" id="mediaModal" hidden aria-modal="true" role="dialog" aria-label="Vídeo do imóvel">
          <div className="media-modal-bar">
            <span className="media-modal-title" id="mediaModalTitle" />
            <button type="button" id="mediaModalClose" aria-label="Fechar">
              <iconify-icon icon="solar:close-circle-linear" />
            </button>
          </div>
          <div className="media-modal-stage" id="mediaModalStage" />
        </div>

        <div className="lightbox" id="lightbox" hidden aria-modal="true" role="dialog" aria-label="Galeria de fotos">
          <div className="lightbox-bar">
            <span className="lightbox-title" id="lightboxTitle" />
            <span className="lightbox-counter" id="lightboxCounter" />
            <div className="lightbox-tools">
              <button id="lbZoomOut" type="button" aria-label="Diminuir zoom">
                <iconify-icon icon="solar:minimize-square-3-linear" />
              </button>
              <button id="lbZoomIn" type="button" aria-label="Aumentar zoom">
                <iconify-icon icon="solar:maximize-square-3-linear" />
              </button>
              <button id="lbRotate" type="button" aria-label="Girar">
                <iconify-icon icon="solar:refresh-square-linear" />
              </button>
              <button id="lbReset" type="button" aria-label="Redefinir">
                1:1
              </button>
              <button id="lbToggleThumbs" type="button" aria-label="Ocultar miniaturas">
                <iconify-icon icon="solar:gallery-minimalistic-linear" />
              </button>
              <button id="lightboxClose" type="button" aria-label="Fechar galeria">
                <iconify-icon icon="solar:close-circle-linear" />
              </button>
            </div>
          </div>
          <button className="lb-nav lb-prev" id="lbPrev" type="button" aria-label="Foto anterior">
            <iconify-icon icon="solar:alt-arrow-left-linear" />
          </button>
          <button className="lb-nav lb-next" id="lbNext" type="button" aria-label="Próxima foto">
            <iconify-icon icon="solar:alt-arrow-right-linear" />
          </button>
          <div className="lightbox-stage" id="lbStage">
            <img id="lbImage" src="" alt="" draggable="false" />
          </div>
          <div className="lightbox-thumbs" id="lbThumbs" />
        </div>
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
              <a href="/imoveis">Busca avançada</a>
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
          <a href="/imoveis">
            Voltar ao catálogo <iconify-icon icon="solar:arrow-up-right-linear" />
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

      <Efeitos scripts={['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', '/nav-dropdown.js', '/common.js', '/imovel.js']} />
    </>
  )
}
