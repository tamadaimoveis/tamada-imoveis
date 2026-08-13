/**
 * Sobe as fotos dos corretores para o Sanity.
 *
 * O feed do Gaia traz a URL da foto dentro de <corretor>, e a importação
 * guardou esse endereço em `fotoUrlOrigem`. Aqui a imagem é de fato baixada e
 * enviada, preenchendo o campo `foto` — que é o que a página "Nossa Equipe" e o
 * Studio usam.
 *
 * Diferente das fotos de imóvel, estas NÃO levam marca d'água: é retrato de
 * pessoa, carimbar por cima só atrapalha.
 *
 *   node scripts/importar-fotos-corretores.mjs --dry-run
 *   node scripts/importar-fotos-corretores.mjs
 *   node scripts/importar-fotos-corretores.mjs --force   (refaz quem já tem foto)
 */
import fs from 'fs'
import path from 'path'

const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

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
const base = `https://${projectId}.api.sanity.io/v2024-01-01`

async function groq(query) {
  const r = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: {Authorization: `Bearer ${token}`},
  })
  const j = await r.json()
  if (j.error) throw new Error(JSON.stringify(j.error))
  return j.result
}

async function subirImagem(url, nomeArquivo) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const tipo = res.headers.get('content-type') || 'image/jpeg'
  const corpo = Buffer.from(await res.arrayBuffer())
  if (corpo.length < 500) throw new Error(`arquivo suspeito (${corpo.length} bytes)`)
  const up = await fetch(`${base}/assets/images/${dataset}?filename=${encodeURIComponent(nomeArquivo)}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': tipo},
    body: corpo,
  })
  if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 120)}`)
  return (await up.json()).document._id
}

const brokers = await groq(
  '*[_type=="broker" && defined(fotoUrlOrigem)]{_id, nome, email, fotoUrlOrigem, "temFoto": defined(foto)}'
)
const alvo = FORCE ? brokers : brokers.filter((b) => !b.temFoto)

console.log(`corretores com URL de foto : ${brokers.length}`)
console.log(`a processar                : ${alvo.length}`)

if (DRY) {
  alvo.slice(0, 5).forEach((b) => console.log(`  ${b.nome} -> ${b.fotoUrlOrigem.slice(0, 70)}...`))
  console.log('\n(dry-run — nada enviado)')
  process.exit(0)
}

const mutations = []
const erros = []
for (const b of alvo) {
  try {
    const slug = (b.email || b.nome).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
    const assetId = await subirImagem(b.fotoUrlOrigem, `corretor-${slug}.jpg`)
    mutations.push({
      patch: {id: b._id, set: {foto: {_type: 'image', asset: {_type: 'reference', _ref: assetId}}}},
    })
    console.log(`  ✓ ${b.nome}`)
  } catch (e) {
    erros.push(`${b.nome}: ${e.message}`)
    console.log(`  ✗ ${b.nome} — ${e.message}`)
  }
}

if (mutations.length) {
  const r = await fetch(`${base}/data/mutate/${dataset}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  })
  console.log(r.ok ? `\n✓ ${mutations.length} fotos vinculadas` : `\n❌ ${r.status} ${(await r.text()).slice(0, 200)}`)
}

if (erros.length) {
  console.log(`\n⚠️ falhas (${erros.length}):`)
  erros.forEach((e) => console.log('   ' + e))
}

console.log('\n--- estado final ---')
console.log('corretores      :', await groq('count(*[_type=="broker"])'))
console.log('  com foto      :', await groq('count(*[_type=="broker" && defined(foto)])'))
console.log('  sem foto      :', await groq('count(*[_type=="broker" && !defined(foto)])'))
