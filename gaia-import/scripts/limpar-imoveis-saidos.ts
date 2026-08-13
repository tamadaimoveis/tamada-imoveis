/**
 * Marca como inativo todo imóvel que estava ativo no Sanity e saiu do feed
 * do Gaia (vendido, alugado ou removido no ERP, sem que o import saiba —
 * o import só processa o que ESTÁ no feed, nunca o que sumiu).
 *
 * Nunca apaga o documento — só troca status:'ativo' para status:'inativo'.
 * Reversível, mantém histórico (leads, fotos, referências).
 *
 * Uso:
 *   npx tsx scripts/limpar-imoveis-saidos.ts --dry-run
 *   npx tsx scripts/limpar-imoveis-saidos.ts
 *
 * .env.local: mesmas variáveis do import-gaia.ts.
 */
import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'
import {createClient} from '@sanity/client'

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

const DRY_RUN = process.argv.includes('--dry-run')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_WRITE_TOKEN
if (!projectId || !dataset || !token) {
  console.error('❌ Faltam variáveis no .env.local (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN)')
  process.exit(1)
}
const sanity = createClient({projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false})

async function main() {
  console.log(`\n🧹 Limpeza de imóveis saídos do Gaia (Tamada) ${DRY_RUN ? '— DRY-RUN' : ''}\n`)

  const codigosPath = path.resolve(process.cwd(), '.codigos-feed-atual.json')
  console.log('   Baixando feed atual do Gaia pra saber quem continua lá...')
  execSync(`npx tsx scripts/import-gaia.ts --listar-codigos "${codigosPath}"`, {stdio: 'inherit'})
  const codigosNoFeed: string[] = JSON.parse(fs.readFileSync(codigosPath, 'utf-8'))
  const noFeed = new Set(codigosNoFeed)
  fs.unlinkSync(codigosPath)
  console.log(`   Imóveis no feed agora: ${noFeed.size}`)

  const ativos: Array<{_id: string; gaiaCodigo: string; codigoImovel: string; title: string}> =
    await sanity.fetch('*[_type=="property" && status=="ativo"]{_id, gaiaCodigo, codigoImovel, title}')
  console.log(`   Imóveis ativos no Sanity: ${ativos.length}`)

  const saidos = ativos.filter((p) => p.gaiaCodigo && !noFeed.has(p.gaiaCodigo))
  console.log(`\n   Saíram do feed mas seguem ativos no site: ${saidos.length}`)
  saidos.slice(0, 20).forEach((p) => console.log(`      ${p.codigoImovel} — ${p.title?.slice(0, 60) ?? ''}`))
  if (saidos.length > 20) console.log(`      ... e mais ${saidos.length - 20}`)

  if (DRY_RUN) {
    console.log('\n(dry-run — nada foi alterado)')
    return
  }
  if (!saidos.length) {
    console.log('\nNada a fazer.')
    return
  }

  console.log('\n   Marcando como inativo...')
  const LOTE = 50
  let feitos = 0
  for (let i = 0; i < saidos.length; i += LOTE) {
    const chunk = saidos.slice(i, i + LOTE)
    const tx = sanity.transaction()
    for (const p of chunk) tx.patch(p._id, (patch) => patch.set({status: 'inativo'}))
    await tx.commit()
    feitos += chunk.length
    console.log(`      ${feitos}/${saidos.length}...`)
  }

  console.log(`\n✓ ${feitos} imóveis marcados como inativo (status:'inativo', publicarSite mantido).`)
}

main().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
