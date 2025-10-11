# Getting Started with Projects 🚀

This quick guide will help you start using the new Project CRUD feature.

## What's New?

You can now:
- ✅ Create multiple canvas projects
- ✅ Save and load your work
- ✅ Manage projects from a home page
- ✅ Reuse queries across projects

## Quick Start (3 Steps)

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

Open your browser to: **http://localhost:5173/**

### Step 2: Create Your First Project

1. You'll see the home page with "Proto Projects"
2. Click **"+ New Project"** button
3. Enter a name like "My Dashboard"
4. Optional: Add a description
5. Click **"Create"**

You'll be taken to the canvas editor!

### Step 3: Build and Save

1. **Add Components**: Drag Button, Input, or Table from the left palette
2. **Position Them**: Drop components anywhere on the canvas
3. **Configure**: Click a component to edit its properties in the right panel
4. **Save**: Click the **"Save"** button in the top bar

**That's it!** Your project is now saved to the database.

## Navigating the App

### Home Page (`/`)
- Lists all your projects in a table
- Shows project name, description, component count, last updated
- Actions: Open, Edit, Delete
- Navigation: Query Creator button

### Canvas Editor (`/editor/{id}`)
- Drag-and-drop canvas in the center
- Component palette on the left
- Property panel on the right
- Top bar with Save button and Home button

### Query Creator (`/query-creator`)
- Create database connectors
- Write and test SQL queries
- Queries can be used in any project

## Working with Projects

### Opening an Existing Project

From the home page:
1. Find your project in the table
2. Click the **"Open"** button
3. Your canvas loads with all saved components

### Editing Project Info

To change the name or description:
1. Click the **pencil icon** next to a project
2. Update the fields
3. Click **"Update"**

Note: This only updates metadata, not the canvas

### Deleting a Project

1. Click the **trash icon** next to a project
2. Confirm the deletion
3. The project is permanently removed

**Warning**: Deleted projects cannot be recovered!

## Linking Queries to Tables

### Prerequisites
You need at least one saved query. If you don't have one:
1. Click **"Query Creator"** from home page
2. Create a database connector
3. Create and save a query

### Link a Query to a Table Component

1. In the canvas editor, drag a **Table** component
2. Click the table to select it
3. In the right panel, go to **"Data"** tab
4. Set **"Data Source Type"** to **"SQL Query"**
5. Select your query from the **"SQL Query"** dropdown
6. Click **"Save"** to persist

The table will automatically load data from your query!

## Reusing Queries

Queries are **independent** of projects:

```
Query "Get Users"
    ↓
    ├── Used in "Dashboard Project"
    ├── Used in "Admin Panel Project"
    └── Used in "Reports Project"
```

**Benefits:**
- Create a query once, use everywhere
- Update the query, all projects get the new data
- Delete a project, queries remain available

## Tips & Tricks

### 💡 Tip 1: Save Frequently
Click the **Save** button regularly to avoid losing work.

### 💡 Tip 2: Use Descriptive Names
Give your projects meaningful names:
- ✅ "User Analytics Dashboard"
- ✅ "Inventory Management Panel"
- ❌ "Project 1"

### 💡 Tip 3: Add Descriptions
Descriptions help you remember what each project does:
```
Name: Sales Dashboard
Description: Real-time sales metrics with filters by region and date
```

### 💡 Tip 4: Organize Your Queries
Create queries with clear, descriptive names:
- ✅ "get_active_users"
- ✅ "sales_by_region_last_30_days"
- ❌ "query1"

### 💡 Tip 5: Test Queries First
Before using a query in a project:
1. Test it in Query Creator
2. Verify it returns the expected data
3. Then link it to your Table component

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Project | Coming soon |
| Delete Component | Click component, then trash icon |
| Deselect Component | Click canvas background |

## Troubleshooting

### Problem: Can't see the Save button
**Solution**: Make sure you opened a project (URL should be `/editor/{id}`)

### Problem: Changes not saving
**Checklist**:
- [ ] Click the Save button after making changes
- [ ] Check browser console for errors
- [ ] Verify backend is running (http://localhost:8000)
- [ ] Look for "Last saved" timestamp

### Problem: Query not showing in dropdown
**Checklist**:
- [ ] Save the query in Query Creator first
- [ ] Refresh the browser page
- [ ] Check that you selected a connector when creating the query

### Problem: Table shows "Failed to fetch"
**Checklist**:
- [ ] Query is valid (test in Query Creator)
- [ ] Backend is running
- [ ] Database connection is working
- [ ] Table component has correct queryId

## What's Stored in a Project?

When you save a project, the database stores:

```json
{
  "id": "uuid-here",
  "name": "My Dashboard",
  "description": "Analytics dashboard",
  "components": [
    {
      "id": "component-1",
      "type": "Table",
      "position": {"x": 100, "y": 100},
      "props": {
        "queryId": "query-uuid",
        "striped": true
      }
    }
    // ... more components
  ],
  "developer_id": "default",
  "created_at": "2025-10-11T12:00:00Z",
  "updated_at": "2025-10-11T12:30:00Z"
}
```

Each component stores:
- Position on canvas
- Size (width/height)
- All property values
- Event handlers
- References to queries (not the query itself)

## Next Steps

Now that you know the basics:

1. **Create a sample project** with a few components
2. **Create a database connector** for your database
3. **Write a SQL query** to fetch some data
4. **Link the query** to a Table component
5. **Save and reload** to verify persistence works

## Need Help?

Check these resources:
- **QUICKSTART.md** - Full setup guide
- **PROJECT_CRUD_FEATURE.md** - Technical details
- **FEATURE_SUMMARY.md** - Architecture overview
- **README.md** - Complete documentation

## API Reference (Advanced)

If you want to interact with the API directly:

### List all projects
```bash
curl http://localhost:8000/api/projects
```

### Get a specific project
```bash
curl http://localhost:8000/api/projects/{project-id}
```

### Create a project
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Test project",
    "components": []
  }'
```

### Update a project
```bash
curl -X PUT http://localhost:8000/api/projects/{project-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "components": [...]
  }'
```

### Delete a project
```bash
curl -X DELETE http://localhost:8000/api/projects/{project-id}
```

---

**Happy Building!** 🎨

If you encounter any issues or have questions, check the documentation files or open an issue.

