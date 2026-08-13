import { ImageIcon } from '@sanity/icons'
import { useState, useEffect } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

type Phase = 'idle' | 'confirm' | 'processing' | 'done' | 'error'

export const reapplyWatermarkAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, published } = props
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState({ current: 0, remaining: 0 })
  const [errorMsg, setErrorMsg] = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (phase !== 'done') return
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          closeAndReload()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (!published) return null

  const label =
    phase === 'processing'
      ? progress.remaining > 0
        ? `Processando ${progress.current}/${progress.current + progress.remaining}...`
        : `Processando ${progress.current} imagem(ns)...`
      : 'Reaplicar Marca d\'Água'

  const runProcessing = async () => {
    setPhase('processing')
    setProgress({ current: 0, remaining: 0 })
    try {
      let totalChanges = 0
      let nextStart = -1
      let iterations = 0
      const MAX_ITERATIONS = 60

      while (iterations < MAX_ITERATIONS) {
        iterations++
        const url = `/api/watermark-test?id=${id}&limit=2&force=true&start=${nextStart}`
        const res = await fetch(url)
        const data = await res.json()

        if (!data.success) {
          setErrorMsg(data.error || 'Falha ao processar')
          setPhase('error')
          return
        }

        totalChanges += data.changes
        setProgress({ current: totalChanges, remaining: data.totalRemaining || 0 })

        if (data.done || data.nextStart === -2) break
        if (data.changes === 0 && data.nextStart === nextStart) break
        nextStart = data.nextStart
      }

      setProgress({ current: totalChanges, remaining: 0 })
      setPhase('done')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setPhase('error')
    }
  }

  const closeAndReload = () => {
    setPhase('idle')
    setProgress({ current: 0, remaining: 0 })
    setErrorMsg('')
    props.onComplete()
    // Recarrega para o usuário ver as imagens atualizadas
    window.location.reload()
  }

  // Monta o dialog baseado na fase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dialog: any = undefined

  if (phase === 'confirm') {
    dialog = {
      type: 'confirm',
      tone: 'primary',
      message:
        'Reprocessar todas as fotos deste imóvel com a marca d\'água atual?\n\n' +
        'As configurações usadas serão as do documento "🎨 Marca d\'Água" no menu lateral.',
      onConfirm: runProcessing,
      onCancel: () => {
        setPhase('idle')
        props.onComplete()
      },
    }
  } else if (phase === 'processing') {
    dialog = {
      type: 'dialog',
      header: 'Processando marca d\'água',
      content: `⏳ ${progress.current} imagem(ns) processada(s)${
        progress.remaining > 0 ? `. ~${progress.remaining} restante(s).` : ''
      }\n\nAguarde, não feche esta janela.`,
      onClose: () => {}, // não fecha durante processamento
    }
  } else if (phase === 'done') {
    dialog = {
      type: 'success',
      header: 'Concluído!',
      content: `${progress.current} imagem(ns) processada(s) com a marca d'água atualizada.\n\nRecarregando em ${countdown}s...`,
      onClose: closeAndReload,
    }
  } else if (phase === 'error') {
    dialog = {
      type: 'dialog',
      header: '❌ Erro',
      content: errorMsg,
      onClose: () => {
        setPhase('idle')
        setErrorMsg('')
        props.onComplete()
      },
    }
  }

  return {
    label,
    icon: ImageIcon,
    disabled: phase === 'processing',
    onHandle: () => {
      if (phase === 'idle') setPhase('confirm')
    },
    dialog,
  }
}
