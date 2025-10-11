import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { DnDPalette } from './DnDPalette'
import { DnDCanvas } from './DnDCanvas'

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

export function DnDEditor() {
  const [items, setItems] = useState<CanvasItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<any>(null)
  const nextIdRef = useRef(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveDragData(event.active.data.current)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event

    console.log('Drag end:', { activeId: active.id, overId: over?.id, delta })

    // Check if dropped on canvas
    if (over?.id === 'canvas') {
      const dragData = active.data.current

      // If dragging from palette, create new item
      if (dragData?.type === 'palette-item') {
        const canvasBounds = canvasRef.current?.getBoundingClientRect()
        if (canvasBounds) {
          // Use a simpler approach: place item at center initially
          // or use a fixed grid position
          const newItem: CanvasItem = {
            id: `item-${nextIdRef.current++}`,
            label: dragData.label,
            color: dragData.color,
            position: {
              x: Math.max(0, Math.min(Math.random() * (canvasBounds.width - 96), canvasBounds.width - 96)),
              y: Math.max(0, Math.min(Math.random() * (canvasBounds.height - 96), canvasBounds.height - 96)),
            },
          }

          setItems((prev) => [...prev, newItem])
          console.log('Created new item:', newItem)
        }
      }
      // If dragging existing canvas item, update position
      else if (dragData?.type === 'canvas-item') {
        setItems((items) =>
          items.map((item) =>
            item.id === active.id
              ? {
                  ...item,
                  position: {
                    x: Math.max(0, item.position.x + delta.x),
                    y: Math.max(0, item.position.y + delta.y),
                  },
                }
              : item
          )
        )
      }
    } else {
      console.log('Not dropped on canvas, over:', over)
    }

    setActiveId(null)
    setActiveDragData(null)
  }

  const handleDelete = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  const activeItem = items.find((item) => item.id === activeId)

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-[1400px] mx-auto h-full flex gap-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={rectIntersection}
        >
          {/* Palette Sidebar */}
          <div className="w-64 flex-shrink-0">
            <DnDPalette />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 min-w-0 min-h-0 flex">
            <DnDCanvas
              items={items}
              canvasRef={canvasRef}
              onDelete={handleDelete}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId &&
            (activeDragData?.type === 'palette-item' || activeItem) ? (
              <div
                className="w-24 h-24 rounded-lg shadow-2xl flex items-center justify-center text-white font-semibold"
                style={{
                  backgroundColor:
                    activeDragData?.type === 'palette-item'
                      ? activeDragData.color
                      : activeItem?.color,
                }}
              >
                {activeDragData?.type === 'palette-item'
                  ? activeDragData.label
                  : activeItem?.label}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

