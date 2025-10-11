# UI Component Builder

A drag-and-drop UI component builder that uses shadcn UI components. This system allows you to visually build UIs by dragging components from a palette onto a canvas, and then **edit their properties** through an intuitive property panel.

## Features

✨ **Drag & Drop Interface**: Drag components from palette to canvas  
🎯 **Component Selection**: Click components to select and edit  
📝 **Property Editing**: Edit component properties organized by category (Data, Methods, Layout, Style)  
⚡ **Real-time Updates**: Changes reflect immediately on the canvas  
🔧 **Event Handlers**: Write JavaScript code for component events  
📊 **5 Components Ready**: Button, Input, Tabs, Select, and Table  
🧩 **Extensible**: Easy to add new components and property types

## Quick Start

1. **Drag** a component from the left palette onto the canvas
2. **Click** the component to select it
3. **Edit** its properties in the right panel:
   - **Data tab**: Change text, options, data sources
   - **Methods tab**: Add onClick, onChange event handlers
   - **Layout tab**: Adjust position and size
   - **Style tab**: Modify variants, colors, styling
4. **Preview** changes in real-time on the canvas

## Architecture

### 1. **Component Metadata System** (`types.ts`)

The system uses a flexible metadata structure:

- **BaseComponentMetadata**: Generic properties all components share
  - `id`: Unique identifier
  - `type`: Component type (Button, Input, Tabs, Table, etc.)
  - `label`: Display name
  - `position`: x,y coordinates on canvas
  - `width`, `height`: Optional dimensions
  - `eventHandlers`: Optional event handler code

- **Component-Specific Props**: Each component type has its own props interface
  - `ButtonProps`: text, variant, size, disabled
  - `InputProps`: placeholder, type, defaultValue, disabled
  - `TabsProps`: tabs array with value/label/content
  - `SelectProps`: options array, placeholder, disabled
  - `TableProps`: columns, data, dataSource, striped, bordered

- **Property Schema System**: Defines how properties should be edited
  - `PropertyDefinition`: Schema for each editable property
  - `PropertyCategory`: Organizes properties into Data, Methods, Layout, Style
  - `PropertyEditorType`: Defines editor UI (text, select, boolean, json, etc.)

- **ComponentInstance**: Combines base metadata with specific props using TypeScript discriminated unions

### 2. **Component Registry** (`component-registry.tsx`)

Central registry that:

- **COMPONENT_REGISTRY**: Defines all available components with:
  - Type identifier
  - Display label
  - Icon for palette
  - Default props for new instances
  - **Property schema**: Defines all editable properties with categories
  - **Available events**: List of events that can have handlers (onClick, onChange, etc.)

- **renderComponent()**: Takes a ComponentInstance and renders the actual shadcn UI component
  - Handles type-specific rendering
  - Passes props to underlying shadcn components
  - Supports all component types including Table

- **renderPalettePreview()**: Renders simplified component previews for the palette

### 3. **Palette** (`DnDPalette.tsx`)

Component library sidebar:
- Shows draggable component items
- Each item contains component metadata
- Uses `@dnd-kit/core` for drag functionality
- Passes component type and default props on drag

### 4. **Canvas** (`DnDCanvas.tsx`)

Main workspace where components are placed:
- Renders actual shadcn UI components at their positions
- Each component has:
  - **Selection state**: Click to select, shows blue border when selected
  - Hover state showing component label
  - Drag handle for repositioning
  - Delete button
  - Visual indicator when selected (blue dot)
- Uses absolute positioning for free-form layout
- Click canvas background to deselect

### 5. **Property Panel** (`PropertyPanel.tsx`)

✨ **NEW!** Property editing sidebar:
- Shows properties for the selected component
- Organized into 4 tabs:
  - **Data**: Component content and configuration
  - **Methods**: Event handlers (onClick, onChange, etc.)
  - **Layout**: Position, width, height
  - **Style**: Visual styling options
- Dynamic property editors based on type:
  - Text inputs for strings
  - Number inputs for dimensions
  - Dropdowns for enums (variants, sizes)
  - Checkboxes for booleans
  - JSON editors for arrays/objects
  - Code editors for event handlers
- Real-time updates as you edit

### 6. **Editor** (`DnDEditor.tsx`)

Main orchestrator:
- Manages component instances state
- Tracks selected component
- Handles drag-and-drop logic:
  - From palette: Creates new component instance with default props
  - Within canvas: Updates component position
- Property change handlers:
  - **handlePropertyChange**: Updates component props
  - **handleEventHandlerChange**: Updates event handler code
  - **handleLayoutChange**: Updates position and dimensions
- Coordinates between palette, canvas, and property panel

## Adding New Components

To add a new shadcn component with full property editing support:

