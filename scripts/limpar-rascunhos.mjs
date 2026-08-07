/**
 * Tira da pasta publicada os arquivos listados no `.vercelignore`.
 *
 * Por que isso existe: o `.vercelignore` só vale para upload pela CLI. Quando a
 * Vercel constrói a partir do repositório, ela serve a pasta de saída inteira —
 * e rascunhos como `sobre.html.ORIGINAL-antes-do-video` iriam para o ar.
 *
 * Só roda dentro da Vercel. Na máquina não apaga nada: lá esses arquivos são o
 * histórico de trabalho, e apagá-los seria perda de verdade.
 *
 *   node scripts/limpar-rascunhos.mjs
 */
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

if (!process.env.VERCEL) {
  console.log('limpar-rascunhos: fora da Vercel, nada a fazer.')
  process.exit(0)
}

const lista = path.join(RAIZ, '.vercelignore')
if (!fs.existsSync(lista)) {
  console.log('limpar-rascunhos: sem .vercelignore, nada a fazer.')
  process.exit(0)
}

const alvos = fs
  .readFileSync(lista, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))

let removidos = 0
for (const alvo of alvos) {
  // Entrada do .vercelignore é sempre relativa à raiz. `resolve` + prefixo
  // barram `../` apontando para fora da pasta publicada.
  const destino = path.resolve(RAIZ, alvo)
  if (!destino.startsWith(RAIZ + path.sep)) {
    console.warn(`  ignorado (fora da raiz): ${alvo}`)
    continue
  }
  if (fs.existsSync(destino)) {
    fs.rmSync(destino, {recursive: true, force: true})
    console.log(`  removido da publicação: ${alvo}`)
    removidos++
  }
}
console.log(`limpar-rascunhos: ${removidos} de ${alvos.length} itens removidos.`)
