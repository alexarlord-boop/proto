# Snap to Grid Feature

## Overview
Added snap-to-grid functionality to the DnD canvas editor, making it easy to populate the canvas with evenly aligned UI components.

## Features Implemented

### 1. Grid Snapping
- Components automatically snap to the nearest grid point when dropped or moved on the canvas
- Configurable grid sizes: 10px, 20px, 25px, 30px, 40px, 50px
- Default grid size: 20px
- Can be enabled/disabled via toggle switch

### 2. Visual Grid Overlay
- Grid lines displayed on the canvas when snap-to-grid is enabled
- Subtle gray grid lines that don't interfere with component visibility
- Grid size matches the snap interval

### 3. UI Controls
Located in the top bar of the editor:
- **Grid Icon & Label**: Visual indicator for the snap-to-grid feature
- **Toggle Switch**: Enable/disable snap-to-grid functionality
- **Grid Size Selector**: Dropdown to choose grid size (only visible when snap is enabled)

## Technical Implementation

### Packages Added
- `@dnd-kit/modifiers` - Provides real-time drag modifiers for DndKit

### Files Modified

#### 1. `DnDEditor.tsx`
- Added state management for `snapToGrid` (boolean) and `gridSize` (number)
- Implemented `snapToGridFn()` utility function that rounds positions to nearest grid point (for drop calculations)
- **Created custom DndKit modifier** that snaps components to grid in real-time during dragging
- Applied snapping in three scenarios:
  - **Real-time during drag** (via modifier)
  - When dropping new components from palette (via snapToGridFn)
  - When moving existing components on canvas (via snapToGridFn)
  - When moving nested components to top-level canvas (via snapToGridFn)
- Added UI controls with Grid3x3 icon, Switch, and Select components
- Passed grid settings to DnDCanvas component

#### 2. `DnDCanvas.tsx`
- Added `showGrid` and `gridSize` props
- Implemented CSS grid background using linear gradients
- Grid automatically updates when grid size changes

### Snap Logic

#### Real-time Modifier (during drag):
```typescript
const createSnapToGridModifier = (gridSize: number): Modifier => {
  return ({ transform, active, draggingNodeRect }) => {
    // Get component's current position
    const baseX = component?.position.x || 0
    const baseY = component?.position.y || 0
    
    // Calculate new absolute position
    const newX = baseX + transform.x
    const newY = baseY + transform.y
    
    // Snap to grid
    const snappedX = Math.round(newX / gridSize) * gridSize
    const snappedY = Math.round(newY / gridSize) * gridSize
    
    // Return corrected delta
    return {
      x: snappedX - baseX,
      y: snappedY - baseY,
    }
  }
}
```

#### Final Position (on drop):
```typescript
const snapToGridFn = (x: number, y: number): { x: number; y: number } => {
  if (!snapToGrid) return { x, y }
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  }
}
```

## Usage

1. **Enable Snap-to-Grid**: Toggle the switch in the top bar
2. **Adjust Grid Size**: Select your preferred grid size from the dropdown
3. **Drag Components**: Components will automatically align to grid points
4. **Disable When Needed**: Turn off the toggle for free-form positioning

## Benefits

- **Consistent Alignment**: Components automatically align to grid, creating a clean layout
- **Faster Design**: No need to manually adjust positions for alignment
- **Flexible**: Can be disabled for precise positioning when needed
- **Adjustable**: Multiple grid sizes for different design needs
- **Visual Feedback**: Grid overlay helps visualize the alignment structure

## Default Behavior

- Snap-to-grid is **enabled by default**
- Default grid size is **20px**
- Grid is visible when snap-to-grid is enabled

## Future Enhancements (Optional)

- Add keyboard shortcut to toggle grid (e.g., Cmd/Ctrl + ')
- Add magnetic strength option (snap distance threshold)
- Support custom grid size input
- Different grid colors/styles
- Grid offset options
- Persistent grid preferences in project settings

