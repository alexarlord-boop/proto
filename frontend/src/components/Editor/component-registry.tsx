import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  ComponentInstance,
  ButtonProps,
  InputProps,
  TabsProps,
  SelectProps,
  TableProps,
  ContainerProps,
  GridProps,
  StackProps,
  PaletteComponentDefinition,
} from './types'

// Simple SVG icons for components
const ButtonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="5" width="12" height="6" rx="2" />
  </svg>
)

const InputIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="6" width="12" height="4" rx="1" />
    <line x1="4" y1="8" x2="10" y2="8" />
  </svg>
)

const TabsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 6h3v-2h3v2h3v-2h3v10H2z" />
  </svg>
)

const SelectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="5" width="12" height="6" rx="1" />
    <path d="M6 8l2 2 2-2" />
  </svg>
)

const TableIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <line x1="2" y1="6" x2="14" y2="6" />
    <line x1="8" y1="6" x2="8" y2="13" />
  </svg>
)

const ContainerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="10" height="10" rx="1" strokeDasharray="2 2" />
  </svg>
)

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="5" height="5" rx="0.5" />
    <rect x="9" y="2" width="5" height="5" rx="0.5" />
    <rect x="2" y="9" width="5" height="5" rx="0.5" />
    <rect x="9" y="9" width="5" height="5" rx="0.5" />
  </svg>
)

const StackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="10" height="2.5" rx="0.5" />
    <rect x="3" y="6.5" width="10" height="2.5" rx="0.5" />
    <rect x="3" y="10" width="10" height="2.5" rx="0.5" />
  </svg>
)

