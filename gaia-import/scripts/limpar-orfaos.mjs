/**
 * Apaga os assets de imagem órfãos listados em orfaos.json.
 *
 * Órfão = asset que nenhum documento referencia. Sobraram da primeira rodada
 * de import, feita antes da marca d'água ser ligada.
 *
 * Segurança: reconfere as referências AGORA, imediatamente antes de apagar —
 * a lista foi gerada antes e o dataset pode ter mudado. Além disso, o próprio
 * Sanity recusa apagar asset referenciado, então há duas travas.
 *
 *   node scripts/limpar-orfaos.mjs --dry-run   # só relatório
 *   node scripts/limpar-orfaos.mjs             # apaga
 */
import fs from 'fs'
import path from 'path'

const DRY = process.argv.includes('--dry-run')
const LOTE = 50

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
  return {status: res.status, body: await res.text()}
}

const candidatos = JSON.parse(fs.readFileSync(path.resolve('orfaos.json'), 'utf8'))
console.log(`candidatos na lista: ${candidatos.length}`)

// ── Trava 1: recolhe TODOS os refs em uso agora ─────────────────────────────
const usados = new Set()
for (let off = 0; ; off += 400) {
  const lote = await groq(
    `*[_type=="property"]|order(_id)[${off}...${off + 400}]{"m":mainImage.asset._ref,"g":images[].asset._ref}`
  )
  if (!lote.length) break
  for (const r of lote) {
    if (r.m) usados.add(r.m)
    for (const x of r.g || []) if (x) usados.add(x)
  }
}
console.log(`refs em uso agora:   ${usados.size}`)

const seguros = candidatos.filter((id) => !usados.has(id))
const recusados = candidatos.length - seguros.length
if (recusados > 0) {
  console.log(`⚠️  ${recusados} da lista VOLTARAM a ser usados — preservados.`)
}
console.log(`a apagar:            ${seguros.length}`)

if (DRY) {
  console.log('\n(dry-run — nada foi apagado)')
  process.exit(0)
}

// ── Trava 2: o Sanity recusa apagar asset referenciado ──────────────────────
let apagados = 0
const erros = []
for (let i = 0; i < seguros.length; i += LOTE) {
  const chunk = seguros.slice(i, i + LOTE)
  const {status, body} = await mutate(chunk.map((id) => ({delete: {id}})))
  if (status === 200) {
    apagados += chunk.length
  } else {
    erros.push(`lote ${i}: ${status} ${body.slice(0, 200)}`)
  }
  if ((i / LOTE) % 20 === 0) {
    console.log(`  ${Math.min(i + LOTE, seguros.length)}/${seguros.length}...`)
  }
}

console.log(`\n✓ apagados: ${apagados}`)
if (erros.length) {
  console.log(`⚠️  erros (${erros.length}):`)
  erros.slice(0, 5).forEach((e) => console.log('   ' + e))
}

console.log('\n--- estado final ---')
console.log('imoveis        :', await groq('count(*[_type=="property"])'))
console.log('assets totais  :', await groq('count(*[_type=="sanity.imageAsset"])'))
console.log('assets c/ marca:', await groq('count(*[_type=="sanity.imageAsset" && label=="watermarked"])'))
console.log('assets s/ marca:', await groq('count(*[_type=="sanity.imageAsset" && label!="watermarked"])'))
