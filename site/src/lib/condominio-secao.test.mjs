import test from 'node:test'
import assert from 'node:assert/strict'
import {
  slugCondominio, sufixoDoSlug, slugValido, localDoCondominio, formatarPrevisaoEntrega,
  detalhesTipologia, pertenceAoCondominio, linhasFicha, gruposDePlantas, montarCondominio, temConteudo,
} from './condominio-secao.ts'

const ID = 'condominio-3dce29c5-1111-4222-8333-444455556666'

test('slug: nome sem acento + 8 primeiros do uuid; sufixo volta', () => {
  const slug = slugCondominio(ID, 'Edifício Promenade')
  assert.equal(slug, 'edificio-promenade-3dce29c5')
  assert.equal(sufixoDoSlug(slug), '3dce29c5')
  assert.ok(slugValido(slug))
  assert.ok(!slugValido('../../etc'))
  assert.ok(!slugValido(''))
})

test('local: só bairro e cidade/UF, nunca rua', () => {
  assert.equal(localDoCondominio({ neighborhood: 'Costa e Silva', city: 'Joinville', state: 'SC' }), 'Costa e Silva, Joinville/SC')
  assert.equal(localDoCondominio({ city: 'Joinville' }), 'Joinville')
  assert.equal(localDoCondominio({}), null)
})

test('previsão de entrega e tipologia: zero aparece, ausente não', () => {
  assert.equal(formatarPrevisaoEntrega('2027-03'), 'mar/2027')
  assert.equal(formatarPrevisaoEntrega('em breve'), 'em breve')
  assert.equal(formatarPrevisaoEntrega(null), null)
  assert.equal(
    detalhesTipologia({ key: 'a', nome: 'A', area: 52, dormitorios: 2, suites: 0, vagas: null }),
    '52 m² · 2 dormitórios · 0 suítes'
  )
  assert.equal(detalhesTipologia({ key: 'a', nome: 'A', area: null, dormitorios: null, suites: null, vagas: null }), null)
})

test('condomínio mínimo: sem ficha, sem plantas, sem seção vazia', () => {
  const c = montarCondominio({ _id: ID, nome: 'Residencial Costa e Silva', fotos: [], comodidades: [] })
  assert.equal(c.ficha, null)
  assert.deepEqual(linhasFicha(c.ficha), [])
  assert.equal(temConteudo(c), false)
})

test('condomínio completo: ficha, tipologias, plantas por tipo, PDF e book', () => {
  const c = montarCondominio({
    _id: ID, nome: 'Sonance', descricao: 'Texto', bairro: 'Atiradores', cidade: 'Joinville', estado: 'SC',
    fotos: ['u1', 'u2'], comodidades: ['piscina', 'piscina', 'academia'],
    fichaTecnica: {
      construtora: 'ACME', torres: 2, andares: 0, previsaoEntrega: '2027-03',
      tipologias: [{ _key: 't1', nome: '2 dorm', area: 60, dormitorios: 2 }, { _key: 't2', nome: 'Cobertura' }],
    },
    plantas: [
      { _key: 'p1', nome: 'Planta A', tipologiaKey: 't1', imagemUrl: 'img1' },
      { _key: 'p2', nome: 'Sem tipo', imagemUrl: 'img2' },
      { _key: 'p3', nome: 'Tipo removido', tipologiaKey: 'zzz', imagemUrl: 'img3' },
      { _key: 'p4', nome: 'Antiga', arquivoUrl: 'pdf1' },
      { _key: 'p5', nome: 'Vazia' },
    ],
    bookUrl: 'book.pdf', bookNome: 'Book Sonance',
  })
  assert.equal(c.slug, 'sonance-3dce29c5')
  assert.equal(c.local, 'Atiradores, Joinville/SC')
  assert.deepEqual(c.comodidades, ['piscina', 'academia'])
  assert.deepEqual(linhasFicha(c.ficha), [
    ['Construtora', 'ACME'], ['Torres', '2'], ['Andares', '0'], ['Previsão de entrega', 'mar/2027'],
  ])
  const { grupos, temTipos, pdfs } = gruposDePlantas(c.ficha, c.plantas)
  assert.equal(temTipos, true)
  // t2 não tem dado nem planta: some. t1 mostra a planta A. Resto vai para "Outras plantas".
  assert.deepEqual(grupos.map(g => g.titulo), ['2 dorm', 'Outras plantas'])
  assert.equal(grupos[0].plantas.length, 1)
  assert.equal(grupos[1].plantas.length, 2)
  assert.deepEqual(pdfs.map(p => p.nome), ['Antiga'])
  assert.equal(c.plantas.length, 4, 'planta sem imagem nem arquivo é descartada')
  assert.equal(temConteudo(c), true)
})

test('documento sem nome ou sem id não vira condomínio', () => {
  assert.equal(montarCondominio(null), null)
  assert.equal(montarCondominio({ _id: ID }), null)
  assert.equal(montarCondominio({ nome: 'X' }), null)
})

test('filtro da busca: imóvel pertence ao condomínio pelo sufixo do slug', () => {
  assert.equal(pertenceAoCondominio(ID, 'edificio-promenade-3dce29c5'), true)
  assert.equal(pertenceAoCondominio(ID, 'edificio-promenade-aaaaaaaa'), false)
  assert.equal(pertenceAoCondominio(undefined, 'edificio-promenade-3dce29c5'), false)
  assert.equal(pertenceAoCondominio(ID, 'sem-sufixo'), false)
})
