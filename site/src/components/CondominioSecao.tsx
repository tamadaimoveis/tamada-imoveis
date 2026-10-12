'use client'

import { useEffect, useState } from 'react'
import { blocosDaDescricao, gruposDePlantas, linhasFicha, type Condominio } from '@/lib/condominio-secao'

type Foto = { url: string; alt: string }

const FOTOS_VISIVEIS = 12

/**
 * Seção "O condomínio" da ficha do imóvel e da página do condomínio.
 * Cada bloco só existe se houver dado: nada de título sem conteúdo.
 * Usa as classes que o site já tem (`detail-block`, `eyebrow`, `amenity-grid`,
 * `detail-facts`, `lightbox`). O lightbox daqui NÃO usa os ids do imovel.js,
 * então os dois não se enxergam.
 */
export default function CondominioSecao({
  condominio: c,
  href,
  comCabecalho = true,
}: {
  condominio: Condominio
  href?: string
  comCabecalho?: boolean
}) {
  const [aberta, setAberta] = useState<{ lista: Foto[]; i: number } | null>(null)
  const [todasFotos, setTodasFotos] = useState(false)

  useEffect(() => {
    if (!aberta) return
    const n = aberta.lista.length
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberta(null)
      if (e.key === 'ArrowRight') setAberta((a) => (a ? { ...a, i: (a.i + 1) % n } : a))
      if (e.key === 'ArrowLeft') setAberta((a) => (a ? { ...a, i: (a.i - 1 + n) % n } : a))
    }
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', tecla)
    }
  }, [aberta !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const fatos = linhasFicha(c.ficha)
  const { grupos, temTipos, pdfs } = gruposDePlantas(c.ficha, c.plantas)
  const todasPlantas: Foto[] = grupos.flatMap((g) => g.plantas.map((p) => ({ url: p.url, alt: `${c.nome} — planta ${p.nome}` })))
  const fotos: Foto[] = c.fotos.map((url, i) => ({ url, alt: `${c.nome} — foto ${i + 1}` }))
  let cursor = 0
  const atual = aberta ? aberta.lista[aberta.i] : null
  const ir = (passo: number) => setAberta((a) => (a ? { ...a, i: (a.i + passo + a.lista.length) % a.lista.length } : a))

  return (
    <>
      {comCabecalho && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Área comum
          </p>
          <h2>
            O condomínio
            <br />
            <em>{c.nome}.</em>
          </h2>
          {c.local && <p style={{ color: 'var(--muted)', margin: '0 0 18px' }}>{c.local}</p>}
          {href && (
            <a className="button button-ghost" href={href}>
              <span>Ver página do condomínio</span>
            </a>
          )}
        </div>
      )}

      {fotos.length > 0 && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Fotos do condomínio
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.6rem', marginTop: 18 }}>
            {(todasFotos ? fotos : fotos.slice(0, FOTOS_VISIVEIS)).map((f, i) => (
              <button
                key={f.url}
                type="button"
                aria-label={`Ampliar foto ${i + 1} do condomínio`}
                onClick={() => setAberta({ lista: fotos, i })}
                style={{ position: 'relative', aspectRatio: '4 / 3', border: 0, padding: 0, borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', background: '#eee' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${f.url}?w=500&h=375&fit=crop&auto=format`}
                  alt={f.alt}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
          {fotos.length > FOTOS_VISIVEIS && (
            <button className="button button-ghost" type="button" style={{ marginTop: 18 }} onClick={() => setTodasFotos((v) => !v)}>
              <span>{todasFotos ? 'Mostrar menos' : `Ver todas as ${fotos.length} fotos`}</span>
            </button>
          )}
        </div>
      )}

      {c.descricao && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Sobre
          </p>
          <h2>
            Sobre o
            <br />
            <em>condomínio.</em>
          </h2>
          {blocosDaDescricao(c.descricao).map((bloco, i) =>
            bloco.tipo === 'lista' ? (
              // Linhas curtas seguidas = lista de características: mesmos cartões das comodidades.
              <ul className="amenity-grid" key={i} style={{ margin: '0 0 24px' }}>
                {bloco.itens.map((item) => (
                  <li className="in" key={item}>
                    <iconify-icon icon="solar:check-circle-linear" style={{ fontSize: 28, flex: '0 0 auto' }} />
                    <div>
                      <span>{item}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i} style={{ maxWidth: '68ch', lineHeight: 1.8, margin: '0 0 16px' }}>
                {bloco.texto}
              </p>
            )
          )}
        </div>
      )}

      {c.comodidades.length > 0 && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Área comum
          </p>
          <h2>
            Comodidades
            <br />
            <em>do condomínio.</em>
          </h2>
          <ul className="amenity-grid">
            {c.comodidades.map((label) => (
              <li className="in" key={label}>
                <iconify-icon icon="solar:check-circle-linear" style={{ fontSize: 28, flex: '0 0 auto' }} />
                <div>
                  <span>{label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fatos.length > 0 && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Ficha técnica
          </p>
          <h2>
            Os números
            <br />
            <em>do condomínio.</em>
          </h2>
          <dl className="detail-facts">
            {fatos.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {grupos.length > 0 && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> {temTipos ? 'Tipos de unidade' : 'Plantas'}
          </p>
          <h2>
            Plantas
            <br />
            <em>{temTipos ? 'por tipo.' : 'do condomínio.'}</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {grupos.map((g) => (
              <div key={g.key}>
                {g.titulo && <p style={{ fontWeight: 700, margin: '0 0 2px' }}>{g.titulo}</p>}
                {g.detalhes && <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 10px' }}>{g.detalhes}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {g.plantas.map((p) => {
                    const indice = cursor++
                    return (
                      <button
                        key={`${p.url}-${indice}`}
                        type="button"
                        aria-label={`Ampliar planta ${p.nome}`}
                        onClick={() => setAberta({ lista: todasPlantas, i: indice })}
                        style={{ flex: '1 1 200px', padding: 10, border: 0, borderRadius: 8, background: '#fff', boxShadow: '0 2px 14px rgba(0,0,0,.08)', cursor: 'zoom-in', textAlign: 'left', color: 'inherit' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${p.url}?w=700&q=80&auto=format&fit=max`}
                          alt={`Planta ${p.nome}`}
                          loading="lazy"
                          style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'contain' }}
                        />
                        <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'var(--muted)' }}>{p.nome}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="detail-block">
          <p className="eyebrow">
            <span /> Plantas para baixar
          </p>
          <ul style={{ listStyle: 'none', margin: '18px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pdfs.map((p) => (
              <li key={p.key}>
                <a href={p.arquivoUrl!} target="_blank" rel="noopener" style={{ color: 'var(--red)', fontWeight: 600 }}>
                  Baixar planta — {p.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {c.bookUrl && (
        <div className="detail-block">
          <a className="button button-red button-large" href={c.bookUrl} target="_blank" rel="noopener">
            <iconify-icon icon="solar:download-minimalistic-linear" />
            <span>Baixar book{c.bookNome ? ` — ${c.bookNome}` : ''}</span>
          </a>
        </div>
      )}

      <div className="lightbox" hidden={aberta === null} aria-modal="true" role="dialog" aria-label="Galeria do condomínio">
        <div className="lightbox-bar">
          <span className="lightbox-title">{c.nome}</span>
          <span className="lightbox-counter">
            {aberta ? aberta.i + 1 : 0} / {aberta?.lista.length ?? 0}
          </span>
          <div className="lightbox-tools">
            <button type="button" aria-label="Fechar galeria" onClick={() => setAberta(null)}>
              <iconify-icon icon="solar:close-circle-linear" />
            </button>
          </div>
        </div>
        <button className="lb-nav lb-prev" type="button" aria-label="Anterior" hidden={(aberta?.lista.length ?? 0) < 2} onClick={() => ir(-1)}>
          <iconify-icon icon="solar:alt-arrow-left-linear" />
        </button>
        <button className="lb-nav lb-next" type="button" aria-label="Próxima" hidden={(aberta?.lista.length ?? 0) < 2} onClick={() => ir(1)}>
          <iconify-icon icon="solar:alt-arrow-right-linear" />
        </button>
        <div className="lightbox-stage">
          {atual ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${atual.url}?w=1800&q=80&auto=format&fit=max`} alt={atual.alt} draggable={false} />
          ) : null}
        </div>
      </div>
    </>
  )
}
