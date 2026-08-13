// Conversão de HEIC/HEIF (formato padrão das fotos de iPhone) para JPEG, feita
// no próprio navegador antes do upload pro Sanity. O Sanity/CDN não processa
// HEIC e o sharp pré-compilado (servidor) também não decodifica HEIC — então a
// conversão tem que ser no cliente.
//
// Usamos DUAS bibliotecas em cascata pra maximizar a chance de sucesso:
//   1. heic-to (libheif moderno) — melhor suporte a HEIC de iPhones recentes
//   2. heic2any (libheif 2021, asm.js inline) — reserva
// Se as duas falharem, propagamos o motivo REAL pra aparecer no aviso ao usuário.

const HEIC_EXTENSION = /\.(heic|heif)$/i
const HEIC_MIME = /^image\/(heic|heif|heic-sequence|heif-sequence)$/i

/**
 * Detecta HEIC/HEIF. Importante: o iPhone às vezes manda o arquivo com
 * `file.type` vazio, então não dá pra confiar só no MIME — checamos a extensão.
 */
export function isHeic(file: File): boolean {
  if (HEIC_EXTENSION.test(file.name)) return true
  return HEIC_MIME.test(file.type)
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message || err.name
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

async function convertWithHeicTo(file: File): Promise<Blob> {
  const { heicTo } = await import('heic-to')
  return heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
}

async function convertWithHeic2any(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  // HEIC com várias imagens (burst/Live Photo) retorna um array de Blobs.
  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!blob) throw new Error('retorno vazio')
  return blob
}

/**
 * Devolve um arquivo pronto pra upload. HEIC/HEIF vira JPEG; qualquer outro
 * formato passa direto. As bibliotecas são importadas dinamicamente porque
 * dependem de `window`/WASM e quebrariam o SSR do Studio.
 */
export async function toUploadableImage(file: File): Promise<File> {
  if (!isHeic(file)) return file

  let blob: Blob | null = null
  let heicToErr = ''

  try {
    blob = await convertWithHeicTo(file)
  } catch (err) {
    heicToErr = errMessage(err)
  }

  if (!blob) {
    try {
      blob = await convertWithHeic2any(file)
    } catch (err) {
      throw new Error(`heic-to(${heicToErr || 'falhou'}) / heic2any(${errMessage(err)})`)
    }
  }

  const jpegName = file.name.replace(HEIC_EXTENSION, '') + '.jpg'
  return new File([blob], jpegName, { type: 'image/jpeg' })
}
