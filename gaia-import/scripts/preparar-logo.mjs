/**
 * Prepara a logo da Tamada para marca d'água e gera uma amostra.
 *
 * O PNG que o Gaia serve vem com fundo branco chapado — jogado direto numa
 * foto vira um retângulo branco. Aqui o branco vira transparente por limiar,
 * preservando o antialias das bordas das letras (senão a logo fica serrilhada).
 *
 *   node scripts/preparar-logo.mjs
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const LOGO_URL =
  'https://cdn1.valuegaia.com.br/gaiasite/8757/TEMA.LOGOTIPO_TOPO_URL/0c2c6acce281d006cc6bedcfea070de1-APLICA%C3%87%C3%83O%20CLEAN%202.png'

const OUT_LOGO = path.resolve('public/logo.png')
const OUT_AMOSTRA = path.resolve('..', 'amostra-marca-dagua.jpg')

// Pixel com os 3 canais acima disto é considerado fundo. 238 (de 255) tira o
// branco e o quase-branco do JPEG sem comer o cinza claro do desenho.
const LIMIAR_BRANCO = 238

async function baixar(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`logo HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Branco → transparente. Tons intermediários viram alpha proporcional, então
 *  a borda das letras continua suave em vez de serrilhada. */
async function removerFundoBranco(buf) {
  const {data, info} = await sharp(buf).ensureAlpha().raw().toBuffer({resolveWithObject: true})
  const {width, height, channels} = info
  for (let i = 0; i < data.length; i += channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const min = Math.min(r, g, b)
    if (min >= LIMIAR_BRANCO) {
      data[i + 3] = 0
    } else if (min > 200) {
      // Faixa de transição: quanto mais claro, mais transparente.
      data[i + 3] = Math.round(data[i + 3] * (1 - (min - 200) / (LIMIAR_BRANCO - 200)))
    }
  }
  return sharp(data, {raw: {width, height, channels}}).png().toBuffer()
}

/** Recorta a moldura totalmente transparente que sobra em volta do desenho. */
async function aparar(buf) {
  return sharp(buf).trim({threshold: 0}).png().toBuffer()
}

async function aplicar(fotoBuf, logoBuf, {sizePercent = 22, opacity = 90, padding = 3.5} = {}) {
  const meta = await sharp(fotoBuf).metadata()
  const w = meta.width ?? 1024
  const h = meta.height ?? 768

  const larguraLogo = Math.round(w * (sizePercent / 100))
  const logo = await sharp(logoBuf)
    .resize(larguraLogo)
    .ensureAlpha()
    .composite([
      {
        // Multiplica o alpha existente pela opacidade desejada — mantém a
        // transparência do fundo em vez de reintroduzir um retângulo.
        input: Buffer.from([255, 255, 255, Math.round((opacity / 100) * 255)]),
        raw: {width: 1, height: 1, channels: 4},
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const logoMeta = await sharp(logo).metadata()
  const margem = Math.round(w * (padding / 100))

  return sharp(fotoBuf)
    .composite([
      {
        input: logo,
        left: w - (logoMeta.width ?? larguraLogo) - margem,
        top: h - (logoMeta.height ?? 0) - margem,
      },
    ])
    .jpeg({quality: 92, mozjpeg: true})
    .toBuffer()
}

// ── Execução ────────────────────────────────────────────────────────────────
const bruta = await baixar(LOGO_URL)
const metaBruta = await sharp(bruta).metadata()
console.log(`logo original: ${metaBruta.width}x${metaBruta.height}, canais=${metaBruta.channels}, alpha=${metaBruta.hasAlpha}`)

const limpa = await aparar(await removerFundoBranco(bruta))
const metaLimpa = await sharp(limpa).metadata()
fs.mkdirSync(path.dirname(OUT_LOGO), {recursive: true})
fs.writeFileSync(OUT_LOGO, limpa)
console.log(`logo tratada:  ${metaLimpa.width}x${metaLimpa.height}, alpha=${metaLimpa.hasAlpha} → ${OUT_LOGO}`)

// Amostra numa foto real do acervo
const FOTO =
  'https://lh3.googleusercontent.com/xIDH29WapdDRM5WzDxcQCR-oQkTj-jSbh8B_AezeHUfLy4E6BSPkMwklIgiTamVBh3XrmY33JAgCVFreOLrxVhpXmlXxvkfTjjMl9NCrnFYzpQ=w1024-h768'
const foto = await baixar(FOTO)
fs.writeFileSync(OUT_AMOSTRA, await aplicar(foto, limpa))
console.log(`amostra:       ${OUT_AMOSTRA}`)
