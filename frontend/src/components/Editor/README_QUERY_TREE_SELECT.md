# Query Tree Select Component

## Overview

The `QueryTreeSelect` component provides a hierarchical, tree-like interface for selecting SQL queries organized by their database connectors. This replaces the previous flat dropdown selector.

## Features

### 1. **Hierarchical Structure**
- **Top Level**: Database connectors (e.g., SQLite, MySQL, PostgreSQL)
- **Nested Level**: SQL queries belonging to each connector
- Expandable/collapsible tree nodes using Radix UI Collapsible

### 2. **Visual Indicators**
- 🗄️ Database icon for connectors
- 📄 File icon for queries
- Chevron icons (▶/▼) to indicate expand/collapse state
- Query count badge for each connector
- Visual highlighting for selected queries
- Checkmark (✓) for the currently selected query

### 3. **Search Functionality**
- Real-time search across both connectors and queries
- Searches in query names and descriptions
- Auto-expands relevant connectors when searching
- Highlights matching results

### 4. **Status Display**
- Shows selected query as a badge at the top: `[Connector Name] / [Query Name]`
- "Clear" button to deselect
- Shows connector database type and name
- Indicates inactive connectors with grayed-out appearance

### 5. **User Experience**
- Auto-expands connector when a query is pre-selected
- Smooth hover and transition effects
- Scrollable list (max height 96 = ~24rem)
- Disabled state support
- Quick actions: "Open Query Creator" and "Refresh" buttons

## Usage

```tsx
import { QueryTreeSelect } from './QueryTreeSelect'

<QueryTreeSelect
  value={selectedQueryId}
  onChange={(queryId) => handleQueryChange(queryId)}
  disabled={false}
  placeholder="Select a query..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | - | Currently selected query ID |
| `onChange` | `(queryId: string) => void` | - | Callback when query is selected |
| `disabled` | `boolean` | `false` | Disables all interactions |
| `placeholder` | `string` | `'Select a query...'` | Placeholder text (currently unused) |

## Integration

The component is integrated into `PropertyPanel.tsx` for the `query-select` editor type:

```tsx
case 'query-select':
  return (
    <QueryTreeSelect
      value={currentValue}
      onChange={(value) => {
        onPropertyChange(prop.key, value)
        setTimeout(() => fetchTableColumns(), 500)
      }}
      disabled={prop.disabled}
      placeholder={prop.placeholder || 'Select a query...'}
    />
  )
```

## API Endpoints

The component fetches data from:
- `GET /api/connectors` - List of database connectors
- `GET /api/queries` - List of SQL queries (filtered to valid queries only)

## Data Structure

### DBConnector
```typescript
{
  id: string
  name: string
  db_type: string          // 'sqlite', 'mysql', 'postgresql'
  database: string
  is_active: boolean
}
```

### SQLQuery
```typescript
{
  id: string
  name: string
  description: string | null
  connector_id: string     // Links to DBConnector.id
  is_valid: boolean
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system:
- Slate color palette for neutral elements
- Blue accents for interactive and selected states
- Hover states for better UX
- Responsive spacing and sizing

## Dependencies

- `lucide-react` - Icons (ChevronDown, ChevronRight, Database, FileText, Search)
- `@radix-ui/react-collapsible` - Collapsible tree nodes
- Custom UI components: `Input`, `Collapsible`

## Future Enhancements

Potential improvements:
- Sort options (alphabetical, by date, by usage)
- Favorites/pinned queries
- Query preview on hover
- Bulk selection support
- Drag-and-drop reordering
- Keyboard navigation (arrow keys, Enter to select)
- Virtual scrolling for large lists

