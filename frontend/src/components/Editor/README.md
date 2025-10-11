# UI Component Builder

A drag-and-drop UI component builder that uses shadcn UI components. This system allows you to visually build UIs by dragging components from a palette onto a canvas.

## Architecture

### 1. **Component Metadata System** (`types.ts`)

The system uses a flexible metadata structure:

- **BaseComponentMetadata**: Generic properties all components share
  - `id`: Unique identifier
  - `type`: Component type (Button, Input, Tabs, etc.)
  - `label`: Display name
  - `position`: x,y coordinates on canvas

- **Component-Specific Props**: Each component type has its own props interface
  - `ButtonProps`: text, variant, size
  - `InputProps`: placeholder, type, defaultValue
  - `TabsProps`: tabs array with value/label/content
  - `SelectProps`: options array, placeholder

- **ComponentInstance**: Combines base metadata with specific props using TypeScript discriminated unions

### 2. **Component Registry** (`component-registry.tsx`)

Central registry that:

- **COMPONENT_REGISTRY**: Defines all available components with:
  - Type identifier
  - Display label
  - Icon for palette
  - Default props for new instances

- **renderComponent()**: Takes a ComponentInstance and renders the actual shadcn UI component
  - Handles type-specific rendering
  - Passes props to underlying shadcn components

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
  - Hover state showing component label
  - Drag handle for repositioning
  - Delete button
- Uses absolute positioning for free-form layout

### 5. **Editor** (`DnDEditor.tsx`)

Main orchestrator:
- Manages component instances state
- Handles drag-and-drop logic:
  - From palette: Creates new component instance with default props
  - Within canvas: Updates component position
- Coordinates between palette and canvas

## Adding New Components

To add a new shadcn component:

### Step 1: Define Props Interface (`types.ts`)

```typescript
export interface MyComponentProps {
  someProp: string
  anotherProp: number
}

// Add to union type
export type ComponentSpecificProps = 
  | { type: 'Button'; props: ButtonProps }
  | { type: 'MyComponent'; props: MyComponentProps } // Add this
  | ...
```

### Step 2: Register Component (`component-registry.tsx`)

```typescript
// Add to COMPONENT_REGISTRY
{
  type: 'MyComponent',
  label: 'My Component',
  icon: '🎨',
  defaultProps: {
    someProp: 'default value',
    anotherProp: 42,
  } as MyComponentProps,
}

// Add render case
case 'MyComponent': {
  const props = component.props as MyComponentProps
  return <MyComponent {...props} />
}

// Add palette preview case
case 'MyComponent':
  return <div>Preview of MyComponent</div>
```

### Step 3: Import the shadcn Component

```typescript
import { MyComponent } from '@/components/ui/my-component'
```

That's it! The component is now available in the palette and can be dropped on the canvas.

## Extensibility

The system is designed to be highly extensible:

1. **Generic Metadata**: All components share common base properties (id, label, position)
2. **Type-Safe Props**: TypeScript discriminated unions ensure type safety for component-specific props
3. **Flexible Rendering**: Component registry pattern allows easy addition of new components
4. **Customizable Props**: Each component can have completely different props tailored to its needs

## Future Enhancements

Potential improvements:

1. **Properties Panel**: Add a sidebar to edit component props after placement
2. **Nested Components**: Support container components that can hold other components
3. **Layout Helpers**: Add grid/flexbox layout assistants
4. **Export/Import**: Serialize canvas state to JSON for saving/loading
5. **Code Generation**: Generate React code from the visual layout
6. **Responsive Design**: Add breakpoint management
7. **Component Variants**: Quick access to common component variations
8. **Undo/Redo**: History management for actions
9. **Copy/Paste**: Duplicate components quickly
10. **Keyboard Shortcuts**: Improve productivity with shortcuts

