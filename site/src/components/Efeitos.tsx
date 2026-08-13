'use client'

import { useEffect } from 'react'

/**
 * Carrega os scripts legados do site (o mesmo common.js/script.js/imovel.js
 * etc. que rodava no HTML estático) depois que a página React já pintou.
 * Não foram reescritos como componente: são centenas de linhas que mexem
 * direto no DOM (reveal on scroll, carrossel, elegant-select, mapa Leaflet)
 * e não conhecem React — reescrever não mudaria um pixel e arriscaria o
 * desenho.
 *
 * Ordem importa: cada script espera que o anterior já tenha rodado (ex.:
 * imovel.js usa initReveal/initMagnetic de common.js). data.forEach abaixo
 * carrega em sequência, uma de cada vez, nunca em paralelo.
 */
function carregar(src: string) {
  return new Promise<void>((resolve) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[data-efeito="${src}"]`)
    if (existente) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.dataset.efeito = src
    // CDN fora do ar não pode travar a página — sem animação o site continua
    // legível e navegável.
    s.onload = () => resolve()
    s.onerror = () => resolve()
    document.head.appendChild(s)
  })
}

function remedir() {
  const ST = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
  if (ST) ST.refresh()
}

export default function Efeitos({ scripts, gsap = false }: { scripts: string[]; gsap?: boolean }) {
  useEffect(() => {
    let cancelado = false

    const bibliotecas = gsap
      ? [
          'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.7/gsap.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.7/ScrollTrigger.min.js',
        ]
      : []
    ;(async () => {
      for (const lib of bibliotecas) {
        if (cancelado) return
        await carregar(lib)
      }
      for (const script of scripts) {
        if (cancelado) return
        await carregar(script)
      }
      if (cancelado) return

      remedir()
      await document.fonts?.ready?.catch(() => {})
      const imagens = Array.from(document.images).filter((i) => !i.complete)
      await Promise.all(
        imagens.map(
          (img) =>
            new Promise<void>((r) => {
              img.addEventListener('load', () => r(), { once: true })
              img.addEventListener('error', () => r(), { once: true })
            })
        )
      )
      if (!cancelado) remedir()
    })()

    window.addEventListener('resize', remedir)
    return () => {
      cancelado = true
      window.removeEventListener('resize', remedir)
    }
  }, [scripts, gsap])

  return null
}
