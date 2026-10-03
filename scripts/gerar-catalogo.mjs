/**
 * Gera `redesign-atlas-urbano/catalog-data.js` a partir do Sanity.
 *
 * Por que gerar arquivo em vez de o site buscar em tempo real: o site é
 * estático e filtra/pagina tudo no navegador, sobre o array inteiro. Buscar ao
 * vivo custaria ~1,8s no primeiro acesso (CDN frio) antes de qualquer coisa
 * aparecer na tela. Como arquivo, o catálogo já vem no HTML — e ainda continua
 * no ar se o Sanity cair.
 *
 * O contrato é o mesmo do arquivo escrito à mão: `window.TAMADA_CATALOG` com
 * ref/title/type/... — `imoveis.js` e `imovel.js` não precisam mudar.
 *
 *   node scripts/gerar-catalogo.mjs
 *   node scripts/gerar-catalogo.mjs --dry-run
 */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import {fileURLToPath} from 'url'
import {COMODIDADES, ACABAMENTOS, GARANTIAS, PAGAMENTO, OCUPACAO} from './lib/opcoes.mjs'

const DRY = process.argv.includes('--dry-run')

// Ancorado no próprio arquivo, não no diretório de onde foi chamado: o build da
// Vercel roda da raiz e a mão roda de dentro de scripts/. Com caminho relativo
// ao CWD, um dos dois escreveria fora do site.
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAIDA = path.join(RAIZ, 'catalog-data.js')

// Na máquina as chaves vêm do `.env.local`; no build da Vercel não existe
// arquivo — as mesmas chaves chegam pelo ambiente. Sem o fallback, o build
// remoto morre no readFileSync antes de tentar qualquer coisa.
// Aceita o `.env.local` na raiz do site ou o do Studio ao lado, que é onde ele
// mora hoje — assim rodar na mão continua funcionando sem copiar nada.
const ARQUIVO_ENV = [path.join(RAIZ, '.env.local'), path.join(RAIZ, '..', 'site', '.env.local')].find(
  (p) => fs.existsSync(p)
)
const env = ARQUIVO_ENV
  ? Object.fromEntries(
      fs
        .readFileSync(ARQUIVO_ENV, 'utf8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=')
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
        })
    )
  : process.env
const {NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset} = env

// Sem isso a URL do Sanity vira ".../undefined/..." e o erro só aparece como
// um 404 críptico no meio do log de build.
if (!projectId || !dataset) {
  console.error(
    'Faltam NEXT_PUBLIC_SANITY_PROJECT_ID e/ou NEXT_PUBLIC_SANITY_DATASET.\n' +
      'Na Vercel: Settings > Environment Variables. Local: site/.env.local.'
  )
  process.exit(1)
}

// Sanity → enum do site (typeLabels em imoveis.js). O site tem menos tipos que
// o Gaia, então vários colapsam: cobertura/studio/duplex viram APARTMENT,
// loja/ponto viram HALL. Sem isso o card cai no rótulo genérico "Imóvel".
const TIPO = {
  apartamento: 'APARTMENT',
  apartamento_duplex: 'APARTMENT',
  cobertura: 'APARTMENT',
  studio: 'APARTMENT',
  conjunto: 'APARTMENT',
  casa: 'HOUSE',
  sobrado: 'TWO_STORY_HOUSE',
  terreno: 'LAND',
  area: 'LAND',
  salao: 'HALL',
  loja: 'HALL',
  ponto: 'HALL',
  sala: 'ROOM',
  predio: 'BUILDING',
  hotel: 'BUILDING',
  galpao: 'OUTHOUSE',
  chacara: 'SMALL_FARM',
  sitio: 'SMALL_FARM',
}

