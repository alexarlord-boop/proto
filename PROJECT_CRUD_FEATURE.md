# Project CRUD Feature

This document describes the Project management feature that allows users to create, read, update, and delete canvas projects with components and linked queries.

## Overview

The Project CRUD feature provides a complete solution for managing canvas-based projects. Each project represents a canvas with drag-and-drop components and their properties, which can reference saved SQL queries.

## Architecture

### Database Schema

**Project Model** (`projects` table):
- `id` (String, Primary Key): Unique project identifier
- `name` (String, Indexed): Project name
- `description` (Text, Optional): Project description
- `components` (Text): JSON-encoded array of ComponentInstance objects
- `developer_id` (String, Indexed): User/developer who created the project
- `created_at` (DateTime): Creation timestamp
- `updated_at` (DateTime): Last update timestamp

### Backend API Endpoints

All endpoints are prefixed with `/api/projects`:

#### Create Project
```
POST /api/projects
Body: {
  name: string
  description?: string
  components?: ComponentInstance[]
  developer_id?: string (default: "default")
}
Response: ProjectResponse
```

#### List Projects
```
GET /api/projects?developer_id={developer_id}
Response: ProjectResponse[]
```

#### Get Project
```
GET /api/projects/{project_id}
Response: ProjectResponse
```

#### Update Project
```
PUT /api/projects/{project_id}
Body: {
  name?: string
  description?: string
  components?: ComponentInstance[]
}
Response: ProjectResponse
```

#### Delete Project
```
DELETE /api/projects/{project_id}
Response: { message: string }
```

## Frontend Components

### 1. ProjectManager Component

**Location**: `/frontend/src/components/ProjectManager/ProjectManager.tsx`

The home page component that provides project management UI:

**Features**:
- List all projects in a table with name, description, component count, and last updated
- Create new projects with name and description
- Edit existing project metadata (name, description)
- Delete projects with confirmation
- Open projects in the editor
- Navigate to Query Creator

**UI Elements**:
- Header with "New Project" and "Query Creator" buttons
- Project table with sortable columns
- Action buttons: Open, Edit, Delete
- Modal dialog for create/edit operations
- Empty state with call-to-action

### 2. Updated DnDEditor Component

**Location**: `/frontend/src/components/Editor/DnDEditor.tsx`

Enhanced canvas editor with project persistence:

**New Props**:
- `projectId?: string` - ID of the project being edited
- `projectName?: string` - Name to display in header
- `onNavigate?: (path: string) => void` - Navigation callback

**Features**:
- Load project data on mount if projectId is provided
- Save button to persist canvas state to database
- "Last saved" timestamp display
- Home button to return to project list
- Auto-detect next component ID based on existing components

**Save Functionality**:
- Saves all components and their properties to the backend
- Shows "Saving..." state during save operation
- Updates "Last saved" timestamp on success

### 3. Updated App Component

**Location**: `/frontend/src/App.tsx`

Enhanced routing to support project-based navigation:

**Routes**:
- `/` - Home page with ProjectManager
- `/editor/{project-id}` - Editor for specific project
- `/query-creator` - Query creator page

**Features**:
- Parse route to extract project ID
- Load project name for display
- Handle browser back/forward navigation
- Simple navigation function for programmatic routing

## Component Structure in Projects

Each project stores an array of `ComponentInstance` objects with the following structure:

```typescript
interface ComponentInstance {
  id: string                    // Unique component ID
  type: string                  // Component type (Button, Input, Table, etc.)
  label: string                 // Display label
  position: { x: number, y: number }  // Canvas position
  width?: number                // Optional width
  height?: number               // Optional height
  props: Record<string, any>    // Component-specific properties
  eventHandlers?: Record<string, EventHandler>  // Event handlers
}
```

## Query Integration

Projects can reference saved queries in component properties:

- **Table components** can link to queries via `queryId` property
- **Query selector** in property panel allows choosing from saved queries
- Queries are **reusable** across multiple projects
- Each query maintains its own connector and SQL definition

## Workflow

### Creating a New Project

1. User clicks "New Project" on home page
2. Enters project name and optional description
3. System creates empty project in database
4. User is redirected to editor with empty canvas
5. User drags components from palette to canvas
6. User configures component properties (including query links)
7. User clicks "Save" to persist changes

### Opening an Existing Project

1. User clicks "Open" on project in home page table
2. System navigates to `/editor/{project-id}`
3. Editor loads project data from API
4. Canvas is populated with saved components
5. User can modify components and save changes

### Editing Project Metadata

1. User clicks "Edit" icon on project in table
2. Modal dialog opens with current name/description
3. User updates fields and clicks "Update"
4. System updates project metadata (not components)

### Deleting a Project

1. User clicks "Delete" icon on project in table
2. Confirmation dialog appears
3. User confirms deletion
4. System removes project from database
5. Project list updates immediately

## Database Initialization

The new `Project` model is automatically created when the backend starts:

```python
from database import init_db
init_db()  # Creates all tables including projects
```

## Migration from Existing Setup

If you have an existing database, the new `projects` table will be automatically created on next backend startup. Existing data in `db_connectors` and `sql_queries` tables remains unchanged.

## Future Enhancements

Potential improvements for this feature:

1. **Project Templates**: Pre-built project templates for common use cases
2. **Project Duplication**: Clone existing projects
3. **Version History**: Track and restore previous versions
4. **Collaboration**: Share projects between users
5. **Export/Import**: Export projects as JSON for backup/sharing
6. **Auto-save**: Automatically save changes periodically
7. **Project Tags**: Categorize projects with tags
8. **Search/Filter**: Search projects by name or description
9. **Thumbnails**: Generate preview images of canvas layout
10. **Query Analytics**: Track which queries are used in which projects

## Testing

To test the feature:

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/`
4. Create a new project
5. Add components to canvas
6. Save the project
7. Return to home and verify project appears in list
8. Reopen project and verify components are loaded
9. Edit project metadata
10. Delete project and verify removal

## API Response Examples

**Create Project Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Dashboard",
  "description": "User analytics dashboard",
  "components": [],
  "developer_id": "default",
  "created_at": "2025-10-11T12:00:00Z",
  "updated_at": "2025-10-11T12:00:00Z"
}
```

**List Projects Response**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Dashboard",
    "description": "User analytics dashboard",
    "components": [
      {
        "id": "component-1",
        "type": "Table",
        "label": "Table",
        "position": {"x": 100, "y": 100},
        "props": {
          "queryId": "query-123",
          "striped": true
        }
      }
    ],
    "developer_id": "default",
    "created_at": "2025-10-11T12:00:00Z",
    "updated_at": "2025-10-11T12:30:00Z"
  }
]
```

