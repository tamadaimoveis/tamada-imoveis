'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { set, setIfMissing, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps, ObjectInputProps } from 'sanity'
import { Button, Flex, Stack, Text } from '@sanity/ui'
import { GalleryGrid } from './GalleryGrid'
import { GalleryFullscreen } from './GalleryFullscreen'
import { loadViewMode, saveViewMode, VIEW_MODE_CONFIG, type ViewMode } from './galleryViewMode'
import { toUploadableImage } from './heicConvert'

// Aceita os formatos comuns + HEIC/HEIF explicitamente. Em vários sistemas o
// `accept="image/*"` sozinho não lista os arquivos HEIC no seletor do iPhone.
const IMAGE_ACCEPT = 'image/*,.heic,.heif'

type ImageItem = {
  _type: 'image'
  _key: string
  asset?: { _type: 'reference'; _ref: string }
}

export function MultiImageInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('medium')
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  useEffect(() => {
    setViewMode(loadViewMode())
  }, [])

  useEffect(() => {
    saveViewMode(viewMode)
  }, [viewMode])

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      const newImages: ImageItem[] = []

      try {
        for (let i = 0; i < fileArray.length; i++) {
          setUploadStatus(`Enviando ${i + 1} de ${fileArray.length}...`)
          const uploadable = await toUploadableImage(fileArray[i])
          const asset = await client.assets.upload('image', uploadable)
          newImages.push({
            _type: 'image',
            _key: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
            asset: { _type: 'reference', _ref: asset._id },
          })
        }

        const current = (props.value as ImageItem[]) || []
        props.onChange(set([...current, ...newImages]))
      } catch (err) {
        console.error('[MultiImageInput] falha ao converter/enviar foto', err)
        // Sobe o que já deu certo antes do erro pra não perder o progresso.
        if (newImages.length) {
          const current = (props.value as ImageItem[]) || []
          props.onChange(set([...current, ...newImages]))
        }
        const motivo = err instanceof Error ? err.message : String(err)
        window.alert(
          `Não foi possível converter ou enviar uma das fotos [v2]. Motivo: ${motivo}. Tente novamente ou envie como JPG.`,
        )
      } finally {
        setUploadStatus('')
      }
    },
    [client, props],
  )

  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      props.onItemMove({ fromIndex, toIndex })
    },
    [props],
  )

  const handleOpenItem = useCallback(
    (key: string) => {
      props.onItemOpen([{ _key: key }])
    },
    [props],
  )

  const handleRemoveItem = useCallback(
    (key: string) => {
      props.onItemRemove(key)
    },
    [props],
  )

  const value = (props.value as ImageItem[]) || []
  const isUploading = uploadStatus !== ''

  return (
    <Stack space={3}>
      <Flex gap={2} align="center" wrap="wrap">
        <Button
          mode="default"
          tone="primary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          text={uploadStatus || '📷 Selecionar várias fotos de uma vez'}
        />

        <Flex gap={1} style={{ marginLeft: 'auto' }} align="center">
          <Text size={1} muted style={{ marginRight: 8 }}>Visualização:</Text>
          {(['list', 'medium', 'large'] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              mode={viewMode === mode ? 'default' : 'ghost'}
              tone={viewMode === mode ? 'primary' : 'default'}
              onClick={() => setViewMode(mode)}
              text={VIEW_MODE_CONFIG[mode].label}
              fontSize={1}
              padding={2}
            />
          ))}
          <Button
            mode="ghost"
            onClick={() => setFullscreenOpen(true)}
            text="⛶ Tela cheia"
            fontSize={1}
            padding={2}
            disabled={value.length === 0}
            style={{ marginLeft: 8 }}
          />
        </Flex>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFiles(e.target.files)
            e.target.value = ''
          }
        }}
      />

      <GalleryGrid
        value={value}
        viewMode={viewMode}
        onMove={handleMove}
        onOpenItem={handleOpenItem}
        onRemoveItem={handleRemoveItem}
        disabled={isUploading}
      />

      <GalleryFullscreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        value={value}
        onMove={handleMove}
        onOpenItem={handleOpenItem}
        onRemoveItem={handleRemoveItem}
        disabled={isUploading}
      />
    </Stack>
  )
}

/**
 * Input customizado da "Foto Principal" (campo `image` único). Igual ao da
 * galeria, converte HEIC/HEIF do iPhone pra JPEG no navegador antes de enviar.
 * Mantém o input nativo do Sanity (`renderDefault`) logo abaixo pra preservar
 * o preview, o hotspot e o corte.
 */
export function SingleImageInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFile = useCallback(
    async (file: File) => {
      try {
        setUploadStatus('Convertendo/enviando...')
        const uploadable = await toUploadableImage(file)
        const asset = await client.assets.upload('image', uploadable)
        props.onChange([
          setIfMissing({ _type: 'image' }),
          set({ _type: 'reference', _ref: asset._id }, ['asset']),
        ])
      } catch (err) {
        console.error('[SingleImageInput] falha ao converter/enviar foto', err)
        const motivo = err instanceof Error ? err.message : String(err)
        window.alert(
          `Não foi possível converter ou enviar a foto [v2]. Motivo: ${motivo}. Tente novamente ou envie como JPG.`,
        )
      } finally {
        setUploadStatus('')
      }
    },
    [client, props],
  )

  const isUploading = uploadStatus !== ''

  return (
    <Stack space={3}>
      <Flex gap={2} align="center" wrap="wrap">
        <Button
          mode="default"
          tone="primary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          text={uploadStatus || '📷 Selecionar foto principal'}
        />
        <Text size={1} muted>
          Aceita HEIC, HEIF, JPG, PNG e WebP. Fotos do iPhone (HEIC) são convertidas automaticamente.
        </Text>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {props.renderDefault(props)}
    </Stack>
  )
}
