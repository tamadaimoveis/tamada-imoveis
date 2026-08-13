'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { Text } from '@sanity/ui'
import { GalleryCard } from './GalleryCard'
import { VIEW_MODE_CONFIG, type ViewMode } from './galleryViewMode'

type ImageItem = {
  _key: string
  asset?: { _ref?: string }
}

type Props = {
  value: ImageItem[]
  viewMode: ViewMode
  onMove: (fromIndex: number, toIndex: number) => void
  onOpenItem: (key: string) => void
  onRemoveItem: (key: string) => void
  disabled?: boolean
}

export function GalleryGrid({ value, viewMode, onMove, onOpenItem, onRemoveItem, disabled }: Props) {
  const config = VIEW_MODE_CONFIG[viewMode]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = value.findIndex((img) => img._key === active.id)
    const toIndex = value.findIndex((img) => img._key === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    onMove(fromIndex, toIndex)
  }

  if (!value || value.length === 0) {
    return (
      <Text size={1} muted style={{ padding: 16, textAlign: 'center' }}>
        Nenhuma foto adicionada. Use o botão acima pra fazer upload.
      </Text>
    )
  }

  const strategy = viewMode === 'list' ? verticalListSortingStrategy : rectSortingStrategy

  const gridStyle: React.CSSProperties = viewMode === 'list'
    ? { display: 'flex', flexDirection: 'column', gap: 8 }
    : {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${config.thumbPx + 16}px, 1fr))`,
        gap: 12,
      }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={value.map((img) => img._key)} strategy={strategy}>
        <div style={gridStyle}>
          {value.map((image, index) => (
            <GalleryCard
              key={image._key}
              image={image}
              index={index}
              thumbPx={config.thumbPx}
              onOpen={() => onOpenItem(image._key)}
              onRemove={() => onRemoveItem(image._key)}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
