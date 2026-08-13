'use client'

import { Dialog, Box, Flex, Text } from '@sanity/ui'
import { GalleryGrid } from './GalleryGrid'

type ImageItem = {
  _key: string
  asset?: { _ref?: string }
}

type Props = {
  open: boolean
  onClose: () => void
  value: ImageItem[]
  onMove: (fromIndex: number, toIndex: number) => void
  onOpenItem: (key: string) => void
  onRemoveItem: (key: string) => void
  disabled?: boolean
}

export function GalleryFullscreen({ open, onClose, value, onMove, onOpenItem, onRemoveItem, disabled }: Props) {
  if (!open) return null

  return (
    <Dialog
      id="gallery-fullscreen"
      header="Organizar fotos da galeria"
      onClose={onClose}
      onClickOutside={onClose}
      width={4}
      footer={
        <Flex padding={3} justify="space-between" align="center">
          <Text size={1} muted>
            {value.length} foto{value.length === 1 ? '' : 's'}. Arraste para reordenar — duplo-clique pra editar.
          </Text>
        </Flex>
      }
    >
      <Box padding={4}>
        <GalleryGrid
          value={value}
          viewMode="large"
          onMove={onMove}
          onOpenItem={onOpenItem}
          onRemoveItem={onRemoveItem}
          disabled={disabled}
        />
      </Box>
    </Dialog>
  )
}
