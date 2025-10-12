import { useState, useRef, useEffect, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, Modifier } from '@dnd-kit/core'
import { DnDPalette } from './DnDPalette'
import { DnDCanvas } from './DnDCanvas'
import { PropertyPanel } from './PropertyPanel'
import { COMPONENT_REGISTRY, LAYOUT_REGISTRY } from './component-registry'
import type { ComponentInstance, EventHandler } from './types'
import { Button } from '@/components/ui/button'
import { Save, Home, Maximize2, Grid3x3, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { FullScreenPreview } from './FullScreenPreview'
import { CanvasPreview } from './CanvasPreview'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'

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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'static' | 'fullstack'>('static')
  const [exportDataStrategy, setExportDataStrategy] = useState<'snapshot' | 'live'>('snapshot')
  const [exporting, setExporting] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false)
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false)
  const nextIdRef = useRef(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Snap to grid utility function for final position calculations
  const snapToGridFn = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y }
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }

  // Create a custom snap-to-grid modifier that works with absolute positioning
  const createSnapToGridModifier = (gridSize: number): Modifier => {
    return ({ transform, active, draggingNodeRect }) => {
      if (!draggingNodeRect) {
        return transform
      }

      // Get the component's current position if it exists
      const activeData = active.data.current
      let baseX = 0
      let baseY = 0

      // For canvas items that already exist, get their base position
      if (activeData?.type === 'canvas-item') {
        const draggedId = active.id as string
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
        const component = findComponent(items)
        if (component && !component.parentId) {
          baseX = component.position.x
          baseY = component.position.y
        }
      }

      // Calculate the new absolute position
      const newX = baseX + transform.x
      const newY = baseY + transform.y

      // Snap to grid
      const snappedX = Math.round(newX / gridSize) * gridSize
      const snappedY = Math.round(newY / gridSize) * gridSize

      // Return the delta that will result in the snapped position
      return {
        ...transform,
        x: snappedX - baseX,
        y: snappedY - baseY,
      }
    }
  }

  // Create modifiers array based on snap settings
  const modifiers = useMemo(() => {
    if (!snapToGrid) return []
    return [createSnapToGridModifier(gridSize)]
  }, [snapToGrid, gridSize, items])

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

          // Apply snap to grid
          const snappedPosition = snapToGridFn(Math.max(0, dropX), Math.max(0, dropY))

          // Create new component instance with metadata and default props
          const newComponent: ComponentInstance = {
            id: `component-${nextIdRef.current++}`,
            type: dragData.componentType,
            label: dragData.label,
            position: snappedPosition,
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
              
              // Apply snap to grid
              const snappedPosition = snapToGridFn(Math.max(0, dropX), Math.max(0, dropY))
              
              let updated = removeComponent(items, draggedId)
              const topLevelComponent = {
                ...draggedComponent,
                parentId: undefined,
                position: snappedPosition
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
                const newX = Math.max(0, item.position.x + delta.x)
                const newY = Math.max(0, item.position.y + delta.y)
                const snappedPosition = snapToGridFn(newX, newY)
                
                return {
                  ...item,
                  position: snappedPosition,
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

  const handleExport = async () => {
    if (!projectId) {
      alert('Please save the project before exporting')
      return
    }

    setExporting(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/export?format=${exportFormat}&data_strategy=${exportDataStrategy}`,
        { method: 'POST' }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Set filename based on format
        const filename = exportFormat === 'static' 
          ? `${projectName || 'project'}.html`
          : `${projectName || 'project'}.zip`
        a.download = filename
        
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        setIsExportDialogOpen(false)
        console.log('Project exported successfully')
      } else {
        const error = await response.json()
        alert(`Export failed: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to export project:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
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
        
        <div className="flex items-center gap-4">
          {/* Grid Controls */}
          <div className="flex items-center gap-3 border-r border-slate-600 pr-4">
            <div className="flex items-center gap-2">
              <Toggle
                pressed={snapToGrid}
                onPressedChange={setSnapToGrid}
                variant="outline"
                size="sm"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 border-slate-500 bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="text-sm">Snap to Grid</span>
              </Toggle>
            </div>
            {snapToGrid && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Grid:</span>
                <Select 
                  value={gridSize.toString()} 
                  onValueChange={(value) => setGridSize(parseInt(value))}
                >
                  <SelectTrigger className="w-[80px] h-8 bg-slate-700 border-slate-600 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="25">25px</SelectItem>
                    <SelectItem value="30">30px</SelectItem>
                    <SelectItem value="40">40px</SelectItem>
                    <SelectItem value="50">50px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

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
            <>
              <Button
                onClick={() => setIsExportDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-green-500 bg-green-600 text-white hover:bg-green-700 hover:border-green-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={saveProject}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full flex gap-2">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={rectIntersection}
            modifiers={modifiers}
          >
            {/* Palette Sidebar */}
            <div className={`flex-shrink-0 transition-all duration-300 ${isPaletteCollapsed ? 'w-16' : 'w-64'}`}>
              <div className="relative h-full">
                <DnDPalette collapsed={isPaletteCollapsed} />
                <button
                  onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border-2 border-slate-300 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors z-10"
                  title={isPaletteCollapsed ? 'Expand Palette' : 'Collapse Palette'}
                >
                  {isPaletteCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                  )}
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 min-w-0 min-h-0 flex">
              <DnDCanvas
                items={items}
                canvasRef={canvasRef}
                selectedId={selectedComponentId}
                onDelete={handleDelete}
                onSelect={handleSelect}
                showGrid={snapToGrid}
                gridSize={gridSize}
              />
            </div>

            {/* Property Panel Sidebar */}
            {!isPropertiesCollapsed && (
              <div className="w-[345px] flex-shrink-0 transition-all duration-300">
                <div className="relative h-full">
                  <button
                    onClick={() => setIsPropertiesCollapsed(true)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border-2 border-slate-300 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors z-10"
                    title="Collapse Properties"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </button>
                  <PropertyPanel
                    component={selectedComponent || null}
                    propertySchema={selectedComponentDef?.propertySchema || []}
                    events={selectedComponentDef?.events || []}
                    onPropertyChange={handlePropertyChange}
                    onEventHandlerChange={handleEventHandlerChange}
                    onLayoutChange={handleLayoutChange}
                  />
                </div>
              </div>
            )}
            
            {/* Collapsed Properties Tab Button */}
            {isPropertiesCollapsed && (
              <button
                onClick={() => setIsPropertiesCollapsed(false)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-white border-2 border-r-0 border-slate-300 rounded-l-lg px-3 py-8 shadow-lg hover:bg-slate-50 transition-all hover:px-4 z-20 flex items-center justify-center"
                title="Properties"
              >
                <span className="text-sm font-bold text-slate-700">P</span>
              </button>
            )}

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

      {/* Export Dialog */}
      {isExportDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Export Project</h2>
              <p className="text-sm text-slate-600 mt-1">
                Create a distributable version of your application
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Export Format
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="format"
                      value="static"
                      checked={exportFormat === 'static'}
                      onChange={(e) => setExportFormat(e.target.value as 'static')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Static Bundle (HTML)</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Single HTML file that can be opened in any browser. Perfect for simple deployments to static hosts like Vercel, Netlify, or GitHub Pages.
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Recommended
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          No dependencies
                        </span>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="format"
                      value="fullstack"
                      checked={exportFormat === 'fullstack'}
                      onChange={(e) => setExportFormat(e.target.value as 'fullstack')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Full-Stack Package (ZIP)</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Complete application with frontend + backend + database connections. Includes Docker setup for easy deployment.
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Advanced
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Requires setup
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data Strategy */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Data Strategy
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="data"
                      value="snapshot"
                      checked={exportDataStrategy === 'snapshot'}
                      onChange={(e) => setExportDataStrategy(e.target.value as 'snapshot')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Snapshot Data</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Execute all queries now and embed current results. App works offline but data is static.
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Works offline
                        </span>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="data"
                      value="live"
                      checked={exportDataStrategy === 'live'}
                      onChange={(e) => setExportDataStrategy(e.target.value as 'live')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Live Queries</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Keep API calls to backend server. Data stays fresh but requires backend to be running.
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Dynamic data
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Requires backend
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800">
                      Export includes:
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>All components and their configurations</li>
                        <li>Event handlers and custom logic</li>
                        <li>Layout and styling</li>
                        <li>
                          {exportDataStrategy === 'snapshot' 
                            ? 'Current query results (static data)' 
                            : 'Query configurations (dynamic data)'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
                disabled={exporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

