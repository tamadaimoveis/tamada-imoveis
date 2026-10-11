import type { Metadata } from 'next'
import Efeitos from '@/components/Efeitos'
import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import Footer from '@/components/Footer'
import { getCondominiosComImoveis } from '@/lib/condominios'

export const metadata: Metadata = {
  title: 'Condomínios — Tamada Imóveis',
  description: 'Condomínios e edifícios com imóveis disponíveis na Tamada Imóveis: fotos, comodidades, plantas e unidades.',
  alternates: { canonical: 'https://www.tamadaimoveis.com.br/condominios' },
}

export const revalidate = 300

const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`

export default async function CondominiosPage() {
  const condominios = await getCondominiosComImoveis()

  return (
    <>
      <Header catalogo active="imoveis" />
      <MobileMenu />

      <main>
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/assets/images/hero-comprar.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>Condomínios</span>
            </nav>
            <p className="eyebrow">
              <span /> Condomínios
            </p>
            <h1>
              Condomínios com
              <br />
              <em>imóveis disponíveis.</em>
            </h1>
          </div>
        </section>

        <section className="shell" style={{ paddingTop: 56, paddingBottom: 80 }}>
          {condominios.length === 0 ? (
            <p>
              No momento não há condomínios com imóveis disponíveis. <a href="/imoveis">Ver todos os imóveis</a>
            </p>
          ) : (
            <div className="catalog-grid">
              {condominios.map((c) => (
                <article className="catalog-card" key={c.id}>
                  <div className="catalog-card-media">
                    <a href={`/condominios/${c.slug}`}>
                      {c.foto ? (
                        <img src={`${c.foto}?w=560&h=400&fit=crop&auto=format`} alt={c.nome} loading="lazy" width={560} height={400} />
                      ) : null}
                    </a>
                    <span className="catalog-card-purpose">
                      {c.qtd} {c.qtd === 1 ? 'imóvel' : 'imóveis'}
                    </span>
                  </div>
                  <div className="catalog-card-copy">
                    {c.local ? <p className="catalog-card-location">{c.local}</p> : null}
                    <h2>{c.nome}</h2>
                    <div className="catalog-card-bottom">
                      <strong>{c.menorPreco ? <>{brl(c.menorPreco)}<small>a partir de</small></> : 'Sob consulta'}</strong>
                      <a href={`/condominios/${c.slug}`} aria-label={`Abrir ${c.nome}`}>
                        <iconify-icon icon="solar:arrow-up-right-linear" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <Efeitos scripts={['/nav-dropdown.js', '/common.js']} />
    </>
  )
}
