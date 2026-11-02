import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { getSlugsCondominios } from '@/lib/condominios'

/* Sempre gerado na hora. Com cache de rota (ISR) a Vercel já deixou o sitemap da GVM congelado por 9 dias (25/10/2026).
   O cache fica só nas consultas ao Sanity, que expiram sozinhas. */
export const dynamic = 'force-dynamic'

const BASE = 'https://www.tamadaimoveis.com.br'
const CACHE_SANITY = { next: { revalidate: 300 } }
/** Data das páginas de texto fixo; atualizar quando o conteúdo delas mudar. */
const TEXTO_FIXO = new Date('2026-11-02T00:00:00Z')

// Mesmo filtro das páginas públicas (FILTRO_PUBLICO em lib/queries.ts): imóvel fora dele dá 404 no site.
const IMOVEIS_PUBLICOS = `*[_type=="property" && publicarSite==true && status=="ativo" && defined(codigoImovel)]{ "ref": codigoImovel, "atualizado": _updatedAt }`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [imoveis, condominios] = await Promise.all([
    client.fetch<Array<{ ref: string; atualizado: string }>>(IMOVEIS_PUBLICOS, {}, CACHE_SANITY),
    getSlugsCondominios(),
  ])

  // Listagens mudam quando muda o imóvel mais recente (data real, não a hora da visita)
  const ultima = imoveis.reduce((m, p) => { const d = new Date(p.atualizado); return d > m ? d : m }, TEXTO_FIXO)

  const fixas: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: ultima, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/imoveis`, lastModified: ultima, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/condominios`, lastModified: ultima, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/financiamento`, lastModified: TEXTO_FIXO, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/anuncie`, lastModified: TEXTO_FIXO, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/sobre`, lastModified: TEXTO_FIXO, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/trabalhe-conosco`, lastModified: TEXTO_FIXO, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const paginasImoveis: MetadataRoute.Sitemap = imoveis.map((p) => ({
    url: `${BASE}/imovel/${p.ref}`,
    lastModified: new Date(p.atualizado),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const paginasCondominios: MetadataRoute.Sitemap = condominios.map((slug) => ({
    url: `${BASE}/condominios/${slug}`,
    lastModified: ultima,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...fixas, ...paginasImoveis, ...paginasCondominios]
}
