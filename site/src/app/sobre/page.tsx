import type { Metadata } from 'next'
import { getImoveis } from '@/lib/queries'
import Efeitos from '@/components/Efeitos'

export const metadata: Metadata = {
  title: 'A Tamada — Tamada Imóveis',
  description:
    'Conheça a Tamada Imóveis — uma imobiliária de bairro em São Paulo, com atendimento próximo, transparência e CRECI licenciado.',
}

export default async function SobrePage() {
  const imoveis = await getImoveis()

  return (
    <>
      {/* Só esta página usa hero em vídeo — CSS isolado em .video-hero-page pra não vazar
          pro resto do site (imoveis.html, anuncie.html etc. compartilham .catalog-hero). Como
          o <body> é global (layout.tsx), a classe vira uma div só em volta da hero. */}
      <link rel="stylesheet" href="/hero-video.css" />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.TAMADA_CATALOG=${JSON.stringify(imoveis)};`,
        }}
      />

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
            <a href="/anuncie">Anuncie</a>
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
                <a className="active" href="/sobre">
                  A Tamada
                </a>
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
            <a className="button button-red" href="https://wa.me/5511965935749" target="_blank" rel="noopener">
              <span>Falar com a Tamada</span>
              <iconify-icon icon="mdi:whatsapp" />
            </a>
            <button className="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
        <div className="mobile-menu-number">
          A
          <br />
          TAMADA
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

      <main id="sobreContent">
        <div className="video-hero-page">
          <section className="catalog-hero hero-video">
            <div className="catalog-hero-media" aria-hidden="true">
              <img src="/assets/images/tamada-hero-poster.jpg" alt="" fetchPriority="high" />
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/assets/images/tamada-hero-poster.jpg"
                id="heroVideo"
              >
                <source src="/assets/video/tamada-hero-mobile.mp4" type="video/mp4" media="(max-width:860px)" />
                <source src="/assets/video/tamada-hero.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="catalog-hero-scrim" aria-hidden="true" />
            <button className="hero-video-play" id="heroVideoPlay" type="button" hidden aria-label="Reproduzir vídeo">
              <iconify-icon icon="solar:play-bold" />
            </button>
            <div className="shell">
              <nav className="breadcrumbs" aria-label="Navegação estrutural">
                <a href="/">Início</a>
                <iconify-icon icon="solar:alt-arrow-right-linear" />
                <span>A Tamada</span>
              </nav>
              <div className="catalog-hero-grid">
                <div>
                  <p className="eyebrow">
                    <span /> <span>Institucional</span>
                  </p>
                  <h1>
                    Vinte anos
                    <br />
                    <em>na mesma esquina.</em>
                  </h1>
                </div>
                <div className="catalog-hero-aside">
                  <p>
                    Sede própria em São Paulo, equipe que atua nas mesmas ruas há duas décadas e atendimento
                    presencial de verdade — da primeira visita à entrega das chaves.
                  </p>
                  <dl>
                    <div>
                      <dt>20</dt>
                      <dd>anos de sede própria</dd>
                    </div>
                    <div>
                      <dt id="statImoveis">{imoveis.length}</dt>
                      <dd>imóveis disponíveis</dd>
                    </div>
                    <div>
                      <dt>12</dt>
                      <dd>regiões em destaque</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="about-section section" id="heroTransition">
          <div className="about-image scroll-fill" style={{ clipPath: 'inset(0 0 100% 0)' }}>
            <img src="/assets/images/about-sobre-1.jpg" alt="Recepção da Tamada Imóveis" />
            <span>
              Atendimento humano
              <br />
              do primeiro contato à chave
            </span>
          </div>
          <div className="about-copy scroll-fill">
            <p className="eyebrow">
              <span>01</span> Quem somos
            </p>
            <h2>
              Uma imobiliária
              <br />
              <em>que conhece a rua.</em>
            </h2>
            <p>
              A Tamada nasceu perto de casa — e continua assim. Trabalhamos venda, locação e administração de
              imóveis com uma equipe que atua na mesma região há anos, entende os bairros de verdade e trata cada
              negócio com a atenção que ele merece, do primeiro contato à entrega das chaves.
            </p>
            <p>
              Não somos um portal, nem um call center. Somos uma imobiliária de bairro, com corretores que você pode
              conhecer pelo nome.
            </p>
          </div>
        </section>

        <section className="about-section section" id="valuesTransition">
          <div className="about-copy reveal">
            <p className="eyebrow">
              <span>02</span> Nossos valores
            </p>
            <h2>
              Transparência
              <br />
              <em>em cada negociação.</em>
            </h2>
            <p>
              Acreditamos que toda negociação começa com clareza. Por isso, explicamos cada etapa para que você
              entenda tudo antes de assinar e tome suas decisões com segurança.
            </p>
            <p>
              Atuamos sempre dentro da lei e da ética do mercado imobiliário, com registro CRECI e responsabilidade
              em cada etapa do processo.
            </p>
          </div>
          <div className="about-image scroll-fill" style={{ clipPath: 'inset(0 0 100% 0)' }}>
            <img src="/assets/images/about-sobre-2.jpg" alt="Chave e mapa de bairro sobre mesa de madeira" loading="lazy" />
            <span>
              Do contrato
              <br />
              à entrega das chaves
            </span>
          </div>
        </section>

        <section className="announce-benefits section">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>03</span> Diferenciais
                </p>
                <h2>
                  Por que escolher
                  <br />
                  <em>a Tamada.</em>
                </h2>
              </div>
              <p>Experiência, proximidade e conhecimento do mercado para cuidar de cada negociação.</p>
            </div>
            <div className="benefit-grid">
              <article className="benefit-card reveal">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:map-point-linear" />
                </div>
                <h3>Conhecimento da região</h3>
                <p>Atuamos de perto nos bairros que conhecemos, oferecendo uma visão mais precisa do mercado local.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-1">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:buildings-2-linear" />
                </div>
                <h3>Atendimento próximo</h3>
                <p>Você conta com uma equipe presente e disponível para orientar cada etapa da negociação.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-2">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:document-text-linear" />
                </div>
                <h3>Transparência</h3>
                <p>Informações claras e orientação para que você tome decisões com mais segurança.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-3">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:shield-check-linear" />
                </div>
                <h3>Gestão completa</h3>
                <p>Da divulgação à entrega das chaves, cuidamos de cada etapa para tornar o processo mais simples.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="space-section section">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>04</span> Nosso espaço
                </p>
                <h2>
                  Um escritório
                  <br />
                  <em>pra receber você.</em>
                </h2>
              </div>
              <p>Passe para conversar, assinar contrato ou só tirar uma dúvida — sem hora marcada.</p>
            </div>
            <div className="space-gallery">
              <button className="space-gallery-item reveal" type="button" data-i="0" aria-label="Ampliar foto">
                <img src="/assets/images/space-sobre-1.jpg" alt="Fachada do escritório Tamada Imóveis" loading="lazy" />
              </button>
              <button className="space-gallery-item reveal reveal-delay-1" type="button" data-i="1" aria-label="Ampliar foto">
                <img src="/assets/images/space-sobre-2.jpg" alt="Sala de reunião do escritório Tamada Imóveis" loading="lazy" />
              </button>
              <button className="space-gallery-item reveal reveal-delay-2" type="button" data-i="2" aria-label="Ampliar foto">
                <img src="/assets/images/space-sobre-3.jpg" alt="Recepção do escritório Tamada Imóveis" loading="lazy" />
              </button>
              <button className="space-gallery-item reveal" type="button" data-i="3" aria-label="Ampliar foto">
                <img src="/assets/images/space-sobre-4.jpg" alt="Detalhe do escritório Tamada Imóveis" loading="lazy" />
              </button>
              <button className="space-gallery-item reveal reveal-delay-1" type="button" data-i="4" aria-label="Ampliar foto">
                <img src="/assets/images/space-sobre-5.jpg" alt="Corredor do escritório Tamada Imóveis" loading="lazy" />
              </button>
              <button className="space-gallery-item reveal reveal-delay-2" type="button" data-i="5" aria-label="Ampliar foto">
                <img
                  src="/assets/images/space-sobre-6.jpg"
                  alt="Vista do bairro a partir do escritório Tamada Imóveis"
                  loading="lazy"
                />
              </button>
            </div>
          </div>
        </section>

        <section className="instagram-cta">
          <div className="section-atmosphere atmosphere-red" aria-hidden="true" />
          <span className="hero-word" aria-hidden="true">
            Insta
          </span>
          <div className="shell">
            <p className="eyebrow">
              <span>05</span> Siga a Tamada
            </p>
            <h2>
              Bairro por bairro,
              <br />
              <em>na sua timeline.</em>
            </h2>
            <p>Imóveis novos, bastidores do atendimento e novidades da região — tudo no nosso Instagram.</p>
            <a
              className="button button-red button-large magnetic"
              href="https://www.instagram.com/tamadaimoveis/"
              target="_blank"
              rel="noopener"
            >
              <span>Seguir @tamadaimoveis</span>
              <iconify-icon icon="mdi:instagram" />
            </a>
          </div>
        </section>

        <section className="catalog-cta">
          <div className="shell">
            <div>
              <p className="eyebrow eyebrow-light">
                <span /> Já conhece a Tamada
              </p>
              <h2>
                Agora veja o
                <br />
                <em>catálogo completo.</em>
              </h2>
            </div>
            <div>
              <p>Imóveis à venda e para locação em São Paulo e região, com busca por bairro, preço e características.</p>
              <a className="button button-red button-large" href="/imoveis">
                Ver catálogo <iconify-icon icon="solar:arrow-up-right-linear" />
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

      <div className="lightbox" id="lightbox" hidden aria-modal="true" role="dialog" aria-label="Galeria do espaço Tamada">
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

      <Efeitos gsap scripts={['/nav-dropdown.js', '/common.js', '/sobre.js']} />
    </>
  )
}
