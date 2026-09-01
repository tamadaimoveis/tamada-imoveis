/**
 * Importação Gaia/ValueGaia (XML) → Sanity — Tamada Imóveis
 *
 * Escala: ~4.429 imóveis e ~99.297 fotos. O upload das fotos é a parte cara
 * (horas). Por isso o script é RETOMÁVEL: um ledger em disco guarda o que já
 * subiu, então cair no meio e rodar de novo continua de onde parou.
 *
 * Uso:
 *   npx tsx scripts/import-gaia.ts --dry-run          # relatório, não escreve
 *   npx tsx scripts/import-gaia.ts --limit 5          # teste com 5 imóveis
 *   npx tsx scripts/import-gaia.ts --sem-fotos        # só os dados, sem upload
 *   npx tsx scripts/import-gaia.ts                    # importação completa
 *   npx tsx scripts/import-gaia.ts --force            # reimporta tudo (ignora ledger)
 *   npx tsx scripts/import-gaia.ts --listar-codigos codigos.json   # só extrai os
 *                                    códigos do feed atual e sai (usado por
 *                                    limpar-imoveis-saidos.ts)
 *
 * .env.local:
 *   GAIA_XML_URL                    (ou --xml <caminho local>)
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_WRITE_TOKEN
 */

import {createClient, type SanityClient} from '@sanity/client'
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Env + args
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnv()

const argv = process.argv.slice(2)
const has = (flag: string) => argv.includes(flag)
const valueOf = (flag: string) => {
  const i = argv.indexOf(flag)
  return i !== -1 ? argv[i + 1] : undefined
}

const DRY_RUN = has('--dry-run')
const SEM_FOTOS = has('--sem-fotos')
const FORCE = has('--force')
const LIMIT = valueOf('--limit') ? parseInt(valueOf('--limit')!, 10) : Infinity
const XML_LOCAL = valueOf('--xml')
const XML_URL = process.env.GAIA_XML_URL
const LISTAR_CODIGOS = valueOf('--listar-codigos')

const LEDGER_PATH = path.resolve(process.cwd(), 'gaia-import-ledger.json')
const REPORT_PATH = path.resolve(process.cwd(), `gaia-${DRY_RUN ? 'dryrun' : 'import'}-report.json`)

// Fotos em paralelo. Ajustável porque o teto real é o rate limit do Sanity, que
// só dá pra descobrir medindo: subir demais troca horas de ganho por retries.
// 20 medido em 30/07: 3,54 fotos/s, zero erro. 4 dava 1,32/s. Acima disso o
// ganho some — o gargalo vira o CDN do Google, não o Sanity.
const FOTO_CONCURRENCY = valueOf('--concurrency') ? parseInt(valueOf('--concurrency')!, 10) : 20

// ---------------------------------------------------------------------------
// Ledger (retomada)
// ---------------------------------------------------------------------------

interface LedgerEntry {
  docId: string
  /** URL da foto no Gaia → assetId no Sanity. Evita re-upload na retomada. */
  assets: Record<string, string>
  /** DataAtualizacaoImovel do Gaia na última importação (ISO). */
  atualizadoEm?: string
  completo?: boolean
}
type Ledger = Record<string, LedgerEntry>

