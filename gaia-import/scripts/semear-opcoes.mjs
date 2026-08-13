/**
 * Semeia o documento `imovelOptions` — o catálogo de Tags e Comodidades que a
 * tela "Tags e Comodidades" do CRM lê e os corretores escolhem nos formulários.
 *
 * Por que semear em vez de o cliente digitar na tela do CRM:
 * aquela tela gera o valor salvo com slugify(label), que usa HÍFEN
 * ("Salão de Festas" -> "salao-de-festas"). Os 4.429 imóveis importados usam
 * UNDERSCORE ("salao_festas"), herdado do schema do Furlanetto/GVM. Digitar na
 * mão criaria opções que não casam com nenhum imóvel — o filtro do site veria
 * duas comodidades distintas. A tela do CRM preserva o value de opções já
 * existentes, então basta o catálogo nascer certo aqui.
 *
 *   node scripts/semear-opcoes.mjs --dry-run
 *   node scripts/semear-opcoes.mjs
 */
import fs from 'fs'
import path from 'path'

const DRY = process.argv.includes('--dry-run')

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

// Tags usam o rótulo como valor (contrato herdado do CRM: TAGS_OPCOES em
// src/lib/sanityOptions.ts guarda 'Lançamento', não 'lancamento').
const TAGS = ['Lançamento', 'Alto Padrão', 'Oportunidade', 'Exclusivo']

// value → rótulo. Os values são exatamente os gravados nos 4.429 imóveis.
const COMODIDADES = {
  piscina: 'Piscina',
  piscina_infantil: 'Piscina Infantil',
  piscina_termica: 'Piscina Térmica',
  churrasqueira: 'Churrasqueira',
  academia: 'Academia',
  sauna: 'Sauna',
  hidromassagem: 'Hidromassagem',
  salao_festas: 'Salão de Festas',
  salao_jogos: 'Salão de Jogos',
  playground: 'Playground',
  quadra_poliesportiva: 'Quadra Poliesportiva',
  campo_futebol: 'Campo de Futebol',
  area_lazer: 'Área de Lazer',
  area_verde: 'Área Verde',
  espaco_gourmet: 'Espaço Gourmet',
  brinquedoteca: 'Brinquedoteca',
  coworking: 'Coworking',
  cinema: 'Cinema',
  bicicletario: 'Bicicletário',
  pet_place: 'Pet Place',
  solarium: 'Solário',
  sacada: 'Sacada / Varanda',
  varanda_gourmet: 'Varanda Gourmet',
  terraco: 'Terraço',
  quintal: 'Quintal',
  lavabo: 'Lavabo',
  area_servico: 'Área de Serviço',
  copa: 'Copa',
  despensa: 'Despensa',
  escritorio: 'Escritório',
  closet: 'Closet',
  deposito: 'Depósito',
  mezanino: 'Mezanino',
  jardim_inverno: 'Jardim de Inverno',
  lareira: 'Lareira',
  adega: 'Adega',
  pe_direito_duplo: 'Pé-direito Duplo',
  dormitorio_reversivel: 'Dormitório Reversível',
  dormitorio_empregada: 'Dormitório de Empregada',
  wc_empregada: 'WC de Empregada',
  vestiario: 'Vestiário',
  armarios_planejados: 'Armários Planejados',
  cozinha_servico: 'Cozinha com Área de Serviço',
  ar_condicionado: 'Ar Condicionado',
  elevador: 'Elevador',
  interfone: 'Interfone',
  portao_eletronico: 'Portão Eletrônico',
  alarme: 'Alarme',
  cftv: 'Câmeras (CFTV)',
  portaria_24h: 'Portaria 24h',
  seguranca_24h: 'Segurança 24h',
  zelador: 'Zelador',
  tv_cabo: 'TV a Cabo',
  energia_solar: 'Energia Solar',
  garagem_coberta: 'Garagem Coberta',
  condominio_fechado: 'Condomínio Fechado',
  acessibilidade_pne: 'Acessibilidade PNE',
  mobiliado: 'Mobiliado',
  semimobiliado: 'Semimobiliado',
  aceita_pet: 'Aceita Pet',
  frente_mar: 'Frente Mar',
  beira_mar: 'Beira Mar',
  agua: 'Água',
  esgoto: 'Esgoto',
  energia_eletrica: 'Energia Elétrica',
  rua_asfaltada: 'Rua Asfaltada',
  entrada_caminhoes: 'Entrada para Caminhões',
  doca: 'Doca',
  vao_livre: 'Vão Livre',
  caseiro: 'Casa de Caseiro',
}

const doc = {
  _id: 'imovelOptions',
  _type: 'imovelOptions',
  tags: TAGS.map((t) => ({_key: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), _type: 'tagOption', value: t, label: t})),
  amenities: Object.entries(COMODIDADES).map(([value, label]) => ({
    _key: value,
    _type: 'amenityOption',
    value,
    label,
  })),
}

// Confere o catálogo contra o que os imóveis realmente usam. Comodidade em uso
// que não estivesse no catálogo sumiria do formulário do corretor.
async function groq(query) {
  const res = await fetch(`${base}/query/${dataset}?query=${encodeURIComponent(query)}`, {
    headers: {Authorization: `Bearer ${token}`},
  })
  return (await res.json()).result
}

const emUso = (await groq('array::unique(*[_type=="property"].amenities[])')).filter(Boolean)
const noCatalogo = new Set(Object.keys(COMODIDADES))
const faltando = emUso.filter((v) => !noCatalogo.has(v))

console.log(`comodidades no catálogo : ${Object.keys(COMODIDADES).length}`)
console.log(`comodidades em uso      : ${emUso.length}`)
console.log(`em uso FORA do catálogo : ${faltando.length}${faltando.length ? ' -> ' + faltando.join(', ') : ' ✓'}`)
console.log(`tags                    : ${TAGS.length}`)

if (faltando.length) {
  console.error('\n❌ Catálogo incompleto — abortado. Some do formulário do corretor.')
  process.exit(1)
}

if (DRY) {
  console.log('\n(dry-run — nada gravado)')
  process.exit(0)
}

const res = await fetch(`${base}/mutate/${dataset}`, {
  method: 'POST',
  headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
  body: JSON.stringify({mutations: [{createOrReplace: doc}]}),
})
console.log(res.ok ? '\n✓ imovelOptions gravado' : `\n❌ ${res.status} ${await res.text()}`)
