import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Position {
  x: number
  y: number
}

interface DraggableItem {
  id: string
  label: string
  position: Position
  color: string
}

function DraggableObject({ id, label, color, position }: DraggableItem) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
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
      className="absolute w-24 h-24 rounded-lg shadow-lg cursor-move flex items-center justify-center text-white font-semibold select-none"
    >
      {label}
    </div>
  )
}

export function DnDCanvas() {
  const [items, setItems] = useState<DraggableItem[]>([
    { id: '1', label: 'Box 1', position: { x: 50, y: 50 }, color: '#3b82f6' },
    { id: '2', label: 'Box 2', position: { x: 200, y: 100 }, color: '#10b981' },
    { id: '3', label: 'Box 3', position: { x: 350, y: 150 }, color: '#f59e0b' },
    { id: '4', label: 'Box 4', position: { x: 100, y: 250 }, color: '#ef4444' },
  ])

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const { setNodeRef } = useDroppable({
    id: 'canvas',
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    
    setItems((items) =>
      items.map((item) =>
        item.id === active.id
          ? {
              ...item,
              position: {
                x: item.position.x + delta.x,
                y: item.position.y + delta.y,
              },
            }
          : item
      )
    )
    
    setActiveId(null)
  }

  const activeItem = items.find((item) => item.id === activeId)

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Drag & Drop Canvas</h1>
        <p className="text-slate-600 text-center mt-2">Drag the boxes around the canvas</p>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={setNodeRef}
          className="relative w-[800px] h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-slate-300"
        >
          {items.map((item) => (
            <DraggableObject key={item.id} {...item} />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div
              className="w-24 h-24 rounded-lg shadow-2xl flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: activeItem.color }}
            >
              {activeItem.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-6 text-sm text-slate-500">
        💡 Tip: Click and drag any box to move it around the canvas
      </div>
    </div>
  )
}

