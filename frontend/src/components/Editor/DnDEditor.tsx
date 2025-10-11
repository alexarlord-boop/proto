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
import { PropertyPanel } from './PropertyPanel'
import { COMPONENT_REGISTRY } from './component-registry'
import type { ComponentInstance, EventHandler } from './types'

export function DnDEditor() {
  const [items, setItems] = useState<ComponentInstance[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<any>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
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
    if (selectedComponentId === id) {
      setSelectedComponentId(null)
    }
  }

  const handleSelect = (id: string | null) => {
    setSelectedComponentId(id)
  }

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedComponentId) return

    setItems((items) =>
      items.map((item) => {
        if (item.id === selectedComponentId) {
          // Handle nested property keys like "position.x"
          if (key.includes('.')) {
            const keys = key.split('.')
            const newItem = { ...item }
            let current: any = newItem
            for (let i = 0; i < keys.length - 1; i++) {
              current[keys[i]] = { ...current[keys[i]] }
              current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
            return newItem
          } else {
            // Update direct props
            return {
              ...item,
              props: {
                ...item.props,
                [key]: value,
              },
            }
          }
        }
        return item
      })
    )
  }

  const handleEventHandlerChange = (eventName: string, handler: EventHandler) => {
    if (!selectedComponentId) return

    setItems((items) =>
      items.map((item) =>
        item.id === selectedComponentId
          ? {
              ...item,
              eventHandlers: {
                ...item.eventHandlers,
                [eventName]: handler,
              },
            }
          : item
      )
    )
  }

  const handleLayoutChange = (updates: {
    width?: number
    height?: number
    position?: { x: number; y: number }
  }) => {
    if (!selectedComponentId) return

    setItems((items) =>
      items.map((item) =>
        item.id === selectedComponentId
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    )
  }

  // Get selected component data
  const selectedComponent = selectedComponentId
    ? items.find((item) => item.id === selectedComponentId)
    : null

  const selectedComponentDef = selectedComponent
    ? COMPONENT_REGISTRY.find((def) => def.type === selectedComponent.type)
    : null

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-[1800px] mx-auto h-full flex gap-6">
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
              selectedId={selectedComponentId}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
          </div>

          {/* Property Panel Sidebar */}
          <div className="w-80 flex-shrink-0">
            <PropertyPanel
              component={selectedComponent || null}
              propertySchema={selectedComponentDef?.propertySchema || []}
              events={selectedComponentDef?.events || []}
              onPropertyChange={handlePropertyChange}
              onEventHandlerChange={handleEventHandlerChange}
              onLayoutChange={handleLayoutChange}
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

