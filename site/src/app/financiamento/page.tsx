import type { Metadata } from 'next'
import Efeitos from '@/components/Efeitos'

export const metadata: Metadata = {
  title: 'Simular financiamento — Tamada Imóveis',
  description:
    'Simule seu financiamento imobiliário com a Tamada — compare taxas dos principais bancos e do Minha Casa Minha Vida.',
}

// Página de simulador estático — sem dado nenhum do Sanity, o cálculo de
// parcela/MCMV é todo client-side em financiamento.js. Header tem a mesma
// variação de anuncie.html (busca vira link pro catálogo, CTA aponta pro
// simulador, item "Simular Financiamento" ativo no dropdown Serviços), então
// segue copiado inline como lá — mesma lógica de imovel/[ref]/page.tsx.
export default function FinanciamentoPage() {
  return (
    <>
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
            <details className="nav-dropdown active">
              <summary>
                Serviços <iconify-icon icon="solar:alt-arrow-down-linear" />
              </summary>
              <div>
                <a href="/anuncie">Anuncie seu imóvel</a>
                <a className="active" href="/financiamento">
                  Simular Financiamento
                </a>
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
            <a className="button button-red" href="#simulador">
              <span>Simular agora</span>
              <iconify-icon icon="solar:arrow-down-linear" />
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
          SIMULAR
          <br />
          FINANCIAMENTO
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

      <main id="financeContent">
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/assets/images/hero-financiamento.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>Financiamento</span>
            </nav>
            <div className="catalog-hero-grid">
              <div>
                <p className="eyebrow">
                  <span /> <span>Simulação de financiamento</span>
                </p>
                <h1>
                  Descubra a parcela
                  <br />
                  <em>que cabe no seu bolso.</em>
                </h1>
              </div>
              <div className="catalog-hero-aside">
                <p>
                  Compare as taxas dos principais bancos e do Minha Casa Minha Vida em segundos. Sem compromisso e sem
                  custo.
                </p>
                <div className="announce-hero-actions">
                  <a className="button button-red button-large magnetic" href="#simulador">
                    <span>Fazer minha simulação</span>
                    <iconify-icon icon="solar:arrow-right-linear" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Carrossel de bancos */}
        <section className="bank-strip" aria-label="Bancos parceiros">
          <div className="shell bank-strip-head">
            <span>Trabalhamos com os principais bancos do país</span>
          </div>
          <div className="bank-marquee" aria-hidden="true">
            <div className="bank-track" id="bankTrack" />
          </div>
        </section>

        {/* Simulador */}
        <section className="section finance-sim-section" id="simulador">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span /> Simulador
                </p>
                <h2>
                  Simule em
                  <br />
                  <em>3 passos.</em>
                </h2>
              </div>
              <p>
                Informe o valor do imóvel, a entrada e sua renda. A gente calcula a parcela em cada banco e verifica se
                você tem direito ao Minha Casa Minha Vida.
              </p>
            </div>
            <div className="finance-sim" id="financeSim" />
          </div>
        </section>

        <section className="section finance-help">
          <div className="shell finance-help-grid">
            <div className="finance-help-copy reveal">
              <p className="eyebrow">
                <span /> Como funciona
              </p>
              <h2>
                Um corretor
                <br />
                <em>faz o resto.</em>
              </h2>
              <p>
                A simulação é uma estimativa. Cada banco tem análise de crédito própria e o subsídio do MCMV depende do
                seu perfil. Nossa equipe faz a análise real, cuida da documentação e acompanha até a assinatura.
              </p>
            </div>
            <ul className="finance-help-list reveal reveal-delay-1">
              <li>
                <iconify-icon icon="solar:check-circle-linear" /> Comparação com Caixa, Itaú, Bradesco, Santander e mais
              </li>
              <li>
                <iconify-icon icon="solar:check-circle-linear" /> Verificação automática do Minha Casa Minha Vida
              </li>
              <li>
                <iconify-icon icon="solar:check-circle-linear" /> Pode usar o FGTS como parte da entrada
              </li>
              <li>
                <iconify-icon icon="solar:check-circle-linear" /> Atendimento humano, sem custo pra simular
              </li>
            </ul>
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
              <a href="/financiamento">Simular financiamento</a>
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

      <Efeitos scripts={['/nav-dropdown.js', '/common.js', '/financiamento.js']} />
    </>
  )
}
