import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Efeitos from '@/components/Efeitos'
import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import Footer from '@/components/Footer'
import CondominioSecao from '@/components/CondominioSecao'
import { getCondominioPorSlug, getSlugsCondominios } from '@/lib/condominios'
import { getImoveis } from '@/lib/queries'
import { sufixoDoSlug } from '@/lib/condominio-secao'

const BASE = 'https://www.tamadaimoveis.com.br'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 300

// Poucos condomínios: nascem prontos. O que surgir depois é gerado na primeira visita.
export async function generateStaticParams() {
  return (await getSlugsCondominios()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const achado = await getCondominioPorSlug(slug)
  if (!achado) return { title: 'Condomínio não encontrado — Tamada Imóveis' }
  const { condominio: c, imoveis } = achado
  const local = c.local ?? 'São Paulo'
  const description = c.descricao
    ? c.descricao.replace(/\s+/g, ' ').trim().slice(0, 160)
    : `${c.nome}, condomínio em ${local}. ${imoveis.length} ${imoveis.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} na Tamada Imóveis.`
  const title = `${c.nome} — Condomínio em ${local} · Tamada Imóveis`
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/condominios/${slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/condominios/${slug}`,
      siteName: 'Tamada Imóveis',
      locale: 'pt_BR',
      type: 'website',
      images: c.fotos[0] ? [{ url: `${c.fotos[0]}?w=1200&h=900&fit=crop&auto=format`, width: 1200, height: 900, alt: c.nome }] : undefined,
    },
  }
}

const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`

export default async function CondominioPage({ params }: Props) {
  const { slug } = await params
  const [achado, todos] = await Promise.all([getCondominioPorSlug(slug), getImoveis()])
  if (!achado) notFound()
  const c = achado.condominio
  const chave = sufixoDoSlug(slug)
  const imoveis = todos.filter((p) => p.cond && p.cond === chave)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: c.nome,
    url: `${BASE}/condominios/${slug}`,
    ...(c.descricao ? { description: c.descricao.slice(0, 500) } : {}),
    ...(c.fotos[0] ? { image: c.fotos[0] } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header catalogo active="imoveis" />
      <MobileMenu />

      <main>
        <section className="catalog-hero">
          <div className="catalog-hero-media" aria-hidden="true">
            {c.fotos[0] ? (
              <img src={`${c.fotos[0]}?w=1600&q=70&auto=format&fit=max`} alt="" fetchPriority="high" />
            ) : (
              <img src="/assets/images/hero-comprar.jpg" alt="" fetchPriority="high" />
            )}
          </div>
          <div className="catalog-hero-scrim" aria-hidden="true" />
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <a href="/condominios">Condomínios</a>
              <iconify-icon icon="solar:alt-arrow-right-linear" />
              <span>{c.nome}</span>
            </nav>
            <p className="eyebrow">
              <span /> Condomínio
            </p>
            <h1>{c.nome}</h1>
            {c.local ? <p style={{ color: '#fff', opacity: 0.85 }}>{c.local}</p> : null}
          </div>
        </section>

        <section className="shell" style={{ paddingTop: 64 }}>
          <CondominioSecao condominio={c} comCabecalho={false} />
        </section>

        {imoveis.length > 0 && (
          <section className="detail-similar" aria-label="Imóveis neste condomínio">
            <div className="shell">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span /> Disponíveis agora
                  </p>
                  <h2>
                    {imoveis.length === 1 ? 'Imóvel neste' : 'Imóveis neste'}
                    <br />
                    <em>condomínio.</em>
                  </h2>
                </div>
                <p>
                  <a href={`/imoveis?condominio=${encodeURIComponent(slug)}`}>Ver na busca</a>
                </p>
              </div>
              <div className="catalog-grid detail-similar-grid">
                {imoveis.map((p) => (
                  <article className="catalog-card" key={p.ref}>
                    <div className="catalog-card-media">
                      <a href={`/imovel/${p.ref}`}>
                        <img src={p.image} alt={`${p.title} em ${p.neighborhood}`} loading="lazy" width={560} height={400} />
                      </a>
                      <span className="catalog-card-code">{p.ref}</span>
                    </div>
                    <div className="catalog-card-copy">
                      <p className="catalog-card-location">
                        {p.neighborhood} · {p.city}
                      </p>
                      <h2>{p.title}</h2>
                      <div className="catalog-card-bottom">
                        <strong>{p.sale ? brl(p.sale) : p.rent ? `${brl(p.rent)}/mês` : 'Sob consulta'}</strong>
                        <a href={`/imovel/${p.ref}`} aria-label="Abrir imóvel">
                          <iconify-icon icon="solar:arrow-up-right-linear" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <Efeitos scripts={['/nav-dropdown.js', '/common.js']} />
    </>
  )
}
