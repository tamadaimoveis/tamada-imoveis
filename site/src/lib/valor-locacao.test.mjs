import test from 'node:test'
import assert from 'node:assert/strict'
import { valorLocacao } from './valor-locacao.ts'

// Imóveis reais da Tamada, conferidos contra o card do CRM (Imóveis > filtro Locação)
test('AP5494: 2.300 + 700 + 100 = 3.100', () => {
  assert.equal(valorLocacao({ rent: 2300, condominio: 700, iptu: 100, iptuPeriodo: 'mensal' }).total, 3100)
})
test('AP5135: 3.500 + 700 + 230 = 4.430', () => {
  assert.equal(valorLocacao({ rent: 3500, condominio: 700, iptu: 230, iptuPeriodo: 'mensal' }).total, 4430)
})
test('AP5953: 4.900 + 480 + 275 = 5.655', () => {
  assert.equal(valorLocacao({ rent: 4900, condominio: 480, iptu: 275, iptuPeriodo: 'mensal' }).total, 5655)
})

test('IPTU anual entra dividido por 12: 6.000 anual = 500/mês', () => {
  const v = valorLocacao({ rent: 2000, condominio: 300, iptu: 6000, iptuPeriodo: 'anual' })
  assert.equal(v.iptu, 500)
  assert.equal(v.iptuModo, 'anual')
  assert.equal(v.total, 2800)
})

test('IPTU anual arredonda a 2 casas: 2.000 anual → 166,67', () => {
  assert.equal(valorLocacao({ rent: 6000, condominio: 350, iptu: 2000, iptuPeriodo: 'anual' }).total, 6516.67)
})

test('IPTU isento soma 0 mesmo com valor preenchido', () => {
  const v = valorLocacao({ rent: 2000, condominio: 300, iptu: 900, iptuPeriodo: 'isento' })
  assert.equal(v.iptu, 0)
  assert.equal(v.total, 2300)
  assert.equal(v.inclui, 'condominio')
})

test('iptuPeriodo ausente, vazio ou desconhecido = mensal', () => {
  for (const iptuPeriodo of [undefined, null, '', 'qualquer']) {
    const v = valorLocacao({ rent: 1000, iptu: 80, iptuPeriodo })
    assert.equal(v.total, 1080)
    assert.equal(v.iptuModo, 'mensal')
  }
})

test('sem condomínio e sem IPTU: o total é o próprio aluguel e nada é "incluído"', () => {
  const v = valorLocacao({ rent: 1500 })
  assert.equal(v.total, 1500)
  assert.equal(v.inclui, null)
})

test('valor vazio, nulo, zero, negativo ou não numérico conta 0', () => {
  const v = valorLocacao({ rent: 1000, condominio: -50, iptu: Number.NaN })
  assert.equal(v.total, 1000)
  assert.equal(valorLocacao({ rent: 1000, condominio: '700', iptu: null }).total, 1000)
  assert.equal(valorLocacao({ rent: 1000, condominio: 0, iptu: undefined }).total, 1000)
})

test('sem aluguel não há total (venda pura, ou aluguel zerado/negativo)', () => {
  assert.equal(valorLocacao({ condominio: 700, iptu: 100 }), null)
  assert.equal(valorLocacao({ rent: 0, condominio: 700 }), null)
  assert.equal(valorLocacao({ rent: -1, condominio: 700 }), null)
  assert.equal(valorLocacao({ rent: null }), null)
})

test('só condomínio / só IPTU / os dois', () => {
  assert.equal(valorLocacao({ rent: 1000, condominio: 200 }).inclui, 'condominio')
  assert.equal(valorLocacao({ rent: 1000, iptu: 50 }).inclui, 'iptu')
  assert.equal(valorLocacao({ rent: 1000, condominio: 200, iptu: 50 }).inclui, 'ambos')
})

import { tituloComValorCheio } from './valor-locacao.ts'

const loc = (o) => valorLocacao({ rent: 2300, condominio: 700, iptu: 100, ...o })

test('título: troca o aluguel puro pelo valor cheio e mantém o resto', () => {
  assert.equal(
    tituloComValorCheio('Apartamento com 2 quartos para alugar, 56 m² por R$ 2.300,00/mês - Vila Marieta - São Paulo/SP', loc()),
    'Apartamento com 2 quartos para alugar, 56 m² por R$ 3.100,00/mês - Vila Marieta - São Paulo/SP'
  )
})

test('título de venda e aluguel: só a parte do aluguel muda, a venda fica igual', () => {
  assert.equal(
    tituloComValorCheio('Apartamento, 82 m² - venda por R$ 750.000,00 ou aluguel por R$ 4.000,00/mês - Penha - São Paulo/SP', loc({ rent: 3500, condominio: 700, iptu: 230 })),
    'Apartamento, 82 m² - venda por R$ 750.000,00 ou aluguel por R$ 4.430,00/mês - Penha - São Paulo/SP'
  )
})

test('título: centavos quando o total não é inteiro; valor que já era o cheio fica igual', () => {
  assert.equal(
    tituloComValorCheio('Casa para alugar, 80 m² por R$ 6.500 - Centro', valorLocacao({ rent: 6000, condominio: 350, iptu: 2000, iptuPeriodo: 'anual' })),
    'Casa para alugar, 80 m² por R$ 6.516,67 - Centro'
  )
  assert.equal(tituloComValorCheio('Sala para alugar, 30 m² por R$ 3.100,00/mês - X', loc()), 'Sala para alugar, 30 m² por R$ 3.100,00/mês - X')
})

test('título: sem locação ou sem preço de locação no texto, nada muda', () => {
  assert.equal(tituloComValorCheio('Casa à venda, 90 m² por R$ 500.000,00 - Centro', null), 'Casa à venda, 90 m² por R$ 500.000,00 - Centro')
  assert.equal(tituloComValorCheio('Casa à venda, 90 m² por R$ 500.000,00 - Centro', loc()), 'Casa à venda, 90 m² por R$ 500.000,00 - Centro')
  assert.equal(tituloComValorCheio('Apartamento para alugar na Penha', loc()), 'Apartamento para alugar na Penha')
})
