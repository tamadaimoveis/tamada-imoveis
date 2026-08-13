/**
 * GROQ + mapper no MESMO formato que scripts/gerar-catalogo.mjs produz pro
 * site estático (window.TAMADA_CATALOG / imovel/{ref}.json) — script.js,
 * imoveis.js e imovel.js portados leem esses objetos sem mudar nada da
 * lógica de card/filtro/render. Só a origem dos dados muda: aqui é live
 * (com cache do Next), lá era arquivo gerado no build.
 */
import { client } from './sanity'
import { COMODIDADES, ACABAMENTOS, GARANTIAS, PAGAMENTO, OCUPACAO } from './opcoes'

const REVALIDATE = 300

const TIPO: Record<string, string> = {
  apartamento: 'APARTMENT',
  apartamento_duplex: 'APARTMENT',
  cobertura: 'APARTMENT',
  studio: 'APARTMENT',
  conjunto: 'APARTMENT',
  casa: 'HOUSE',
  sobrado: 'TWO_STORY_HOUSE',
  terreno: 'LAND',
  area: 'LAND',
  salao: 'HALL',
  loja: 'HALL',
  ponto: 'HALL',
  sala: 'ROOM',
  predio: 'BUILDING',
  hotel: 'BUILDING',
  galpao: 'OUTHOUSE',
  chacara: 'SMALL_FARM',
  sitio: 'SMALL_FARM',
}

const FILTRO_PUBLICO = `_type=="property" && publicarSite==true && status=="ativo"`

export type Imovel = {
  ref: string
  title: string
  featured: boolean
  type: string
  neighborhood: string
  city: string
  sale: number
  rent: number
  area: number
  beds: number
  baths: number
  garages: number
  image: string
  url: string
}

export type ImovelDetalhe = Imovel & {
  codigo: string | null
  photos: string[]
  descricao: string
  comodidades: string[]
  acabamentos: string[]
  garantias: string[]
  pagamento: string[]
  tags: string[]
  ficha: Record<string, unknown>
  video: string | null
  videoInstitucional: boolean
  tour: string | null
  corretor: { nome: string; celular: string | null; creci: string | null } | null
}

type Bruto = {
  ref: string
  codigo?: string
  title: string
  tipo?: string
  finalidade?: string
  oferta?: string
  subTipo?: string
  constructionStatus?: string
  neighborhood?: string
  city?: string
  address?: string
  addressNumber?: string
  cep?: string
  pontoReferencia?: string
  zoneamento?: string
  latitude?: number
  longitude?: number
  sale?: number
  rent?: number
  priceCash?: number
  condominio?: number
  iptu?: number
  precoM2Venda?: number
  aceitaNegociacao?: boolean
  garantiaLocacao?: string[]
  paymentMethods?: string[]
  area?: number
  areaTotal?: number
  beds?: number
  suites?: number
  baths?: number
  qtdSalas?: number
  garages?: number
  vagasCobertas?: number
  vagasDescobertas?: number
  garageType?: string
  numeroAndar?: number
  qtdAndar?: number
  qtdElevador?: number
  alturaPeDireito?: number
  anoConstrucao?: number
  anoReforma?: number
  description?: string
  videoUrl?: string
  tourVirtual?: string
  amenities?: string[]
  acabamentos?: string[]
  tags?: string[]
  ocupacao?: string
  locado?: boolean
  exclusividade?: boolean
  captador?: string
  captadorCelular?: string
  captadorCRECI?: string
  img?: string
  fotos?: string[]
  slug?: string
  featured?: boolean
  usoDeVideo?: number
}

const rotular = (valores: string[] | undefined, mapa: Record<string, string>) =>
  (valores || []).map((v) => mapa[v]).filter(Boolean)

// Vídeo institucional x vídeo do imóvel: vídeo reaproveitado em muitos
// imóveis é o comercial da Tamada, não desse imóvel específico — o mesmo
// critério do gerador estático (scripts/gerar-catalogo.mjs).
const LIMITE_INSTITUCIONAL = 5

const CAMPOS_BASICOS = `
  "ref": gaiaCodigo,
  title,
  featured,
  "tipo": type,
  neighborhood,
  "city": cidade,
  "sale": price,
  "rent": rentPrice,
  area,
  "beds": bedrooms,
  "baths": bathrooms,
  "garages": garage,
  "img": mainImage.asset->url,
  "slug": slug.current
`

function mapBasico(p: Bruto): Imovel {
  return {
    ref: p.ref,
    title: p.title,
    featured: p.featured === true,
    type: TIPO[p.tipo ?? ''] || 'HOUSE',
    neighborhood: p.neighborhood || '',
    city: p.city || 'São Paulo',
    sale: p.sale || 0,
    rent: p.rent || 0,
    area: p.area || 0,
    beds: p.beds || 0,
    baths: p.baths || 0,
    garages: p.garages || 0,
    image: p.img ? `${p.img}?w=560&h=400&fit=crop&auto=format` : '',
    url: `/imovel/${p.slug}/${p.ref}`,
  }
}

export async function getImoveis(): Promise<Imovel[]> {
  const data = await client.fetch<Bruto[]>(
    `*[${FILTRO_PUBLICO}]|order(_createdAt desc){${CAMPOS_BASICOS}}`,
    {},
    { next: { revalidate: REVALIDATE } }
  )
  return (data || []).filter((p) => p.ref && p.title).map(mapBasico)
}