function carregarLedger(): Ledger {
  if (FORCE || !fs.existsSync(LEDGER_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8')) as Ledger
  } catch {
    console.warn('⚠️  Ledger ilegível — recomeçando do zero.')
    return {}
  }
}

// Escreve em arquivo temporário e renomeia: se o processo morrer no meio da
// gravação, o ledger antigo continua íntegro em vez de virar JSON truncado.
function salvarLedger(ledger: Ledger) {
  const tmp = `${LEDGER_PATH}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(ledger))
  fs.renameSync(tmp, LEDGER_PATH)
}

// ---------------------------------------------------------------------------
// Parser XML (sem dependência — o feed é regular e plano)
// ---------------------------------------------------------------------------

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
}

/** Conteúdo da primeira ocorrência de <tag>, já sem CDATA e sem entidades. */
function campo(bloco: string, tag: string): string | undefined {
  const abre = `<${tag}>`
  const fecha = `</${tag}>`
  const i = bloco.indexOf(abre)
  if (i === -1) return undefined
  const j = bloco.indexOf(fecha, i)
  if (j === -1) return undefined
  let raw = bloco.slice(i + abre.length, j)
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)
  raw = cdata ? cdata[1] : decodeEntities(raw)
  const t = raw.trim()
  return t === '' ? undefined : t
}

/** Todas as ocorrências de <tag> dentro do bloco. */
function campos(bloco: string, tag: string): string[] {
  const out: string[] = []
  const re = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(bloco)) !== null) {
    const v = decodeEntities(m[1]).trim()
    if (v) out.push(v)
  }
  return out
}

function num(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = parseFloat(v.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n !== 0 ? n : undefined
}

/** Campos numéricos do Gaia que já vêm com ponto decimal (PrecoVenda etc). */
function decimal(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function inteiro(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** Flag booleana do Gaia: presente com "1" = sim. Ausente = indefinido. */
function flag(bloco: string, tag: string): boolean | undefined {
  const v = campo(bloco, tag)
  if (v === undefined) return undefined
  return v === '1'
}

/** "30/07/2026 06:52:05" → ISO. */
function dataGaia(v: string | undefined): string | undefined {
  if (!v) return undefined
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/)
  if (!m) return undefined
  const [, d, mo, y, h = '00', mi = '00', s = '00'] = m
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`
  return Number.isNaN(Date.parse(iso)) ? undefined : iso
}

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

/**
 * Título do Gaia vem no formato SEO longo:
 *   "Sobrado com 4 quartos à venda, 120 m² por R$ 472.000 - Itaquera - São Paulo/SP"
 * Preço e localização no slug envelhecem (preço muda, URL quebra) e ainda
 * cortavam no meio ao truncar em 80 chars, deixando restos tipo "-120-m-por".
 * Aqui fica só a parte descritiva.
 */
function baseSlugDoTitulo(title: string): string {
  const semLocal = title.split(' - ')[0]
  // O sufixo "/mês" aparece nos títulos de locação depois do valor — sem ele no
  // padrão, a âncora de fim não casa e sobra "466-m-por-mes" no slug.
  const PERIODO = String.raw`(\s*\/\s*m[eê]s)?`
  const semPreco = semLocal
    .replace(new RegExp(String.raw`,?\s*[\d.,]+\s*m²?\s*(por)?\s*(R\$\s*[\d.,]+)?${PERIODO}\s*$`, 'i'), '')
    .replace(new RegExp(String.raw`,?\s*por\s*R\$\s*[\d.,]+${PERIODO}\s*$`, 'i'), '')
    .replace(/\s*R\$\s*[\d.,]+/gi, '')
    .trim()
  return slugify(semPreco || semLocal || title)
}

/** Valores que o Gaia usa como "vazio" em campo de texto livre. */
const LIXO_TEXTO = new Set(['nao tem', 'não tem', 'nao', 'não', 'n/a', 'na', '-', '--', 'sem', 'nenhum', 'x', '0', 'nao informado', 'não informado'])

function textoUtil(v: string | undefined): string | undefined {
  if (!v) return undefined
  const norm = v.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return LIXO_TEXTO.has(norm) ? undefined : v.trim()
}

/** Divide o XML em blocos <Imovel> por índice — mais rápido e seguro que regex global em 58MB. */
function* blocosImovel(xml: string): Generator<string> {
  const ABRE = '<Imovel>'
  const FECHA = '</Imovel>'
  let pos = 0
  for (;;) {
    const i = xml.indexOf(ABRE, pos)
    if (i === -1) return
    const j = xml.indexOf(FECHA, i)
    if (j === -1) return
    yield xml.slice(i, j + FECHA.length)
    pos = j + FECHA.length
  }
}

// ---------------------------------------------------------------------------
// Mapeamentos Gaia → schema
// ---------------------------------------------------------------------------

const TIPO_MAP: Record<string, string> = {
  Apartamento: 'apartamento',
  'Apartamento Duplex': 'apartamento_duplex',
  Casa: 'casa',
  Sobrado: 'sobrado',
  Cobertura: 'cobertura',
  Studio: 'studio',
  Kitnet: 'studio',
  Conjunto: 'conjunto',
  Terreno: 'terreno',
  'Chácara': 'chacara',
  'Sítio': 'sitio',
  Sala: 'sala',
  'Salão': 'salao',
  Loja: 'loja',
  Ponto: 'ponto',
  'Prédio': 'predio',
  'Galpão': 'galpao',
  'Área': 'area',
  Hotel: 'hotel',
}

const FINALIDADE_MAP: Record<string, string> = {
  Residencial: 'residencial',
  Comercial: 'comercial',
  Rural: 'rural',
  Industrial: 'industrial',
}

// PublicaValores no Gaia identifica a OFERTA, não visibilidade de preço.
// Confirmado contra o site: 1 = venda+locação, 2 = venda, 3 = locação.
const OFERTA_MAP: Record<string, string> = {
  '1': 'venda_locacao',
  '2': 'venda',
  '3': 'locacao',
}

// "Não Informado" fica de fora de propósito: gravar o valor só polui o painel
// com um campo preenchido que não informa nada. Ausente = não informado.
const OCUPACAO_MAP: Record<string, string> = {
  Ocupado: 'ocupado',
  Desocupado: 'desocupado',
  Novo: 'novo',
  'Em construção': 'em_construcao',
  'Lançamento': 'lancamento',
}

const PADRAO_MAP: Record<string, string> = {
  Alto: 'alto',
  'Médio': 'medio',
  Regular: 'regular',
  Baixo: 'baixo',
}

const PADRAO_LOCAL_MAP: Record<string, string> = {
  Privilegiada: 'privilegiada',
  'Ótima': 'otima',
  Boa: 'boa',
  'Média': 'media',
  Regular: 'regular',
}

/** Tag booleana de piso → value do campo `acabamentos`. */
const ACABAMENTO_MAP: Record<string, string> = {
  PisoPorcelanato: 'porcelanato',
  PisoCeramica: 'ceramica',
  PisoLaminado: 'laminado',
  PisoGranito: 'granito',
  PisoMarmore: 'marmore',
  PisoTacoMadeira: 'taco_madeira',
  PisoArdosia: 'ardosia',
  PisoElevado: 'piso_elevado',
  PisoAquecido: 'piso_aquecido',
  PisoBloquete: 'bloquete',
  CimentoQueimado: 'cimento_queimado',
  ContraPiso: 'contrapiso',
  Carpete: 'carpete',
  CarpeteMadeira: 'carpete',
  CarpeteNylon: 'carpete',
  CarpeteAcrilico: 'carpete',
}

/** Qualquer um destes = o imóvel tem armário planejado. O Gaia detalha por
 *  cômodo; no site isso vira um selo só — detalhe demais não ajuda a busca. */
const TAGS_ARMARIO = [
  'ArmarioCozinha',
  'ArmarioDormitorio',
  'ArmarioAreaServico',
  'ArmarioBanheiro',
  'ArmarioSala',
  'ArmarioCorredor',
  'ArmarioEscritorio',
  'ArmarioDormitorioEmpregada',
  'ArmarioHomeTheater',
]

const GARANTIA_MAP: Record<string, string> = {
  'Caução': 'caucao',
  'Seguro Fiança': 'seguro_fianca',
  Fiador: 'fiador',
  'Capitalização': 'capitalizacao',
  'Aluguel antecipado': 'aluguel_antecipado',
  'Kenlo Garante': 'kenlo_garante',
}

const STATUS_OBRA_MAP: Record<string, string> = {
  'Lançamento': 'lancamento',
  'Pré-lançamento': 'lancamento',
  'Futuro lançamento': 'lancamento',
  'Últimas unidades': 'lancamento',
  'Pronto para Morar': 'pronto',
}

/** Tag booleana do Gaia → value do campo `amenities`. */
const AMENITY_MAP: Record<string, string> = {
  Piscina: 'piscina',
  Churrasqueira: 'churrasqueira',
  Sauna: 'sauna',
  Hidromassagem: 'hidromassagem',
  QuadraPoliEsportiva: 'quadra_poliesportiva',
  CampoFutebol: 'campo_futebol',
  AreaComum: 'area_lazer',
  Sacada: 'sacada',
  Varanda: 'sacada',
  VarandaGourmet: 'varanda_gourmet',
  Terraco: 'terraco',
  Quintal: 'quintal',
  Lavabo: 'lavabo',
  AreaServico: 'area_servico',
  Copa: 'copa',
  Despensa: 'despensa',
  Escritorio: 'escritorio',
  AreaEscritorio: 'escritorio',
  ArmarioCloset: 'closet',
  Deposito: 'deposito',
  Mezanino: 'mezanino',
  JardimInverno: 'jardim_inverno',
  Lareira: 'lareira',
  Adega: 'adega',
  Solarium: 'solarium',
  PeDireitoDuplo: 'pe_direito_duplo',
  DormitorioReversivel: 'dormitorio_reversivel',
  DormitorioEmpregada: 'dormitorio_empregada',
  WCEmpregada: 'wc_empregada',
  Vestiario: 'vestiario',
  ArCondicionado: 'ar_condicionado',
  Interfone: 'interfone',
  PortaoEletronico: 'portao_eletronico',
  Alarme: 'alarme',
  TVCabo: 'tv_cabo',
  Zelador: 'zelador',
  Mobiliado: 'mobiliado',
  AceitaPet: 'aceita_pet',
  Agua: 'agua',
  Esgoto: 'esgoto',
  EnergiaEletrica: 'energia_eletrica',
  RuaAsfaltada: 'rua_asfaltada',
  EntradaCaminhoes: 'entrada_caminhoes',
  Doca: 'doca',
  VaoLivre: 'vao_livre',
  Caseiro: 'caseiro',
  CondominioFechado: 'condominio_fechado',
}

// ponytail: cobre os bairros de maior volume da carteira (Zona Leste concentra
// ~80% do estoque). Bairro fora do mapa fica sem zona — o site cai no filtro
// por bairro/cidade, que continua funcionando. Ampliar quando/se as páginas de
// zona virarem prioridade.
const ZONA_SP: Record<string, string> = {
  'penha de frança': 'leste',
  'penha': 'leste',
  'jardim penha': 'leste',
  'vila ré': 'leste',
  'tatuapé': 'leste',
  'vila esperança': 'leste',
  'vila matilde': 'leste',
  'vila carrão': 'leste',
  'parque boturussu': 'leste',
  'vila buenos aires': 'leste',
  'vila granada': 'leste',
  'jardim popular': 'leste',
  'itaquera': 'leste',
  'vila marieta': 'leste',
  'cidade patriarca': 'leste',
  'vila rio branco': 'leste',
  'cangaíba': 'leste',
  'vila formosa': 'leste',
  'mooca': 'leste',
  'cidade líder': 'leste',
  'vila guilhermina': 'leste',
  'vila domitila': 'leste',
  'cidade antônio estevão de carvalho': 'leste',
  'vila sílvia': 'leste',
  'parque cruzeiro do sul': 'leste',
  'artur alvim': 'leste',
  'vila são geraldo': 'leste',
  'vila costa melo': 'leste',
  'vila talarico': 'leste',
  'vila gomes cardim': 'leste',
  'vila curuçá': 'leste',
  'belém': 'leste',
  'água rasa': 'leste',
  'carrão': 'leste',
  'aricanduva': 'leste',
  'são miguel paulista': 'leste',
  'ermelino matarazzo': 'leste',
  'vila prudente': 'leste',
  'sapopemba': 'leste',
  'guaianases': 'leste',
  'cidade tiradentes': 'leste',
  'são mateus': 'leste',
  'santana': 'norte',
  'tucuruvi': 'norte',
  'vila maria': 'norte',
  'vila guilherme': 'norte',
  'casa verde': 'norte',
  'freguesia do ó': 'norte',
  'tremembé': 'norte',
  'jaçanã': 'norte',
  'pinheiros': 'oeste',
  'perdizes': 'oeste',
  'lapa': 'oeste',
  'butantã': 'oeste',
  'vila leopoldina': 'oeste',
  'pompeia': 'oeste',
  'moema': 'sul',
  'vila mariana': 'sul',
  'saúde': 'sul',
  'ipiranga': 'sul',
  'santo amaro': 'sul',
  'campo belo': 'sul',
  'jabaquara': 'sul',
  'cursino': 'sul',
  'sé': 'centro',
  'república': 'centro',
  'bela vista': 'centro',
  'consolação': 'centro',
  'liberdade': 'centro',
  'santa cecília': 'centro',
  'bom retiro': 'centro',
  'brás': 'centro',
}

function resolverZona(bairro: string | undefined, cidade: string | undefined): string | undefined {
  if (cidade && cidade.toLowerCase() !== 'são paulo') return 'outra'
  if (!bairro) return undefined
  return ZONA_SP[bairro.toLowerCase()]
}

// ---------------------------------------------------------------------------
// Mapeamento de um <Imovel>
// ---------------------------------------------------------------------------

interface Foto {
  url: string
  principal: boolean
}

interface Corretor {
  nome: string
  email: string
  celular?: string
  telefone?: string
  fotoUrl?: string
}

interface ImovelMapeado {
  doc: Record<string, unknown>
  fotos: Foto[]
  corretor?: Corretor
  gaiaCodigo: string
}

// `featured`, `publicarSite` e `status` NÃO vêm do Gaia — quem manda neles é
// o corretor pelo CRM ("Destacar na home" / "Publicar no site" / marcar
// venda). Só entram como valor padrão na CRIAÇÃO de um imóvel novo; num
// imóvel que já existe, incluir esses campos no patch apagava a escolha do
// cliente a cada reimportação. `status` é o mais grave dos três: o Gaia só
// exporta imóvel ainda publicado, então toda rodada reescrevia 'ativo' por
// cima de um 'vendido'/'reservado' que o corretor tinha acabado de marcar —
// bug idêntico ao achado no LanPortus (RobustCRM), mesma causa raiz.
const DEFAULTS_SO_NA_CRIACAO = {
  publicarSite: true,
  featured: false,
  status: 'ativo',
} as const

function mapearImovel(bloco: string): ImovelMapeado | null {
  const gaiaCodigo = campo(bloco, 'CodigoImovel')
  if (!gaiaCodigo) return null

  // "AP9128-EIU" → "AP9128". É o código que a equipe usa e o que a URL antiga
  // do site expõe em ?ref=. O sufixo do tenant não agrega nada ao usuário.
  const codigoImovel = gaiaCodigo.split('-')[0]

  const title = campo(bloco, 'TituloImovel') || `Imóvel ${codigoImovel}`
  const cidade = campo(bloco, 'Cidade')
  const bairro = campo(bloco, 'Bairro') || campo(bloco, 'BairroOficial')
  const endereco = campo(bloco, 'Endereco')
  const numero = campo(bloco, 'Numero')
  const statusComercial = campo(bloco, 'StatusComercial')

  // Comodidades a partir das flags booleanas
  const amenities = new Set<string>()
  for (const [tag, value] of Object.entries(AMENITY_MAP)) {
    if (flag(bloco, tag)) amenities.add(value)
  }
  if (inteiro(campo(bloco, 'QtdElevador'))) amenities.add('elevador')
  if (inteiro(campo(bloco, 'QtdVagasCobertas'))) amenities.add('garagem_coberta')
  if (TAGS_ARMARIO.some((t) => flag(bloco, t))) amenities.add('armarios_planejados')
  if (flag(bloco, 'ServicoCozinha')) amenities.add('cozinha_servico')
  if (flag(bloco, 'FrenteMar')) amenities.add('frente_mar')
  if (flag(bloco, 'BeiraMar')) amenities.add('beira_mar')

  const acabamentos = new Set<string>()
  for (const [tag, value] of Object.entries(ACABAMENTO_MAP)) {
    if (flag(bloco, tag)) acabamentos.add(value)
  }

  const paymentMethods = new Set<string>()
  if (flag(bloco, 'AceitaFinanciamento')) paymentMethods.add('financiamento_bancario')
  if (flag(bloco, 'AceitaPermuta')) paymentMethods.add('permuta')

  const tags: string[] = []
  if (campo(bloco, 'Exclusividade') === 'Sim') tags.push('Exclusivo')
  if (statusComercial && statusComercial.toLowerCase().includes('lançamento')) tags.push('Lançamento')
  if (PADRAO_MAP[campo(bloco, 'PadraoImovel') || ''] === 'alto') tags.push('Alto Padrão')

  // GarantiaLocacao é aninhado: <GarantiaLocacao><Garantia>X</Garantia>...</GarantiaLocacao>
  const blocoGarantia = (() => {
    const i = bloco.indexOf('<GarantiaLocacao>')
    if (i === -1) return ''
    const j = bloco.indexOf('</GarantiaLocacao>', i)
    return j === -1 ? '' : bloco.slice(i, j)
  })()
  const garantiaLocacao = campos(blocoGarantia, 'Garantia')
    .map((g) => GARANTIA_MAP[g])
    .filter((g): g is string => Boolean(g))

  const lat = parseFloat(campo(bloco, 'latitude') || '0')
  const lon = parseFloat(campo(bloco, 'longitude') || '0')
  const cepDigits = (campo(bloco, 'CEP') || '').replace(/\D/g, '')

  const enderecoPublico = [endereco, numero].filter(Boolean).join(', ')

  const doc: Record<string, unknown> = {
    _id: `gaia-${gaiaCodigo}`,
    _type: 'property',
    codigoImovel,
    gaiaCodigo,
    // status fica de fora de propósito — ver comentário em DEFAULTS_SO_NA_CRIACAO.
    title,
    slug: {_type: 'slug', current: `${baseSlugDoTitulo(title)}-${codigoImovel.toLowerCase()}`},
    type: TIPO_MAP[campo(bloco, 'TipoImovel') || ''],
    finalidade: FINALIDADE_MAP[campo(bloco, 'Finalidade') || ''],
    oferta: OFERTA_MAP[campo(bloco, 'PublicaValores') || ''] || 'venda',
    subTipo: campo(bloco, 'SubTipoImovel'),
    constructionStatus: STATUS_OBRA_MAP[statusComercial || ''],

    price: decimal(campo(bloco, 'PrecoVenda')),
    rentPrice: decimal(campo(bloco, 'PrecoLocacao')),
    condominio: decimal(campo(bloco, 'PrecoCondominio')),
    iptu: decimal(campo(bloco, 'PrecoIptu')),
    precoM2Venda: decimal(campo(bloco, 'PrecoMedioM2Venda')),
    precoM2Locacao: decimal(campo(bloco, 'PrecoMedioM2Locacao')),
    aceitaNegociacao: flag(bloco, 'AceitaNegociacao'),
    garantiaLocacao: garantiaLocacao.length ? garantiaLocacao : undefined,

    area: num(campo(bloco, 'AreaUtil')),
    areaTotal: num(campo(bloco, 'AreaTotal')),
    bedrooms: inteiro(campo(bloco, 'QtdDormitorios')),
    suites: inteiro(campo(bloco, 'QtdSuites')),
    bathrooms: inteiro(campo(bloco, 'QtdBanheiros')),
    qtdSalas: inteiro(campo(bloco, 'QtdSalas')),
    garage: inteiro(campo(bloco, 'QtdVagas')),
    vagasCobertas: inteiro(campo(bloco, 'QtdVagasCobertas')),
    vagasDescobertas: inteiro(campo(bloco, 'QtdVagasDescobertas')),
    numeroAndar: inteiro(campo(bloco, 'NumeroAndar')),
    qtdAndar: inteiro(campo(bloco, 'QtdAndar')),
    qtdElevador: inteiro(campo(bloco, 'QtdElevador')),
    anoConstrucao: inteiro(campo(bloco, 'AnoConstrucao')),
    anoReforma: inteiro(campo(bloco, 'AnoReforma')),

    neighborhood: bairro,
    cidade,
    estado: campo(bloco, 'Estado'),
    zona: resolverZona(bairro, cidade),
    address: enderecoPublico || undefined,
    addressNumber: numero,
    addressPrivate: textoUtil(campo(bloco, 'ComplementoEndereco')),
    cep: cepDigits.length === 8 ? cepDigits : undefined,
    pontoReferencia: textoUtil(campo(bloco, 'PontoReferenciaEndereco')),
    latitude: Number.isFinite(lat) && lat !== 0 ? lat : undefined,
    longitude: Number.isFinite(lon) && lon !== 0 ? lon : undefined,
    condominioNome: campo(bloco, 'NomeCondominio') || campo(bloco, 'NomeEdificio'),
    zoneamento: campo(bloco, 'Zoneamento')?.toUpperCase(),

    description: campo(bloco, 'Observacao'),
    videoUrl: campo(bloco, 'LinkVideo'),
    tourVirtual: campo(bloco, 'TourVirtual'),
    tags: tags.length ? tags : undefined,
    amenities: amenities.size ? [...amenities] : undefined,
    acabamentos: acabamentos.size ? [...acabamentos] : undefined,
    paymentMethods: paymentMethods.size ? [...paymentMethods] : undefined,

    ocupacao: OCUPACAO_MAP[campo(bloco, 'Ocupacao') || ''],
    ocupador: campo(bloco, 'Ocupador') === 'Inquilino' ? 'inquilino' : campo(bloco, 'Ocupador') === 'Proprietário' ? 'proprietario' : undefined,
    locado: flag(bloco, 'Locado'),
    exclusividade: campo(bloco, 'Exclusividade') === 'Sim',
    padraoImovel: PADRAO_MAP[campo(bloco, 'PadraoImovel') || ''],
    padraoLocalizacao: PADRAO_LOCAL_MAP[campo(bloco, 'PadraoLocalizacao') || ''],
    placaNoLocal: flag(bloco, 'PlacaNoLocal'),
    alturaPeDireito: num(campo(bloco, 'AlturaPeDireito')),
    // Guarda a URL antiga pra montar os redirects 301 no lançamento do site
    // novo. Sem isso o Google descarta o ranking das 4.429 páginas atuais.
    urlGaiaOriginal: campo(bloco, 'URLGaiaSite'),
    dataCadastroGaia: dataGaia(campo(bloco, 'DataCadastro')),
    dataAtualizacaoGaia: dataGaia(campo(bloco, 'DataAtualizacaoImovel')),
  }

  // Corretor
  const iCor = bloco.indexOf('<corretor>')
  let corretor: Corretor | undefined
  if (iCor !== -1) {
    const jCor = bloco.indexOf('</corretor>', iCor)
    const blocoCor = bloco.slice(iCor, jCor === -1 ? undefined : jCor)
    const email = campo(blocoCor, 'email')
    const nome = campo(blocoCor, 'nome')
    if (email && nome) {
      corretor = {
        nome,
        email,
        celular: campo(blocoCor, 'celular'),
        telefone: campo(blocoCor, 'telefone'),
        fotoUrl: campo(blocoCor, 'foto'),
      }
      doc.captador = nome
      doc.captadorEmail = email
      doc.captadorCelular = corretor.celular || corretor.telefone
    }
  }

  // Fotos
  const fotos: Foto[] = []
  const iFotos = bloco.indexOf('<Fotos>')
  if (iFotos !== -1) {
    const blocoFotos = bloco.slice(iFotos, bloco.indexOf('</Fotos>', iFotos))
    const re = /<Foto>([\s\S]*?)<\/Foto>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(blocoFotos)) !== null) {
      const url = campo(m[1], 'URLArquivo')
      if (!url) continue
      fotos.push({url, principal: campo(m[1], 'Principal') === '1'})
    }
  }
  // Principal primeiro — vira mainImage.
  fotos.sort((a, b) => Number(b.principal) - Number(a.principal))

  // Remove undefined: o Sanity trata chave com undefined como erro de mutação.
  for (const k of Object.keys(doc)) {
    if (doc[k] === undefined) delete doc[k]
  }

  return {doc, fotos, corretor, gaiaCodigo}
}

