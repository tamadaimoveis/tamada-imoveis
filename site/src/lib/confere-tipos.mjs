// Confere os tipos de imóvel publicados no Sanity contra a tabela do site (tipos.ts).
// Só leitura. Sai com erro (1) se o CRM tiver um tipo que o site não conhece.
// Uso: npm run check:tipos
import { TIPO } from './tipos.ts'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'v3whr4as'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const query = '*[_type=="property" && publicarSite==true && status=="ativo"]{"ref":codigoImovel,type}'
const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`

const res = await fetch(url)
if (!res.ok) {
  console.error(`Sanity respondeu ${res.status}`)
  process.exit(2)
}
const { result } = await res.json()

const faltando = new Map()
const semTipo = []
for (const { ref, type } of result) {
  if (!type) { semTipo.push(ref); continue }
  if (TIPO[type]) continue
  if (!faltando.has(type)) faltando.set(type, [])
  faltando.get(type).push(ref)
}

console.log(`${result.length} imóveis ativos conferidos.`)
// Sem tipo é falha de cadastro no CRM, não da tabela: só avisa.
if (semTipo.length) console.log(`AVISO: ${semTipo.length} sem tipo no CRM (aparecem como "Imóvel"): ${semTipo.slice(0, 5).join(', ')}`)
if (!faltando.size) {
  console.log('OK: todos os tipos do CRM estão na tabela do site.')
} else {
  for (const [tipo, refs] of faltando) {
    console.log(`FALTA "${tipo}": ${refs.length} imóvel(is), ex.: ${refs.slice(0, 5).join(', ')}`)
  }
  console.log('Esses aparecem como "Imóvel" no site. Adicione o tipo em src/lib/tipos.ts.')
  process.exit(1)
}
