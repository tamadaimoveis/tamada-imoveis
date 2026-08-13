'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Flex, Text } from '@sanity/ui'
import { TrashIcon, EyeOpenIcon } from '@sanity/icons'
import imageUrlBuilder from '@sanity/image-url'
import { useClient } from 'sanity'

type ImageItem = {
  _key: string
  asset?: { _ref?: string }
}

type Props = {
  image: ImageItem
  index: number
  thumbPx: number
  onOpen: () => void
  onRemove: () => void
  disabled?: boolean
}

export function GalleryCard({ image, index, thumbPx, onOpen, onRemove, disabled }: Props) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image._key, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const thumbUrl = image.asset?._ref
    ? builder.image(image.asset._ref).width(thumbPx * 2).height(thumbPx * 2).fit('crop').url()
    : null

  const fullUrl = image.asset?._ref
    ? builder.image(image.asset._ref).width(1600).url()
    : null

  const filename = image.asset?._ref?.split('-').slice(1, -2).join('-') || `Foto ${index + 1}`

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled) return
    const ok = window.confirm(`Remover a foto ${index + 1} da galeria?\n\nIsso só remove a foto deste imóvel — o arquivo continua no acervo de mídia.`)
    if (ok) onRemove()
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      padding={2}
      radius={2}
      shadow={isDragging ? 3 : 1}
      tone={isDragging ? 'primary' : 'default'}
    >
      <Flex direction="column" gap={2} align="center">
        <div style={{ position: 'relative', width: thumbPx, height: thumbPx }}>
          <div
            {...attributes}
            {...listeners}
            style={{
              width: thumbPx,
              height: thumbPx,
              background: '#f0f0f0',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'none',
              cursor: disabled ? 'not-allowed' : 'grab',
            }}
            onDoubleClick={onOpen}
            title="Arraste pra reordenar — duplo-clique pra editar"
          >
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={filename}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
            ) : (
              <Text size={1} muted>Sem imagem</Text>
            )}
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                borderRadius: 3,
                padding: '1px 6px',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {index + 1}
            </div>
          </div>
          {fullUrl && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.open(fullUrl, '_blank') }}
              title="Ver foto em tamanho real (nova aba)"
              aria-label={`Ver foto ${index + 1} em tamanho real`}
              style={{
                position: 'absolute',
                top: 4,
                right: 32,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(30,30,30,0.75)',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              <EyeOpenIcon />
            </button>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            title="Remover foto da galeria"
            aria-label={`Remover foto ${index + 1}`}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(200,30,30,0.92)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: 0,
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            <TrashIcon />
          </button>
        </div>
        <Text size={1} muted style={{ maxWidth: thumbPx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filename}
        </Text>
      </Flex>
    </Card>
  )
}
