import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { COMPONENT_REGISTRY, LAYOUT_REGISTRY, renderPalettePreview } from './component-registry'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { PaletteComponentDefinition } from './types'

interface ComponentPaletteItemProps {
  componentDef: PaletteComponentDefinition
  collapsed?: boolean
}

function ComponentPaletteItem({ componentDef, collapsed }: ComponentPaletteItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${componentDef.type}`,
    data: {
      type: 'palette-item',
      componentType: componentDef.type,
      label: componentDef.label,
      defaultProps: componentDef.defaultProps,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  if (collapsed) {
    // Icon-only view when collapsed
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-white border border-slate-300 rounded-md cursor-grab active:cursor-grabbing flex items-center justify-center p-2 select-none hover:bg-slate-50 hover:border-slate-400 transition-all"
        title={`Drag ${componentDef.label} to canvas`}
      >
        {componentDef.icon}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-slate-300 rounded-md cursor-grab active:cursor-grabbing flex items-center justify-start px-2 py-1.5 select-none hover:bg-slate-50 hover:border-slate-400 transition-all"
      title={`Drag ${componentDef.label} to canvas`}
    >
      {renderPalettePreview(componentDef)}
    </div>
  )
}

interface DnDPaletteProps {
  collapsed?: boolean
}

export function DnDPalette({ collapsed = false }: DnDPaletteProps) {
  if (collapsed) {
    // Compact view when collapsed - vertical icon strip
    return (
      <div className="bg-white rounded-xl shadow-lg p-2 border-2 border-slate-300 h-full overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {/* Show all components in a single column */}
          {COMPONENT_REGISTRY.map((componentDef) => (
            <ComponentPaletteItem key={componentDef.type} componentDef={componentDef} collapsed={true} />
          ))}
          <div className="border-t border-slate-300 my-1" />
          {LAYOUT_REGISTRY.map((componentDef) => (
            <ComponentPaletteItem key={componentDef.type} componentDef={componentDef} collapsed={true} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-slate-300 h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-700 mb-3">Palette</h2>
      <Tabs defaultValue="components" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
          <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="mt-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-1.5">
            {COMPONENT_REGISTRY.map((componentDef) => (
              <ComponentPaletteItem key={componentDef.type} componentDef={componentDef} collapsed={false} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="layout" className="mt-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-1.5">
            {LAYOUT_REGISTRY.map((componentDef) => (
              <ComponentPaletteItem key={componentDef.type} componentDef={componentDef} collapsed={false} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-xs text-slate-500 mt-3 text-center flex-shrink-0">
        Drag to canvas
      </p>
    </div>
  )
}