// ---------------------------------------------------------------------------
// Upload de fotos
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function withRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 4): Promise<T> {
  let ultimoErro: unknown
  for (let tentativa = 1; tentativa <= maxAttempts; tentativa++) {
    try {
      return await fn()
    } catch (err) {
      ultimoErro = err
      if (tentativa === maxAttempts) break
      await sleep(tentativa * 2000)
    }
  }
  throw new Error(`${label}: ${(ultimoErro as Error)?.message ?? ultimoErro}`)
}

// ── Marca d'água ────────────────────────────────────────────────────────────
// Opção A escolhida em 31/07: 22% da largura, opacidade 90, canto inferior
// direito, sem sombra. As fotos do Gaia vêm limpas — a marca que aparece no
// site antigo é uma camada que o Gaia desenha na hora de exibir, não está
// gravada no arquivo.

const SEM_MARCA = has('--sem-marca')
const LOGO_PATH = path.resolve(process.cwd(), 'public/logo.png')
const LOGO_LARGURA_PCT = 22
const LOGO_OPACIDADE = 90
const LOGO_MARGEM_PCT = 3.5

/** Logo já redimensionada, por largura alvo. As fotos do acervo têm poucos
 *  tamanhos distintos, então o cache evita reprocessar a logo 99 mil vezes. */
