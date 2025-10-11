# Database Schema Visualizer

## Overview

The Database Schema Visualizer is an interactive widget integrated into the SQL Query Creator page that provides a visual representation of your database structure, including tables, columns, and foreign key relationships.

## Features

### Visual Diagram View
- **Interactive Node-Based Layout**: Each database table is displayed as a draggable node
- **Relationship Visualization**: Foreign key relationships are shown as animated arrows connecting tables
- **Smart Layout**: Automatic grid-based positioning for optimal viewing
- **Zoom & Pan**: Intuitive navigation with mouse/trackpad controls
- **MiniMap**: Overview of the entire schema for quick navigation

### Table Details View
- **Column Information**: Complete list of columns with types, nullability, and primary keys
- **Foreign Key Details**: Explicit listing of all foreign key relationships
- **Expandable Tables**: Collapsible sections for each table to manage information density

## Technology

Built with [ReactFlow](https://reactflow.dev/) - a powerful open-source library for building node-based visualizations in React.

## Usage

### Accessing the Visualizer

1. Navigate to the **SQL Query Creator** page
2. Select or create a **Database Connector** from the sidebar
3. The **Database Schema** section will appear below the query editor
4. Choose between two tabs:
   - **Visual Diagram**: Interactive schema visualization
   - **Table Details**: Traditional table-based view

### Visual Diagram Controls

- **Pan**: Click and drag on the background
- **Zoom**: Scroll with mouse wheel or use pinch gesture on trackpad
- **Move Tables**: Click and drag individual table nodes
- **Zoom Controls**: Use the +/- buttons in the bottom-left corner
- **Fit View**: Click the fit view button to reset zoom and center all tables
- **MiniMap**: Use the minimap in bottom-right corner for quick navigation

### Understanding the Visualization

#### Table Nodes
- **Header**: Table name with 📊 icon
- **Primary Keys**: Columns marked with 🔑 icon
- **Foreign Keys**: Columns marked with 🔗 icon (in blue background)
- **Referenced Columns**: Columns referenced by other tables (in green background)
- **Column Types**: Displayed to the right of each column name
- **Connection Points**: Small colored dots on columns involved in relationships
  - Blue dots (right side): Foreign key columns that reference other tables
  - Green dots (left side): Columns that are referenced by foreign keys

#### Relationships
- **Column-to-Column Arrows**: Point directly from foreign key column to referenced column
- **Labels**: Show exact column mapping (e.g., "manager_id → id")
- **Animation**: Animated flow indicates relationship direction
- **Blue Lines**: Foreign key relationships in blue color (#3b82f6)
- **Visual Clarity**: Each relationship connects at the specific column level, not just table-to-table

### Schema Overview Panel

The info panel in the top-left corner shows:
- Total number of tables in the database
- Total number of relationships
- **Interactive Legend**:
  - 🔑 Primary Key indicator
  - 🔗 Foreign Key indicator
  - Blue highlight: Foreign key columns
  - Green highlight: Referenced columns
- Navigation tips (drag to pan, scroll to zoom)

## Example Database

The included test database (`test.db`) demonstrates the visualizer with a real-world schema:

```
users (10 records)
├── id (PRIMARY KEY)
├── name, email, role, status
├── department, salary
└── created_at

projects (5 records)
├── id (PRIMARY KEY)
├── name, description, status
├── budget, start_date, end_date
└── manager_id → users.id (FOREIGN KEY)

tasks (10 records)
├── id (PRIMARY KEY)
├── title, description, status, priority
├── project_id → projects.id (FOREIGN KEY)
├── assigned_to → users.id (FOREIGN KEY)
└── created_at
```

### Visualized Relationships

The test database shows these relationships:
1. **projects.manager_id** → **users.id** (Each project has a manager)
2. **tasks.project_id** → **projects.id** (Each task belongs to a project)
3. **tasks.assigned_to** → **users.id** (Each task is assigned to a user)

## Benefits for Query Development

### 1. **Visual Understanding**
- Quickly grasp the overall database structure
- Identify table relationships at a glance
- Understand data flow between entities

### 2. **JOIN Query Assistance**
- See which tables can be joined and on which columns
- Visualize multi-table relationships for complex queries
- Reduce errors in foreign key references

### 3. **Schema Exploration**
- Discover tables you might not have known existed
- Find related data across tables
- Plan complex queries before writing them

### 4. **Documentation**
- Self-documenting schema for team members
- Visual aid for onboarding new developers
- Reference for database design discussions

## Implementation Details

### Frontend Components

**SchemaVisualizer.tsx**
- Custom ReactFlow implementation
- Auto-layout algorithm for table positioning
- Custom table node component with column details
- Edge rendering for foreign key relationships

**QueryCreator.tsx**
- Integration of SchemaVisualizer component
- Tab-based interface for switching between views
- Enhanced SchemaTable interface with foreign key support

### Backend API

**Endpoint**: `GET /api/connectors/{connector_id}/schema`

**Returns**:
```json
{
  "success": true,
  "database": "test.db",
  "tables": [
    {
      "name": "users",
      "columns": [...],
      "primary_keys": ["id"],
      "foreign_keys": []
    },
    {
      "name": "projects",
      "columns": [...],
      "primary_keys": ["id"],
      "foreign_keys": [
        {
          "constrained_columns": ["manager_id"],
          "referred_table": "users",
          "referred_columns": ["id"]
        }
      ]
    }
  ],
  "table_count": 3
}
```

### Database Support

The visualizer works with all supported database types:
- ✅ SQLite
- ✅ PostgreSQL
- ✅ MySQL

Foreign key information is retrieved using SQLAlchemy's inspection API, which supports all major database systems.

## Future Enhancements

Potential improvements for future versions:

1. **Export Capabilities**
   - Export schema diagram as PNG/SVG
   - Generate ERD documentation

2. **Interactive Query Building**
   - Click on relationships to auto-generate JOIN queries
   - Drag and drop tables to build SELECT statements

3. **Advanced Relationship Types**
   - Show cardinality (1:1, 1:N, M:N)
   - Display indexes and constraints
   - Show views and stored procedures

4. **Custom Layouts**
   - Save custom table positions
   - Alternative layout algorithms (hierarchical, radial)
   - Group related tables

5. **Schema Comparison**
   - Compare schemas between different databases
   - Highlight differences
   - Migration visualization

## Troubleshooting

### Visualizer Not Showing
- Ensure a connector is selected
- Verify the database connection is active
- Check that tables exist in the database

### Relationships Not Displaying
- Ensure foreign keys are properly defined in the database schema
- Check that foreign key constraints are enabled (especially for SQLite)
- Verify the backend is returning `foreign_keys` in the schema response

### Performance Issues
- For very large databases (100+ tables), the initial render may take a moment
- Consider creating focused connectors for specific schema subsets
- Use the zoom controls to navigate large schemas

## Related Files

- `/frontend/src/components/QueryCreator/SchemaVisualizer.tsx` - Main visualizer component
- `/frontend/src/components/QueryCreator/QueryCreator.tsx` - Integration point
- `/backend/db_manager.py` - Schema introspection logic
- `/backend/create_test_db.py` - Test database generator

## Resources

- [ReactFlow Documentation](https://reactflow.dev/docs)
- [SQLAlchemy Schema Inspection](https://docs.sqlalchemy.org/en/20/core/reflection.html)
- [Database Foreign Keys](https://en.wikipedia.org/wiki/Foreign_key)

