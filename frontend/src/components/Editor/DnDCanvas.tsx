import { RefObject } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { renderComponent } from './component-registry'
import type { ComponentInstance } from './types'

interface DraggableComponentProps {
  component: ComponentInstance
  isSelected: boolean
  onDelete?: (id: string) => void
  onSelect?: (id: string) => void
}

function DraggableComponent({ component, isSelected, onDelete, onSelect }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
      data: {
        type: 'canvas-item',
      },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    opacity: isDragging ? 0.5 : 1,
    width: component.width ? `${component.width}px` : 'auto',
    height: component.height ? `${component.height}px` : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="absolute group"
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(component.id)
      }}
    >
      {/* Component wrapper with drag handle */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-2 transition-colors ${
          isSelected 
            ? 'border-blue-500 bg-blue-50/10' 
            : 'border-transparent hover:border-blue-400'
        }`}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className={`absolute -top-6 left-0 right-0 h-6 bg-slate-700 text-white text-xs rounded-t-lg flex items-center justify-between px-2 transition-opacity cursor-move select-none ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="font-medium">{component.label}</span>
          <div className="flex items-center gap-1">
            {isSelected && (
              <span className="text-blue-300 text-[10px]">●</span>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(component.id)
                }}
                className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center hover:bg-red-600"
                title="Delete"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Actual component */}
        <div className="pointer-events-auto">
          {renderComponent(component)}
        </div>
      </div>
    </div>
  )
}

interface DnDCanvasProps {
  items: ComponentInstance[]
  canvasRef: RefObject<HTMLDivElement>
  selectedId: string | null
  onDelete: (id: string) => void
  onSelect: (id: string | null) => void
}

export function DnDCanvas({ items, canvasRef, selectedId, onDelete, onSelect }: DnDCanvasProps) {
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
      className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-2xl overflow-auto border-2 border-slate-300"
      onClick={() => onSelect(null)}
    >
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg pointer-events-none">
          Drag UI components from the palette here
        </div>
      )}
      {items.map((item) => (
        <DraggableComponent 
          key={item.id} 
          component={item} 
          isSelected={item.id === selectedId}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}


