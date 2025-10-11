import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { 
  ComponentInstance, 
  PropertyDefinition, 
  PropertyCategory,
  EventHandler 
} from './types'

interface PropertyPanelProps {
  component: ComponentInstance | null
  propertySchema: PropertyDefinition[]
  events?: string[]
  onPropertyChange: (key: string, value: any) => void
  onEventHandlerChange: (eventName: string, handler: EventHandler) => void
  onLayoutChange: (updates: { width?: number; height?: number; position?: { x: number; y: number } }) => void
}

export function PropertyPanel({
  component,
  propertySchema,
  events = [],
  onPropertyChange,
  onEventHandlerChange,
  onLayoutChange,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<PropertyCategory>('data')

  if (!component) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-lg p-6 border-2 border-slate-300">
        <div className="text-center text-slate-400 mt-20">
          <p className="text-lg font-medium">No component selected</p>
          <p className="text-sm mt-2">Select a component on the canvas to edit its properties</p>
        </div>
      </div>
    )
  }

  // Group properties by category
  const propertiesByCategory = propertySchema.reduce((acc, prop) => {
    if (!acc[prop.category]) {
      acc[prop.category] = []
    }
    acc[prop.category].push(prop)
    return acc
  }, {} as Record<PropertyCategory, PropertyDefinition[]>)

  // Add layout properties (common to all components)
  const layoutProperties: PropertyDefinition[] = [
    {
      key: 'position.x',
      label: 'X Position',
      category: 'layout',
      editorType: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      key: 'position.y',
      label: 'Y Position',
      category: 'layout',
      editorType: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      key: 'width',
      label: 'Width',
      category: 'layout',
      editorType: 'number',
      min: 50,
      placeholder: 'auto',
    },
    {
      key: 'height',
      label: 'Height',
      category: 'layout',
      editorType: 'number',
      min: 20,
      placeholder: 'auto',
    },
  ]

  if (!propertiesByCategory.layout) {
    propertiesByCategory.layout = []
  }
  propertiesByCategory.layout.push(...layoutProperties)

  // Categories to show tabs for
  const categories: Array<{ key: PropertyCategory; label: string }> = [
    { key: 'data', label: 'Data' },
    { key: 'methods', label: 'Methods' },
    { key: 'layout', label: 'Layout' },
    { key: 'style', label: 'Style' },
  ]

  const renderPropertyEditor = (prop: PropertyDefinition) => {
    const currentValue = getNestedValue(component, prop.key)

    switch (prop.editorType) {
      case 'text':
      case 'textarea':
        return (
          <Input
            type="text"
            value={currentValue || ''}
            onChange={(e) => onPropertyChange(prop.key, e.target.value)}
            placeholder={prop.placeholder}
            disabled={prop.disabled}
            className="w-full"
          />
        )

      case 'number':
      case 'slider':
        return (
          <Input
            type="number"
            value={currentValue ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : Number(e.target.value)
              if (prop.key.startsWith('position.')) {
                const axis = prop.key.split('.')[1] as 'x' | 'y'
                onLayoutChange({ position: { ...component.position, [axis]: value || 0 } })
              } else if (prop.key === 'width' || prop.key === 'height') {
                onLayoutChange({ [prop.key]: value })
              } else {
                onPropertyChange(prop.key, value)
              }
            }}
            min={prop.min}
            max={prop.max}
            step={prop.step}
            placeholder={prop.placeholder}
            disabled={prop.disabled}
            className="w-full"
          />
        )

      case 'select':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => onPropertyChange(prop.key, value)}
            disabled={prop.disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={prop.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) => onPropertyChange(prop.key, e.target.checked)}
              disabled={prop.disabled}
              className="w-4 h-4"
            />
            <span className="text-sm">Enabled</span>
          </label>
        )

      case 'json':
        return (
          <textarea
            value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                onPropertyChange(prop.key, parsed)
              } catch {
                // Invalid JSON, don't update
              }
            }}
            placeholder={prop.placeholder || '[]'}
            disabled={prop.disabled}
            className="w-full min-h-[100px] p-2 border rounded font-mono text-sm"
          />
        )

      case 'code':
        return (
          <textarea
            value={currentValue || ''}
            onChange={(e) => onPropertyChange(prop.key, e.target.value)}
            placeholder={prop.placeholder || '// Enter code...'}
            disabled={prop.disabled}
            className="w-full min-h-[150px] p-2 border rounded font-mono text-sm bg-slate-50"
          />
        )

      default:
        return <div className="text-xs text-slate-400">Unsupported editor type</div>
    }
  }

  const renderEventHandlers = () => {
    if (events.length === 0) {
      return <div className="text-sm text-slate-400">No events available</div>
    }

    return (
      <div className="space-y-4">
        {events.map((eventName) => {
          const handler = component.eventHandlers?.[eventName]
          return (
            <div key={eventName} className="border rounded-lg p-3 bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {eventName}
              </label>
              <textarea
                value={handler?.code || ''}
                onChange={(e) => {
                  onEventHandlerChange(eventName, {
                    name: eventName,
                    code: e.target.value,
                  })
                }}
                placeholder={`// ${eventName} handler\nconsole.log('${eventName} triggered')`}
                className="w-full min-h-[100px] p-2 border rounded font-mono text-xs bg-white"
              />
              <p className="text-xs text-slate-500 mt-1">
                Available: event, component
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  const renderCategoryContent = (category: PropertyCategory) => {
    if (category === 'methods') {
      return (
        <div className="space-y-4">
          {renderEventHandlers()}
        </div>
      )
    }

    const properties = propertiesByCategory[category] || []
    if (properties.length === 0) {
      return (
        <div className="text-sm text-slate-400 text-center py-8">
          No {category} properties available
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {properties.map((prop) => (
          <div key={prop.key} className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              {prop.label}
            </label>
            {renderPropertyEditor(prop)}
            {prop.description && (
              <p className="text-xs text-slate-500">{prop.description}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg border-2 border-slate-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-slate-700">{component.label}</h2>
        <p className="text-xs text-slate-500">ID: {component.id}</p>
      </div>

      {/* Property Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PropertyCategory)} className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-4 m-2">
            {categories.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key} className="flex-1 p-4">
              {renderCategoryContent(cat.key)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

// Helper to get nested property values (e.g., "position.x")
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }
  return value
}