// Registry of available components for the palette
export const COMPONENT_REGISTRY: PaletteComponentDefinition[] = [
  {
    type: 'Button',
    label: 'Button',
    icon: <ButtonIcon />,
    defaultProps: {
      text: 'Click me',
      variant: 'default' as const,
      size: 'default' as const,
      disabled: false,
    } as ButtonProps,
    propertySchema: [
      {
        key: 'text',
        label: 'Button Text',
        category: 'data',
        editorType: 'text',
        defaultValue: 'Click me',
        placeholder: 'Enter button text',
        description: 'The text displayed on the button',
      },
      {
        key: 'variant',
        label: 'Variant',
        category: 'style',
        editorType: 'select',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'destructive', label: 'Destructive' },
          { value: 'outline', label: 'Outline' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'link', label: 'Link' },
        ],
        description: 'Visual style of the button',
      },
      {
        key: 'size',
        label: 'Size',
        category: 'style',
        editorType: 'select',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'sm', label: 'Small' },
          { value: 'lg', label: 'Large' },
          { value: 'icon', label: 'Icon' },
        ],
        description: 'Size of the button',
      },
      {
        key: 'disabled',
        label: 'Disabled',
        category: 'data',
        editorType: 'boolean',
        defaultValue: false,
        description: 'Whether the button is disabled',
      },
    ],
    events: ['onClick', 'onMouseEnter', 'onMouseLeave'],
  },
  {
    type: 'Input',
    label: 'Input',
    icon: <InputIcon />,
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text' as const,
      disabled: false,
    } as InputProps,
    propertySchema: [
      {
        key: 'placeholder',
        label: 'Placeholder',
        category: 'data',
        editorType: 'text',
        defaultValue: 'Enter text...',
        placeholder: 'Placeholder text',
        description: 'Placeholder text shown when input is empty',
      },
      {
        key: 'type',
        label: 'Input Type',
        category: 'data',
        editorType: 'select',
        defaultValue: 'text',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'email', label: 'Email' },
          { value: 'password', label: 'Password' },
          { value: 'number', label: 'Number' },
        ],
        description: 'Type of input field',
      },
      {
        key: 'defaultValue',
        label: 'Default Value',
        category: 'data',
        editorType: 'text',
        placeholder: 'Default value',
        description: 'Initial value of the input',
      },
      {
        key: 'disabled',
        label: 'Disabled',
        category: 'data',
        editorType: 'boolean',
        defaultValue: false,
        description: 'Whether the input is disabled',
      },
    ],
    events: ['onChange', 'onFocus', 'onBlur'],
  },
  {
    type: 'Tabs',
    label: 'Tabs',
    icon: <TabsIcon />,
    defaultProps: {
      tabs: [
        { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
        { value: 'tab2', label: 'Tab 2', content: 'Content 2' },
        { value: 'tab3', label: 'Tab 3', content: 'Content 3' },
      ],
      defaultValue: 'tab1',
    } as TabsProps,
    propertySchema: [
      {
        key: 'tabs',
        label: 'Tabs Configuration',
        category: 'data',
        editorType: 'json',
        defaultValue: [
          { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
          { value: 'tab2', label: 'Tab 2', content: 'Content 2' },
        ],
        placeholder: '[{"value": "tab1", "label": "Tab 1", "content": "Content 1"}]',
        description: 'Array of tab configurations with value, label, and content',
      },
      {
        key: 'defaultValue',
        label: 'Default Tab',
        category: 'data',
        editorType: 'text',
        placeholder: 'tab1',
        description: 'The tab value to show by default',
      },
    ],
    events: ['onValueChange'],
  },
  {
    type: 'Select',
    label: 'Select',
    icon: <SelectIcon />,
    defaultProps: {
      placeholder: 'Select an option',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      disabled: false,
    } as SelectProps,
    propertySchema: [
      {
        key: 'placeholder',
        label: 'Placeholder',
        category: 'data',
        editorType: 'text',
        defaultValue: 'Select an option',
        placeholder: 'Placeholder text',
        description: 'Placeholder text shown when nothing is selected',
      },
      {
        key: 'options',
        label: 'Options',
        category: 'data',
        editorType: 'json',
        defaultValue: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
        placeholder: '[{"value": "opt1", "label": "Option 1"}]',
        description: 'Array of options with value and label',
      },
      {
        key: 'defaultValue',
        label: 'Default Value',
        category: 'data',
        editorType: 'text',
        placeholder: 'option1',
        description: 'The option value to select by default',
      },
      {
        key: 'disabled',
        label: 'Disabled',
        category: 'data',
        editorType: 'boolean',
        defaultValue: false,
        description: 'Whether the select is disabled',
      },
    ],
    events: ['onValueChange'],
  },
  {
    type: 'Table',
    label: 'Table',
    icon: <TableIcon />,
    defaultProps: {
      dataSourceType: 'query',
      striped: true,
      bordered: true,
    } as TableProps,
    propertySchema: [
      {
        key: 'dataSourceType',
        label: 'Data Source Type',
        category: 'data',
        editorType: 'select',
        defaultValue: 'query',
        options: [
          { value: 'query', label: 'SQL Query' },
          { value: 'url', label: 'URL/API Endpoint' },
          { value: 'static', label: 'Static Data' },
        ],
        description: 'Type of data source for the table',
      },
      {
        key: 'queryId',
        label: 'SQL Query',
        category: 'data',
        editorType: 'query-select',
        placeholder: 'Select a saved query',
        description: 'Select a saved SQL query to populate the table',
        visibleWhen: {
          key: 'dataSourceType',
          value: 'query',
        },
      },
      {
        key: 'dataSource',
        label: 'API Endpoint URL',
        category: 'data',
        editorType: 'text',
        placeholder: 'https://api.example.com/data',
        description: 'API endpoint that returns JSON data',
        visibleWhen: {
          key: 'dataSourceType',
          value: 'url',
        },
      },
      {
        key: 'data',
        label: 'Static Data',
        category: 'data',
        editorType: 'json',
        placeholder: '[{"id": 1, "name": "Item"}]',
        description: 'JSON array of data. Columns will be auto-detected.',
        visibleWhen: {
          key: 'dataSourceType',
          value: 'static',
        },
      },
      {
        key: 'striped',
        label: 'Striped Rows',
        category: 'style',
        editorType: 'boolean',
        defaultValue: true,
        description: 'Alternate row colors',
      },
      {
        key: 'bordered',
        label: 'Bordered',
        category: 'style',
        editorType: 'boolean',
        defaultValue: true,
        description: 'Show borders around cells',
      },
    ],
    events: ['onRowClick'],
  },
]

// Layout components registry
export const LAYOUT_REGISTRY: PaletteComponentDefinition[] = [
  {
    type: 'Container',
    label: 'Container',
    icon: <ContainerIcon />,
    defaultProps: {
      padding: '16px',
      backgroundColor: 'transparent',
    },
    propertySchema: [
      {
        key: 'padding',
        label: 'Padding',
        category: 'layout',
        editorType: 'text',
        defaultValue: '16px',
        placeholder: '16px',
        description: 'Padding inside the container',
      },
      {
        key: 'backgroundColor',
        label: 'Background',
        category: 'style',
        editorType: 'text',
        defaultValue: 'transparent',
        placeholder: '#ffffff',
        description: 'Background color',
      },
    ],
    events: [],
  },
  {
    type: 'Grid',
    label: 'Grid',
    icon: <GridIcon />,
    defaultProps: {
      columns: 2,
      gap: '16px',
    },
    propertySchema: [
      {
        key: 'columns',
        label: 'Columns',
        category: 'layout',
        editorType: 'number',
        defaultValue: 2,
        min: 1,
        max: 12,
        description: 'Number of columns',
      },
      {
        key: 'gap',
        label: 'Gap',
        category: 'layout',
        editorType: 'text',
        defaultValue: '16px',
        placeholder: '16px',
        description: 'Space between items',
      },
    ],
    events: [],
  },
  {
    type: 'Stack',
    label: 'Stack',
    icon: <StackIcon />,
    defaultProps: {
      direction: 'vertical',
      gap: '8px',
      align: 'stretch',
    },
    propertySchema: [
      {
        key: 'direction',
        label: 'Direction',
        category: 'layout',
        editorType: 'select',
        defaultValue: 'vertical',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ],
        description: 'Stack direction',
      },
      {
        key: 'gap',
        label: 'Gap',
        category: 'layout',
        editorType: 'text',
        defaultValue: '8px',
        placeholder: '8px',
        description: 'Space between items',
      },
      {
        key: 'align',
        label: 'Alignment',
        category: 'layout',
        editorType: 'select',
        defaultValue: 'stretch',
        options: [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'stretch', label: 'Stretch' },
        ],
        description: 'Item alignment',
      },
    ],
    events: [],
  },
]

