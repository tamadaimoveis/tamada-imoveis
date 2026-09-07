import type { Metadata } from 'next'
import { getImoveis, getBairros } from '@/lib/queries'
import Efeitos from '@/components/Efeitos'
import MobileMenu from '@/components/MobileMenu'
import TabBar from '@/components/TabBar'

export const metadata: Metadata = {
  title: 'Trabalhe Conosco — Tamada Imóveis',
  description:
    'Trabalhe conosco: seja um corretor autônomo parceiro da Tamada Imóveis. Carteira ativa, leads e estrutura de uma imobiliária de bairro em São Paulo e região.',
}

export default async function TrabalheConoscoPage() {
  const [imoveis, bairros] = await Promise.all([getImoveis(), getBairros()])

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.TAMADA_CATALOG=${JSON.stringify(imoveis)};window.TAMADA_BAIRROS=${JSON.stringify(bairros)};`,
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
                <a href="/sobre">A Tamada</a>
                <a className="active" href="/trabalhe-conosco">
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
            <a className="button button-ghost header-search" href="/imoveis">
              <iconify-icon icon="solar:magnifer-linear" />
              <span>Ver catálogo</span>
            </a>
            <a className="button button-red" href="#candidatura">
              <span>Candidatar-se</span>
              <iconify-icon icon="solar:arrow-down-linear" />
            </a>
            <button className="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu />

      <main id="trabalheContent">
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/assets/images/hero-trabalhe.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>Trabalhe conosco</span>
            </nav>
            <div className="catalog-hero-grid">
              <div>
                <p className="eyebrow">
                  <span /> <span>Faça parte da Tamada</span>
                </p>
                <h1>
                  Seu próximo passo
                  <br />
                  <em>profissional pode começar aqui.</em>
                </h1>
              </div>
              <div className="catalog-hero-aside">
                <p>Oportunidades em diferentes áreas para quem quer aprender, crescer e construir uma trajetória com a Tamada.</p>
                <dl>
                  <div>
                    <dt id="statCarteira">{imoveis.length}</dt>
                    <dd>imóveis na carteira ativa</dd>
                  </div>
                  <div>
                    <dt id="statBairros">{bairros.length}</dt>
                    <dd>bairros com presença</dd>
                  </div>
                  <div>
                    <dt>Crescimento</dt>
                    <dd>ambiente colaborativo, com espaço para aprender e evoluir</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="announce-benefits section">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>01</span> O que você ganha
                </p>
                <h2>
                  Estrutura pronta,
                  <br />
                  <em>comissão sua.</em>
                </h2>
              </div>
              <p>Estrutura de comissão competitiva — detalhamos na conversa. O resto, é isso aqui:</p>
            </div>
            <div className="benefit-grid">
              <article className="benefit-card reveal">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:case-minimalistic-linear" />
                </div>
                <h3>Carteira pronta</h3>
                <p>
                  <span id="statCarteira3">{imoveis.length}</span> imóveis ativos agora — você não começa do zero
                  procurando cliente.
                </p>
              </article>
              <article className="benefit-card reveal reveal-delay-1">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:medal-ribbon-star-linear" />
                </div>
                <h3>
                  Marca em <span id="statBairros3">{bairros.length}</span> bairros
                </h3>
                <p>Você negocia com o peso de uma imobiliária já presente na região.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-2">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:shield-check-linear" />
                </div>
                <h3>Suporte de verdade</h3>
                <p>Retaguarda administrativa e jurídica do escritório, CRECI da empresa cobrindo sua atuação.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-3">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:routing-2-linear" />
                </div>
                <h3>Autonomia com estrutura</h3>
                <p>Você toca sua agenda e seus contatos, com o escritório Tamada por trás.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="announce-form-section section" id="candidatura">
          <div className="shell announce-form-grid">
            <div className="announce-form-copy reveal">
              <p className="eyebrow">
                <span /> Candidate-se
              </p>
              <h2>
                Manda seu perfil
                <br />
                <em>e vamos conversar.</em>
              </h2>
              <p>Quanto mais informação, melhor a conversa. Mas fique tranquilo — só o essencial é obrigatório.</p>
              <ul className="announce-form-points">
                <li>
                  <iconify-icon icon="solar:check-circle-linear" /> Retorno em até 2 dias úteis
                </li>
                <li>
                  <iconify-icon icon="solar:check-circle-linear" /> Conversa direta, sem processo seletivo arrastado
                </li>
              </ul>
              <div className="announce-form-contact">
                <iconify-icon icon="mdi:whatsapp" />
                <div>
                  <strong>Prefere falar direto?</strong>
                  <a href="tel:01126822320">(11) 2682-2320</a>
                </div>
              </div>
            </div>

            <form className="announce-form" id="recruitForm" noValidate>
              <fieldset>
                <legend>Seus dados</legend>
                <label className="af-field">
                  <span>Vaga de interesse*</span>
                  <select id="rcRole" required data-elegant="">
                    <option value="">Selecione</option>
                    <option>Corretor autônomo</option>
                    <option>Captador</option>
                    <option>Administrativo</option>
                    <option>Outro</option>
                  </select>
                </label>
                <div className="af-row">
                  <label className="af-field">
                    <span>Nome completo*</span>
                    <input id="rcName" type="text" autoComplete="name" required placeholder="Seu nome" />
                  </label>
                  <label className="af-field">
                    <span>Telefone / WhatsApp*</span>
                    <input
                      id="rcPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="(11) 90000-0000"
                    />
                  </label>
                </div>
                <label className="af-field">
                  <span>E-mail*</span>
                  <input id="rcEmail" type="email" autoComplete="email" required placeholder="voce@email.com" />
                </label>
              </fieldset>

              <fieldset>
                <legend>Sobre sua experiência</legend>
                {/* Só faz sentido pra quem se candidata a corretor. JS mostra/esconde
                    e liga/desliga o required em rcStatus conforme a Vaga de interesse. */}
                <div className="af-row" id="rcCorretorFields">
                  <label className="af-field">
                    <span>Já é corretor?*</span>
                    <select id="rcStatus" data-elegant="">
                      <option value="">Selecione</option>
                      <option>Sim, tenho CRECI ativo</option>
                      <option>Estou tirando o CRECI</option>
                      <option>Ainda não, mas tenho interesse</option>
                    </select>
                  </label>
                  <label className="af-field">
                    <span>CRECI</span>
                    <input id="rcCreci" type="text" placeholder="Se já tiver" />
                  </label>
                </div>
                {/* Só faz sentido pra quem NÃO é corretor — pra corretor autônomo o que
                    importa é CRECI/experiência de mercado, não faculdade. */}
                <div id="rcFormacaoFields" hidden>
                  <div className="af-row">
                    <label className="af-field">
                      <span>É formado(a)?</span>
                      <select id="rcFormado" data-elegant="">
                        <option value="">Selecione</option>
                        <option>Sim</option>
                        <option>Cursando</option>
                        <option>Não</option>
                      </select>
                    </label>
                    <label className="af-field">
                      <span>Ano de conclusão</span>
                      <input id="rcAnoConclusao" type="text" inputMode="numeric" placeholder="Ex.: 2022" />
                    </label>
                  </div>
                  <div className="af-row">
                    <label className="af-field">
                      <span>Faculdade / instituição</span>
                      <input id="rcFaculdade" type="text" placeholder="Se já tiver ou estiver cursando" />
                    </label>
                    <label className="af-field">
                      <span>Curso</span>
                      <input id="rcCurso" type="text" placeholder="Ex.: Administração, Gestão Imobiliária..." />
                    </label>
                  </div>
                </div>
                <details className="af-more">
                  <summary>Currículo e mais sobre você (opcional)</summary>
                  <label className="af-field">
                    <span id="rcExperienceLabel">Conte um pouco da sua experiência</span>
                    <textarea
                      id="rcExperience"
                      rows={3}
                      placeholder="Tempo de mercado, imóveis que já negociou, o que você busca..."
                    />
                  </label>
                  <label className="af-field">
                    <span>Currículo</span>
                    <input id="rcResume" type="file" accept=".pdf,.doc,.docx" />
                  </label>
                </details>
                <label className="lead-check">
                  <input id="rcConsent" type="checkbox" required />
                  <span>
                    Declaro que li e concordo em ser contatado pela Tamada Imóveis, de acordo com a Política de
                    Privacidade.
                  </span>
                </label>
              </fieldset>

              <button className="button button-red button-large" id="rcSubmit" type="submit">
                <iconify-icon icon="solar:arrow-right-linear" />
                <span>Enviar candidatura</span>
              </button>
              <p className="af-note">Seus dados ficam guardados e nosso time analisa — sem processo automático, sem spam.</p>
              <p className="af-note" id="rcError" hidden role="alert" />
            </form>

            <div className="announce-form af-success" id="recruitSuccess" hidden>
              <iconify-icon icon="solar:check-circle-bold" />
              <h3>Recebemos seu interesse!</h3>
              <p>Nosso time vai olhar seu perfil e entra em contato em breve.</p>
              <a className="button button-red button-large" href="/imoveis">
                <span>Ver catálogo completo</span>
                <iconify-icon icon="solar:arrow-up-right-linear" />
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

      <TabBar />

      <Efeitos scripts={['/nav-dropdown.js', '/common.js', '/elegant-select.js', '/trabalhe-conosco.js']} />
    </>
  )
}
