export interface Position {
  x: number
  y: number
}

// Property editor types - defines how a property should be edited
export type PropertyEditorType =
  | 'text'      // Single line text input
  | 'textarea'  // Multi-line text input
  | 'number'    // Number input
  | 'select'    // Dropdown selection
  | 'boolean'   // Checkbox/toggle
  | 'color'     // Color picker
  | 'slider'    // Range slider
  | 'json'      // JSON array/object editor
  | 'code'      // Code editor
  | 'event'     // Event handler (method)
  | 'query-select'  // SQL query selector
  | 'formatting-rules'  // Visual formatting rules manager
  | 'column-config'     // Visual column configuration manager

// Property category - for organizing properties in the editor
export type PropertyCategory = 'data' | 'methods' | 'layout' | 'style'

// Property definition schema
export interface PropertyDefinition {
  key: string
  label: string
  category: PropertyCategory
  editorType: PropertyEditorType
  defaultValue?: any
  options?: Array<{ value: string; label: string }>  // For select editor
  min?: number      // For number/slider
  max?: number      // For number/slider
  step?: number     // For number/slider
  placeholder?: string
  description?: string
  disabled?: boolean
  visibleWhen?: {    // Conditional visibility
    key: string      // Property key to check
    value: any       // Value that the property should have for this to be visible
  }
}

// Event handler definition
export interface EventHandler {
  name: string
  code: string  // JavaScript code to execute
}

// Base component metadata that all components have
export interface BaseComponentMetadata {
  id: string
  type: string
  label: string
  position: Position
  width?: number
  height?: number
  eventHandlers?: Record<string, EventHandler>  // Event name -> handler code
  children?: ComponentInstance[]  // Nested children for layout components
  parentId?: string  // ID of parent container (if nested)
}

// Component-specific properties for each component type
export interface ButtonProps {
  text: string
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

export interface InputProps {
  placeholder: string
  type: 'text' | 'email' | 'password' | 'number'
  defaultValue?: string
  disabled?: boolean
}

export interface TabsProps {
  tabs: Array<{
    value: string
    label: string
    content: string
  }>
  defaultValue?: string
}

export interface SelectProps {
  placeholder: string
  options: Array<{
    value: string
    label: string
  }>
  defaultValue?: string
  disabled?: boolean
}

// Formatting rule condition for fuzzy logic
export interface FormatCondition {
  column: string  // Column to check
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'
  value?: any  // Value to compare (not needed for isEmpty/isNotEmpty)
  logic?: 'AND' | 'OR'  // Logic operator to combine with next condition
}

// Formatting style to apply when conditions match
export interface FormatStyle {
  backgroundColor?: string
  textColor?: string
  fontWeight?: 'normal' | 'bold' | 'bolder'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
}

// Complete formatting rule
export interface FormattingRule {
  id: string
  name: string
  target: 'row' | 'cell'  // Apply to entire row or specific cell
  targetColumn?: string  // Required if target is 'cell'
  conditions: FormatCondition[]
  style: FormatStyle
  enabled: boolean
}

// Column configuration with visibility
export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  width?: string
}

export interface TableProps {
  columns?: Array<{
    key: string
    label: string
  }>  // Optional - will be auto-derived from data if not provided
  dataSource?: string  // URL or API endpoint
  dataSourceType?: 'url' | 'query' | 'static'  // Type of data source
  queryId?: string  // ID of saved SQL query
  data?: Array<Record<string, any>>  // Optional - only for static data
  striped?: boolean
  bordered?: boolean
  // Enhanced formatting properties
  columnConfigs?: ColumnConfig[]  // Column visibility and configuration
  formattingRules?: FormattingRule[]  // Logic-based formatting rules
  headerBackgroundColor?: string
  headerTextColor?: string
  rowHoverColor?: string
}

export interface ContainerProps {
  padding?: string
  backgroundColor?: string
}

export interface GridProps {
  columns?: number
  gap?: string
}

export interface StackProps {
  direction?: 'vertical' | 'horizontal'
  gap?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
}

// Union type for all component-specific properties
export type ComponentSpecificProps = 
  | { type: 'Button'; props: ButtonProps }
  | { type: 'Input'; props: InputProps }
  | { type: 'Tabs'; props: TabsProps }
  | { type: 'Select'; props: SelectProps }
  | { type: 'Table'; props: TableProps }
  | { type: 'Container'; props: ContainerProps }
  | { type: 'Grid'; props: GridProps }
  | { type: 'Stack'; props: StackProps }

// Complete component instance that combines base metadata with specific props
export type ComponentInstance = BaseComponentMetadata & ComponentSpecificProps

// Palette item definition with property schema
export interface PaletteComponentDefinition {
  type: string
  label: string
  icon: React.ReactNode
  defaultProps: any
  propertySchema: PropertyDefinition[]
  events?: string[]  // List of available events (e.g., ['onClick', 'onHover'])
}
