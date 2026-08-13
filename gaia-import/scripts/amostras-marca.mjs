/**
 * Gera um painel comparativo de variações da marca d'água, para escolher
 * tamanho/opacidade/sombra olhando em vez de adivinhar.
 *
 *   node scripts/amostras-marca.mjs
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const LOGO = path.resolve('public/logo.png')
const SAIDA = path.resolve('..', 'amostras-marca-dagua.jpg')

const FOTO =
  'https://lh3.googleusercontent.com/xIDH29WapdDRM5WzDxcQCR-oQkTj-jSbh8B_AezeHUfLy4E6BSPkMwklIgiTamVBh3XrmY33JAgCVFreOLrxVhpXmlXxvkfTjjMl9NCrnFYzpQ=w1024-h768'

const VARIACOES = [
  {nome: 'A — 22%, sem sombra (a de antes)', size: 22, opacity: 90, sombra: false},
  {nome: 'B — 22%, sombra no contorno', size: 22, opacity: 95, sombra: true},
  {nome: 'C — 28%, sombra no contorno', size: 28, opacity: 95, sombra: true},
  {nome: 'D — 34%, sombra no contorno', size: 34, opacity: 95, sombra: true},
]

async function carimbar(fotoBuf, logoBuf, {size, opacity, sombra}) {
  const meta = await sharp(fotoBuf).metadata()
  const w = meta.width ?? 1024
  const h = meta.height ?? 768
  const larguraLogo = Math.round(w * (size / 100))

  const logo = await sharp(logoBuf)
    .resize(larguraLogo)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
        raw: {width: 1, height: 1, channels: 4},
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const lm = await sharp(logo).metadata()
  const lw = lm.width ?? larguraLogo
  const lh = lm.height ?? 0
  const margem = Math.round(w * 0.035)
  const left = w - lw - margem
  const top = h - lh - margem

  const camadas = []

  if (sombra) {
    // Sombra de verdade: o próprio alpha da logo, borrado e pintado de preto.
    // Segue o contorno das letras. Um retângulo borrado não resolve — o miolo
    // continua opaco e vira uma caixa cinza visível sobre a foto.
    const {data, info} = await sharp(logo).ensureAlpha().raw().toBuffer({resolveWithObject: true})
    const mascara = Buffer.alloc(info.width * info.height * 4)
    for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
      mascara[j] = 0
      mascara[j + 1] = 0
      mascara[j + 2] = 0
      mascara[j + 3] = data[i + 3] // mesma silhueta da logo
    }
    const raio = Math.max(2, Math.round(lw * 0.018))
    const sombraBuf = await sharp(mascara, {raw: {width: info.width, height: info.height, channels: 4}})
      .blur(raio)
      .png()
      .toBuffer()
    // Duas passadas: adensa o escuro sem precisar de alpha alto (que borraria
    // a foto em volta).
    for (const dy of [0, 1]) {
      camadas.push({input: sombraBuf, left, top: top + dy})
    }
  }

  camadas.push({input: logo, left, top})

  return sharp(fotoBuf).composite(camadas).jpeg({quality: 92, mozjpeg: true}).toBuffer()
}

/** Faixa com o nome da variação, pra saber o que é o quê no painel. */
function rotulo(texto, largura) {
  const svg = `<svg width="${largura}" height="40">
    <rect width="100%" height="100%" fill="#16181d"/>
    <text x="12" y="26" font-family="system-ui,sans-serif" font-size="17" fill="#fff">${texto}</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

const logoBuf = fs.readFileSync(LOGO)
const fotoBuf = Buffer.from(await (await fetch(FOTO)).arrayBuffer())

const painéis = []
for (const v of VARIACOES) {
  const img = await carimbar(fotoBuf, logoBuf, v)
  const m = await sharp(img).metadata()
  const w = m.width ?? 576
  const h = m.height ?? 768
  const faixa = await rotulo(v.nome, w)
  painéis.push(
    await sharp({create: {width: w, height: h + 40, channels: 3, background: '#16181d'}})
      .composite([
        {input: faixa, left: 0, top: 0},
        {input: img, left: 0, top: 40},
      ])
      .jpeg({quality: 92})
      .toBuffer()
  )
}

const m0 = await sharp(painéis[0]).metadata()
const pw = m0.width ?? 576
const ph = m0.height ?? 808

const grid = await sharp({
  create: {width: pw * 2 + 12, height: ph * 2 + 12, channels: 3, background: '#16181d'},
})
  .composite([
    {input: painéis[0], left: 0, top: 0},
    {input: painéis[1], left: pw + 12, top: 0},
    {input: painéis[2], left: 0, top: ph + 12},
    {input: painéis[3], left: pw + 12, top: ph + 12},
  ])
  .jpeg({quality: 88, mozjpeg: true})
  .toBuffer()

fs.writeFileSync(SAIDA, grid)
console.log(`✓ ${SAIDA}`)
