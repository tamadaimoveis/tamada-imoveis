// Rodar: node --test src/lib/campos-personalizados.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { camposPersonalizados } from './campos-personalizados.ts'

test('Salas = 2 (formato do Trama)', () => {
  assert.deepEqual(camposPersonalizados([{ key: 'salas', label: 'Salas', tipo: 'numero', value: '2' }]), [
    { chave: 'salas', rotulo: 'Salas', valor: '2' },
  ])
})
test('sem customFields ou lista vazia: nada', () => {
  assert.deepEqual(camposPersonalizados(undefined), [])
  assert.deepEqual(camposPersonalizados(null), [])
  assert.deepEqual(camposPersonalizados([]), [])
})
test('vazio, zero e checkbox desmarcado não aparecem', () => {
  assert.deepEqual(
    camposPersonalizados([
      { key: 'salas', label: 'Salas', tipo: 'numero', value: '' },
      { key: 'x', label: 'X', tipo: 'numero', value: '0' },
      { key: 'y', label: 'Y', tipo: 'checkbox', value: 'false' },
      { key: 'z', label: '', tipo: 'texto', value: 'algo' },
    ]),
    []
  )
})
test('sufixo, decimal brasileiro, checkbox e texto', () => {
  assert.deepEqual(
    camposPersonalizados([
      { key: 'pe', label: 'Pé-direito duplo', tipo: 'numero', value: '5.5', sufixo: 'm' },
      { key: 'gerador', label: 'Gerador', tipo: 'checkbox', value: 'true' },
      { key: 'vista', label: 'Vista', tipo: 'select', value: 'Mar' },
    ]),
    [
      { chave: 'pe', rotulo: 'Pé-direito duplo', valor: '5,5 m' },
      { chave: 'gerador', rotulo: 'Gerador', valor: 'Sim' },
      { chave: 'vista', rotulo: 'Vista', valor: 'Mar' },
    ]
  )
})
test('chave repetida entra uma vez só', () => {
  assert.equal(camposPersonalizados([
    { key: 'salas', label: 'Salas', tipo: 'numero', value: '2' },
    { key: 'salas', label: 'Salas', tipo: 'numero', value: '3' },
  ]).length, 1)
})
