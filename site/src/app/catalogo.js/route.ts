/**
 * Catálogo inteiro + bairros como script, em vez de embutido em cada página.
 * Antes home, catálogo, sobre e trabalhe-conosco carregavam ~4,5 MB de HTML cada
 * (a lista dos ~4.400 imóveis dentro da página) e eram refeitas a cada 5 min e a
 * cada salvamento do CRM — o que estourou a cota do plano gratuito da Vercel.
 * Agora o HTML fica leve e esta rota é gerada no máximo a cada 15 min e servida
 * do cache da CDN. Quem precisa da lista carrega `/catalogo.js` antes do script
 * da página (ver os `Efeitos` de page.tsx e imoveis/page.tsx).
 */
import { getImoveis, getBairros } from '@/lib/queries'

export const dynamic = 'force-static'
export const revalidate = 900

export async function GET() {
  // 900 também nas consultas: o Next usa o MENOR revalidate entre rota e fetch.
  const [imoveis, bairros] = await Promise.all([getImoveis(900), getBairros(900)])
  const corpo = `window.TAMADA_CATALOG=${JSON.stringify(imoveis)};window.TAMADA_BAIRROS=${JSON.stringify(bairros)};`
  return new Response(corpo, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}
