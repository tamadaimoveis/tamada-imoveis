/**
 * Grava os proprietários no Sanity (ownerName / ownerPhone / ownerNotes).
 *
 * Origem: exportação "Proprietários por imóveis" do Kenlo, convertida por
 * scripts/parse-proprietarios.py. É a única exportação que traz `Ref. Imóvel` e
 * `Ref. Prop.` na mesma linha — o feed XML público não tem dado de dono (é o
 * feed de portais, seria vazamento de LGPD), e as outras planilhas trazem só um
 * lado do vínculo.
 *
 * ⚠️ Estes campos são internos. Ficam no Sanity para o CRM e a equipe; o
 * gerador do site (gerar-catalogo.mjs) NÃO os consulta, então não vão para
 * nenhum arquivo público.
 *
 *   node scripts/importar-proprietarios.mjs <proprietarios.json> --dry-run
 *   node scripts/importar-proprietarios.mjs <proprietarios.json>
 */
import fs from 'fs'
import path from 'path'

const ARQUIVO = process.argv[2]
const DRY = process.argv.includes('--dry-run')
if (!ARQUIVO) throw new Error('uso: node scripts/importar-proprietarios.mjs <proprietarios.json> [--dry-run]')

const env = Object.fromEntries(
  fs
    .readFileSync(path.resolve('.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const {
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: dataset,
  SANITY_WRITE_TOKEN: token,
} = env
const base = `https://${projectId}.api.sanity.io/v2024-01-01/data`

async function groq(query) {
  const res = await fetch(`${base}/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: {Authorization: `Bearer ${token}`},
  })
  const json = await res.json()
  if (json.error) throw new Error(JSON.stringify(json.error))
  return json.result
}

async function mutate(mutations) {
  const res = await fetch(`${base}/mutate/${dataset}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  })
  return {ok: res.ok, status: res.status, corpo: res.ok ? '' : await res.text()}
}

const donos = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'))

// Mapa codigoImovel -> _id do documento no Sanity
const docs = []
for (let off = 0; ; off += 500) {
  const lote = await groq(`*[_type=="property"]|order(_id)[${off}...${off + 500}]{_id, codigoImovel}`)
  if (!lote.length) break
  docs.push(...lote)
}
console.log(`imóveis no Sanity        : ${docs.length}`)
console.log(`imóveis com proprietário : ${Object.keys(donos).length}`)

const patches = []
let semDono = 0
for (const d of docs) {
  const lista = donos[String(d.codigoImovel || '').toUpperCase()]
  if (!lista || !lista.length) {
    semDono++
    continue
  }
  // Mais de um dono no mesmo imóvel (casal, espólio) vira uma linha só —
  // o campo do schema é texto simples e o CRM espera string.
  const nomes = lista.map((o) => o.nome).join(' e ')
  const fones = [...new Set(lista.flatMap((o) => o.telefones))].join(' · ')
  const emails = [...new Set(lista.map((o) => o.email).filter(Boolean))]
  const inativos = lista.filter((o) => o.statusProprietario && o.statusProprietario !== 'Ativo')

  const notas = [
    `Ref. Kenlo: ${lista.map((o) => 'CP' + o.refProprietario).join(', ')}`,
    emails.length ? `E-mail: ${emails.join(', ')}` : null,
    inativos.length ? `⚠️ Cadastro inativo no Kenlo: ${inativos.map((o) => o.nome).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const set = {ownerName: nomes, ownerNotes: notas}
  if (fones) set.ownerPhone = fones
  patches.push({patch: {id: d._id, set}})
}

console.log(`a gravar                 : ${patches.length}`)
console.log(`sem proprietário na base : ${semDono}`)

if (DRY) {
  console.log('\nAmostra:')
  patches.slice(0, 3).forEach((p) => console.log(' ', JSON.stringify(p.patch.set)))
  console.log('\n(dry-run — nada gravado)')
  process.exit(0)
}

const LOTE = 100
let gravados = 0
const erros = []
for (let i = 0; i < patches.length; i += LOTE) {
  const chunk = patches.slice(i, i + LOTE)
  const r = await mutate(chunk)
  if (r.ok) gravados += chunk.length
  else erros.push(`lote ${i}: ${r.status} ${r.corpo.slice(0, 160)}`)
  if ((i / LOTE) % 10 === 0) console.log(`  ${Math.min(i + LOTE, patches.length)}/${patches.length}...`)
}

console.log(`\n✓ gravados: ${gravados}`)
if (erros.length) {
  console.log(`⚠️ erros (${erros.length}):`)
  erros.slice(0, 5).forEach((e) => console.log('   ' + e))
}

console.log('\n--- conferência no Sanity ---')
console.log('com ownerName :', await groq('count(*[_type=="property" && defined(ownerName)])'))
console.log('com ownerPhone:', await groq('count(*[_type=="property" && defined(ownerPhone)])'))
