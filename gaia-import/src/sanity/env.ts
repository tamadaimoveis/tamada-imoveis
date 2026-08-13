/**
 * Identidade do projeto Sanity.
 *
 * As env vars têm precedência (o site Next.js as injeta no build). Os valores
 * fixos abaixo são o fallback: sem eles o `sanity deploy` quebra, porque o CLI
 * do Sanity não enxerga variáveis com prefixo NEXT_PUBLIC_. Não é segredo —
 * projectId e dataset vão no bundle do navegador de qualquer jeito.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'v3whr4as'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
