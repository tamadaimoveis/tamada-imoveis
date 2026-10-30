/**
 * Tipo do imóvel no CRM (campo `type` no Sanity) → tipo usado pelo site.
 *
 * Lista mantida à mão: quando o CRM ganha um tipo novo, ele precisa entrar aqui.
 * Tipo que não está na lista vira 'OTHER' (o site mostra "Imóvel"), nunca um
 * chute como "Casa". `npm run check:tipos` compara esta lista com o Sanity ao vivo.
 */
export const TIPO: Record<string, string> = {
  apartamento: 'APARTMENT',
  apartamento_duplex: 'APARTMENT',
  cobertura: 'APARTMENT',
  studio: 'APARTMENT',
  studio_kitchenette: 'APARTMENT',
  estudio: 'APARTMENT',
  conjunto: 'APARTMENT',
  casa: 'HOUSE',
  sobrado: 'TWO_STORY_HOUSE',
  terreno: 'LAND',
  area: 'LAND',
  salao: 'HALL',
  salao_comercial: 'HALL',
  loja: 'HALL',
  ponto: 'HALL',
  sala: 'ROOM',
  sala_comercial: 'ROOM',
  predio: 'BUILDING',
  predio_comercial: 'BUILDING',
  hotel: 'BUILDING',
  galpao: 'OUTHOUSE',
  chacara: 'SMALL_FARM',
  sitio: 'SMALL_FARM',
}

export const tipoDoSite = (tipoCrm?: string | null): string => TIPO[tipoCrm ?? ''] || 'OTHER'
