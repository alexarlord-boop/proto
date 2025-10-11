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
import type { ComponentInstance } from './types'

export function DnDEditor() {
  const [items, setItems] = useState<ComponentInstance[]>([])
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
    const { active, delta, over, activatorEvent } = event

    console.log('Drag end:', { activeId: active.id, overId: over?.id, delta })

    // Check if dropped on canvas
    if (over?.id === 'canvas') {
      const dragData = active.data.current

      // If dragging from palette, create new component instance
      if (dragData?.type === 'palette-item') {
        const canvasBounds = canvasRef.current?.getBoundingClientRect()
        if (canvasBounds && activatorEvent instanceof PointerEvent) {
          // Calculate drop position
          const dropX = activatorEvent.clientX + delta.x - canvasBounds.left
          const dropY = activatorEvent.clientY + delta.y - canvasBounds.top

          // Create new component instance with metadata and default props
          const newComponent: ComponentInstance = {
            id: `component-${nextIdRef.current++}`,
            type: dragData.componentType,
            label: dragData.label,
            position: {
              x: Math.max(0, dropX),
              y: Math.max(0, dropY),
            },
            props: dragData.defaultProps,
          } as ComponentInstance

          setItems((prev) => [...prev, newComponent])
          console.log('Created new component:', newComponent)
        }
      }
      // If dragging existing canvas component, update position
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
            {activeId && activeDragData?.type === 'palette-item' ? (
              <div className="bg-white border-2 border-blue-400 rounded-lg shadow-2xl p-3 flex items-center justify-center">
                <span className="text-slate-700 font-medium">
                  {activeDragData.label}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

