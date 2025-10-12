# Default Queries Feature

## Overview
This feature automatically generates default `SELECT * FROM [table]` queries for each table in a database connector's schema. These default queries are displayed in a tree structure in the SQL Query Creator sidebar, making it easy for users to quickly access and use basic queries for any table.

## Implementation

### Backend Changes

#### 1. Database Manager (`backend/db_manager.py`)
Added a new method `generate_default_queries()` that:
- Fetches the database schema for a connector
- Iterates through all tables
- Generates a basic `SELECT * FROM [table_name]` query for each table
- Returns a structured list of default queries

```python
def generate_default_queries(self, connector: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate default queries for all tables in the database schema.
    Creates basic SELECT * queries for each table.
    """
```

#### 2. API Endpoint (`backend/main.py`)
Added a new GET endpoint:
```
GET /api/connectors/{connector_id}/default-queries
```

This endpoint:
- Takes a connector ID as a parameter
- Returns all default queries for that connector
- Returns format:
```json
{
  "success": true,
  "connector_id": "connector-uuid",
  "queries": [
    {
      "table_name": "users",
      "query_name": "Select all from users",
      "description": "Get all records from users table",
      "sql_query": "SELECT * FROM users",
      "query_type": "SELECT"
    },
    ...
  ],
  "query_count": 5
}
```

### Frontend Changes

#### 1. Query Creator Component (`frontend/src/components/QueryCreator/QueryCreator.tsx`)

**New State Variables:**
- `defaultQueries`: Record<string, DefaultQuery[]> - Stores default queries keyed by connector ID
- `expandedConnectors`: Set<string> - Tracks which connectors have their query tree expanded

**New Functions:**
- `fetchDefaultQueries(connectorId)`: Fetches default queries for a specific connector
- `loadDefaultQuery(defaultQuery, connectorId)`: Populates the query editor with a selected default query
- `toggleConnectorExpansion(connectorId)`: Toggles the expansion state of a connector's query tree

**UI Changes:**
The Connectors tab now displays a tree structure:
```
Connector Name
  ├─ [Expand/Collapse Icon]
  └─ Default Queries (N)
      ├─ table1 (SELECT * FROM table1)
      ├─ table2 (SELECT * FROM table2)
      └─ table3 (SELECT * FROM table3)
```

**New Imports:**
- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` from `@/components/ui/collapsible`
- `ChevronDown`, `ChevronRight` icons from `lucide-react`

## User Workflow

1. **View Connectors**: Navigate to the SQL Query Creator page and go to the "Connectors" tab
2. **Expand Connector**: Click the chevron icon next to a connector to expand and see its default queries
3. **Select Query**: Click on any default query to load it into the query editor
4. **Edit & Execute**: The query is automatically populated in the editor with:
   - Query name (e.g., "Select all from users")
   - Description (e.g., "Get all records from users table")
   - SQL query (e.g., "SELECT * FROM users")
   - Connector pre-selected

5. **Save or Execute**: User can now:
   - Execute the query immediately
   - Modify the query and save it as a custom query
   - Use it as a starting point for more complex queries

## Benefits

1. **Quick Access**: Users can instantly access basic queries for any table without typing
2. **Discoverability**: New users can easily see what tables are available and query them
3. **Time Saving**: No need to manually type basic SELECT queries
4. **Learning Tool**: Shows users the correct table names and basic query syntax
5. **Starting Point**: Default queries serve as templates for more complex queries

## Future Enhancements

Potential improvements for future versions:
1. Generate more query types (COUNT, LIMIT, WHERE templates)
2. Add queries for common JOIN patterns based on foreign keys
3. Allow users to customize default query templates
4. Add query snippets for filtering and aggregation
5. Generate queries with specific column selections instead of SELECT *
6. Add pagination queries (LIMIT/OFFSET patterns)
7. Cache default queries to reduce API calls

## Technical Notes

- Default queries are fetched when connectors are loaded
- Queries are stored in component state and do not persist to the database
- Each connector can have multiple default queries (one per table)
- The tree structure uses Radix UI's Collapsible component for accessibility
- Expansion state is managed locally and resets on page reload

