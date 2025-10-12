import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormattingRuleManager } from './FormattingRuleManager'
import { ColumnConfigManager } from './ColumnConfigManager'
import { QueryTreeSelect } from './QueryTreeSelect'
import type { 
  ComponentInstance, 
  PropertyDefinition, 
  PropertyCategory,
  EventHandler,
  TableProps,
  FormattingRule,
  ColumnConfig,
} from './types'

const API_BASE = 'http://localhost:8000'

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
  const [jsonEditorValues, setJsonEditorValues] = useState<Record<string, string>>({})
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({})
  const [availableColumns, setAvailableColumns] = useState<string[]>([])

  // Fetch available columns for table components
  useEffect(() => {
    if (component?.type === 'Table') {
      fetchTableColumns()
    }
  }, [component])

  const fetchTableColumns = async () => {
    if (component?.type !== 'Table') return

    const tableProps = (component as any).props as TableProps
    
    try {
      // Try to fetch from query
      if (tableProps.dataSourceType === 'query' && tableProps.queryId) {
        const response = await fetch(`${API_BASE}/api/queries/${tableProps.queryId}/execute`)
        const result = await response.json()
        if (result.columns) {
          setAvailableColumns(result.columns.map((c: any) => c.key))
          return
        }
      }
      
      // Try to fetch from URL
      if (tableProps.dataSourceType === 'url' && tableProps.dataSource) {
        const response = await fetch(tableProps.dataSource)
        const result = await response.json()
        const data = Array.isArray(result) ? result : result.data
        if (data && data.length > 0) {
          setAvailableColumns(Object.keys(data[0]))
          return
        }
      }
      
      // Use static data
      if (tableProps.dataSourceType === 'static' && tableProps.data && tableProps.data.length > 0) {
        setAvailableColumns(Object.keys(tableProps.data[0]))
        return
      }
    } catch (error) {
      console.error('Error fetching table columns:', error)
    }
    
    setAvailableColumns([])
  }

  if (!component) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg p-6 border-2 border-slate-300">
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
          <div className="flex items-center gap-3">
            <Switch
              checked={!!currentValue}
              onCheckedChange={(checked) => onPropertyChange(prop.key, checked)}
              disabled={prop.disabled}
            />
            <span className="text-sm text-slate-600">
              {currentValue ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      case 'json': {
        // Use local state for JSON editing to allow intermediate invalid states
        const editorKey = `${component.id}-${prop.key}`
        const editorValue = jsonEditorValues[editorKey] ?? 
          (typeof currentValue === 'object' && currentValue !== null 
            ? JSON.stringify(currentValue, null, 2) 
            : '')
        
        return (
          <div className="space-y-1">
            <textarea
              value={editorValue}
              onChange={(e) => {
                const newValue = e.target.value
                setJsonEditorValues({ ...jsonEditorValues, [editorKey]: newValue })
                
                // Try to parse and update if valid
                if (newValue.trim() === '') {
                  // Empty value is valid - clear the data
                  onPropertyChange(prop.key, undefined)
                  setJsonErrors({ ...jsonErrors, [editorKey]: '' })
                } else {
                  try {
                    const parsed = JSON.parse(newValue)
                    onPropertyChange(prop.key, parsed)
                    setJsonErrors({ ...jsonErrors, [editorKey]: '' })
                  } catch (err) {
                    // Store error but allow typing to continue
                    setJsonErrors({ 
                      ...jsonErrors, 
                      [editorKey]: err instanceof Error ? err.message : 'Invalid JSON'
                    })
                  }
                }
              }}
              onBlur={() => {
                // On blur, try to format if valid
                if (!jsonErrors[editorKey] && editorValue.trim()) {
                  try {
                    const parsed = JSON.parse(editorValue)
                    const formatted = JSON.stringify(parsed, null, 2)
                    setJsonEditorValues({ ...jsonEditorValues, [editorKey]: formatted })
                  } catch {
                    // Ignore formatting errors
                  }
                }
              }}
              placeholder={prop.placeholder || '[]'}
              disabled={prop.disabled}
              className={`w-full min-h-[100px] p-2 border rounded font-mono text-sm ${
                jsonErrors[editorKey] ? 'border-red-300 bg-red-50' : 'bg-slate-50'
              }`}
            />
            {jsonErrors[editorKey] && (
              <p className="text-xs text-red-600">{jsonErrors[editorKey]}</p>
            )}
          </div>
        )
      }

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

      case 'query-select':
        return (
          <QueryTreeSelect
            value={currentValue}
            onChange={(value) => {
              onPropertyChange(prop.key, value)
              // Refresh columns when query changes
              setTimeout(() => fetchTableColumns(), 500)
            }}
            disabled={prop.disabled}
            placeholder={prop.placeholder || 'Select a query...'}
          />
        )

      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={currentValue || '#ffffff'}
              onChange={(e) => onPropertyChange(prop.key, e.target.value)}
              className="w-16 h-9 p-1"
            />
            <Input
              type="text"
              value={currentValue || ''}
              onChange={(e) => onPropertyChange(prop.key, e.target.value)}
              placeholder={prop.placeholder || '#ffffff'}
              className="flex-1"
            />
          </div>
        )

      case 'formatting-rules':
        return (
          <FormattingRuleManager
            rules={(currentValue as FormattingRule[]) || []}
            columns={availableColumns}
            onChange={(rules) => onPropertyChange(prop.key, rules)}
          />
        )

      case 'column-config':
        return (
          <ColumnConfigManager
            columns={(currentValue as ColumnConfig[]) || []}
            availableColumns={availableColumns}
            onChange={(columns) => onPropertyChange(prop.key, columns)}
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

  const isPropertyVisible = (prop: PropertyDefinition): boolean => {
    // If no visibility condition, always show
    if (!prop.visibleWhen) {
      return true
    }

    // Check if the condition is met
    const conditionValue = getNestedValue(component, prop.visibleWhen.key)
    return conditionValue === prop.visibleWhen.value
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
    const visibleProperties = properties.filter(isPropertyVisible)
    
    if (visibleProperties.length === 0) {
      return (
        <div className="text-sm text-slate-400 text-center py-8">
          No {category} properties available
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {visibleProperties.map((prop) => (
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
    <div className="w-full bg-white rounded-xl shadow-lg border-2 border-slate-300 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-700 truncate">{component.label}</h2>
        <p className="text-xs text-slate-500 truncate">ID: {component.id}</p>
      </div>

      {/* Property Tabs */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PropertyCategory)} className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-4 m-2 flex-shrink-0">
            {categories.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key} className="flex-1 p-4 overflow-y-auto">
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
  // Handle special base properties (position, width, height, eventHandlers)
  if (path.startsWith('position.') || path.startsWith('eventHandlers.')) {
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
  
  // Handle width, height directly on component
  if (path === 'width' || path === 'height') {
    return obj[path]
  }
  
  // All other properties are in component.props
  if (path.includes('.')) {
    const keys = path.split('.')
    let value = obj.props
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    return value
  }
  
  // Simple property name - look in props
  return obj.props?.[path]
}