const QUERY = `*[_type=="property" && publicarSite==true && status=="ativo"]|order(_createdAt desc){
  "ref": gaiaCodigo,
  "codigo": codigoImovel,
  title, "tipo": type, finalidade, oferta, subTipo, constructionStatus,
  "neighborhood": neighborhood, "city": cidade, estado, zona,
  address, addressNumber, cep, pontoReferencia, zoneamento, latitude, longitude,
  "sale": price, "rent": rentPrice, priceCash, condominio, iptu, precoM2Venda,
  aceitaNegociacao, garantiaLocacao, paymentMethods,
  "area": area, areaTotal,
  "beds": bedrooms, suites, "baths": bathrooms, qtdSalas,
  "garages": garage, vagasCobertas, vagasDescobertas, garageType,
  numeroAndar, qtdAndar, qtdElevador, alturaPeDireito,
  anoConstrucao, anoReforma,
  description, videoUrl, tourVirtual,
  amenities, acabamentos, tags,
  ocupacao, locado, exclusividade,
  captador, captadorCelular, captadorCRECI,
  "img": mainImage.asset->url,
  "fotos": images[].asset->url,
  "slug": slug.current,
  featured
}`

/* Busca paginada. A query pede muitos campos por imóvel (incluindo as ~22 URLs
   de foto); pedir os 4.429 de uma vez estoura o limite de tempo do Sanity com
   erro 524. Em lotes de 500 responde folgado. */