// Helper to execute event handler code
function executeEventHandler(
  component: ComponentInstance,
  eventName: string,
  event: any
) {
  const handler = component.eventHandlers?.[eventName]
  if (handler && handler.code) {
    try {
      // Create a function from the code string
      // Available variables: event, component
      const func = new Function('event', 'component', handler.code)
      func(event, component)
    } catch (error) {
      console.error(`Error executing ${eventName} handler:`, error)
    }
  }
}

// TableComponent with data fetching capability
function TableComponent({ component, props }: { component: ComponentInstance; props: TableProps }) {
  const [data, setData] = React.useState<Array<Record<string, any>>>([])
  const [columns, setColumns] = React.useState<Array<{key: string, label: string}>>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Auto-derive columns from data
  const autoDetectColumns = (dataArray: Array<Record<string, any>>) => {
    if (!dataArray || dataArray.length === 0) return []
    
    const firstRow = dataArray[0]
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    }))
  }

  React.useEffect(() => {
    // Determine data source URL based on type
    let dataSourceUrl: string | undefined

    // If using SQL query as data source
    if (props.dataSourceType === 'query' && props.queryId) {
      dataSourceUrl = `http://localhost:8000/api/queries/${props.queryId}/execute`
    } 
    // If using URL as data source
    else if (props.dataSourceType === 'url' && props.dataSource) {
      dataSourceUrl = props.dataSource
    }
    
    // If dataSource URL is provided, fetch data from API
    if (dataSourceUrl) {
      setLoading(true)
      setError(null)
      
      fetch(dataSourceUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((result) => {
          // Handle response that includes both columns and data (from SQL queries)
          if (result.columns && result.data) {
            setColumns(result.columns)
            setData(result.data)
          } 
          // Handle response that's just an array of data
          else if (Array.isArray(result)) {
            setData(result)
            setColumns(autoDetectColumns(result))
          }
          // Handle response with data property
          else if (result.data) {
            const dataArray = Array.isArray(result.data) ? result.data : [result.data]
            setData(dataArray)
            setColumns(autoDetectColumns(dataArray))
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching table data:', err)
          setError(err.message || 'Failed to fetch data')
          setLoading(false)
        })
    } else {
      // Use static data
      const staticData = props.data || []
      setData(staticData)
      
      // Use provided columns or auto-detect from data
      if (props.columns && props.columns.length > 0) {
        setColumns(props.columns)
      } else {
        setColumns(autoDetectColumns(staticData))
      }
    }
  }, [props.dataSource, props.dataSourceType, props.queryId, props.data, props.columns])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-slate-400">
                Loading data...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-red-500">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : data && data.length > 0 ? (
            data.map((row, idx) => (
              <TableRow 
                key={idx}
                className={`${props.striped && idx % 2 === 1 ? 'bg-slate-50' : ''} ${component.eventHandlers?.onRowClick ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                onClick={(e) => executeEventHandler(component, 'onRowClick', { row, index: idx, event: e })}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {row[col.key] ?? '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-slate-400">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Render function that takes component instance and renders the actual UI component
export function renderComponent(component: ComponentInstance): React.ReactNode {
  switch (component.type) {
    case 'Button': {
      const props = component.props as ButtonProps
      return (
        <Button 
          variant={props.variant} 
          size={props.size}
          disabled={props.disabled}
          className="w-full h-full"
          onClick={(e) => executeEventHandler(component, 'onClick', e)}
          onMouseEnter={(e) => executeEventHandler(component, 'onMouseEnter', e)}
          onMouseLeave={(e) => executeEventHandler(component, 'onMouseLeave', e)}
        >
          {props.text}
        </Button>
      )
    }

    case 'Input': {
      const props = component.props as InputProps
      return (
        <Input
          type={props.type}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
          onChange={(e) => executeEventHandler(component, 'onChange', e)}
          onFocus={(e) => executeEventHandler(component, 'onFocus', e)}
          onBlur={(e) => executeEventHandler(component, 'onBlur', e)}
        />
      )
    }

    case 'Tabs': {
      const props = component.props as TabsProps
      return (
        <Tabs 
          defaultValue={props.defaultValue || props.tabs[0]?.value}
          onValueChange={(value) => executeEventHandler(component, 'onValueChange', { value })}
        >
          <TabsList>
            {props.tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {props.tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )
    }

    case 'Select': {
      const props = component.props as SelectProps
      return (
        <Select 
          defaultValue={props.defaultValue} 
          disabled={props.disabled}
          onValueChange={(value) => executeEventHandler(component, 'onValueChange', { value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    case 'Table': {
      const props = component.props as TableProps
      return <TableComponent component={component} props={props} />
    }

    case 'Container': {
      const props = component.props as ContainerProps
      return (
        <div 
          className="w-full h-full border-2 border-dashed border-slate-300 rounded-md"
          style={{ 
            padding: props.padding || '16px',
            backgroundColor: props.backgroundColor || 'transparent'
          }}
        >
          <div className="text-xs text-slate-400 text-center">Container</div>
        </div>
      )
    }

    case 'Grid': {
      const props = component.props as GridProps
      return (
        <div 
          className="w-full h-full border-2 border-dashed border-slate-300 rounded-md p-2"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
            gap: props.gap || '16px'
          }}
        >
          <div className="text-xs text-slate-400 text-center col-span-full">Grid Layout</div>
        </div>
      )
    }

    case 'Stack': {
      const props = component.props as StackProps
      return (
        <div 
          className="w-full h-full border-2 border-dashed border-slate-300 rounded-md p-2"
          style={{ 
            display: 'flex',
            flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
            gap: props.gap || '8px',
            alignItems: props.align || 'stretch'
          }}
        >
          <div className="text-xs text-slate-400 text-center">Stack Layout</div>
        </div>
      )
    }

    default:
      return <div>Unknown component type</div>
  }
}

// Get preview component for palette (smaller/simplified version)
export function renderPalettePreview(
  componentDef: PaletteComponentDefinition
): React.ReactNode {
  switch (componentDef.type) {
    default:
      return (
        <div className="flex items-center gap-2 text-slate-600 text-xs">
          <span className="flex-shrink-0">{componentDef.icon}</span>
          <span className="font-medium">{componentDef.label}</span>
        </div>
      )
  }
}