export async function getBairros(): Promise<
  { nome: string; cidade: string; total: number; lat: number; lng: number; amostras: number }[]
> {
  const data = await client.fetch<{ neighborhood?: string; city?: string; latitude?: number; longitude?: number }[]>(
    `*[${FILTRO_PUBLICO}]{neighborhood, "city": cidade, latitude, longitude}`,
    {},
    { next: { revalidate: REVALIDATE } }
  )
  const porBairro: Record<string, { nome: string; cidade: string; total: number; lats: number[]; lngs: number[] }> = {}
  for (const p of data || []) {
    const nome = (p.neighborhood || '').trim()
    if (!nome) continue
    const b = (porBairro[nome] = porBairro[nome] || { nome, cidade: p.city || 'São Paulo', total: 0, lats: [], lngs: [] })
    b.total++
    if (p.latitude && p.longitude) {
      b.lats.push(p.latitude)
      b.lngs.push(p.longitude)
    }
  }
  const media = (a: number[]) => a.reduce((s, n) => s + n, 0) / a.length
  return Object.values(porBairro)
    .filter((b) => b.lats.length > 0)
    .map((b) => ({
      nome: b.nome,
      cidade: b.cidade,
      total: b.total,
      lat: Number(media(b.lats).toFixed(5)),
      lng: Number(media(b.lngs).toFixed(5)),
      amostras: b.lats.length,
    }))
    .sort((a, b) => b.total - a.total)
}

const CAMPOS_DETALHE = `
  ${CAMPOS_BASICOS},
  "codigo": codigoImovel,
  finalidade, oferta, subTipo, constructionStatus,
  garantiaLocacao, paymentMethods,
  areaTotal, suites, qtdSalas,
  vagasCobertas, vagasDescobertas, garageType,
  numeroAndar, qtdAndar, qtdElevador, alturaPeDireito,
  anoConstrucao, anoReforma,
  condominio, iptu, precoM2Venda, priceCash, aceitaNegociacao,
  ocupacao, locado, exclusividade, zoneamento,
  description, videoUrl, tourVirtual,
  amenities, acabamentos, tags,
  captador, captadorCelular, captadorCRECI,
  "fotos": images[].asset->url,
  "usoDeVideo": count(*[_type=="property" && videoUrl==^.videoUrl])
`

export async function getImovel(ref: string): Promise<ImovelDetalhe | null> {
  const p = await client.fetch<Bruto | null>(
    `*[${FILTRO_PUBLICO} && gaiaCodigo==$ref][0]{${CAMPOS_DETALHE}}`,
    { ref },
    { next: { revalidate: REVALIDATE } }
  )
  if (!p) return null

  const basico = mapBasico(p)
  return {
    ...basico,
    codigo: p.codigo ?? null,
    photos: [p.img, ...(p.fotos || [])].filter((v): v is string => !!v),
    descricao: p.description || '',
    comodidades: rotular(p.amenities, COMODIDADES),
    acabamentos: rotular(p.acabamentos, ACABAMENTOS),
    garantias: rotular(p.garantiaLocacao, GARANTIAS),
    pagamento: rotular(p.paymentMethods, PAGAMENTO),
    tags: p.tags || [],
    ficha: {
      subTipo: p.subTipo,
      finalidade: p.finalidade,
      areaUtil: p.area,
      areaTotal: p.areaTotal,
      quartos: p.beds,
      suites: p.suites,
      banheiros: p.baths,
      salas: p.qtdSalas,
      vagas: p.garages,
      vagasCobertas: p.vagasCobertas,
      vagasDescobertas: p.vagasDescobertas,
      tipoVaga: p.garageType === 'privativa' ? 'Privativa' : p.garageType === 'rotativa' ? 'Rotativa' : null,
      andar: p.numeroAndar,
      andaresPredio: p.qtdAndar,
      elevadores: p.qtdElevador,
      peDireito: p.alturaPeDireito,
      anoConstrucao: p.anoConstrucao,
      anoReforma: p.anoReforma,
      condominio: p.condominio,
      iptu: p.iptu,
      precoM2: p.precoM2Venda,
      precoAVista: p.priceCash,
      aceitaNegociacao: p.aceitaNegociacao,
      ocupacao: OCUPACAO[p.ocupacao ?? ''] || null,
      locado: p.locado,
      exclusividade: p.exclusividade,
      zoneamento: p.zoneamento,
      obra:
        p.constructionStatus === 'pronto'
          ? 'Pronto para morar'
          : p.constructionStatus === 'construcao'
            ? 'Em construção'
            : p.constructionStatus === 'lancamento'
              ? 'Lançamento'
              : null,
    },
    video: p.videoUrl || null,
    videoInstitucional: !!p.videoUrl && (p.usoDeVideo || 0) > LIMITE_INSTITUCIONAL,
    tour: p.tourVirtual || null,
    corretor: p.captador
      ? { nome: p.captador, celular: p.captadorCelular || null, creci: p.captadorCRECI || null }
      : null,
  }
}

export async function getRefBySlug(slug: string): Promise<string | null> {
  const ref = await client.fetch<string | null>(
    `*[${FILTRO_PUBLICO} && slug.current==$slug][0].gaiaCodigo`,
    { slug },
    { next: { revalidate: REVALIDATE } }
  )
  return ref ?? null
}
