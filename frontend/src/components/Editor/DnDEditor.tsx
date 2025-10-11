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

  // Get selected component data
  const selectedComponent = selectedComponentId
    ? items.find((item) => item.id === selectedComponentId)
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

