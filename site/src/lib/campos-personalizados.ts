/**
 * Campos personalizados do imóvel (`customFields` do Sanity), criados pela Tamada no Trama.
 * Ex.: { key: "salas", label: "Salas", tipo: "numero", value: "2" }.
 *
 * A ficha mostra TODOS os que têm valor (rótulo + valor + sufixo), sem lista fixa: um campo novo
 * que a Tamada criar amanhã aparece sozinho, sem mexer no site. O Trama só manda ao site os campos
 * marcados como públicos. Campo vazio, zero ou checkbox desmarcado não aparece.
 */
export type CampoBruto = {
  key?: string | null
  label?: string | null
  tipo?: string | null
  value?: string | number | boolean | null
  sufixo?: string | null
}

export type CampoFicha = { chave: string; rotulo: string; valor: string }

const SIM = new Set(['true', 'sim', 's', '1', 'yes'])

function texto(v: unknown, max: number): string {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v).trim().slice(0, max) : ''
}

export function camposPersonalizados(lista: CampoBruto[] | null | undefined): CampoFicha[] {
  if (!Array.isArray(lista)) return []
  const vistos = new Set<string>()
  const saida: CampoFicha[] = []
  for (const c of lista) {
    if (!c || typeof c !== 'object') continue
    const rotulo = texto(c.label, 60)
    const chave = texto(c.key, 60) || rotulo.toLowerCase()
    const bruto = texto(c.value, 120)
    if (!rotulo || !bruto || vistos.has(chave)) continue
    let valor: string
    if (c.tipo === 'checkbox') {
      if (!SIM.has(bruto.toLowerCase())) continue
      valor = 'Sim'
    } else if (c.tipo === 'numero') {
      const n = Number(bruto.replace(',', '.'))
      if (Number.isFinite(n)) {
        if (n === 0) continue
        valor = n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
      } else valor = bruto
    } else {
      valor = bruto
    }
    const sufixo = texto(c.sufixo, 20)
    if (sufixo) valor = `${valor} ${sufixo}`
    vistos.add(chave)
    saida.push({ chave, rotulo, valor })
  }
  return saida
}
