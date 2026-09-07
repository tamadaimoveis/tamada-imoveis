import type { Metadata } from 'next'
import Efeitos from '@/components/Efeitos'
import MobileMenu from '@/components/MobileMenu'
import TabBar from '@/components/TabBar'

export const metadata: Metadata = {
  title: 'Anuncie seu imóvel — Tamada Imóveis',
  description:
    'Anuncie seu imóvel com a Tamada Imóveis — venda, locação e administração em São Paulo e região. Simples, sem burocracia.',
}

// Página de formulário estático — sem dado nenhum do Sanity. O header tem
// CTA/nav-ativo diferentes do padrão (link "Anuncie" ativo solto no nav,
// busca vira link pro catálogo em vez de abrir o modal, CTA aponta pro
// formulário), então é copiado inline em vez de usar <Header /> — mesma
// lógica de imovel/[ref]/page.tsx. anuncie.js (legado, via Efeitos) cuida da
// validação/envio; os ids dos campos batem 1:1 com o que ele espera.
export default function AnunciePage() {
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
            <a className="active" href="/anuncie">
              Anuncie
            </a>
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
            <a className="button button-red" href="#announceForm">
              <span>Anunciar agora</span>
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

      <main id="announceContent">
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/assets/images/hero-anuncie.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>Anuncie seu imóvel</span>
            </nav>
            <div className="catalog-hero-grid">
              <div>
                <p className="eyebrow">
                  <span /> <span>Proprietários</span>
                </p>
                <h1>
                  Anuncie seu imóvel
                  <br />
                  <em>sem burocracia.</em>
                </h1>
              </div>
              <div className="catalog-hero-aside">
                <p>
                  Com a Tamada, colocar seu imóvel à venda ou para locação é simples, rápido e com total segurança. Você
                  acompanha cada passo.
                </p>
                <div className="announce-hero-actions">
                  <a className="button button-red button-large magnetic" href="#announceForm">
                    <span>Cadastrar meu imóvel</span>
                    <iconify-icon icon="solar:arrow-right-linear" />
                  </a>
                  <a className="announce-hero-phone" href="https://wa.me/5511966378282" target="_blank" rel="noopener">
                    <span>
                      <iconify-icon icon="mdi:whatsapp" />
                    </span>
                    <small>
                      Falar com um corretor
                      <b>(11) 96637-8282</b>
                    </small>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="announce-benefits section">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span /> Por que anunciar com a Tamada
                </p>
                <h2>
                  Seu imóvel
                  <br />
                  <em>em boas mãos.</em>
                </h2>
              </div>
              <p>
                Uma imobiliária local, próxima e experiente — que trata cada imóvel como se fosse único, do anúncio à
                entrega das chaves.
              </p>
            </div>
            <div className="benefit-grid">
              <article className="benefit-card reveal">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:tag-price-linear" />
                </div>
                <h3>Avaliação justa</h3>
                <p>Definimos o preço certo com base no mercado da sua região — nem acima, nem abaixo do que vale.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-1">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:magnifer-zoom-in-linear" />
                </div>
                <h3>Divulgação ampla</h3>
                <p>Seu imóvel exposto no nosso catálogo e nos principais portais, com fotos e descrição que vendem.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-2">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:shield-check-linear" />
                </div>
                <h3>Segurança total</h3>
                <p>Contratos, documentação e negociação conduzidos por quem entende — CRECI 21745-J.</p>
              </article>
              <article className="benefit-card reveal reveal-delay-3">
                <div className="benefit-icon">
                  <iconify-icon icon="solar:users-group-rounded-linear" />
                </div>
                <h3>Atendimento próximo</h3>
                <p>Um corretor acompanha você do começo ao fim, com respostas rápidas e sem enrolação.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="announce-steps section">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span /> Como funciona
                </p>
                <h2>
                  Três passos
                  <br />
                  <em>até anunciar.</em>
                </h2>
              </div>
              <p>Você preenche, a gente cuida do resto. Rápido e sem complicação.</p>
            </div>
            <ol className="steps-grid">
              <li className="step-card reveal">
                <span className="step-num">01</span>
                <h3>Preencha o formulário</h3>
                <p>Conte o tipo, a finalidade e alguns dados do imóvel. Leva menos de 2 minutos.</p>
              </li>
              <li className="step-card reveal reveal-delay-1">
                <span className="step-num">02</span>
                <h3>Um corretor entra em contato</h3>
                <p>Agendamos uma visita, avaliamos o imóvel e alinhamos a estratégia de venda ou locação.</p>
              </li>
              <li className="step-card reveal reveal-delay-2">
                <span className="step-num">03</span>
                <h3>Seu imóvel no ar</h3>
                <p>Divulgamos com fotos profissionais e cuidamos de todo o atendimento aos interessados.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="announce-form-section section" id="announceForm">
          <div className="shell announce-form-grid">
            <div className="announce-form-copy reveal">
              <p className="eyebrow">
                <span /> Cadastre seu imóvel
              </p>
              <h2>
                Preencha e a gente
                <br />
                <em>retorna rápido.</em>
              </h2>
              <p>
                Quanto mais informação, melhor a avaliação. Mas fique tranquilo — só o essencial é obrigatório, o resto a
                gente completa na conversa.
              </p>
              <ul className="announce-form-points">
                <li>
                  <iconify-icon icon="solar:check-circle-linear" /> Sem custo para anunciar
                </li>
                <li>
                  <iconify-icon icon="solar:check-circle-linear" /> Retorno em até 1 dia útil
                </li>
                <li>
                  <iconify-icon icon="solar:check-circle-linear" /> Atendimento humano, sem robô
                </li>
              </ul>
            </div>

            <form className="announce-form" id="propertyForm" noValidate>
              <fieldset>
                <legend>Informações do imóvel</legend>
                <div className="af-row">
                  <label className="af-field">
                    <span>Tipo do imóvel*</span>
                    <select id="afType" required>
                      <option value="">Selecione</option>
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Sobrado</option>
                      <option>Kitnet / Studio</option>
                      <option>Terreno</option>
                      <option>Chácara / Sítio</option>
                      <option>Salão comercial</option>
                      <option>Sala comercial</option>
                      <option>Galpão</option>
                      <option>Prédio</option>
                      <option>Loja</option>
                      <option>Outro</option>
                    </select>
                  </label>
                  <label className="af-field">
                    <span>Finalidade*</span>
                    <select id="afGoal" required>
                      <option value="">Selecione</option>
                      {/* Sem "Temporada": a Tamada não trabalha com esse tipo de locação. */}
                      <option>Venda</option>
                      <option>Locação</option>
                      <option>Venda e locação</option>
                    </select>
                  </label>
                </div>
                <label className="af-field af-field-location">
                  <span>Bairro / Cidade</span>
                  <input id="afLocation" type="text" placeholder="Ex.: Tatuapé, São Paulo" />
                </label>

                <details className="af-more">
                  <summary>Mais detalhes do imóvel (opcional)</summary>
                  <div className="af-row af-row-3">
                    <label className="af-field">
                      <span>Quartos</span>
                      <select id="afBeds">
                        <option value="">--</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>Acima de 5</option>
                      </select>
                    </label>
                    <label className="af-field">
                      <span>Banheiros</span>
                      <select id="afBaths">
                        <option value="">--</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>Acima de 4</option>
                      </select>
                    </label>
                    <label className="af-field">
                      <span>Vagas</span>
                      <select id="afGarage">
                        <option value="">--</option>
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>Acima de 3</option>
                      </select>
                    </label>
                  </div>
                  <div className="af-row af-row-3">
                    <label className="af-field">
                      <span>Área total (m²)</span>
                      <input id="afArea" type="number" min="0" inputMode="numeric" placeholder="Ex.: 120" />
                    </label>
                    <label className="af-field">
                      <span>CEP</span>
                      <input
                        id="afCep"
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        autoComplete="postal-code"
                        placeholder="00000-000"
                      />
                      <small id="afCepStatus" className="af-cep-status" aria-live="polite" />
                    </label>
                  </div>
                  <div className="af-row">
                    <label className="af-field">
                      <span>Aceita pet?</span>
                      <select id="afPet">
                        <option value="">--</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>
                    </label>
                    <label className="af-field" id="afFinancingField">
                      <span>Aceita financiamento?</span>
                      <select id="afFinancing">
                        <option value="">--</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>
                    </label>
                  </div>
                  <label className="af-field">
                    <span>Endereço completo</span>
                    <input id="afAddress" type="text" placeholder="Rua, número, complemento (não será divulgado)" />
                  </label>
                  <label className="af-field">
                    <span>Informações adicionais</span>
                    <textarea id="afNotes" rows={3} placeholder="Conte diferenciais, estado do imóvel, valor pretendido…" />
                  </label>
                </details>
              </fieldset>

              <fieldset>
                <legend>Seus dados para contato</legend>
                <div className="af-row">
                  <label className="af-field">
                    <span>Nome completo*</span>
                    <input id="afName" type="text" autoComplete="name" required placeholder="Seu nome" />
                  </label>
                  <label className="af-field">
                    <span>Telefone / WhatsApp*</span>
                    <input
                      id="afPhone"
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
                  <input id="afEmail" type="email" autoComplete="email" required placeholder="voce@email.com" />
                </label>
                <label className="lead-check">
                  <input id="afConsent" type="checkbox" required />
                  <span>
                    Declaro que li e concordo em ser contatado pela Tamada Imóveis, de acordo com a Política de
                    Privacidade.
                  </span>
                </label>
              </fieldset>

              <button className="button button-red button-large" id="afSubmit" type="submit">
                <iconify-icon icon="solar:letter-linear" />
                <span>Enviar cadastro</span>
              </button>
              <p className="af-note">Ao enviar, seus dados seguem por e-mail para nossa equipe. Retorno em até 1 dia útil.</p>
              <p className="af-note" id="afError" hidden role="alert" />
            </form>

            <div className="af-success" id="afSuccess" hidden>
              <iconify-icon icon="solar:check-circle-bold" />
              <h3>Cadastro recebido.</h3>
              <p>
                Recebemos as informações do seu imóvel. Nossa equipe entra em contato em até 1 dia útil pelo telefone ou
                e-mail informado.
              </p>
              <a className="button button-red" href="/">
                <span>Voltar ao início</span>
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

      <TabBar active="anuncie" />

      <Efeitos scripts={['/nav-dropdown.js', '/common.js', '/anuncie.js']} />
    </>
  )
}
