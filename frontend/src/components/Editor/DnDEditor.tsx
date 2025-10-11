import { useState, useRef, useEffect } from 'react'
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
import { COMPONENT_REGISTRY, LAYOUT_REGISTRY } from './component-registry'
import type { ComponentInstance, EventHandler } from './types'
import { Button } from '@/components/ui/button'
import { Save, Home, Maximize2 } from 'lucide-react'
import { FullScreenPreview } from './FullScreenPreview'
import { CanvasPreview } from './CanvasPreview'

interface DnDEditorProps {
  projectId?: string
  projectName?: string
  onNavigate?: (path: string) => void
}

export function DnDEditor({ projectId, projectName, onNavigate }: DnDEditorProps) {
  const [items, setItems] = useState<ComponentInstance[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<any>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const nextIdRef = useRef(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Load project data if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProject(projectId)
    }
  }, [projectId])

  const loadProject = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${id}`)
      if (response.ok) {
        const project = await response.json()
        setItems(project.components || [])
        
        // Update nextIdRef based on existing component IDs
        const maxId = project.components.reduce((max: number, component: ComponentInstance) => {
          const idNum = parseInt(component.id.replace('component-', ''))
          return isNaN(idNum) ? max : Math.max(max, idNum)
        }, 0)
        nextIdRef.current = maxId + 1
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  const saveProject = async () => {
    if (!projectId) {
      console.warn('No project ID to save to')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components: items }),
      })

      if (response.ok) {
        setLastSaved(new Date())
        console.log('Project saved successfully')
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setSaving(false)
    }
  }

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

    console.log('Drag end:', { activeId: active.id, overId: over?.id, overData: over?.data.current, delta })

    const dragData = active.data.current
    const overData = over?.data.current

    // Helper to check if a component is a descendant of another
    const isDescendantOf = (items: ComponentInstance[], componentId: string, potentialAncestorId: string): boolean => {
      const findComponent = (items: ComponentInstance[], id: string): ComponentInstance | null => {
        for (const item of items) {
          if (item.id === id) return item
          if (item.children) {
            const found = findComponent(item.children, id)
            if (found) return found
          }
        }
        return null
      }

      const checkDescendants = (component: ComponentInstance): boolean => {
        if (component.id === potentialAncestorId) return true
        if (component.children) {
          return component.children.some(child => checkDescendants(child))
        }
        return false
      }

      const component = findComponent(items, componentId)
      return component ? checkDescendants(component) : false
    }

    // Helper to add child to container
    const addChildToContainer = (items: ComponentInstance[], containerId: string, child: ComponentInstance): ComponentInstance[] => {
      return items.map(item => {
        if (item.id === containerId) {
          // Create the child with updated parentId and position, preserving all other properties including nested children
          const childToAdd = {
            ...child,
            parentId: containerId,
            position: { x: 0, y: 0 },
            children: child.children || [] // Explicitly preserve children if it's a layout container
          }
          return {
            ...item,
            children: [...(item.children || []), childToAdd]
          }
        }
        // Recursively check nested children
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: addChildToContainer(item.children, containerId, child)
          }
        }
        return item
      })
    }

    // Helper to remove component from its current location
    const removeComponent = (items: ComponentInstance[], componentId: string): ComponentInstance[] => {
      return items.filter(item => item.id !== componentId).map(item => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: removeComponent(item.children, componentId)
          }
        }
        return item
      })
    }

    // Check if dropped on a layout container
    if (overData?.type === 'layout-container' && overData?.containerId) {
      const containerId = overData.containerId
      
      // Prevent dropping a component onto itself
      if (active.id === containerId) {
        console.log('Cannot drop component onto itself')
        setActiveId(null)
        setActiveDragData(null)
        return
      }

      // Prevent circular nesting (dropping a container into one of its own descendants)
      if (dragData?.type === 'canvas-item' && isDescendantOf(items, active.id as string, containerId)) {
        console.log('Cannot create circular nesting - container would be nested inside its own child')
        setActiveId(null)
        setActiveDragData(null)
        return
      }

      // If dragging from palette, create new component and add to container
      if (dragData?.type === 'palette-item') {
        const newComponent: ComponentInstance = {
          id: `component-${nextIdRef.current++}`,
          type: dragData.componentType,
          label: dragData.label,
          position: { x: 0, y: 0 },
          props: dragData.defaultProps,
          parentId: containerId,
        } as ComponentInstance

        setItems((prev) => {
          const updated = addChildToContainer(prev, containerId, newComponent)
          console.log('Added component to container:', newComponent, 'Container:', containerId)
          console.log('Updated items:', updated)
          return updated
        })
      }
      // If dragging existing component, move it to container
      else if (dragData?.type === 'canvas-item') {
        const draggedId = active.id as string
        setItems((prev) => {
          // Find the dragged component
          const findComponent = (items: ComponentInstance[]): ComponentInstance | null => {
            for (const item of items) {
              if (item.id === draggedId) return item
              if (item.children) {
                const found = findComponent(item.children)
                if (found) return found
              }
            }
            return null
          }

          const draggedComponent = findComponent(prev)
          if (!draggedComponent) return prev

          // Remove from current location and add to new container
          console.log('Moving component:', draggedComponent, 'to container:', containerId)
          let updated = removeComponent(prev, draggedId)
          console.log('After remove:', updated)
          updated = addChildToContainer(updated, containerId, draggedComponent)
          console.log('After add to container:', updated)
          return updated
        })
      }
    }
    // Check if dropped on canvas
    else if (over?.id === 'canvas' || overData?.type === 'canvas') {
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

          setItems((prev) => {
            const updated = [...prev, newComponent]
          console.log('Created new component:', newComponent)
            console.log('Total items:', updated.length)
            return updated
          })
        }
      }
      // If dragging existing canvas component, update position
      else if (dragData?.type === 'canvas-item') {
        const draggedId = active.id as string
        setItems((items) => {
          // If component is nested, we need to move it to top-level
          const findComponent = (items: ComponentInstance[]): ComponentInstance | null => {
            for (const item of items) {
              if (item.id === draggedId) return item
              if (item.children) {
                const found = findComponent(item.children)
                if (found) return found
              }
            }
            return null
          }

          const draggedComponent = findComponent(items)
          if (!draggedComponent) return items

          // If was nested, remove from parent and add to top-level with proper position
          if (draggedComponent.parentId) {
            const canvasBounds = canvasRef.current?.getBoundingClientRect()
            if (canvasBounds && activatorEvent instanceof PointerEvent) {
              // Calculate actual drop position on canvas
              const dropX = activatorEvent.clientX + delta.x - canvasBounds.left
              const dropY = activatorEvent.clientY + delta.y - canvasBounds.top
              
              let updated = removeComponent(items, draggedId)
              const topLevelComponent = {
                ...draggedComponent,
                parentId: undefined,
                position: {
                  x: Math.max(0, dropX),
                  y: Math.max(0, dropY),
                }
              }
              return [...updated, topLevelComponent]
            } else {
              // Fallback if we can't get bounds (shouldn't happen)
              let updated = removeComponent(items, draggedId)
              const topLevelComponent = {
                ...draggedComponent,
                parentId: undefined,
                position: { x: 100, y: 100 }
              }
              return [...updated, topLevelComponent]
            }
          }

          // Otherwise just update position
          const updatePosition = (items: ComponentInstance[]): ComponentInstance[] => {
            return items.map((item) => {
              if (item.id === draggedId) {
                return {
                  ...item,
                  position: {
                    x: Math.max(0, item.position.x + delta.x),
                    y: Math.max(0, item.position.y + delta.y),
                  },
                  // Explicitly preserve children to avoid any spread issues
                  children: item.children,
                }
              }
              // Recursively check children in case we're updating a nested component
              if (item.children && item.children.length > 0) {
                return {
                  ...item,
                  children: updatePosition(item.children)
                }
              }
              return item
            })
          }
          
          const updated = updatePosition(items)
          console.log('Updated position for component:', draggedId)
          console.log('Items after position update:', updated)
          return updated
        })
      }
    } else {
      console.log('Not dropped on canvas or container, over:', over)
    }

    setActiveId(null)
    setActiveDragData(null)
  }

  const handleDelete = (id: string) => {
    // Recursively delete component and its children
    const removeComponent = (items: ComponentInstance[], componentId: string): ComponentInstance[] => {
      return items.filter(item => item.id !== componentId).map(item => {
        if (item.children) {
          return {
            ...item,
            children: removeComponent(item.children, componentId)
          }
        }
        return item
      })
    }

    setItems((items) => removeComponent(items, id))
    if (selectedComponentId === id) {
      setSelectedComponentId(null)
    }
  }

  const handleSelect = (id: string | null) => {
    setSelectedComponentId(id)
  }

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedComponentId) return

    // Recursively update component properties (works for nested and top-level)
    const updateComponentProps = (items: ComponentInstance[]): ComponentInstance[] => {
      return items.map((item) => {
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
        // Recursively check children
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateComponentProps(item.children)
          }
        }
        return item
      })
    }

    setItems((items) => updateComponentProps(items))
  }

  const handleEventHandlerChange = (eventName: string, handler: EventHandler) => {
    if (!selectedComponentId) return

    // Recursively update event handlers (works for nested and top-level)
    const updateEventHandlers = (items: ComponentInstance[]): ComponentInstance[] => {
      return items.map((item) => {
        if (item.id === selectedComponentId) {
          return {
              ...item,
              eventHandlers: {
                ...item.eventHandlers,
                [eventName]: handler,
              },
            }
        }
        // Recursively check children
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateEventHandlers(item.children)
          }
        }
        return item
      })
    }

    setItems((items) => updateEventHandlers(items))
  }

  const handleLayoutChange = (updates: {
    width?: number
    height?: number
    position?: { x: number; y: number }
  }) => {
    if (!selectedComponentId) return

    // Recursively update layout (works for nested and top-level)
    const updateLayout = (items: ComponentInstance[]): ComponentInstance[] => {
      return items.map((item) => {
        if (item.id === selectedComponentId) {
          return {
              ...item,
              ...updates,
            }
        }
        // Recursively check children
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateLayout(item.children)
          }
        }
        return item
      })
    }

    setItems((items) => updateLayout(items))
  }

  const handlePreviewPositionChange = (id: string, position: { x: number; y: number }) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              position,
            }
          : item
      )
    )
  }

  // Get selected component data (search recursively for nested components)
  const findComponentById = (items: ComponentInstance[], id: string): ComponentInstance | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findComponentById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedComponent = selectedComponentId
    ? findComponentById(items, selectedComponentId)
    : null

  const selectedComponentDef = selectedComponent
    ? [...COMPONENT_REGISTRY, ...LAYOUT_REGISTRY].find((def) => def.type === selectedComponent.type)
    : null

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {onNavigate && (
            <Button
              onClick={() => onNavigate('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold">
              {projectName || 'Untitled Project'}
            </h1>
            {lastSaved && (
              <p className="text-xs text-slate-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
            size="sm"
            className="border-slate-500 bg-slate-700 text-white hover:bg-slate-600 hover:border-slate-400"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          {projectId && (
            <Button
              onClick={saveProject}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-hidden">
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

      {/* Full Screen Preview */}
      <FullScreenPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Preview: ${projectName || 'Untitled Project'}`}
      >
        <CanvasPreview 
          items={items} 
          onPositionChange={handlePreviewPositionChange}
        />
      </FullScreenPreview>
    </div>
  )
}