const LOTE_CONSULTA = 500
const result = []
for (let off = 0; ; off += LOTE_CONSULTA) {
  const q = QUERY.replace(']|order(_createdAt desc){', `]|order(_createdAt desc)[${off}...${off + LOTE_CONSULTA}]{`)
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(q)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity ${res.status} no lote ${off}: ${(await res.text()).slice(0, 200)}`)
  const {result: lote} = await res.json()
  if (!lote.length) break
  result.push(...lote)
  process.stdout.write(`\r  buscando... ${result.length}`)
}
process.stdout.write('\r'.padEnd(30) + '\r')

const catalogo = result
  .filter((p) => p.ref && p.title)
  .map((p) => ({
    ref: p.ref,
    // Título exatamente como o cliente cadastrou no Gaia. Não encurtar: é
    // escolha dele e é o que o Google já indexa no site atual.
    title: p.title,
    // Destaque da home. Marcado no Studio/CRM, campo `featured` do Sanity —
    // antes a home tinha 12 imóveis fixos no código, que ninguém conseguia
    // trocar sem mexer no site.
    featured: p.featured === true,
    type: TIPO[p.tipo] || 'HOUSE',
    neighborhood: p.neighborhood || '',
    city: p.city || 'São Paulo',
    sale: p.sale || 0,
    rent: p.rent || 0,
    area: p.area || 0,
    beds: p.beds || 0,
    baths: p.baths || 0,
    garages: p.garages || 0,
    // Sanity redimensiona no CDN: o card mostra ~400px, não faz sentido baixar
    // a original de 1024 em 4.429 imóveis.
    image: p.img ? `${p.img}?w=560&h=400&fit=crop&auto=format` : '',
    url: `/imovel/${p.slug}/${p.ref}`,
  }))

const semTipo = result.filter((p) => p.tipo && !TIPO[p.tipo])
if (semTipo.length) {
  const distintos = [...new Set(semTipo.map((p) => p.tipo))]
  console.log(`⚠️  tipos sem mapeamento (caíram em HOUSE): ${distintos.join(', ')}`)
}

/* Bairros com centro geográfico e contagem, para o mapa da home.
   O centro é a MÉDIA das coordenadas dos imóveis do bairro — nunca a
   coordenada de um imóvel específico. Assim o mapa funciona sem publicar a
   localização exata de ninguém (ver o bloco sobre endereço mais acima).
   Bairro sem nenhuma coordenada fica de fora do mapa, mas segue no catálogo. */
const porBairro = {}
for (const p of result) {
  const nome = (p.neighborhood || '').trim()
  if (!nome) continue
  const b = (porBairro[nome] = porBairro[nome] || {nome, cidade: p.city, total: 0, lats: [], lngs: []})
  b.total++
  if (p.latitude && p.longitude) {
    b.lats.push(p.latitude)
    b.lngs.push(p.longitude)
  }
}
const media = (a) => a.reduce((s, n) => s + n, 0) / a.length
const bairros = Object.values(porBairro)
  .filter((b) => b.lats.length > 0)
  .map((b) => ({
    nome: b.nome,
    cidade: b.cidade || 'São Paulo',
    total: b.total,
    // 5 casas decimais ≈ 1 m de precisão no centro do bairro. Mais que isso é
    // ruído e engorda o arquivo à toa.
    lat: Number(media(b.lats).toFixed(5)),
    lng: Number(media(b.lngs).toFixed(5)),
    // Quantas coordenadas sustentam esse centro — bairro com 1 só é chute.
    amostras: b.lats.length,
  }))
  .sort((a, b) => b.total - a.total)

const semCoordenada = Object.values(porBairro).length - bairros.length
console.log(`bairros  : ${bairros.length} com centro (${semCoordenada} sem coordenada, ficam fora do mapa)`)

const conteudo = `/* GERADO por site/scripts/gerar-catalogo.mjs — não editar à mão.
   Fonte: Sanity ${projectId}/${dataset}. Regerar após mudança no catálogo. */
window.TAMADA_CATALOG = ${JSON.stringify(catalogo)};
window.TAMADA_BAIRROS = ${JSON.stringify(bairros)};
window.TAMADA_SANITY = {projectId: ${JSON.stringify(projectId)}, dataset: ${JSON.stringify(dataset)}};
`

const bytes = Buffer.byteLength(conteudo)
const gz = zlib.gzipSync(Buffer.from(conteudo)).length
console.log(`imóveis  : ${catalogo.length}`)
console.log(`sem foto : ${catalogo.filter((p) => !p.image).length}`)
console.log(`sem preço: ${catalogo.filter((p) => !p.sale && !p.rent).length}`)
console.log(`arquivo  : ${(bytes / 1024 / 1024).toFixed(2)} MB · ${(gz / 1024).toFixed(0)} KB comprimido`)

/* Registro completo de cada imóvel, um arquivo por imóvel.
   Fora do catalog-data.js porque descrição + 22 fotos + comodidades de 4.429
   imóveis daria dezenas de MB — todo visitante baixaria tudo para ver um. E não
   é buscado no Sanity em tempo real porque o navegador esbarra em CORS (a
   origem do site teria que ser liberada no projeto) e somaria latência a cada
   abertura. */
const PASTA_DADOS = path.join(RAIZ, 'imovel')

const rotular = (valores, mapa) =>
  (valores || []).map((v) => mapa[v]).filter(Boolean)

/* Vídeo institucional x vídeo do imóvel.
   O cadastro tem 2.842 imóveis com vídeo, mas só 7 URLs distintas: 2.323
   apontam para o mesmo institucional da Tamada e 512 para outro. Um botão
   "Vídeo" que abre comercial da imobiliária frustra quem clicou para ver a
   casa. O critério é a repetição — vídeo do imóvel é, por definição, único. */
const LIMITE_INSTITUCIONAL = 5
const usoDeVideo = {}
for (const p of result) if (p.videoUrl) usoDeVideo[p.videoUrl] = (usoDeVideo[p.videoUrl] || 0) + 1
const ehInstitucional = (url) => !!url && usoDeVideo[url] > LIMITE_INSTITUCIONAL

const registros = result
  .filter((p) => p.ref)
  .map((p) => ({
    ref: p.ref,
    codigo: p.codigo,
    // Campos básicos duplicados do catalog-data.js — de propósito. Antes
    // imovel.html precisava esperar o catálogo inteiro (2,2 MB, 4.429
    // imóveis) carregar e ser varrido só para achar ESTE imóvel, mesmo tendo
    // o ref pronto na URL. Com os básicos aqui, a página renderiza só com
    // este arquivo (poucos KB); o catálogo grande vira opcional, usado
    // depois, só para sugerir imóveis parecidos.
    title: p.title,
    type: TIPO[p.tipo] || 'HOUSE',
    neighborhood: p.neighborhood || '',
    city: p.city || 'São Paulo',
    sale: p.sale || 0,
    rent: p.rent || 0,
    area: p.area || 0,
    beds: p.beds || 0,
    baths: p.baths || 0,
    garages: p.garages || 0,
    image: p.img ? `${p.img}?w=560&h=400&fit=crop&auto=format` : '',
    url: `/imovel/${p.slug}/${p.ref}`,
    photos: [p.img, ...(p.fotos || [])].filter(Boolean),
    descricao: p.description || '',
    // Rótulos já resolvidos: o site não precisa conhecer os slugs do Sanity.
    comodidades: rotular(p.amenities, COMODIDADES),
    acabamentos: rotular(p.acabamentos, ACABAMENTOS),
    garantias: rotular(p.garantiaLocacao, GARANTIAS),
    pagamento: rotular(p.paymentMethods, PAGAMENTO),
    tags: p.tags || [],
    ficha: {
      subTipo: p.subTipo,
      finalidade: p.finalidade,
      areaUtil: p.area,
      areaTotal: p.areaTotal,
      quartos: p.beds,
      suites: p.suites,
      banheiros: p.baths,
      salas: p.qtdSalas,
      vagas: p.garages,
      vagasCobertas: p.vagasCobertas,
      vagasDescobertas: p.vagasDescobertas,
      tipoVaga: p.garageType === 'privativa' ? 'Privativa' : p.garageType === 'rotativa' ? 'Rotativa' : null,
      andar: p.numeroAndar,
      andaresPredio: p.qtdAndar,
      elevadores: p.qtdElevador,
      peDireito: p.alturaPeDireito,
      anoConstrucao: p.anoConstrucao,
      anoReforma: p.anoReforma,
      condominio: p.condominio,
      iptu: p.iptu,
      precoM2: p.precoM2Venda,
      precoAVista: p.priceCash,
      aceitaNegociacao: p.aceitaNegociacao,
      ocupacao: OCUPACAO[p.ocupacao] || null,
      locado: p.locado,
      exclusividade: p.exclusividade,
      zoneamento: p.zoneamento,
      /* SEM ENDEREÇO. Rua+número, CEP, ponto de referência e coordenadas exatas
         NÃO saem daqui: estes arquivos são servidos publicamente, então
         esconder na tela não adiantaria — bastaria abrir o JSON. Endereço
         explícito permite ao interessado (ou ao concorrente) chegar no
         proprietário sem passar pela imobiliária. Os dados continuam no Sanity
         para uso interno e do CRM. O mapa da página usa posição aproximada
         por bairro, calculada no próprio site. */
      obra: p.constructionStatus === 'pronto' ? 'Pronto para morar'
        : p.constructionStatus === 'construcao' ? 'Em construção'
        : p.constructionStatus === 'lancamento' ? 'Lançamento' : null,
    },
    video: p.videoUrl || null,
    videoInstitucional: ehInstitucional(p.videoUrl),
    tour: p.tourVirtual || null,
    corretor: p.captador ? {nome: p.captador, celular: p.captadorCelular || null, creci: p.captadorCRECI || null} : null,
    // `geo` removido: latitude/longitude exatas localizam a porta do imóvel
    // tão bem quanto a rua e o número. O mapa usa aproximação por bairro.
  }))

const totalFotos = registros.reduce((s, r) => s + r.photos.length, 0)
const semDescricao = registros.filter((r) => !r.descricao).length
const semComodidades = registros.filter((r) => !r.comodidades.length).length
console.log(`registros: ${registros.length} arquivos · ${totalFotos} fotos`)
console.log(`  sem descrição   : ${semDescricao}`)
console.log(`  sem comodidades : ${semComodidades}`)

if (DRY) {
  console.log('\n(dry-run — nada escrito)')
} else {
  fs.writeFileSync(SAIDA, conteudo)
  console.log(`\n✓ ${SAIDA}`)

  fs.rmSync(PASTA_DADOS, {recursive: true, force: true})
  // Pasta antiga do formato só-fotos: some para não deixar dado velho servido.
  fs.rmSync(path.join(RAIZ, 'fotos'), {recursive: true, force: true})
  fs.mkdirSync(PASTA_DADOS, {recursive: true})
  for (const r of registros) {
    fs.writeFileSync(path.join(PASTA_DADOS, `${r.ref}.json`), JSON.stringify(r))
  }
  console.log(`✓ ${PASTA_DADOS} (${registros.length} arquivos)`)
}
