// Testes de site/public/oferta.js — script global (carregado via <script src>
// clássico, não módulo ES), então importa via vm em vez de import estático.
// Mesmo padrão do oferta.test.mjs do ImoBueno (PR #1, "Mostra venda ou
// locacao conforme a carteira do visitante"), adaptado pro vocabulário da
// Tamada (sale/rent em vez de precoVenda/precoLocacao).
//
// Rodar: node --test src/lib/oferta.test.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import { test } from 'node:test'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const codigo = readFileSync(path.resolve(aqui, '../../public/oferta.js'), 'utf-8')

const sandbox = { window: { location: { search: '' } }, URLSearchParams }
vm.createContext(sandbox)
vm.runInContext(codigo, sandbox)

const {
  precoDestaque,
  destaqueEhLocacao,
  precoSecundario,
  purposeLabelContextual,
  rotuloPrecoContextual,
  temAmbos,
  purposeDaUrl,
} = sandbox

const soVenda = { sale: 500000, rent: null }
const soLocacao = { sale: null, rent: 2000 }
const ambos = { sale: 210000, rent: 1200 }

test('só venda, sem propósito -> venda em destaque', () => {
  assert.equal(precoDestaque(soVenda, null), 500000)
  assert.equal(destaqueEhLocacao(soVenda, null), false)
})

test('só locação, sem propósito -> locação em destaque (único preço)', () => {
  assert.equal(precoDestaque(soLocacao, null), 2000)
  assert.equal(destaqueEhLocacao(soLocacao, null), true)
})

test('a aba não pode inventar oferta que o imóvel não tem: ?de=rent em imóvel só de venda', () => {
  assert.equal(precoDestaque(soVenda, 'rent'), 500000)
  assert.equal(destaqueEhLocacao(soVenda, 'rent'), false)
  assert.equal(purposeLabelContextual(soVenda, 'rent'), 'À venda')
})

test('a aba não pode inventar oferta que o imóvel não tem: ?de=sale em imóvel só de locação', () => {
  assert.equal(precoDestaque(soLocacao, 'sale'), 2000)
  assert.equal(destaqueEhLocacao(soLocacao, 'sale'), true)
  assert.equal(purposeLabelContextual(soLocacao, 'sale'), 'Para alugar')
})

test('dual-uso, sem propósito -> venda em destaque (padrão)', () => {
  assert.equal(precoDestaque(ambos, null), 210000)
  assert.equal(destaqueEhLocacao(ambos, null), false)
  assert.equal(purposeLabelContextual(ambos, null), 'Venda ou locação')
})

test('dual-uso, ?de=rent -> locação em destaque, venda como secundário', () => {
  assert.equal(precoDestaque(ambos, 'rent'), 1200)
  assert.equal(destaqueEhLocacao(ambos, 'rent'), true)
  assert.equal(precoSecundario(ambos, 'rent'), 210000)
  assert.equal(purposeLabelContextual(ambos, 'rent'), 'Para alugar')
  assert.equal(rotuloPrecoContextual(ambos, 'rent'), 'Para locação por')
})

test('dual-uso, ?de=sale -> venda em destaque, locação como secundário', () => {
  assert.equal(precoDestaque(ambos, 'sale'), 210000)
  assert.equal(destaqueEhLocacao(ambos, 'sale'), false)
  assert.equal(precoSecundario(ambos, 'sale'), 1200)
  assert.equal(purposeLabelContextual(ambos, 'sale'), 'À venda')
  assert.equal(rotuloPrecoContextual(ambos, 'sale'), 'À venda por')
})

test('só venda não tem secundário mesmo com propósito ativo', () => {
  assert.equal(precoSecundario(soVenda, 'rent'), null)
  assert.equal(precoSecundario(soVenda, 'sale'), null)
})

test('sem preço nenhum -> destaque null, rótulo "Valor"', () => {
  const vazio = { sale: null, rent: null }
  assert.equal(precoDestaque(vazio, null), null)
  assert.equal(rotuloPrecoContextual(vazio, null), 'Valor')
})

test('preço 0 é tratado como ausente, não como valor válido (CRM pode gravar 0 em vez de null)', () => {
  const zerado = { sale: 0, rent: 1500 }
  assert.equal(precoDestaque(zerado, null), 1500)
  assert.equal(temAmbos(zerado), false)
})

test('purposeDaUrl: aceita ?de= (ficha) e ?purpose= (catálogo), ignora valores fora do enum', () => {
  sandbox.window.location.search = '?de=rent'
  assert.equal(purposeDaUrl(), 'rent')
  sandbox.window.location.search = '?purpose=sale'
  assert.equal(purposeDaUrl(), 'sale')
  sandbox.window.location.search = '?purpose=commercial'
  assert.equal(purposeDaUrl(), null)
  sandbox.window.location.search = ''
  assert.equal(purposeDaUrl(), null)
})
