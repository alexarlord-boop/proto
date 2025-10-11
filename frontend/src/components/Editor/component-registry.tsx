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
  PaletteComponentDefinition,
} from './types'

// Registry of available components for the palette
export const COMPONENT_REGISTRY: PaletteComponentDefinition[] = [
  {
    type: 'Button',
    label: 'Button',
    icon: '🔘',
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
    icon: '📝',
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
    icon: '📑',
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
    icon: '📋',
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
    icon: '📊',
    defaultProps: {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
      ],
      data: [
        { id: '1', name: 'Item 1', status: 'Active' },
        { id: '2', name: 'Item 2', status: 'Inactive' },
      ],
      striped: true,
      bordered: true,
    } as TableProps,
    propertySchema: [
      {
        key: 'columns',
        label: 'Columns',
        category: 'data',
        editorType: 'json',
        defaultValue: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
        ],
        placeholder: '[{"key": "id", "label": "ID"}]',
        description: 'Array of column definitions with key and label',
      },
      {
        key: 'dataSource',
        label: 'Data Source URL',
        category: 'data',
        editorType: 'text',
        placeholder: 'https://api.example.com/data',
        description: 'API endpoint to fetch table data from',
      },
      {
        key: 'data',
        label: 'Static Data',
        category: 'data',
        editorType: 'json',
        placeholder: '[{"id": 1, "name": "Item"}]',
        description: 'Static data array (used if dataSource is not set)',
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
  const [data, setData] = React.useState(props.data || [])
  const [columns, setColumns] = React.useState(props.columns || [])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // If dataSource is provided, fetch data from API
    if (props.dataSource) {
      setLoading(true)
      setError(null)
      
      fetch(props.dataSource)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((result) => {
          // Handle response that includes both columns and data
          if (result.columns && result.data) {
            setColumns(result.columns)
            setData(result.data)
          } 
          // Handle response that's just an array of data
          else if (Array.isArray(result)) {
            setData(result)
          }
          // Handle response with data property
          else if (result.data) {
            setData(result.data)
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
      setData(props.data || [])
      setColumns(props.columns || [])
    }
  }, [props.dataSource, props.data, props.columns])

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

    default:
      return <div>Unknown component type</div>
  }
}

// Get preview component for palette (smaller/simplified version)
export function renderPalettePreview(
  componentDef: PaletteComponentDefinition
): React.ReactNode {
  switch (componentDef.type) {
    case 'Button':
      return (
        <Button variant="outline" size="sm" className="pointer-events-none">
          {componentDef.icon} {componentDef.label}
        </Button>
      )

    case 'Input':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    case 'Tabs':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    case 'Select':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    case 'Table':
      return (
        <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
          <span className="text-2xl">{componentDef.icon}</span>
          <span>{componentDef.label}</span>
        </div>
      )

    default:
      return (
        <div className="text-sm text-slate-700">
          {componentDef.icon} {componentDef.label}
        </div>
      )
  }
}

