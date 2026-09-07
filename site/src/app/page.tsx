import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { getImoveis, getBairros } from '@/lib/queries'
import Efeitos from '@/components/Efeitos'
import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import Footer from '@/components/Footer'
import SearchModal from '@/components/SearchModal'
import TabBar from '@/components/TabBar'

export const metadata: Metadata = {
  title: 'Tamada Imóveis — Seu lugar na cidade',
  description: 'Tamada Imóveis — venda, locação e administração de imóveis em São Paulo e região.',
}

export default async function HomePage() {
  const [imoveis, bairros] = await Promise.all([getImoveis(), getBairros()])

  return (
    <>
      {/* Destaques/mapa/bairros continuam montados client-side pelo script.js
          legado (portado sem alterações) — aqui só trocamos a origem dos
          dados: em vez de esperar catalog-data.js (gerado no build), injetamos
          o resultado da query Sanity direto na página. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.TAMADA_CATALOG=${JSON.stringify(imoveis)};window.TAMADA_BAIRROS=${JSON.stringify(bairros)};`,
        }}
      />
      {/* Leaflet só carregava o JS, nunca o CSS — sem isso o mapa não tem
          posicionamento absoluto e os tiles empilham soltos na página. */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <Header />
      <MobileMenu />

      <main id="conteudo">
        <section className="hero" id="inicio">
          <div className="hero-media" aria-hidden="true">
            <picture>
              <source
                type="image/webp"
                srcSet="/assets/images/hero-cidade-640.webp 640w, /assets/images/hero-cidade-960.webp 960w, /assets/images/hero-cidade-1344.webp 1344w"
                sizes="100vw"
              />
              <img
                src="/assets/images/hero-cidade-1344.jpg"
                srcSet="/assets/images/hero-cidade-640.jpg 640w, /assets/images/hero-cidade-960.jpg 960w, /assets/images/hero-cidade-1344.jpg 1344w"
                sizes="100vw"
                alt=""
                fetchPriority="high"
                width={1344}
                height={768}
              />
            </picture>
            <div className="hero-scrim" />
            <svg className="hero-route" viewBox="0 0 1344 768" fill="none" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="routeGrad" x1="685" y1="790" x2="668" y2="322" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#e3101c" stopOpacity=".96" />
                  <stop offset=".5" stopColor="#ff2330" stopOpacity=".92" />
                  <stop offset="1" stopColor="#ff3d46" stopOpacity=".85" />
                </linearGradient>
              </defs>
              <path
                className="route-ribbon"
                fill="url(#routeGrad)"
                d="M695.0 789.6 L694.9 787.2 L694.7 784.5 L694.5 781.4 L694.4 778.1 L694.2 774.5 L694.0 770.7 L693.7 766.7 L693.5 762.4 L693.3 758.0 L693.0 753.4 L692.7 748.7 L692.5 743.8 L692.2 738.8 L691.9 733.7 L691.6 728.6 L691.3 723.4 L691.1 718.2 L690.8 712.9 L690.5 707.7 L690.2 702.5 L689.9 697.3 L689.6 692.2 L689.3 687.1 L689.1 682.2 L688.8 677.4 L688.5 672.7 L688.3 668.2 L688.0 663.9 L687.8 659.6 L687.6 655.4 L687.3 651.2 L687.1 647.0 L686.8 642.9 L686.6 638.7 L686.3 634.6 L686.1 630.5 L685.9 626.4 L685.6 622.3 L685.4 618.2 L685.1 614.2 L684.9 610.2 L684.7 606.2 L684.4 602.2 L684.2 598.2 L684.0 594.3 L683.7 590.3 L683.5 586.4 L683.3 582.5 L683.1 578.6 L682.9 574.8 L682.7 570.9 L682.5 567.1 L682.3 563.3 L682.1 559.5 L681.9 555.8 L681.7 552.0 L681.5 548.3 L681.4 544.5 L681.2 540.7 L681.0 536.9 L680.9 533.1 L680.7 529.3 L680.6 525.5 L680.4 521.7 L680.3 518.0 L680.2 514.2 L680.0 510.5 L679.9 506.7 L679.8 503.1 L679.6 499.4 L679.5 495.8 L679.4 492.2 L679.3 488.7 L679.2 485.2 L679.0 481.8 L678.9 478.4 L678.8 475.1 L678.7 471.9 L678.6 468.7 L678.5 465.6 L678.4 462.6 L678.3 459.7 L678.2 456.9 L678.1 454.1 L678.0 451.5 L677.9 448.9 L677.8 446.4 L677.8 444.0 L677.7 441.7 L677.6 439.4 L677.6 437.2 L677.5 435.0 L677.5 432.9 L677.4 430.9 L677.3 428.9 L677.3 427.0 L677.2 425.1 L677.2 423.3 L677.2 421.5 L677.1 419.8 L677.1 418.1 L677.0 416.4 L676.9 414.8 L676.9 413.2 L676.8 411.7 L676.8 410.1 L676.7 408.6 L676.6 407.2 L676.5 405.7 L676.4 404.3 L676.3 402.9 L676.2 401.5 L676.1 400.2 L676.0 398.9 L675.9 397.7 L675.8 396.5 L675.7 395.4 L675.7 394.4 L675.6 393.4 L675.5 392.4 L675.4 391.5 L675.2 390.6 L675.1 389.7 L675.0 388.9 L674.9 388.1 L674.8 387.3 L674.7 386.5 L674.5 385.8 L674.4 385.0 L674.2 384.3 L674.1 383.6 L673.9 382.9 L673.7 382.2 L673.5 381.5 L673.3 380.8 L673.1 380.1 L672.9 379.4 L672.6 378.7 L672.4 377.9 L672.1 377.2 L671.8 376.4 L671.5 375.6 L671.1 374.8 L670.8 374.1 L670.4 373.3 L670.0 372.6 L669.6 371.9 L669.2 371.2 L668.8 370.5 L668.3 369.9 L667.9 369.2 L667.5 368.6 L667.0 367.9 L666.6 367.3 L666.2 366.7 L665.7 366.1 L665.3 365.5 L664.9 364.9 L664.4 364.3 L664.0 363.8 L663.6 363.2 L663.2 362.6 L662.8 362.1 L662.4 361.5 L662.1 361.0 L661.7 360.5 L661.4 359.9 L661.0 359.4 L660.7 358.8 L660.3 358.2 L659.9 357.6 L659.5 357.0 L659.1 356.4 L658.7 355.9 L658.3 355.3 L658.0 354.8 L657.6 354.3 L657.2 353.7 L656.8 353.2 L656.5 352.7 L656.1 352.2 L655.8 351.7 L655.4 351.2 L655.1 350.7 L654.8 350.3 L654.6 349.8 L654.3 349.3 L654.1 348.9 L653.9 348.5 L653.7 348.0 L653.5 347.6 L653.4 347.2 L653.3 346.8 L653.2 346.4 L653.1 346.0 L653.1 345.6 L653.1 345.2 L653.1 344.9 L653.1 344.4 L653.2 344.0 L653.3 343.6 L653.4 343.1 L653.5 342.7 L653.7 342.2 L653.8 341.7 L654.0 341.3 L654.3 340.8 L654.5 340.3 L654.7 339.8 L655.0 339.3 L655.3 338.8 L655.6 338.3 L655.9 337.9 L656.2 337.4 L656.5 336.9 L656.8 336.4 L657.1 335.9 L657.5 335.5 L657.8 335.0 L658.1 334.5 L658.4 334.1 L658.8 333.6 L659.1 333.2 L659.4 332.7 L659.7 332.3 L660.0 331.9 L660.3 331.5 L660.6 331.1 L661.0 330.7 L661.4 330.3 L661.8 329.9 L662.2 329.5 L662.6 329.1 L663.0 328.7 L663.4 328.4 L663.8 328.0 L664.3 327.6 L664.7 327.2 L665.1 326.9 L665.5 326.5 L665.9 326.1 L666.3 325.8 L666.7 325.5 L667.1 325.2 L667.4 324.9 L667.8 324.6 L668.1 324.3 L668.4 324.0 L668.7 323.8 L669.0 323.6 L669.2 323.3 L669.4 323.1 L667.6 321.1 L667.4 321.2 L667.1 321.4 L666.9 321.6 L666.6 321.8 L666.3 322.0 L666.0 322.3 L665.6 322.6 L665.2 322.9 L664.8 323.2 L664.4 323.5 L664.0 323.8 L663.6 324.1 L663.1 324.5 L662.7 324.8 L662.2 325.2 L661.8 325.6 L661.3 326.0 L660.9 326.4 L660.4 326.8 L659.9 327.2 L659.5 327.6 L659.0 328.0 L658.6 328.4 L658.2 328.9 L657.8 329.3 L657.4 329.8 L657.0 330.2 L656.6 330.7 L656.3 331.1 L656.0 331.5 L655.6 332.0 L655.3 332.4 L654.9 332.9 L654.5 333.3 L654.2 333.8 L653.8 334.3 L653.5 334.8 L653.1 335.3 L652.7 335.8 L652.4 336.3 L652.0 336.9 L651.7 337.4 L651.4 338.0 L651.1 338.5 L650.8 339.1 L650.5 339.6 L650.2 340.2 L650.0 340.8 L649.7 341.4 L649.5 342.0 L649.3 342.6 L649.2 343.2 L649.1 343.8 L649.0 344.5 L648.9 345.1 L648.9 345.8 L648.9 346.4 L649.0 347.1 L649.1 347.7 L649.3 348.3 L649.4 348.9 L649.6 349.6 L649.9 350.2 L650.1 350.7 L650.4 351.3 L650.7 351.9 L651.0 352.5 L651.3 353.0 L651.6 353.6 L651.9 354.2 L652.3 354.7 L652.6 355.3 L653.0 355.8 L653.4 356.4 L653.7 356.9 L654.1 357.5 L654.4 358.0 L654.8 358.5 L655.2 359.1 L655.5 359.6 L655.8 360.2 L656.2 360.7 L656.5 361.3 L656.8 361.8 L657.1 362.4 L657.5 363.1 L657.8 363.7 L658.2 364.3 L658.6 364.9 L659.0 365.5 L659.4 366.1 L659.8 366.7 L660.2 367.3 L660.6 367.9 L661.0 368.5 L661.4 369.1 L661.8 369.7 L662.2 370.3 L662.6 370.9 L663.0 371.5 L663.4 372.1 L663.8 372.7 L664.1 373.3 L664.5 373.9 L664.8 374.6 L665.1 375.2 L665.4 375.8 L665.7 376.4 L666.0 377.1 L666.3 377.7 L666.5 378.4 L666.7 379.0 L666.9 379.7 L667.1 380.4 L667.3 381.1 L667.5 381.7 L667.7 382.4 L667.8 383.0 L668.0 383.6 L668.1 384.2 L668.2 384.8 L668.3 385.5 L668.4 386.1 L668.5 386.8 L668.6 387.5 L668.7 388.1 L668.8 388.9 L668.9 389.6 L669.0 390.4 L669.0 391.2 L669.1 392.1 L669.1 392.9 L669.2 393.9 L669.3 394.9 L669.3 395.9 L669.4 397.0 L669.4 398.1 L669.5 399.3 L669.5 400.6 L669.6 401.9 L669.6 403.2 L669.6 404.6 L669.7 406.0 L669.7 407.4 L669.7 408.8 L669.7 410.3 L669.7 411.8 L669.7 413.3 L669.7 414.9 L669.7 416.5 L669.7 418.1 L669.7 419.8 L669.6 421.6 L669.6 423.3 L669.6 425.1 L669.6 427.0 L669.5 428.9 L669.5 430.9 L669.5 433.0 L669.4 435.1 L669.4 437.2 L669.4 439.5 L669.4 441.7 L669.4 444.1 L669.3 446.5 L669.3 449.0 L669.3 451.6 L669.3 454.3 L669.3 457.0 L669.3 459.8 L669.3 462.8 L669.3 465.8 L669.2 468.8 L669.2 472.0 L669.2 475.2 L669.2 478.5 L669.2 481.9 L669.2 485.3 L669.2 488.8 L669.1 492.4 L669.1 495.9 L669.1 499.6 L669.1 503.2 L669.1 506.9 L669.1 510.6 L669.1 514.4 L669.1 518.2 L669.1 522.0 L669.1 525.8 L669.1 529.6 L669.1 533.4 L669.2 537.2 L669.2 541.0 L669.2 544.8 L669.2 548.6 L669.3 552.4 L669.3 556.2 L669.4 559.9 L669.4 563.7 L669.5 567.6 L669.6 571.4 L669.6 575.3 L669.7 579.1 L669.8 583.0 L669.9 586.9 L670.0 590.9 L670.1 594.8 L670.2 598.8 L670.3 602.8 L670.3 606.8 L670.4 610.8 L670.5 614.8 L670.6 618.9 L670.8 622.9 L670.9 627.0 L671.0 631.1 L671.1 635.2 L671.2 639.4 L671.3 643.5 L671.4 647.7 L671.5 651.9 L671.6 656.1 L671.7 660.3 L671.8 664.5 L671.9 668.9 L672.0 673.4 L672.1 678.1 L672.2 682.9 L672.3 687.8 L672.4 692.8 L672.5 698.0 L672.6 703.1 L672.7 708.4 L672.9 713.6 L673.0 718.9 L673.1 724.1 L673.2 729.3 L673.3 734.5 L673.4 739.5 L673.6 744.5 L673.7 749.4 L673.8 754.2 L673.9 758.8 L674.0 763.2 L674.1 767.5 L674.2 771.5 L674.3 775.3 L674.3 778.9 L674.4 782.2 L674.5 785.2 L674.6 788.0 L674.6 790.4 Z"
              />
              <path
                className="route-flow"
                pathLength="100"
                d="M684.8 790 C684.0 769.0 681.4 703.8 679.9 664.2 C678.4 624.6 676.5 587.2 675.5 552.2 C674.5 517.2 674.1 479.3 673.7 454.2 C673.3 429.1 673.6 414.4 672.9 401.7 C672.2 389.0 671.7 385.0 669.4 378.1 C667.1 371.2 662.0 366.0 658.9 360.6 C655.8 355.2 651.1 350.5 651 345.7 C650.9 340.9 655.1 335.6 658 331.7 C660.9 327.8 666.8 323.7 668.5 322.1"
              />
              <g className="hero-route-pin" transform="translate(668 322)">
                <circle className="pin-pulse" r="7" />
                <circle className="pin-core" r="5" />
              </g>
            </svg>
          </div>

          <div className="shell hero-layout">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">
                <span /> Imóveis que fazem parte da sua história
              </p>
              <h1 aria-label="Seu próximo endereço começa aqui">
                <span className="line-mask">
                  <span>Seu próximo</span>
                </span>
                <span className="line-mask">
                  <span>
                    <em>endereço</em> começa
                  </span>
                </span>
                <span className="line-mask">
                  <span>aqui.</span>
                </span>
              </h1>
              <p className="hero-lead">
                Há mais de 20 anos conectando pessoas aos melhores imóveis, com a experiência de quem conhece o mercado e
                valoriza cada conquista.
              </p>
              <div className="hero-actions">
                <a className="button button-red button-large magnetic" href="/imoveis">
                  <span>Encontrar meu imóvel</span>
                  <iconify-icon icon="solar:arrow-right-linear" />
                </a>
                <a className="hero-phone" href="tel:01126822320">
                  <span>
                    <iconify-icon icon="solar:phone-calling-rounded-linear" />
                  </span>
                  <small>
                    Prefere conversar?
                    <b>(11) 2682-2320</b>
                  </small>
                </a>
              </div>
            </div>

            <div className="hero-coordinate" aria-hidden="true">
              <b>SP</b>
              <span>
                23°33&apos;01&quot;S
                <br />
                46°38&apos;59&quot;W
              </span>
            </div>
          </div>

          <div className="shell search-stage">
            <form className="search-dock" id="heroSearch">
              <div className="purpose-tabs" role="group" aria-label="Finalidade">
                <button className="purpose-tab active" type="button" data-purpose="sale">
                  Comprar
                </button>
                <button className="purpose-tab" type="button" data-purpose="rent">
                  Alugar
                </button>
                <button className="purpose-tab" type="button" data-purpose="commercial">
                  Comercial
                </button>
              </div>
              <label className="search-field search-location">
                <span>Onde você quer morar?</span>
                <div>
                  <iconify-icon icon="solar:map-point-linear" />
                  <input id="heroLocation" type="search" placeholder="Bairro, cidade ou código" autoComplete="off" />
                </div>
              </label>
              <label className="search-field search-field-type">
                <span>Tipo de imóvel</span>
                <div>
                  <iconify-icon icon="solar:buildings-2-linear" />
                  <select id="heroType" data-elegant="">
                    <option value="">Todos os tipos</option>
                    <option value="APARTMENT">Apartamento</option>
                    <option value="HOUSE">Casa</option>
                    <option value="TWO_STORY_HOUSE">Sobrado</option>
                    <option value="HALL">Comercial</option>
                    <option value="LAND">Terreno</option>
                  </select>
                </div>
              </label>
              <label className="search-field search-field-price">
                <span>Faixa de valor</span>
                <div>
                  <iconify-icon icon="solar:wallet-money-linear" />
                  <select id="heroPrice" data-elegant="">
                    <option value="">Qualquer valor</option>
                    <option value="260000">Até R$ 260 mil</option>
                    <option value="500000">Até R$ 500 mil</option>
                    <option value="900000">Até R$ 900 mil</option>
                    <option value="2000000">Até R$ 2 milhões</option>
                  </select>
                </div>
              </label>
              <button className="search-submit magnetic" type="submit">
                <span>Buscar imóveis</span>
                <iconify-icon icon="solar:magnifer-linear" />
              </button>
              <button className="advanced-link" type="button" data-open-search>
                <iconify-icon icon="solar:tuning-2-linear" /> Mais filtros
              </button>
            </form>
          </div>

          <a className="scroll-cue" href="#imoveis">
            <span>Explore a cidade</span>
            <i />
          </a>
        </section>

        <div className="type-shortcuts" aria-label="Atalhos por tipo de imóvel">
          <a href="/imoveis?purpose=sale&type=APARTMENT">
            <iconify-icon icon="solar:buildings-2-linear" /> Apartamentos
          </a>
          <a href="/imoveis?purpose=sale&type=HOUSE">
            <iconify-icon icon="solar:home-2-linear" /> Casas
          </a>
          <a href="/imoveis?purpose=sale&type=TWO_STORY_HOUSE">
            <iconify-icon icon="solar:layers-minimalistic-linear" /> Sobrados
          </a>
          <a href="/imoveis?purpose=sale&commercial=1">
            <iconify-icon icon="solar:shop-2-linear" /> Comerciais
          </a>
          <a href="/imoveis?purpose=sale&type=LAND">
            <iconify-icon icon="solar:map-point-linear" /> Terrenos
          </a>
        </div>

        <section className="property-section section" id="imoveis">
          <div className="section-atmosphere atmosphere-red" aria-hidden="true" />
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>01</span> Seleção Tamada
                </p>
                <h2>
                  Um imóvel para cada
                  <br />
                  <em>momento da sua vida.</em>
                </h2>
              </div>
              <p>
                Uma seleção pensada para diferentes momentos da vida: do primeiro apartamento ao espaço ideal para o
                crescimento do seu negócio.
              </p>
            </div>

            <div className="mobile-carousel-toolbar">
              <p>
                <strong>{imoveis.length}</strong> imóveis no catálogo
              </p>
              <a href="/imoveis">
                Ver todos <iconify-icon icon="solar:arrow-right-linear" />
              </a>
            </div>

            <div className="property-carousel" aria-label="Imóveis em destaque">
              <div className="property-carousel-window">
                <div className="property-grid" id="propertyGrid" aria-live="polite" />
              </div>
            </div>

            <div className="property-footer reveal">
              <p>Não encontrou o que procura? Conte para a gente — buscamos com você.</p>
              <div>
                <button className="button button-ink magnetic" type="button" data-open-search>
                  <span>Explorar busca completa</span>
                  <iconify-icon icon="solar:arrow-right-linear" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="map-section section atlas-section" id="mapa">
          <div className="map-topography" aria-hidden="true" />

          <div className="atlas-view atlas-view-list is-active is-visible" id="atlasViewList">
            <div className="shell map-heading">
              <div>
                <p className="eyebrow eyebrow-light">
                  <span>02</span> Atlas Tamada
                </p>
                <h2>
                  Encontre o bairro
                  <br />
                  <em>ideal para você.</em>
                </h2>
              </div>
              <p>Conheça os principais bairros onde atuamos e explore os imóveis disponíveis em cada região.</p>
            </div>
            <div className="shell neighborhood-list-wrap">
              <div className="neighborhood-list" id="neighborhoodList">
                <button className="active" type="button" data-neighborhood="Vila Granada">
                  <span>Vila Granada</span>
                  <small>Residencial · conectado</small>
                  <b>02</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
                <button type="button" data-neighborhood="Tatuapé">
                  <span>Tatuapé</span>
                  <small>Urbano · completo</small>
                  <b>03</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
                <button type="button" data-neighborhood="Penha de França">
                  <span>Penha de França</span>
                  <small>Tradicional · central</small>
                  <b>04</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
                <button type="button" data-neighborhood="Vila Matilde">
                  <span>Vila Matilde</span>
                  <small>Calmo · conveniente</small>
                  <b>05</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
                <button type="button" data-neighborhood="Itaquera">
                  <span>Itaquera</span>
                  <small>Dinâmico · acessível</small>
                  <b>06</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
                <button type="button" data-neighborhood="São Mateus">
                  <span>São Mateus</span>
                  <small>Familiar · em movimento</small>
                  <b>07</b>
                <iconify-icon icon="solar:arrow-right-linear" />
                </button>
              </div>
              <a className="button button-ghost atlas-open-map" href="/imoveis?view=map">
                <iconify-icon icon="solar:map-linear" />
                <span>Abrir o mapa da Zona Leste</span>
              </a>
            </div>
          </div>

          <div className="atlas-view atlas-view-map" id="atlasViewMap">
            <div className="shell map-heading">
              <button className="atlas-back" type="button" id="atlasBack">
                <iconify-icon icon="solar:arrow-left-linear" /> Voltar aos bairros
              </button>
              <p>Passe pelos marcadores para descobrir imóveis e bairros. As posições são aproximadas para preservar cada endereço.</p>
            </div>

            <div className="shell map-layout">
              <div className="map-shell">
                <div id="propertyMap" className="property-map" aria-label="Mapa interativo de imóveis em São Paulo" />
                <p className="map-disclaimer">
                  Pinos em posição aproximada dentro do bairro. O endereço exato é informado pelo corretor.
                </p>
                <div className="map-fallback" id="mapFallback" aria-hidden="true">
                  <span className="fallback-road road-one" />
                  <span className="fallback-road road-two" />
                  <span className="fallback-road road-three" />
                  <button style={{ '--x': '32%', '--y': '38%' } as CSSProperties}>01</button>
                  <button style={{ '--x': '57%', '--y': '50%' } as CSSProperties}>02</button>
                  <button style={{ '--x': '72%', '--y': '31%' } as CSSProperties}>03</button>
                  <button style={{ '--x': '46%', '--y': '70%' } as CSSProperties}>04</button>
                </div>
                <button className="atlas-back atlas-back-floating" type="button" data-atlas-back>
                  <iconify-icon icon="solar:arrow-left-linear" /> Voltar aos bairros
                </button>
                <div className="map-meta">
                  <span>
                    <i /> Localização aproximada
                  </span>
                  <strong>São Paulo · Zona Leste</strong>
                </div>
                <div className="map-controls">
                  <button type="button" id="mapZoomIn" aria-label="Aproximar">
                    +
                  </button>
                  <button type="button" id="mapZoomOut" aria-label="Afastar">
                    −
                  </button>
                </div>
              </div>

              <aside className="map-panel">
                <div className="map-panel-head">
                  <span id="mapIndex" />
                  <button type="button" id="mapFavorite" aria-label="Salvar imóvel">
                    <iconify-icon icon="solar:heart-linear" />
                  </button>
                </div>
                <div className="map-card-image">
                  <img id="mapCardImage" src="" alt="Imóvel selecionado no mapa" />
                  <span id="mapCardPurpose">À venda</span>
                </div>
                <div className="map-panel-copy">
                  <p id="mapCardLocation" />
                  <h3 id="mapCardTitle" />
                  <div className="map-card-features" id="mapCardFeatures" />
                  <strong id="mapCardPrice" />
                  <a className="button button-red" id="mapCardLink" href="#" target="_blank" rel="noopener">
                    <span>Conhecer o imóvel</span>
                    <iconify-icon icon="solar:arrow-up-right-linear" />
                  </a>
                </div>
                <div className="map-neighborhoods" id="mapNeighborhoods" />
              </aside>
            </div>
          </div>
        </section>

        <section className="opportunities section" id="oportunidades">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>03</span> Valores que cabem no seu bolso
                </p>
                <h2>
                  Oportunidades para
                  <br />
                  <em>começar agora.</em>
                </h2>
              </div>
              <p>Atalhos para encontrar imóveis dentro do seu momento financeiro, sem perder tempo em buscas genéricas.</p>
            </div>

            <div className="opportunity-grid">
              <a className="opportunity-card opportunity-sale reveal" href="/imoveis?purpose=sale&affordable=1&max=260000">
                <div className="opportunity-number">01</div>
                <div className="opportunity-icon">
                  <iconify-icon icon="solar:key-minimalistic-square-3-linear" />
                </div>
                <p>Primeiro imóvel</p>
                <h3>
                  Compra até
                  <br />
                  <em>R$ 260 mil</em>
                </h3>
                <span>Apartamentos e casas com financiamento acessível.</span>
                <span className="opportunity-cta">
                  Ver oportunidades <iconify-icon icon="solar:arrow-right-linear" />
                </span>
              </a>
              <a className="opportunity-card opportunity-rent reveal reveal-delay-1" href="/imoveis?purpose=rent&max=1500">
                <div className="opportunity-number">02</div>
                <div className="opportunity-icon">
                  <iconify-icon icon="solar:home-smile-angle-linear" />
                </div>
                <p>Seu novo aluguel</p>
                <h3>
                  Locação até
                  <br />
                  <em>R$ 1.500/mês</em>
                </h3>
                <span>Opções práticas para mudar de endereço sem complicação.</span>
                <span className="opportunity-cta">
                  Ver para alugar <iconify-icon icon="solar:arrow-right-linear" />
                </span>
              </a>
              <a className="opportunity-card opportunity-program reveal reveal-delay-2" href="/imoveis?purpose=all&commercial=1">
                <div className="opportunity-number">03</div>
                <div className="opportunity-icon">
                  <iconify-icon icon="solar:shop-2-linear" />
                </div>
                <p>Para o seu negócio</p>
                <h3>
                  Salas, lojas
                  <br />
                  <em>e galpões.</em>
                </h3>
                <span>Pontos comerciais para abrir, crescer ou investir na Zona Leste.</span>
                <span className="opportunity-cta">
                  Ver comerciais <iconify-icon icon="solar:arrow-right-linear" />
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="services section" id="servicos">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="eyebrow">
                  <span>04</span> Mais do que encontrar
                </p>
                <h2>
                  Serviços que deixam
                  <br />
                  <em>tudo mais simples.</em>
                </h2>
              </div>
              <p>
                Da avaliação à entrega das chaves, acompanhamos você em cada etapa com atendimento próximo, transparência e
                confiança.
              </p>
            </div>

            <div className="service-grid">
              <article className="service-card service-featured reveal">
                <div
                  className="service-photo-bg"
                  style={{ backgroundImage: "url('/assets/images/service-featured.jpg')" }}
                  aria-hidden="true"
                />
                <div className="service-map-lines" aria-hidden="true" />
                <span>Proprietários</span>
                <h3>
                  Seu imóvel,
                  <br />
                  <em>bem cuidado.</em>
                </h3>
                <p>Avaliação, divulgação, locação e administração com acompanhamento do começo ao fim.</p>
                <a href="/anuncie">
                  Cadastrar imóvel <iconify-icon icon="solar:arrow-up-right-linear" />
                </a>
              </article>
              <article className="service-card service-photo reveal reveal-delay-1">
                <div
                  className="service-photo-bg"
                  style={{ backgroundImage: "url('/assets/images/service-financing.jpg')" }}
                  aria-hidden="true"
                />
                <div className="service-icon">
                  <iconify-icon icon="solar:magnifer-zoom-in-linear" />
                </div>
                <span>Compradores</span>
                <h3>Encontre seu imóvel</h3>
                <p>Todo o acervo em um lugar só, com filtro por bairro, tipo e faixa de preço.</p>
                <a href="/imoveis">
                  Ver imóveis <iconify-icon icon="solar:arrow-right-linear" />
                </a>
              </article>
              <article className="service-card service-photo reveal reveal-delay-2">
                <div
                  className="service-photo-bg"
                  style={{ backgroundImage: "url('/assets/images/service-rent.jpg')" }}
                  aria-hidden="true"
                />
                <div className="service-icon">
                  <iconify-icon icon="solar:document-text-linear" />
                </div>
                <span>Inquilinos</span>
                <h3>Aluguel sem burocracia</h3>
                <p>Informação objetiva e apoio durante toda a locação.</p>
                <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                  Falar com locação <iconify-icon icon="solar:arrow-right-linear" />
                </a>
              </article>
              <article className="service-card service-photo service-contact reveal reveal-delay-3">
                <div
                  className="service-photo-bg"
                  style={{ backgroundImage: "url('/assets/images/service-contact.jpg')" }}
                  aria-hidden="true"
                />
                <span>Atendimento</span>
                <h3>Já é cliente?</h3>
                <p>Segunda via, extrato do proprietário e suporte.</p>
                <div>
                  <a href="https://www.tamadaimoveis.com.br/segunda-via-boleto" target="_blank" rel="noopener">
                    2ª via
                  </a>
                  <a href="https://www.tamadaimoveis.com.br/extrato-proprietario" target="_blank" rel="noopener">
                    Extrato
                  </a>
                  <a href="https://www.tamadaimoveis.com.br/fale-conosco" target="_blank" rel="noopener">
                    Suporte
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="about-section section" id="sobre">
          <div className="about-image reveal">
            <img src="/assets/images/ap9008-interior.jpg" alt="Apartamento apresentado pela Tamada Imóveis" loading="lazy" />
            <span>
              Presença local
              <br />
              Atendimento humano
            </span>
          </div>
          <div className="about-copy reveal">
            <p className="eyebrow">
              <span>05</span> Tamada Imóveis
            </p>
            <h2>
              A experiência de quem
              <br />
              <em>vive a região.</em>
            </h2>
            <p>
              Venda, locação e administração de imóveis em São Paulo e região. Uma imobiliária próxima para decisões que
              mudam a vida — ou fazem um negócio avançar.
            </p>
            <dl>
              <div>
                <dt>Endereço</dt>
                <dd>
                  Avenida Amador Bueno da Veiga, 4389
                  <br />
                  São Paulo · SP
                </dd>
              </div>
              <div>
                <dt>Atendimento</dt>
                <dd>
                  (11) 2682-2320
                  <br />
                  CRECI 21745-J
                </dd>
              </div>
            </dl>
            <div className="about-copy-actions">
              <a
                className="button button-ink"
                href="https://www.google.com/maps/search/?api=1&query=Avenida+Amador+Bueno+da+Veiga+4389+Sao+Paulo"
                target="_blank"
                rel="noopener"
              >
                <span>Como chegar</span>
                <iconify-icon icon="solar:map-arrow-up-linear" />
              </a>
              <a className="button button-ghost" href="/sobre">
                <span>Conheça a Tamada</span>
                <iconify-icon icon="solar:arrow-right-linear" />
              </a>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-orbit" aria-hidden="true" />
          <div className="shell contact-layout">
            <div className="contact-copy reveal">
              <p className="eyebrow eyebrow-light">
                <span>06</span> Vamos conversar
              </p>
              <h2>
                Toda boa escolha
                <br />
                começa com a
                <br />
                <em>orientação certa.</em>
              </h2>
            </div>
            <div className="contact-actions reveal reveal-delay-1">
              <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                <span>
                  <iconify-icon icon="solar:chat-round-dots-linear" /> Novos clientes
                </span>
                <strong>(11) 96593-5749</strong>
                <b>
                  <iconify-icon icon="solar:arrow-up-right-linear" />
                </b>
              </a>
              <a href="https://wa.me/5511966378282" target="_blank" rel="noopener">
                <span>
                  <iconify-icon icon="solar:key-minimalistic-square-2-linear" /> Inquilinos e proprietários
                </span>
                <strong>(11) 96637-8282</strong>
                <b>
                  <iconify-icon icon="solar:arrow-up-right-linear" />
                </b>
              </a>
              <a href="tel:01126822320">
                <span>
                  <iconify-icon icon="solar:phone-linear" /> Telefone
                </span>
                <strong>(11) 2682-2320</strong>
                <b>
                  <iconify-icon icon="solar:arrow-up-right-linear" />
                </b>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <TabBar active="inicio" />

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

      <SearchModal />

      <Efeitos
        scripts={['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', '/elegant-select.js', '/nav-dropdown.js', '/script.js']}
        gsap={false}
      />
    </>
  )
}
