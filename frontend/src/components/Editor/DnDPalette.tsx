import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export interface PaletteItem {
  id: string
  label: string
  color: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  { id: 'palette-blue', label: 'Blue', color: '#3b82f6' },
  { id: 'palette-green', label: 'Green', color: '#10b981' },
  { id: 'palette-orange', label: 'Orange', color: '#f59e0b' },
  { id: 'palette-red', label: 'Red', color: '#ef4444' },
  { id: 'palette-purple', label: 'Purple', color: '#a855f7' },
  { id: 'palette-pink', label: 'Pink', color: '#ec4899' },
  { id: 'palette-indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'palette-cyan', label: 'Cyan', color: '#06b6d4' },
]

interface PaletteBoxProps {
  item: PaletteItem
}

function PaletteBox({ item }: PaletteBoxProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: 'palette-item',
      color: item.color,
      label: item.label,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundColor: item.color,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-20 h-20 rounded-lg shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-xs font-semibold select-none hover:shadow-lg transition-shadow"
      title={`Drag ${item.label} box to canvas`}
    >
      {item.label}
    </div>
  )
}

export function DnDPalette() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-300">
      <h2 className="text-lg font-bold text-slate-700 mb-4">Color Palette</h2>
      <div className="grid grid-cols-2 gap-4">
        {PALETTE_ITEMS.map((item) => (
          <PaletteBox key={item.id} item={item} />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">
        Drag boxes to canvas
      </p>
    </div>
  )
}

