import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { COMPONENT_REGISTRY, renderPalettePreview } from './component-registry'
import type { PaletteComponentDefinition } from './types'

interface ComponentPaletteItemProps {
  componentDef: PaletteComponentDefinition
}

function ComponentPaletteItem({ componentDef }: ComponentPaletteItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border-2 border-slate-300 rounded-lg shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center p-3 select-none hover:shadow-lg hover:border-slate-400 transition-all"
      title={`Drag ${componentDef.label} to canvas`}
    >
      {renderPalettePreview(componentDef)}
    </div>
  )
}

export function DnDPalette() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-300">
      <h2 className="text-lg font-bold text-slate-700 mb-4">UI Components</h2>
      <div className="grid grid-cols-1 gap-3">
        {COMPONENT_REGISTRY.map((componentDef) => (
          <ComponentPaletteItem key={componentDef.type} componentDef={componentDef} />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">
        Drag components to canvas
      </p>
    </div>
  )
}

