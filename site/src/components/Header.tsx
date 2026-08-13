/**
 * Header do site antigo, portado 1:1 (mesmas classes, mesmo markup) —
 * nav-dropdown.js (injetado via Efeitos) liga o toggle do menu mobile e o
 * comportamento dos <details> de navegação sem precisar reescrever nada.
 *
 * `scrolled` NÃO é setado aqui de propósito: no site atual essa classe só
 * existe via JS (common.js, scroll > 90px) em TODA página, inclusive as
 * internas — nenhuma delas nasce sólida. Funciona porque toda página tem uma
 * hero/imagem escura logo abaixo do header. Prefixar "scrolled" no servidor
 * mudaria o comportamento original, não corrigiria bug nenhum.
 * `catalog-header` não tem regra CSS nenhuma (confirmado) — mantido só pra
 * bater 1:1 com o HTML antigo.
 */
export default function Header({ catalogo = false, active }: { catalogo?: boolean; active?: string }) {
  return (
    <header className={`site-header${catalogo ? ' catalog-header' : ''}`} id="siteHeader">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="Tamada Imóveis — início">
          <img src="/assets/images/tamada-logo.png" alt="Tamada Imóveis" width={400} height={148} />
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
              <a className={active === 'sobre' ? 'active' : undefined} href="/sobre">
                A Tamada
              </a>
              <a className={active === 'trabalhe-conosco' ? 'active' : undefined} href="/trabalhe-conosco">
                Trabalhe conosco
              </a>
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
          <button className="button button-ghost header-search" type="button" data-open-search>
            <iconify-icon icon="solar:magnifer-linear" />
            <span>Busca avançada</span>
          </button>
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
  )
}
