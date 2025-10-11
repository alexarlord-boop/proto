# Full-Screen Preview Feature

## Overview

The full-screen preview feature provides an immersive, distraction-free viewing experience for both the canvas editor and database schema visualizer. This enhancement allows users to focus entirely on their work without the clutter of editor UI elements.

## Features

### 1. Canvas Full-Screen Preview

**Location:** Available in the DnD Editor (Project Canvas)

**Purpose:** View and arrange your application layout in a clean, distraction-free environment without editor controls, property panels, or delete buttons.

**How to Use:**
1. Open any project in the editor
2. Click the "Preview" button (with Maximize icon) in the top toolbar
3. View your components with a clean interface
4. **Hover over components** to see a minimal drag handle
5. **Drag components** to reposition them (changes are saved to the main editor)
6. Press `ESC` or click the `X` button to exit full-screen mode

**Benefits:**
- Clean, focused preview of your UI
- **Interactive dragging** for quick layout adjustments
- Minimal UI - only shows drag handles on hover
- See exact component positions and layouts
- Changes sync back to the main editor instantly
- Perfect for fine-tuning layouts or client presentations

### 2. Database Schema Full-Screen Preview

**Location:** Available in the Schema Visualizer (Query Creator)

**Purpose:** Expand the database schema diagram to full-screen for better manipulation, especially useful for complex schemas with many tables and relationships.

**How to Use:**
1. Select a database connector in the Query Creator
2. View the schema diagram in the right panel
3. Click the "Full Screen" button in the info overlay
4. Use enhanced space to pan, zoom, and explore relationships
5. Press `ESC` or click the `X` button to exit full-screen mode

**Benefits:**
- More space to work with complex database schemas
- Better visibility of table relationships
- Enhanced ability to rearrange and organize tables
- Improved readability of column names and types
- Full access to ReactFlow controls (zoom, pan, minimap)

## Architecture

### Components

#### 1. `FullScreenPreview` Component
**File:** `frontend/src/components/Editor/FullScreenPreview.tsx`

A reusable full-screen overlay component that:
- Renders content in a portal (attached to `document.body`)
- Provides a consistent header with title and close button
- Handles ESC key to exit
- Prevents body scroll when open
- Uses dark overlay with backdrop blur for focus

**Props:**
```typescript
interface FullScreenPreviewProps {
  isOpen: boolean          // Controls visibility
  onClose: () => void      // Callback when user exits
  children: React.ReactNode // Content to display
  title?: string           // Optional header title
}
```

**Features:**
- Smooth fade-in animation
- ESC key listener
- Body scroll prevention
- Dark themed header bar
- Responsive to viewport changes

#### 2. `CanvasPreview` Component
**File:** `frontend/src/components/Editor/CanvasPreview.tsx`

A pure preview renderer for canvas components that:
- Renders components without editor UI elements
- Maintains exact positions and dimensions
- Uses clean gradient background
- Shows empty state when no components

**Props:**
```typescript
interface CanvasPreviewProps {
  items: ComponentInstance[] // Array of components to render
}
```

**Differences from DnDCanvas:**
- No drag handles
- No selection borders
- No delete buttons
- No hover states
- No dnd-kit integration
- Pure visual rendering only

### Integration Points

#### DnDEditor Integration
```tsx
// State management
const [isPreviewOpen, setIsPreviewOpen] = useState(false)

// Toolbar button
<Button onClick={() => setIsPreviewOpen(true)}>
  <Maximize2 /> Preview
</Button>

// Full-screen preview
<FullScreenPreview
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  title={`Preview: ${projectName}`}
>
  <CanvasPreview items={items} />
</FullScreenPreview>
```

#### SchemaVisualizer Integration
```tsx
// State management
const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)

// Reusable diagram renderer
const renderDiagram = (inFullScreen = false) => (
  // ReactFlow diagram with conditional info overlay positioning
)

// Button in info overlay
<Button onClick={() => setIsFullScreenOpen(true)}>
  <Maximize2 /> Full Screen
</Button>

// Full-screen preview
<FullScreenPreview
  isOpen={isFullScreenOpen}
  onClose={() => setIsFullScreenOpen(false)}
  title="Database Schema Diagram"
>
  {renderDiagram(true)}
</FullScreenPreview>
```

