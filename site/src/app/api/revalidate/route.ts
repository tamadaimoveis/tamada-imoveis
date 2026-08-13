/**
 * O corretor salva o imóvel no CRM → a edge `update-imovel-sanity` (e as
 * irmãs: fotos, publish, delete) fazem o PATCH no Sanity e chamam esta rota
 * (organizations.revalidate_url) com o segredo no header. As páginas afetadas
 * são marcadas como velhas e o Next as regenera na próxima visita — sem
 * deploy, sem esperar o ISR de 300s.
 */
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getRefBySlug } from '@/lib/queries'

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // triggerRevalidate (App/supabase/functions/_shared/revalidate.ts, no CRM)
  // manda { _id, slug: { current } } — não manda o ref (gaiaCodigo), que é o
  // que usamos na URL /imovel/[ref]. Traduz slug -> ref via GROQ antes de
  // revalidar a página específica.
  let body: { _id?: string; slug?: { current?: string } } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = body?.slug?.current
  const ref = slug ? await getRefBySlug(slug) : null
  if (ref) revalidatePath(`/imovel/${ref}`)

  // O imóvel aparece na home (destaques) e no catálogo também — as três
  // caem juntas, senão o card fica com preço/foto velhos em algum canto
  // mesmo depois do PATCH.
  revalidatePath('/imoveis')
  revalidatePath('/')

  return NextResponse.json({ ok: true, revalidated: ref ?? null })
}
