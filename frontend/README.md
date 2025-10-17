# Proto Frontend

React + TypeScript frontend for the Proto low-code platform.

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
# or: yarn install
```

### 2. Start Development Server
```bash
pnpm dev
# or: npm run dev
# or: yarn dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production
```bash
pnpm build
# or: npm run build
# or: yarn build
```

### 4. Preview Production Build
```bash
pnpm preview
# or: npm run preview
# or: yarn preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ProjectManager/
│   │   └── ProjectManager.tsx       # Project list and management UI
│   ├── QueryCreator/
│   │   ├── QueryCreator.tsx         # SQL query builder interface
│   │   └── SchemaVisualizer.tsx     # Database schema visualization
│   ├── Editor/
│   │   ├── DnDEditor.tsx            # Main editor container
│   │   ├── DnDCanvas.tsx            # Drag-and-drop canvas
│   │   ├── DnDPalette.tsx           # Component palette
│   │   ├── PropertyPanel.tsx        # Component property editor
│   │   ├── ColumnConfigManager.tsx  # Table column configuration
│   │   ├── FormattingRuleManager.tsx # Conditional formatting rules
│   │   ├── CanvasPreview.tsx        # Canvas preview modal
│   │   ├── FullScreenPreview.tsx    # Full-screen preview
│   │   ├── ProjectRenderer.tsx      # Project export renderer
│   │   ├── QueryTreeSelect.tsx      # Query selection component
│   │   ├── component-registry.tsx   # Component definitions
│   │   └── types.ts                 # TypeScript type definitions
│   └── ui/                          # Shadcn UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── ...
├── lib/
│   ├── utils.ts                     # Utility functions
│   └── table-formatting.ts          # Table formatting utilities
├── App.tsx                          # Main app with routing
├── main.tsx                         # App entry point
└── index.css                        # Global styles
```

---

## Available Components

The visual editor includes these drag-and-drop components:

### Basic Components
- **Button** - Interactive buttons with click handlers
- **Input** - Text input fields
- **Select** - Dropdown selections
- **Switch** - Toggle switches

### Layout Components
- **Tabs** - Tabbed interfaces
- **Container** - Layout containers with styling

### Data Components
- **Table** - Data tables with SQL query binding, sorting, filtering, and conditional formatting
  - Connect to SQL queries or API endpoints
  - Configure columns, formatting rules, and styles
  - Pagination support

---

## Features

### 1. Project Management
- Create, edit, and delete projects
- Save and load canvas layouts
- Project library with search and filtering

### 2. Visual Editor
- Drag-and-drop interface
- Component property editing
- Real-time preview
- Full-screen preview mode
- Export to HTML or full-stack package

### 3. SQL Query Builder
- Create and manage SQL queries
- Visual schema explorer
- Query validation and execution
- Database connector management

### 4. Data Binding
- Connect tables to SQL queries
- API endpoint integration
- Static JSON data support
- Auto-refresh on mount

### 5. Styling & Formatting
- Customizable component styles
- Conditional formatting for tables
- Color, size, and layout controls
- Responsive design

---

## Environment Configuration

Create a `.env` file in the frontend directory (optional):

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Other environment variables
VITE_APP_NAME=Proto
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library
- **@dnd-kit** - Drag-and-drop functionality
- **React Flow** - Schema visualization

---

## Development Tips

### Hot Module Replacement (HMR)
Vite provides fast HMR out of the box. Changes to React components will reflect immediately in the browser.

### TypeScript
The project uses strict TypeScript. Type checking runs during development:
```bash
pnpm run build  # Includes type checking
```

### Linting
```bash
pnpm run lint
```

### Code Organization
- Keep components small and focused
- Use TypeScript interfaces for type safety
- Extract reusable logic into custom hooks
- Store shared utilities in `lib/`

---

## Component Development

### Adding a New Component to the Palette

1. Define the component in `component-registry.tsx`:
```typescript
export const MyComponent: React.FC<ComponentProps> = ({ id, properties, eventHandlers }) => {
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};
```

2. Add to the palette definition:
```typescript
const paletteItems = [
  // ... existing items
  {
    id: 'mycomponent',
    type: 'MyComponent',
    label: 'My Component',
    icon: '🎨',
    defaultProperties: {
      // default props
    }
  }
];
```

3. Update the component renderer in `DnDCanvas.tsx` if needed.

---

## API Integration

The frontend communicates with the backend API at `http://localhost:8000`.

### Example: Fetching Projects
```typescript
const response = await fetch('http://localhost:8000/api/projects');
const projects = await response.json();
```

### Example: Creating a Query
```typescript
const response = await fetch('http://localhost:8000/api/queries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Query',
    sql_query: 'SELECT * FROM users',
    connector_id: 'conn-123',
    project_id: 'proj-456',
    developer_id: 'dev-789'
  })
});
```

---

## Troubleshooting

**Port 5173 already in use:**
Vite will automatically try the next available port (5174, 5175, etc.)

**Failed to fetch errors:**
- Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Verify API endpoints are accessible

**TypeScript errors:**
- Run `pnpm install` to ensure dependencies are up to date
- Check `tsconfig.json` for configuration issues
- Use `// @ts-ignore` sparingly for quick fixes (fix properly later)

**Styling issues:**
- Ensure Tailwind CSS is properly configured in `vite.config.ts`
- Check `index.css` for global styles
- Use browser DevTools to inspect applied styles

**Component not rendering:**
- Check browser console for errors
- Verify component is registered in `component-registry.tsx`
- Ensure component ID is unique

---

## Build & Deployment

### Production Build
```bash
pnpm build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build Locally
```bash
pnpm preview
```

### Deploy to Static Hosting

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
1. Build the project: `pnpm build`
2. Push `dist/` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

---

## Testing

### Manual Testing Checklist
- [ ] Create a new project
- [ ] Drag components onto canvas
- [ ] Edit component properties
- [ ] Save and reload project
- [ ] Create SQL query
- [ ] Bind table to query
- [ ] Preview canvas
- [ ] Export project

### Automated Testing (Future)
```bash
# Unit tests with Vitest
pnpm test

# E2E tests with Playwright
pnpm test:e2e
```

---

For more information, see the main [project README](../README.md) or the [Quick Start Guide](../QUICKSTART.md).
