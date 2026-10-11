import { client } from './sanity'
import { COMODIDADES } from './opcoes'
import { rotularComFallback } from './queries'
import {
  montarCondominio, slugCondominio, localDoCondominio, sufixoDoSlug, slugValido,
  type Condominio, type CondominioCard,
} from './condominio-secao'

// O CRM regrava o documento inteiro e ainda existem documentos com os nomes antigos
// (logradouro/imagens/bairro/cidade): ler os dois com coalesce. O CRM nunca cria rascunho
// (`drafts.`) deste tipo.
const PROJECAO = `
  _id, nome,
  "descricao": coalesce(description, descricaoPublica),
  "bairro": coalesce(neighborhood, bairro),
  "cidade": coalesce(city, cidade),
  "estado": coalesce(state, estado),
  "fotos": coalesce(images, imagens)[defined(asset)].asset->url,
  "comodidades": amenitiesCondominio,
  fichaTecnica{
    construtora, arquitetura, torres, andares, elevadores, totalUnidades, unidadesPorAndar,
    totalVagas, areaTerreno, areaConstruida, previsaoEntrega,
    tipologias[]{ _key, nome, area, dormitorios, suites, vagas }
  },
  "plantas": plantas[]{ _key, nome, tipologiaKey, "imagemUrl": imagem.asset->url, "arquivoUrl": arquivo.asset->url },
  "bookUrl": book.asset->url,
  bookNome
`

// Mesmos filtros da listagem pública: só entra no site imóvel ativo e publicado.
const IMOVEL_PUBLICO = `_type == "property" && publicarSite == true && status == "ativo"`

const REVALIDA = { next: { revalidate: 300 } } as const

/** As comodidades chegam como slug; o site da Tamada mostra o rótulo (mapa COMODIDADES, com fallback formatado). */
function rotulado(c: Condominio | null): Condominio | null {
  return c ? { ...c, comodidades: rotularComFallback(c.comodidades, COMODIDADES) } : null
}

export async function getCondominioPorId(id: string): Promise<Condominio | null> {
  if (!id) return null
  const raw = await client.fetch(`*[_type == "condominio" && _id == $id][0]{ ${PROJECAO} }`, { id }, REVALIDA)
  return rotulado(montarCondominio(raw))
}

/** Condomínios com ao menos um imóvel ativo e publicado. Os sem imóvel (a maioria) nunca aparecem. */
export async function getCondominiosComImoveis(): Promise<CondominioCard[]> {
  const rows = (await client.fetch(
    `*[_type == "condominio"]{
      _id, nome,
      "bairro": coalesce(neighborhood, bairro), "cidade": coalesce(city, cidade), "estado": coalesce(state, estado),
      "foto": coalesce(images, imagens)[defined(asset)][0].asset->url,
      "imoveis": *[${IMOVEL_PUBLICO} && condominioRef._ref == ^._id].price
    }`,
    {},
    REVALIDA
  )) as Array<{ _id: string; nome?: string; bairro?: string; cidade?: string; estado?: string; foto?: string | null; imoveis?: Array<number | null> }>

  return rows
    .filter(r => r._id && r.nome && (r.imoveis?.length ?? 0) > 0)
    .map(r => {
      const precos = (r.imoveis ?? []).filter((p): p is number => typeof p === 'number' && p > 0)
      return {
        id: r._id,
        slug: slugCondominio(r._id, r.nome!),
        nome: r.nome!,
        local: localDoCondominio({ neighborhood: r.bairro, city: r.cidade, state: r.estado }),
        foto: r.foto ?? null,
        qtd: r.imoveis!.length,
        menorPreco: precos.length ? Math.min(...precos) : null,
      }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/** Página do condomínio: só existe se o slug bate com o documento E há imóvel ativo nele. */
export async function getCondominioPorSlug(slug: string): Promise<{ condominio: Condominio; imoveis: string[] } | null> {
  if (!slugValido(slug)) return null
  const sufixo = sufixoDoSlug(slug)
  if (!sufixo) return null

  const raw = await client.fetch(
    `*[_type == "condominio" && string::startsWith(_id, $prefixo)][0]{
      ${PROJECAO},
      "imoveis": *[${IMOVEL_PUBLICO} && condominioRef._ref == ^._id].slug.current
    }`,
    { prefixo: `condominio-${sufixo}` },
    REVALIDA
  )
  const condominio = rotulado(montarCondominio(raw))
  const imoveis = ((raw?.imoveis as Array<string | null> | undefined) ?? []).filter((s): s is string => Boolean(s))
  if (!condominio || condominio.slug !== slug || imoveis.length === 0) return null
  return { condominio, imoveis }
}

export async function getSlugsCondominios(): Promise<string[]> {
  return (await getCondominiosComImoveis()).map(c => c.slug)
}
