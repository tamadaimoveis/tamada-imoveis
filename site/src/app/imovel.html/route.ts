import { NextRequest, NextResponse } from 'next/server'

// Ponte da URL antiga (imovel.html?ref=AP0001-EIU) pra rota nova
// (/imovel/AP0001-EIU). Sem ref, ou ref vazio, manda pro catálogo em vez
// de 404 — link quebrado ainda leva a algum lugar útil.
export async function GET(req: NextRequest) {
  const ref = (req.nextUrl.searchParams.get('ref') || '').trim().toUpperCase()
  if (!ref) return NextResponse.redirect(new URL('/imoveis', req.url), 302)
  return NextResponse.redirect(new URL(`/imovel/${encodeURIComponent(ref)}`, req.url), 301)
}