## User Experience

### Keyboard Shortcuts
- **ESC**: Exit full-screen mode (works from anywhere in the preview)

### Visual Feedback
- Smooth fade-in animation when opening
- Dark backdrop to focus attention on content
- Clear header bar with title and close button
- Visible "Press ESC to exit" hint in header

### Accessibility
- Keyboard navigation support (ESC key)
- Focus management
- Proper ARIA labels for close button
- High contrast header for visibility

## Technical Details

### Portal Rendering
The full-screen preview uses React's `createPortal` to render outside the normal component hierarchy, ensuring:
- Proper z-index layering
- No interference from parent styles
- Full viewport coverage
- Clean separation from editor UI

### State Management
- Each component (DnDEditor, SchemaVisualizer) manages its own full-screen state
- State is local and isolated
- No global state pollution
- Simple boolean flag controls visibility

### Performance Considerations
- Components only render when `isOpen` is true
- Event listeners added/removed based on state
- Body scroll management is clean and reversible
- No re-renders of main editor when preview opens

## Future Enhancements

Potential improvements for future versions:

1. **Canvas Preview Enhancements:**
   - Interactive preview mode (clickable buttons, form inputs)
   - Event handler execution in preview
   - Responsive breakpoint preview (mobile/tablet/desktop views)
   - Dark mode toggle for preview

2. **Schema Preview Enhancements:**
   - Export diagram as image from full-screen
   - Save custom table positions
   - Advanced filtering (show only specific tables)
   - Different layout algorithms (circular, hierarchical)

3. **General Enhancements:**
   - Fullscreen API integration (browser native fullscreen)
   - Multiple preview windows
   - Split-screen comparison mode
   - Preview history/snapshots

## Browser Compatibility

The full-screen preview feature is compatible with all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** Uses React portals, CSS transforms, and modern JavaScript features. No polyfills required for supported browsers.

## Testing

To test the full-screen preview feature:

1. **Canvas Preview:**
   ```bash
   cd frontend
   npm run dev
   ```
   - Create or open a project
   - Add some components to the canvas
   - Click "Preview" button
   - Verify components render without editor UI
   - Test ESC key and close button

2. **Schema Preview:**
   - Navigate to Query Creator
   - Select a database with schema
   - View schema diagram
   - Click "Full Screen" in info overlay
   - Verify diagram expands correctly
   - Test drag, zoom, and pan functionality
   - Test ESC key and close button

## Troubleshooting

### Issue: Full-screen doesn't open
- Check browser console for errors
- Verify `isOpen` state is being set correctly
- Ensure no CSS conflicts with z-index

### Issue: ESC key doesn't work
- Check if event listener is properly attached
- Verify no other components are preventing event propagation
- Try clicking the close button as alternative

### Issue: Content not visible in full-screen
- Check if children prop is being passed correctly
- Verify content has proper dimensions
- Check for CSS display issues

### Issue: Body still scrolls when preview is open
- Verify `useEffect` cleanup is working
- Check if multiple instances are conflicting
- Ensure `overflow: hidden` is being applied to body

## Code Examples

### Creating a New Full-Screen Preview

To add full-screen preview to a new component:

```tsx
import { useState } from 'react'
import { FullScreenPreview } from '@/components/Editor/FullScreenPreview'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)

  return (
    <>
      {/* Your component UI */}
      <div>
        <Button onClick={() => setIsFullScreenOpen(true)}>
          <Maximize2 className="w-4 h-4 mr-2" />
          Full Screen
        </Button>
        
        {/* Your content */}
        <div id="my-content">
          {/* ... */}
        </div>
      </div>

      {/* Full-screen preview */}
      <FullScreenPreview
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title="My Component Full Screen"
      >
        {/* Render your content in full-screen */}
        <div className="w-full h-full">
          {/* Full-screen version of your content */}
        </div>
      </FullScreenPreview>
    </>
  )
}
```

## Conclusion

The full-screen preview feature enhances the user experience by providing focused, distraction-free views of both the canvas editor and schema visualizer. The reusable `FullScreenPreview` component makes it easy to add this functionality to other parts of the application in the future.

