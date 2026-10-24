import { createClient } from '@sanity/client'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'v3whr4as'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Leituras pela CDN do Sanity (cota de 1M/mês, quase sem uso) em vez da API comum
  // (cota de 250k/mês, que chegou a 87%). O cache do Next já revalida a cada 5-15 min,
  // então os poucos segundos de atraso da CDN não mudam nada.
  useCdn: true,
})
