/**
 * Valor cheio da locação: aluguel + condomínio + IPTU mensal.
 *
 * Mesma fórmula do CRM (Trama), para o valor do site bater com o do CRM. É só
 * leitura: nada é gravado no Sanity, o total é calculado aqui, ao ler o imóvel.
 * Taxa de administração e taxas extras NÃO entram.
 *
 * `rentPrice` vazio/zero = sem total (imóvel sem aluguel não é de locação).
 */

export type IptuPeriodo = 'mensal' | 'anual' | 'isento'

export type ValorLocacao = {
  aluguel: number
  condominio: number
  /** IPTU já convertido para mensal (anual ÷ 12, 2 casas; isento = 0). */
  iptu: number
  /** Como o IPTU foi lido: ausente/vazio contam como 'mensal'. */
  iptuModo: IptuPeriodo
  total: number
  /** O que, além do aluguel, entrou no total. null = total é o próprio aluguel. */
  inclui: 'condominio' | 'iptu' | 'ambos' | null
}

type Entrada = {
  rent?: number | null
  condominio?: number | null
  iptu?: number | null
  iptuPeriodo?: string | null
}

// Vazio, nulo, zero, negativo ou não numérico conta 0.
const valor = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0)

const arredonda = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100

export function valorLocacao(p: Entrada): ValorLocacao | null {
  const aluguel = valor(p.rent)
  if (!aluguel) return null

  const condominio = valor(p.condominio)
  const iptuModo: IptuPeriodo = p.iptuPeriodo === 'anual' || p.iptuPeriodo === 'isento' ? p.iptuPeriodo : 'mensal'
  const iptuBruto = valor(p.iptu)
  const iptu = iptuModo === 'isento' ? 0 : iptuModo === 'anual' ? arredonda(iptuBruto / 12) : iptuBruto

  return {
    aluguel,
    condominio,
    iptu,
    iptuModo,
    total: arredonda(aluguel + condominio + iptu),
    inclui: condominio && iptu ? 'ambos' : condominio ? 'condominio' : iptu ? 'iptu' : null,
  }
}

const brl2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * O título vem pronto do CRM ("... para alugar, 52 m² por R$ 5.655,00/mês") e em parte dos imóveis
 * ainda traz o aluguel puro ou um valor velho. Troca só o preço da locação pelo valor cheio, para o
 * título (h1, <title>, prévia do link) bater com o preço da página. Não mexe no preço de venda nem
 * em título sem preço de locação.
 */
export function tituloComValorCheio(titulo: string, loc: ValorLocacao | null): string {
  if (!loc) return titulo
  return titulo.replace(
    /((?:[aA]luguel|[aA]lugar|[lL]oca[cç][aã]o)[^R$]*?\bpor\s*)R\$\s*[0-9.]+(?:,[0-9]{1,2})?/,
    (_m, antes: string) => `${antes}R$ ${brl2(loc.total)}`
  )
}
