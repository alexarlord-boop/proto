import { RefObject } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { renderComponent } from './component-registry'
import type { ComponentInstance } from './types'

// Check if component is a layout container that can have children
function isLayoutContainer(type: string): boolean {
  return ['Container', 'Grid', 'Stack'].includes(type)
}

interface DraggableComponentProps {
  component: ComponentInstance
  isSelected: boolean
  onDelete?: (id: string) => void
  onSelect?: (id: string) => void
  selectedId?: string | null
  isNested?: boolean
}

function DraggableComponent({ component, isSelected, onDelete, onSelect, selectedId, isNested = false }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
      data: {
        type: 'canvas-item',
      },
    })

  // Make layout containers droppable
  // Disable droppable when this component is being dragged to prevent self-drop
  const { setNodeRef: setDroppableRef, isOver, active } = useDroppable({
    id: `container-${component.id}`,
    disabled: !isLayoutContainer(component.type) || isDragging, // Disable while dragging
    data: {
      type: 'layout-container',
      containerId: component.id,
    },
  })
  
  // Don't show hover effect if dragging this component onto itself
  const isHoveringOverSelf = isOver && active?.id === component.id
  const showDropZone = isOver && !isHoveringOverSelf && !isDragging

  const style = isNested ? {
    // Nested components use relative positioning
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  } : {
    // Top-level components use absolute positioning
    transform: CSS.Translate.toString(transform),
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    opacity: isDragging ? 0.5 : 1,
  }

  const componentStyle = {
    width: component.width ? `${component.width}px` : undefined,
    height: component.height ? `${component.height}px` : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isNested ? "relative group w-full" : "absolute group"}
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
        } ${showDropZone && isLayoutContainer(component.type) ? 'border-green-500 bg-green-50/20' : ''}`}
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

        {/* Actual component with droppable zone for layout containers */}
        <div 
          ref={isLayoutContainer(component.type) ? setDroppableRef : undefined}
          className="pointer-events-auto flex items-stretch" 
          style={componentStyle}
        >
          <div className="w-full h-full">
            {isLayoutContainer(component.type) && component.children && component.children.length > 0 ? (
              // Render children with special layout-aware rendering
              renderComponent(component, (children) => {
                // Different rendering based on layout type
                if (component.type === 'Container') {
                  return children.map((child) => (
                    <div key={child.id} className="mb-2 last:mb-0">
                      <DraggableComponent
                        component={child}
                        isSelected={child.id === selectedId}
                        selectedId={selectedId}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        isNested={true}
                      />
                    </div>
                  ))
                } else if (component.type === 'Grid') {
                  return children.map((child) => (
                    <div key={child.id}>
                      <DraggableComponent
                        component={child}
                        isSelected={child.id === selectedId}
                        selectedId={selectedId}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        isNested={true}
                      />
                    </div>
                  ))
                } else if (component.type === 'Stack') {
                  const stackProps = component.props as any
                  return children.map((child) => (
                    <div key={child.id} className={stackProps?.direction === 'horizontal' ? 'flex-shrink-0' : ''}>
                      <DraggableComponent
                        component={child}
                        isSelected={child.id === selectedId}
                        selectedId={selectedId}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        isNested={true}
                      />
                    </div>
                  ))
                }
                return null
              })
            ) : (
              renderComponent(component)
            )}
          </div>
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
  showGrid?: boolean
  gridSize?: number
}

export function DnDCanvas({ items, canvasRef, selectedId, onDelete, onSelect, showGrid = false, gridSize = 20 }: DnDCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
    data: {
      type: 'canvas',
    },
  })

  // Only render top-level items (items without a parentId)
  const topLevelItems = items.filter(item => !item.parentId)

  // Generate grid background style
  const gridStyle = showGrid ? {
    backgroundImage: `
      linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  } : {}

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
      style={gridStyle}
      onClick={() => onSelect(null)}
    >
      {topLevelItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg pointer-events-none">
          Drag UI components from the palette here
        </div>
      )}
      {topLevelItems.map((item) => (
        <DraggableComponent 
          key={item.id} 
          component={item} 
          isSelected={item.id === selectedId}
          selectedId={selectedId}
          onDelete={onDelete}
          onSelect={onSelect}
          isNested={false}
        />
      ))}
    </div>
  )
}