### Step 1: Define Props Interface (`types.ts`)

```typescript
export interface MyComponentProps {
  someProp: string
  anotherProp: number
  optionalProp?: boolean
}

// Add to union type
export type ComponentSpecificProps = 
  | { type: 'Button'; props: ButtonProps }
  | { type: 'MyComponent'; props: MyComponentProps } // Add this
  | ...
```

### Step 2: Register Component with Property Schema (`component-registry.tsx`)

```typescript
// Add to COMPONENT_REGISTRY
{
  type: 'MyComponent',
  label: 'My Component',
  icon: '🎨',
  defaultProps: {
    someProp: 'default value',
    anotherProp: 42,
    optionalProp: false,
  } as MyComponentProps,
  // Define property schema for editing
  propertySchema: [
    {
      key: 'someProp',
      label: 'Some Property',
      category: 'data',
      editorType: 'text',
      defaultValue: 'default value',
      placeholder: 'Enter text',
      description: 'Description of this property',
    },
    {
      key: 'anotherProp',
      label: 'Number Value',
      category: 'data',
      editorType: 'number',
      defaultValue: 42,
      min: 0,
      max: 100,
    },
    {
      key: 'optionalProp',
      label: 'Enable Feature',
      category: 'style',
      editorType: 'boolean',
      defaultValue: false,
    },
  ],
  // Define available events
  events: ['onClick', 'onCustomEvent'],
}

// Add render case
case 'MyComponent': {
  const props = component.props as MyComponentProps
  return <MyComponent {...props} />
}

// Add palette preview case
case 'MyComponent':
  return (
    <div className="flex items-center gap-2">
      <span>🎨</span>
      <span>My Component</span>
    </div>
  )
```

### Step 3: Import the shadcn Component

```typescript
import { MyComponent } from '@/components/ui/my-component'
```

That's it! The component is now available in the palette with full property editing support.

## Property Editing System

The property editing system is **generic and extensible**:

### Property Categories

Properties are organized into 4 categories:

1. **Data**: Component content, configuration, data sources
   - Example: Button text, Input placeholder, Table data
2. **Methods**: Event handlers and callbacks
   - Example: onClick, onChange, onRowClick
3. **Layout**: Position and dimensions
   - Example: x/y position, width, height
4. **Style**: Visual styling options
   - Example: variant, size, colors, borders

### Property Editor Types

Different editor types for different data types:

- `text`: Single-line text input
- `textarea`: Multi-line text input
- `number`: Number input with min/max
- `select`: Dropdown with predefined options
- `boolean`: Checkbox toggle
- `color`: Color picker (future)
- `slider`: Range slider (future)
- `json`: JSON array/object editor
- `code`: Code editor for event handlers
- `event`: Special type for event handlers

### Event Handlers

Components can define available events. Each event handler:
- Has a name (e.g., `onClick`)
- Contains JavaScript code as a string
- Has access to `event` and `component` variables
- Can be edited in the Methods tab

### Example: Button with onClick

```typescript
// Component instance
{
  id: 'button-1',
  type: 'Button',
  props: {
    text: 'Click Me',
    variant: 'default',
  },
  eventHandlers: {
    onClick: {
      name: 'onClick',
      code: `console.log('Button clicked!', event, component)`
    }
  }
}
```

## Extensibility

The system is designed to be highly extensible:

1. **Generic Metadata**: All components share common base properties (id, label, position)
2. **Type-Safe Props**: TypeScript discriminated unions ensure type safety for component-specific props
3. **Flexible Rendering**: Component registry pattern allows easy addition of new components
4. **Customizable Props**: Each component can have completely different props tailored to its needs
5. **Schema-Based Editing**: Property schemas make any component editable without custom UI
6. **Category Organization**: Properties automatically organize into intuitive categories
7. **Extensible Editors**: Easy to add new property editor types for custom needs

## Future Enhancements

Potential improvements:

1. ~~**Properties Panel**: Add a sidebar to edit component props after placement~~ ✅ **DONE!**
2. **Nested Components**: Support container components that can hold other components
3. **Layout Helpers**: Add grid/flexbox layout assistants
4. **Export/Import**: Serialize canvas state to JSON for saving/loading
5. **Code Generation**: Generate React code from the visual layout
6. **Responsive Design**: Add breakpoint management
7. **Component Variants**: Quick access to common component variations
8. **Undo/Redo**: History management for actions
9. **Copy/Paste**: Duplicate components quickly
10. **Keyboard Shortcuts**: Improve productivity with shortcuts
11. **Color Picker**: Add visual color picker for color properties
12. **API Integration**: Execute event handlers and fetch data from APIs
13. **Data Binding**: Connect components to data sources
14. **Validation**: Add property validation rules

