// Lógica pura da seção "O condomínio" (ficha do imóvel, página do condomínio e lista).
// Sem Sanity e sem React: tudo aqui é testável com `npm run test:condominio`.

export type Tipologia = {
  key: string
  nome: string
  area: number | null
  dormitorios: number | null
  suites: number | null
  vagas: number | null
}

export type FichaTecnica = {
  construtora: string | null
  arquitetura: string | null
  torres: number | null
  andares: number | null
  elevadores: number | null
  totalUnidades: number | null
  unidadesPorAndar: number | null
  totalVagas: number | null
  areaTerreno: number | null
  areaConstruida: number | null
  previsaoEntrega: string | null
  tipologias: Tipologia[]
}

export type Planta = { key: string; nome: string; tipologiaKey: string | null; imagemUrl: string | null; arquivoUrl: string | null }

export type Condominio = {
  id: string
  slug: string
  nome: string
  descricao: string | null
  /** Só bairro/cidade/UF: o site nunca publica rua de imóvel, então o condomínio também não. */
  local: string | null
  fotos: string[]
  comodidades: string[]
  ficha: FichaTecnica | null
  plantas: Planta[]
  bookUrl: string | null
  bookNome: string | null
}

export type CondominioCard = {
  id: string
  slug: string
  nome: string
  local: string | null
  foto: string | null
  qtd: number
  menorPreco: number | null
}

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/** Zero é valor válido (0 suíte); só `null`, `undefined` e não-número ficam de fora. */
function numero(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

export function toSlug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** `nome-<8 primeiros do uuid>`: o documento do CRM não tem slug. */
export function slugCondominio(id: string, nome: string): string {
  const uuid = id.replace(/^condominio-/, '').replace(/-/g, '')
  const base = toSlug(nome) || 'condominio'
  return `${base}-${uuid.slice(0, 8)}`
}

/** Slug válido para URL: protege a rota dinâmica de entrada inesperada. */
export function slugValido(slug: string): boolean {
  return /^[a-z0-9-]{1,120}$/.test(slug)
}

/** O imóvel (por `condominioId`) pertence ao condomínio da URL (`?condominio=<slug>`)? */
export function pertenceAoCondominio(condominioId: string | undefined, slug: string): boolean {
  const sufixo = sufixoDoSlug(slug)
  if (!condominioId || !sufixo) return false
  return condominioId.replace(/^condominio-/, '').replace(/-/g, '').startsWith(sufixo)
}

/** Final do slug (8 hex) que identifica o condomínio. */
export function sufixoDoSlug(slug: string): string | null {
  const m = /-([0-9a-f]{8})$/.exec(slug)
  return m ? m[1] : null
}

export function localDoCondominio(c: { neighborhood?: unknown; city?: unknown; state?: unknown }): string | null {
  const bairro = texto(c.neighborhood)
  const cidade = [texto(c.city), texto(c.state)].filter(Boolean).join('/')
  const partes = [bairro, cidade].filter(Boolean)
  return partes.length ? partes.join(', ') : null
}

/** `YYYY-MM` -> "mar/2027". Outro formato volta como veio. */
export function formatarPrevisaoEntrega(valor: string | null | undefined): string | null {
  if (!valor) return null
  const m = valor.match(/^(\d{4})-(\d{2})$/)
  if (!m) return valor
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const mes = Number(m[2])
  return mes >= 1 && mes <= 12 ? `${meses[mes - 1]}/${m[1]}` : valor
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const plural = (v: number, s: string, p: string) => `${fmt(v)} ${v === 1 ? s : p}`

/** "52 m² · 2 dormitórios · 1 suíte · 0 vaga": zero aparece, ausente não. */
export function detalhesTipologia(t: Tipologia): string | null {
  const partes = [
    t.area !== null ? `${fmt(t.area)} m²` : null,
    t.dormitorios !== null ? plural(t.dormitorios, 'dormitório', 'dormitórios') : null,
    t.suites !== null ? plural(t.suites, 'suíte', 'suítes') : null,
    t.vagas !== null ? plural(t.vagas, 'vaga', 'vagas') : null,
  ].filter(Boolean)
  return partes.length ? partes.join(' · ') : null
}

/** Pares rótulo/valor da ficha técnica, só os que têm dado. */
export function linhasFicha(f: FichaTecnica | null): Array<[string, string]> {
  if (!f) return []
  const n = (v: number | null) => (v !== null ? fmt(v) : null)
  const m2 = (v: number | null) => (v !== null ? `${fmt(v)} m²` : null)
  const linhas: Array<[string, string | null]> = [
    ['Construtora', f.construtora],
    ['Arquitetura', f.arquitetura],
    ['Torres', n(f.torres)],
    ['Andares', n(f.andares)],
    ['Elevadores', n(f.elevadores)],
    ['Total de unidades', n(f.totalUnidades)],
    ['Unidades por andar', n(f.unidadesPorAndar)],
    ['Vagas', n(f.totalVagas)],
    ['Área do terreno', m2(f.areaTerreno)],
    ['Área construída', m2(f.areaConstruida)],
    ['Previsão de entrega', formatarPrevisaoEntrega(f.previsaoEntrega)],
  ]
  return linhas.filter((l): l is [string, string] => l[1] !== null && l[1] !== '')
}

export type GrupoPlantas = {
  key: string
  titulo: string | null
  detalhes: string | null
  plantas: Array<{ url: string; nome: string }>
}

/** Agrupa as plantas por tipo de unidade; planta sem tipo (ou de tipo removido) vai para "Outras plantas". */
export function gruposDePlantas(ficha: FichaTecnica | null, plantas: Planta[]): { grupos: GrupoPlantas[]; temTipos: boolean; pdfs: Planta[] } {
  const comImagem = plantas.filter(p => p.imagemUrl)
  const tipologias = ficha?.tipologias ?? []
  const chaves = new Set(tipologias.map(t => t.key))
  const porTipo: GrupoPlantas[] = tipologias
    .map(t => ({
      key: t.key,
      titulo: t.nome,
      detalhes: detalhesTipologia(t),
      plantas: comImagem.filter(p => p.tipologiaKey === t.key).map(p => ({ url: p.imagemUrl!, nome: p.nome })),
    }))
    .filter(g => g.detalhes || g.plantas.length > 0)
  const semTipo = comImagem.filter(p => !p.tipologiaKey || !chaves.has(p.tipologiaKey))
  const grupos = [
    ...porTipo,
    ...(semTipo.length
      ? [{ key: 'sem-tipo', titulo: porTipo.length ? 'Outras plantas' : null, detalhes: null, plantas: semTipo.map(p => ({ url: p.imagemUrl!, nome: p.nome })) }]
      : []),
  ]
  return { grupos, temTipos: porTipo.length > 0, pdfs: plantas.filter(p => !p.imagemUrl && p.arquivoUrl) }
}

type Bruto = Record<string, unknown>

/** Converte o resultado cru do GROQ no modelo do site. Todo campo é opcional (o CRM regrava o documento inteiro). */
export function montarCondominio(raw: Bruto | null | undefined): Condominio | null {
  if (!raw) return null
  const id = texto(raw._id)
  const nome = texto(raw.nome)
  if (!id || !nome) return null

  const f = raw.fichaTecnica as Bruto | null | undefined
  const tipologias = (Array.isArray(f?.tipologias) ? (f!.tipologias as Bruto[]) : [])
    .map((t): Tipologia | null => {
      const key = texto(t._key)
      const nomeTipo = texto(t.nome)
      if (!key || !nomeTipo) return null
      return { key, nome: nomeTipo, area: numero(t.area), dormitorios: numero(t.dormitorios), suites: numero(t.suites), vagas: numero(t.vagas) }
    })
    .filter((t): t is Tipologia => t !== null)

  const ficha: FichaTecnica | null = f
    ? {
        construtora: texto(f.construtora),
        arquitetura: texto(f.arquitetura),
        torres: numero(f.torres),
        andares: numero(f.andares),
        elevadores: numero(f.elevadores),
        totalUnidades: numero(f.totalUnidades),
        unidadesPorAndar: numero(f.unidadesPorAndar),
        totalVagas: numero(f.totalVagas),
        areaTerreno: numero(f.areaTerreno),
        areaConstruida: numero(f.areaConstruida),
        previsaoEntrega: texto(f.previsaoEntrega),
        tipologias,
      }
    : null

  const plantas = (Array.isArray(raw.plantas) ? (raw.plantas as Bruto[]) : [])
    .map((p, i): Planta => ({
      key: texto(p._key) ?? `planta-${i}`,
      nome: texto(p.nome) ?? `Planta ${i + 1}`,
      tipologiaKey: texto(p.tipologiaKey),
      imagemUrl: texto(p.imagemUrl),
      arquivoUrl: texto(p.arquivoUrl),
    }))
    .filter(p => p.imagemUrl || p.arquivoUrl)

  const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length > 0) : [])

  return {
    id,
    slug: slugCondominio(id, nome),
    nome,
    descricao: texto(raw.descricao),
    local: localDoCondominio({ neighborhood: raw.bairro, city: raw.cidade, state: raw.estado }),
    fotos: lista(raw.fotos),
    comodidades: [...new Set(lista(raw.comodidades))],
    ficha,
    plantas,
    bookUrl: texto(raw.bookUrl),
    bookNome: texto(raw.bookNome),
  }
}

/** A seção existe se tiver ao menos um bloco de conteúdo além do nome. */
export function temConteudo(c: Condominio): boolean {
  const { grupos, pdfs } = gruposDePlantas(c.ficha, c.plantas)
  return Boolean(
    c.fotos.length || c.descricao || c.comodidades.length || linhasFicha(c.ficha).length || grupos.length || pdfs.length || c.bookUrl
  )
}
