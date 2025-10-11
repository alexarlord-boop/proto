import { RefObject } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Position {
  x: number
  y: number
}

export interface CanvasItem {
  id: string
  label: string
  position: Position
  color: string
}

interface DraggableObjectProps extends CanvasItem {
  onDelete?: (id: string) => void
}

function DraggableObject({
  id,
  label,
  color,
  position,
  onDelete,
}: DraggableObjectProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        type: 'canvas-item',
      },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${position.x}px`,
    top: `${position.y}px`,
    backgroundColor: color,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute w-24 h-24 rounded-lg shadow-lg cursor-move flex items-center justify-center text-white font-semibold select-none group"
    >
      {label}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  )
}

interface DnDCanvasProps {
  items: CanvasItem[]
  canvasRef: RefObject<HTMLDivElement>
  onDelete: (id: string) => void
}

export function DnDCanvas({ items, canvasRef, onDelete }: DnDCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  })

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (canvasRef) {
          // @ts-ignore - React 18 ref callback
          canvasRef.current = node
        }
      }}
      className="relative w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-slate-300"
    >
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg pointer-events-none">
          Drag colored boxes from the palette here
        </div>
      )}
      {items.map((item) => (
        <DraggableObject key={item.id} {...item} onDelete={onDelete} />
      ))}
    </div>
  )
}


