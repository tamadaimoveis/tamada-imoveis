/**
 * Converte o endereço de um imóvel em latitude/longitude (Nominatim/OpenStreetMap)
 * e grava no Sanity. Chamado pela rota /api/revalidate quando o CRM salva o imóvel,
 * só quando o documento ainda não tem coordenada. Nunca lança: falha vira `false`
 * e o site cai no centro do bairro.
 */
import { createClient } from '@sanity/client'
import { projectId, dataset, apiVersion } from './sanity'

const UA = 'TamadaImoveis-geocode/1.0 (contato: tarcisio9547@gmail.com)'
const norm = (s?: string | null) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const dentro = (lat: number, lon: number) => lat > -24.3 && lat < -23.0 && lon > -47.3 && lon < -45.9
const km = (a: number, b: number, c: number, d: number) => {
  const t = (x: number) => (x * Math.PI) / 180
  const h = Math.sin(t(c - a) / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(t(d - b) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}
const limpaRua = (a?: string | null) =>
  String(a || '').split(/\s[-–—]\s|,\s*#|\s#/)[0].replace(/\b(n[ºo°]\.?|numero|número)\s*/gi, '').replace(/\s+/g, ' ').trim()

type Hit = { lat: string; lon: string; address?: Record<string, string> }
async function buscar(q: string): Promise<Hit[]> {
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q, format: 'jsonv2', limit: '10', countrycodes: 'br', addressdetails: '1' })
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) })
  return r.ok ? ((await r.json()) as Hit[]) : []
}

type Doc = { _id: string; address?: string; neighborhood?: string; cidade?: string; cep?: string; latitude?: number; longitude?: number }

export async function geocodificarImovel(sanityId: string): Promise<boolean> {
  try {
    const token = process.env.SANITY_WRITE_TOKEN?.trim()
    if (!token) return false
    const sanity = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
    const id = sanityId.replace(/^drafts\./, '')
    const d = await sanity.fetch<Doc | null>(
      `*[_id == $id][0]{_id, address, neighborhood, cidade, cep, latitude, longitude}`,
      { id }
    )
    if (!d || (d.latitude && d.longitude)) return false

    const rua = limpaRua(d.address)
    const cidade = d.cidade || 'São Paulo'
    const bairro = norm(d.neighborhood)
    const cep5 = String(d.cep || '').replace(/\D/g, '').slice(0, 5)
    if (!rua) return false

    // Confere por CEP ou bairro devolvidos; se o mapa escreve o bairro diferente,
    // cai no critério de distância ao centro do bairro (média dos imóveis dele).
    let achado: { lat: number; lon: number } | null = null
    const q1 = `${rua}, ${d.neighborhood || ''}, ${cidade}, SP, Brasil`
    for (const h of await buscar(q1)) {
      const lat = +h.lat, lon = +h.lon
      const a = h.address || {}
      const subs = [a.suburb, a.neighbourhood, a.city_district, a.quarter].map(norm)
      const confere =
        (cep5 && String(a.postcode || '').replace(/\D/g, '').startsWith(cep5)) ||
        (bairro && subs.some((s) => s && (s.includes(bairro) || bairro.includes(s))))
      if (dentro(lat, lon) && confere) { achado = { lat, lon }; break }
    }
    if (!achado && d.neighborhood) {
      const pts = await sanity.fetch<{ latitude: number; longitude: number }[]>(
        `*[_type=="property" && neighborhood == $b && cidade == $c && defined(latitude) && defined(longitude)][0...60]{latitude, longitude}`,
        { b: d.neighborhood, c: cidade }
      )
      if (pts.length >= 3) {
        const med = (v: number[]) => v.sort((x, y) => x - y)[Math.floor(v.length / 2)]
        const centro: [number, number] = [med(pts.map((p) => p.latitude)), med(pts.map((p) => p.longitude))]
        const cands = (await buscar(`${rua}, ${cidade}, SP, Brasil`))
          .map((h) => ({ lat: +h.lat, lon: +h.lon }))
          .filter((c) => dentro(c.lat, c.lon))
          .map((c) => ({ ...c, k: km(c.lat, c.lon, centro[0], centro[1]) }))
          .sort((a, b) => a.k - b.k)
        if (cands[0] && cands[0].k <= 2.5) achado = cands[0]
      }
    }
    // Bairro sem nenhum imóvel com coordenada (não há centro pra comparar): aceita a
    // rua só se o CEP do resultado cai na mesma região do CEP do cadastro (4 dígitos).
    const cep4 = cep5.slice(0, 4)
    if (!achado && cep4.length === 4) {
      const hit = (await buscar(`${rua}, ${cidade}, SP, Brasil`)).find(
        (h) => dentro(+h.lat, +h.lon) && String(h.address?.postcode || '').replace(/\D/g, '').startsWith(cep4)
      )
      if (hit) achado = { lat: +hit.lat, lon: +hit.lon }
    }
    if (!achado) return false

    await sanity.patch(d._id).set({ latitude: Number(achado.lat.toFixed(6)), longitude: Number(achado.lon.toFixed(6)) }).commit()
    return true
  } catch {
    return false
  }
}
