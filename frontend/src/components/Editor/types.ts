export interface Position {
  x: number
  y: number
}

// Base component metadata that all components have
export interface BaseComponentMetadata {
  id: string
  type: string
  label: string
  position: Position
}

// Component-specific properties for each component type
export interface ButtonProps {
  text: string
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
}

export interface InputProps {
  placeholder: string
  type: 'text' | 'email' | 'password' | 'number'
  defaultValue?: string
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
}

// Union type for all component-specific properties
export type ComponentSpecificProps = 
  | { type: 'Button'; props: ButtonProps }
  | { type: 'Input'; props: InputProps }
  | { type: 'Tabs'; props: TabsProps }
  | { type: 'Select'; props: SelectProps }

// Complete component instance that combines base metadata with specific props
export type ComponentInstance = BaseComponentMetadata & ComponentSpecificProps

// Palette item definition
export interface PaletteComponentDefinition {
  type: string
  label: string
  icon: string
  defaultProps: any
}
