import { RefObject, useState } from 'react'
import { 
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { renderComponent } from './component-registry'
import type { ComponentInstance } from './types'
import { GripVertical } from 'lucide-react'

interface CanvasPreviewProps {
  items: ComponentInstance[]
  onPositionChange?: (id: string, position: { x: number; y: number }) => void
  canvasRef?: RefObject<HTMLDivElement>
}

interface DraggablePreviewComponentProps {
  component: ComponentInstance
  isHovered: boolean
  onHover: (id: string | null) => void
}

function DraggablePreviewComponent({ component, isHovered, onHover }: DraggablePreviewComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: {
      type: 'preview-item',
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    opacity: isDragging ? 0.7 : 1,
  }

  const componentStyle = {
    width: component.width ? `${component.width}px` : undefined,
    height: component.height ? `${component.height}px` : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="absolute group"
      onMouseEnter={() => onHover(component.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="relative">
        {/* Minimal drag handle - only shows on hover */}
        <div
          {...listeners}
          {...attributes}
          className={`absolute -top-7 left-0 right-0 h-6 bg-slate-700/90 backdrop-blur-sm text-white text-xs rounded-t flex items-center justify-between px-2 transition-opacity cursor-move select-none ${
            isHovered || isDragging ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            <span className="font-medium text-[11px]">{component.label}</span>
          </div>
        </div>

        {/* Subtle border on hover */}
        <div 
          className={`relative rounded transition-all ${
            isHovered || isDragging ? 'ring-2 ring-blue-400/50 shadow-lg' : ''
          }`}
        >
          <div className="w-full h-full" style={componentStyle}>
            {renderComponent(component)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Interactive preview mode - renders components with minimal drag capability
 * Clean UI but allows repositioning components
 */
export function CanvasPreview({ items, onPositionChange, canvasRef }: CanvasPreviewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const { setNodeRef } = useDroppable({
    id: 'preview-canvas',
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    
    if (!onPositionChange) return

    const item = items.find(i => i.id === active.id)
    if (!item) return

    const newPosition = {
      x: Math.max(0, item.position.x + delta.x),
      y: Math.max(0, item.position.y + delta.y),
    }

    onPositionChange(active.id as string, newPosition)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={(node) => {
          setNodeRef(node)
          if (canvasRef) {
            // @ts-ignore - React 18 ref callback
            canvasRef.current = node
          }
        }}
        className="w-full h-full bg-gradient-to-br from-white to-slate-50 relative overflow-auto min-h-screen"
      >
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg">
            No components to preview
          </div>
        )}
        
        {items.map((item) => (
          <DraggablePreviewComponent
            key={item.id}
            component={item}
            isHovered={item.id === hoveredId}
            onHover={setHoveredId}
          />
        ))}

        {/* Helper hint */}
        {items.length > 0 && (
          <div className="absolute top-4 right-4 bg-slate-700/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-xs">
            💡 Hover over components to drag them
          </div>
        )}
      </div>
    </DndContext>
  )
}