const cacheLogo = new Map<number, Buffer>()
let logoOriginal: Buffer | null = null

async function logoNaLargura(largura: number): Promise<Buffer> {
  const cached = cacheLogo.get(largura)
  if (cached) return cached
  if (!logoOriginal) logoOriginal = fs.readFileSync(LOGO_PATH)
  const buf = await sharp(logoOriginal)
    .resize(largura)
    .ensureAlpha()
    .composite([
      {
        // dest-in multiplica pelo alpha existente: preserva o fundo
        // transparente em vez de reintroduzir um retângulo branco.
        input: Buffer.from([255, 255, 255, Math.round((LOGO_OPACIDADE / 100) * 255)]),
        raw: {width: 1, height: 1, channels: 4},
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()
  cacheLogo.set(largura, buf)
  return buf
}

async function carimbar(foto: Buffer): Promise<Buffer> {
  const meta = await sharp(foto).metadata()
  const w = meta.width
  const h = meta.height
  // Sem dimensão legível não dá pra posicionar a logo — devolve a foto
  // original em vez de derrubar o imóvel inteiro por causa de uma imagem.
  if (!w || !h) return foto

  const logo = await logoNaLargura(Math.round(w * (LOGO_LARGURA_PCT / 100)))
  const lm = await sharp(logo).metadata()
  const margem = Math.round(w * (LOGO_MARGEM_PCT / 100))

  return sharp(foto)
    .composite([
      {input: logo, left: w - (lm.width ?? 0) - margem, top: h - (lm.height ?? 0) - margem},
    ])
    .jpeg({quality: 92, mozjpeg: true})
    .toBuffer()
}

async function baixarESubir(
  client: SanityClient,
  url: string,
  codigo: string,
  idx: number
): Promise<string> {
  return withRetry(async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    let buffer = Buffer.from(await res.arrayBuffer())
    if (!SEM_MARCA) buffer = await carimbar(buffer)
    const asset = await client.assets.upload('image', buffer, {
      filename: `${codigo}-${idx}.jpg`,
      contentType: 'image/jpeg',
      label: 'watermarked',
      description: `gaia-src:${url}`,
    })
    return asset._id
  }, `foto ${codigo}#${idx}`)
}

/** Roda `tarefas` com no máximo `limite` em voo. Mantém a ordem do resultado. */
async function poolLimitado<T>(
  tarefas: Array<() => Promise<T>>,
  limite: number
): Promise<Array<T | null>> {
  const resultados: Array<T | null> = new Array(tarefas.length).fill(null)
  let proximo = 0
  const workers = Array.from({length: Math.min(limite, tarefas.length)}, async () => {
    for (;;) {
      const i = proximo++
      if (i >= tarefas.length) return
      try {
        resultados[i] = await tarefas[i]()
      } catch (err) {
        console.error(`      ⚠️  ${(err as Error).message}`)
        resultados[i] = null
      }
    }
  })
  await Promise.all(workers)
  return resultados
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function carregarXml(): Promise<string> {
  if (XML_LOCAL) {
    console.log(`   Lendo XML local: ${XML_LOCAL}`)
    return fs.readFileSync(XML_LOCAL, 'utf-8').replace(/^﻿/, '')
  }
  if (!XML_URL) {
    throw new Error('Defina GAIA_XML_URL no .env.local ou passe --xml <caminho>')
  }
  console.log('   Baixando XML do Gaia (~58MB, pode demorar)...')
  const res = await fetch(XML_URL)
  if (!res.ok) throw new Error(`Falha ao baixar XML: HTTP ${res.status}`)
  return (await res.text()).replace(/^﻿/, '')
}

async function main() {
  console.log(`\n🏠 Importação Gaia → Sanity (Tamada) ${DRY_RUN ? '— DRY-RUN' : ''}\n`)

  let sanity: SanityClient | null = null
  if (!DRY_RUN) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
    const token = process.env.SANITY_WRITE_TOKEN
    if (!projectId || !dataset || !token) {
      console.error('❌ Faltam variáveis no .env.local:')
      console.error(`   NEXT_PUBLIC_SANITY_PROJECT_ID: ${projectId ? '✓' : '✗'}`)
      console.error(`   NEXT_PUBLIC_SANITY_DATASET:    ${dataset ? '✓' : '✗'}`)
      console.error(`   SANITY_WRITE_TOKEN:            ${token ? '✓' : '✗'}`)
      console.error('   (ou rode com --dry-run)')
      process.exit(1)
    }
    sanity = createClient({projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false})
    console.log(`   Destino: ${projectId}/${dataset}`)
  }

  const xml = await carregarXml()
  const imoveis: ImovelMapeado[] = []
  for (const bloco of blocosImovel(xml)) {
    const m = mapearImovel(bloco)
    if (m) imoveis.push(m)
    if (imoveis.length >= LIMIT) break
  }
  console.log(`   Imóveis no feed: ${imoveis.length}`)

  if (LISTAR_CODIGOS) {
    fs.writeFileSync(LISTAR_CODIGOS, JSON.stringify(imoveis.map((i) => i.gaiaCodigo)))
    console.log(`   Códigos gravados em ${LISTAR_CODIGOS}`)
    return
  }

  const ledger = carregarLedger()
  const jaImportados = Object.values(ledger).filter((e) => e.completo).length
  if (jaImportados) console.log(`   Ledger: ${jaImportados} imóveis já importados — serão pulados.\n`)

  const stats = {
    total: imoveis.length,
    pulados: 0,
    criados: 0,
    fotosTotal: imoveis.reduce((s, i) => s + i.fotos.length, 0),
    fotosEnviadas: 0,
    fotosReaproveitadas: 0,
    semTipo: [] as string[],
    semPreco: [] as string[],
    semZona: 0,
    porTipo: {} as Record<string, number>,
    porOferta: {} as Record<string, number>,
    erros: [] as string[],
  }

  // ── Corretores (dedup por e-mail) ────────────────────────────────────────
  const corretores = new Map<string, Corretor>()
  for (const {corretor} of imoveis) {
    if (corretor && !corretores.has(corretor.email)) corretores.set(corretor.email, corretor)
  }
  console.log(`   Corretores distintos: ${corretores.size}`)

  if (!DRY_RUN && sanity) {
    for (const c of corretores.values()) {
      const id = `broker-${slugify(c.email)}`
      try {
        await sanity.createOrReplace({
          _id: id,
          _type: 'broker',
          nome: c.nome,
          email: c.email,
          celular: c.celular,
          telefone: c.telefone,
          fotoUrlOrigem: c.fotoUrl,
          ativo: true,
        })
      } catch (err) {
        stats.erros.push(`broker ${c.email}: ${(err as Error).message}`)
      }
    }
    console.log(`   ✓ ${corretores.size} corretores gravados\n`)
  }

  // ── Imóveis ──────────────────────────────────────────────────────────────
  for (let i = 0; i < imoveis.length; i++) {
    const {doc, fotos, gaiaCodigo} = imoveis[i]
    const codigo = String(doc.codigoImovel)

    stats.porTipo[String(doc.type ?? '?')] = (stats.porTipo[String(doc.type ?? '?')] || 0) + 1
    stats.porOferta[String(doc.oferta)] = (stats.porOferta[String(doc.oferta)] || 0) + 1
    if (!doc.type) stats.semTipo.push(codigo)
    if (!doc.price && !doc.rentPrice) stats.semPreco.push(codigo)
    if (!doc.zona) stats.semZona++

    const entrada = ledger[gaiaCodigo]
    // Pula só se completo E sem mudança no Gaia desde a última importação.
    const inalterado =
      entrada?.completo &&
      entrada.atualizadoEm === doc.dataAtualizacaoGaia &&
      Object.keys(entrada.assets).length >= fotos.length
    if (inalterado && !FORCE) {
      stats.pulados++
      continue
    }

    if (DRY_RUN) {
      if (i < 3) console.log(`   [amostra] ${codigo} — ${String(doc.title).slice(0, 70)} (${fotos.length} fotos)`)
      continue
    }
    if (!sanity) continue

    try {
      const assets: Record<string, string> = {...(entrada?.assets ?? {})}

      if (!SEM_FOTOS && fotos.length) {
        const pendentes = fotos.filter((f) => !assets[f.url])
        stats.fotosReaproveitadas += fotos.length - pendentes.length

        const ids = await poolLimitado(
          pendentes.map((f, idx) => () => baixarESubir(sanity!, f.url, codigo, idx + 1)),
          FOTO_CONCURRENCY
        )
        pendentes.forEach((f, idx) => {
          const id = ids[idx]
          if (id) {
            assets[f.url] = id
            stats.fotosEnviadas++
          }
        })
      }

      const refs = fotos.map((f) => assets[f.url]).filter(Boolean)
      // Só os campos que vêm do Gaia (+ as fotos, calculadas acima a partir
      // do feed) — featured/publicarSite ficam de fora de propósito.
      const camposGaia: Record<string, unknown> = {...doc}

      // Imóvel dual-uso (venda + locação): quando a locação fecha, o CRM
      // apaga o rentPrice e grava locacaoEncerrada:true (marca explícita,
      // sem ambiguidade). Se o Gaia ainda lista o imóvel como alugável (o
      // ERP pode demorar a refletir o fechamento), reimportar reintroduzia
      // o rentPrice e reabria a locação sozinho — mesma classe de bug do
      // status. A reativação grava locacaoEncerrada:false explícito.
      //
      // undefined !== false: locacaoEncerrada ausente (doc antigo, criado
      // antes desse campo existir) cai no heurístico — oferta continuava
      // 'venda_locacao' no run anterior. Só usa o heurístico quando a marca
      // não existe; quando existe, ela manda sozinha, mesmo que valha false
      // (reativação não pode ser tratada como "não sei").
      //
      // Decisão sempre olha o estado ANTERIOR (Sanity), nunca o que chegou
      // agora — testado contra reclassificação de oferta, price zerado e
      // rodadas encadeadas (bugs reais que a sessão LanPortus achou, dois
      // deles no próprio código dela). NÃO sincronizo oferta -> 'venda' no
      // fechamento: o heurístico de fallback depende de oferta continuar
      // 'venda_locacao' pra se re-armar; sincronizar apaga esse sinal e a
      // locação reabre sozinha na rodada seguinte (achei isso testando 2
      // rodadas em sequência, não só uma).
      if (camposGaia.rentPrice) {
        const atual = await sanity.fetch<
          {rentPrice?: number; oferta?: string; locacaoEncerrada?: boolean} | null
        >('*[_id==$id][0]{rentPrice, oferta, locacaoEncerrada}', {id: String(doc._id)})
        if (atual) {
          const fechouLocacao =
            atual.locacaoEncerrada != null
              ? atual.locacaoEncerrada === true
              : atual.rentPrice == null && atual.oferta === 'venda_locacao'
          if (fechouLocacao) delete camposGaia.rentPrice
        }
      }
      if (refs[0]) {
        camposGaia.mainImage = {_type: 'image', asset: {_type: 'reference', _ref: refs[0]}}
      }
      camposGaia.images = refs.slice(1).map((id, idx) => ({
        _type: 'image',
        _key: `gaia-${codigo}-${idx}`,
        asset: {_type: 'reference', _ref: id},
      }))

      // createIfNotExists só grava algo se o documento AINDA NÃO existe —
      // nesse caso entra com os defaults de featured/publicarSite. O patch
      // roda sempre depois e só toca os campos do Gaia: se o imóvel já
      // existia, o que o CRM setou em featured/publicarSite (ou qualquer
      // outro campo fora desta lista) não é tocado.
      await sanity
        .transaction()
        .createIfNotExists({_id: String(doc._id), _type: 'property', ...DEFAULTS_SO_NA_CRIACAO, ...camposGaia})
        .patch(String(doc._id), (p) => p.set(camposGaia))
        .commit()
      stats.criados++

      ledger[gaiaCodigo] = {
        docId: String(doc._id),
        assets,
        atualizadoEm: doc.dataAtualizacaoGaia as string | undefined,
        completo: refs.length === fotos.length,
      }
      salvarLedger(ledger)

      const pct = (((i + 1) / imoveis.length) * 100).toFixed(1)
      console.log(
        `   [${i + 1}/${imoveis.length} · ${pct}%] ${codigo} — ${refs.length}/${fotos.length} fotos · ${stats.fotosEnviadas} enviadas no total`
      )
    } catch (err) {
      const msg = `${codigo}: ${(err as Error).message}`
      stats.erros.push(msg)
      console.error(`   ❌ ${msg}`)
    }
  }

  // ── Relatório ────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(64))
  console.log('📋 RELATÓRIO')
  console.log('='.repeat(64))
  console.log(`   Imóveis no feed:      ${stats.total}`)
  console.log(`   Pulados (sem mudança): ${stats.pulados}`)
  console.log(`   Gravados:             ${stats.criados}`)
  console.log(`   Fotos no feed:        ${stats.fotosTotal}`)
  console.log(`   Fotos enviadas:       ${stats.fotosEnviadas}`)
  console.log(`   Fotos reaproveitadas: ${stats.fotosReaproveitadas}`)
  console.log(`   Por tipo:`, stats.porTipo)
  console.log(`   Por oferta:`, stats.porOferta)
  console.log(`   Sem tipo mapeado:     ${stats.semTipo.length}${stats.semTipo.length ? ` → ${stats.semTipo.slice(0, 10).join(', ')}` : ''}`)
  console.log(`   Sem preço:            ${stats.semPreco.length}`)
  console.log(`   Sem zona resolvida:   ${stats.semZona}`)
  if (stats.erros.length) {
    console.log(`   ⚠️  Erros (${stats.erros.length}):`)
    stats.erros.slice(0, 20).forEach((e) => console.log(`      - ${e}`))
    if (stats.erros.length > 20) console.log(`      ... e mais ${stats.erros.length - 20}`)
  }

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify({data: new Date().toISOString(), stats, amostras: imoveis.slice(0, 3).map((i) => i.doc)}, null, 2)
  )
  console.log(`\n   Relatório: ${REPORT_PATH}`)
  if (!DRY_RUN) console.log(`   Ledger:    ${LEDGER_PATH} (apague para reimportar do zero)\n`)
}

main().catch((err) => {
  console.error('❌ Falha geral:', err)
  process.exit(1)
})
