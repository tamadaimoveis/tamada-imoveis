import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <MobileMenu />
      <main id="detailContent">
      <section className="detail-notfound shell">
        <p className="eyebrow">
          <span /> Página não encontrada
        </p>
        <h1>
          Esse endereço não está
          <br />
          <em>no site.</em>
        </h1>
        <p>A página pode ter mudado de lugar ou o link está incompleto. Explore o catálogo ou fale com a gente.</p>
        <div className="detail-notfound-actions">
          <a className="button button-red button-large" href="/imoveis">
            <span>Ver todos os imóveis</span>
            <iconify-icon icon="solar:arrow-right-linear" />
          </a>
          <a className="button button-ghost button-large" href="https://wa.me/5511965935749" target="_blank" rel="noopener">
            <iconify-icon icon="mdi:whatsapp" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </section>
      </main>
      <Footer />
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
    </>
  )
}
