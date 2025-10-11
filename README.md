# Proto - SQL Query Builder & Visual Editor

A comprehensive low-code platform with project management, SQL query builder, and visual component editor.

## Features

### 1. Project Management 🆕
- **Create Projects**: Build multiple canvas-based applications
- **Save & Load**: Persist canvas layouts with all components and properties
- **Project Library**: Manage all your projects from a central home page
- **Query Reusability**: Share SQL queries across multiple projects
- **Version Tracking**: Automatic timestamps for created and updated dates

### 2. SQL Query Creator
- **Database Connectors**: Support for SQLite, PostgreSQL, and MySQL
- **Query Management**: Create, read, update, and delete SQL queries
- **Real-time Validation**: Validate SQL queries before execution
- **Schema Browser**: View database tables, columns, types, and relationships
- **Query Execution**: Test queries and view results directly in the interface
- **Per-Project Storage**: Queries are saved per developer per project
- **Full-Screen Schema Diagram**: Expand schema visualizer for better manipulation 🆕

### 3. Visual Component Editor
- **Drag-and-Drop Interface**: Build UIs by dragging components onto a canvas
- **Component Library**: Buttons, Inputs, Tabs, Selects, and Tables
- **Property Panel**: Edit component properties, styles, and behaviors
- **Event Handlers**: Add custom JavaScript event handlers to components
- **Data Binding**: Connect table components to SQL queries or API endpoints
- **Persistent Canvas**: Save your layouts and reload them anytime
- **Full-Screen Preview**: View your canvas as end-users would see it 🆕
- **Project Export**: Export as standalone HTML or full-stack package 🆕

### 4. Data Integration
- **SQL Query Data Sources**: Use saved SQL queries to populate table components
- **API Endpoints**: Connect to external APIs for data fetching
- **Static Data**: Define inline JSON data for quick prototyping
- **Auto-refresh**: Tables automatically fetch data when mounted

### 5. Project Export 🆕 🚀
- **Static Bundle**: Export as single HTML file (works offline with snapshot data)
- **Full-Stack Package**: Export as ZIP with frontend + minimal backend
- **Data Strategies**: Choose between snapshot (embedded) or live (dynamic) data
- **Deployment Ready**: Deploy to Vercel, Netlify, Heroku, AWS, or anywhere
- **Zero Config**: Exported apps work out of the box

## Architecture

### Backend (FastAPI)
```
backend/
├── main.py              # API endpoints
├── database.py          # Database models (SQLite for metadata)
├── db_manager.py        # Target database connection management
└── requirements.txt     # Python dependencies
```

**Key Endpoints:**
- `POST /api/projects` - Create canvas project
- `GET /api/projects` - List all projects
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/connectors` - Create database connector
- `GET /api/connectors` - List all connectors
- `GET /api/connectors/{id}/schema` - Get database schema
- `POST /api/queries` - Create SQL query
- `GET /api/queries` - List all queries
- `PUT /api/queries/{id}` - Update query
- `POST /api/queries/validate` - Validate query syntax
- `GET /api/queries/{id}/execute` - Execute query and return results

### Frontend (React + TypeScript)
```
frontend/src/
├── components/
│   ├── ProjectManager/
│   │   └── ProjectManager.tsx    # Project list and CRUD UI
│   ├── Editor/
│   │   ├── DnDEditor.tsx         # Main editor with save/load
│   │   ├── DnDCanvas.tsx         # Drag-and-drop canvas
│   │   ├── DnDPalette.tsx        # Component palette
│   │   ├── PropertyPanel.tsx     # Property editor with query selection
│   │   ├── component-registry.tsx # Component definitions
│   │   └── types.ts              # TypeScript types
│   ├── QueryCreator/
│   │   └── QueryCreator.tsx      # SQL query management UI
│   └── ui/                       # Shadcn UI components
└── App.tsx                       # Routing (/, /editor/{id}, /query-creator)
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pnpm (or npm/yarn)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Test Databases (Optional)

To get started quickly with sample data, we provide test database scripts for three different database systems:

#### Quick Setup (All Databases)
```bash
cd backend
./setup_test_dbs.sh
```

This interactive script will help you set up:
- **SQLite** test database (no Docker required)
- **PostgreSQL** test database (with Docker)
- **MySQL** test database (with Docker)

#### Individual Setup

**SQLite** (Simplest - no dependencies):
```bash
cd backend
python create_test_db.py
```

**PostgreSQL** (Recommended for production-like testing):
```bash
# Start PostgreSQL with Docker
docker run --name proto-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Create test database
cd backend
python create_postgres_test_db.py
```

**MySQL** (Alternative):
```bash
# Start MySQL with Docker
docker run --name proto-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8

# Create test database
cd backend
python create_mysql_test_db.py
```

All test databases contain the same schema with sample data:
- 10 users (with departments, roles, salaries)
- 5 projects (with budgets, dates, managers)
- 10 tasks (with assignments, priorities, statuses)

For detailed information, connection settings, and troubleshooting, see [backend/TEST_DATABASES.md](backend/TEST_DATABASES.md).

## Usage Guide

### Creating a New Project

1. Open the app at `http://localhost:5173/` (you'll see the home page)
2. Click **+ New Project**
3. Enter a project name and optional description
4. Click **Create** - you'll be taken to the canvas editor
5. Drag components from the left palette onto the canvas
6. Configure component properties in the right panel
7. Link Table components to saved SQL queries
8. Click **Save** to persist your project

### Managing Projects

From the home page you can:
- **Open**: Edit a project in the canvas
- **Edit**: Update project name and description  
- **Delete**: Remove a project (with confirmation)

### Creating a Database Connector

1. Navigate to **Query Creator** (button in top-right)
2. Go to the **Connectors** tab
3. Click **+ New Connector**
4. Fill in the connection details:
   - **SQLite**: Name and database file path
   - **PostgreSQL/MySQL**: Name, host, port, database, username, password
5. Click **Create Connector** (connection is tested automatically)

### Creating a SQL Query

1. Select a connector from the **Connectors** tab
2. Go to the **Queries** tab
3. Click **+ New Query**
4. Enter:
   - Query Name
   - Description (optional)
   - SQL Query
5. Click **Validate** to check syntax
6. Click **Execute** to test the query
7. Click **Save Query** to persist it

### Using Queries in Table Components

1. In the **Visual Editor**, drag a **Table** component onto the canvas
2. Select the table component
3. In the **Property Panel** → **Data** tab:
   - Set **Data Source Type** to "SQL Query"
   - Select your saved query from the **SQL Query** dropdown
4. The table will automatically fetch and display data from the query

### Using Full-Screen Preview 🆕

**Canvas Preview:**
1. Open any project in the editor
2. Click the **Preview** button in the top toolbar (next to Save)
3. View your canvas without editor UI elements
4. Press **ESC** or click the close button to exit

**Schema Diagram Preview:**
1. Navigate to Query Creator
2. Select a database connector
3. Click **Full Screen** button in the schema info overlay
4. Use enhanced space to manipulate complex schemas
5. Press **ESC** or click the close button to exit

### Exporting Your Project 🆕

1. Open your project in the editor
2. Click the **Export** button (green button next to Preview)
3. Choose export format:
   - **Static Bundle** - Single HTML file (recommended for demos)
   - **Full-Stack Package** - ZIP with frontend + backend (for production)
4. Choose data strategy:
   - **Snapshot Data** - Embed current query results (works offline)
   - **Live Queries** - Keep dynamic data (requires backend)
5. Click **Export Project** and download your file

**Deployment Options:**
- **Static Bundle:** Deploy to Vercel, Netlify, GitHub Pages, or open locally
- **Full-Stack:** Extract ZIP, start backend with `python main.py`, open frontend

See [PROJECT_EXPORT_FEATURE.md](PROJECT_EXPORT_FEATURE.md) for detailed documentation.

### Alternative: Using API Endpoints

1. Set **Data Source Type** to "URL/API Endpoint"
2. Enter the API URL in **Data Source URL**
3. The response should be in format:
```json
{
  "columns": [
    {"key": "id", "label": "ID"},
    {"key": "name", "label": "Name"}
  ],
  "data": [
    {"id": "1", "name": "Alice"},
    {"id": "2", "name": "Bob"}
  ]
}
```

## Database Schema

### Metadata Storage (SQLite - `proto_queries.db`)

**db_connectors table:**
- Stores database connection configurations
- Fields: id, name, db_type, host, port, database, username, password, is_active, timestamps

**sql_queries table:**
- Stores SQL queries with metadata
- Fields: id, name, description, sql_query, connector_id, project_id, developer_id, is_valid, validation_error, last_executed, timestamps

**projects table:** 🆕
- Stores canvas projects with components
- Fields: id, name, description, components (JSON), developer_id, timestamps
- Components are stored as JSON array of ComponentInstance objects

### Target Databases
- The system connects to your actual databases (SQLite, PostgreSQL, MySQL)
- No data is stored in the metadata DB, only connection info and queries
- Queries are executed directly against target databases

## Security Considerations

⚠️ **Important for Production:**

1. **Password Encryption**: Currently passwords are stored in plain text. Implement encryption before production use.
2. **Authentication**: Add user authentication and authorization.
3. **Query Sandboxing**: Restrict query execution to SELECT statements or implement permission levels.
4. **Rate Limiting**: Add rate limiting to prevent abuse.
5. **Connection Pooling**: Configured with `pool_pre_ping` and `pool_recycle`.
6. **SQL Injection**: SQLAlchemy's `text()` with parameterization helps, but validate user input.

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Shadcn UI**: Component library
- **DndKit**: Drag-and-drop

## API Examples

### Create a Connector
```bash
curl -X POST http://localhost:8000/api/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SQLite DB",
    "db_type": "sqlite",
    "database": "./mydata.db"
  }'
```

### Create a Query
```bash
curl -X POST http://localhost:8000/api/queries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Get All Users",
    "description": "Fetch all users from users table",
    "sql_query": "SELECT * FROM users",
    "connector_id": "connector-uuid-here",
    "project_id": "default",
    "developer_id": "default"
  }'
```

### Execute a Query
```bash
curl http://localhost:8000/api/queries/{query-id}/execute
```

## Troubleshooting

### Backend Issues

**Error: "Connection failed"**
- Verify database is running
- Check connection credentials
- Ensure database is accessible from backend

**Error: "Query validation failed"**
- Check SQL syntax
- Verify table/column names exist
- Ensure proper permissions

### Frontend Issues

**Error: "Failed to fetch queries"**
- Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Verify API endpoints are accessible

**Table not displaying data**
- Check browser console for fetch errors
- Verify query ID is correct
- Ensure query returns data when executed

## Documentation

- **QUICKSTART.md** - Step-by-step getting started guide
- **PROJECT_CRUD_FEATURE.md** - Detailed technical documentation for projects feature
- **PROJECT_EXPORT_FEATURE.md** - Complete export feature guide and deployment strategies 🆕
- **FEATURE_SUMMARY.md** - Complete implementation summary with architecture diagrams
- **ARCHITECTURE.md** - Overall system architecture
- **IMPLEMENTATION_SUMMARY.md** - Development history and decisions
- **FULL_SCREEN_PREVIEW.md** - Full-screen preview feature documentation
- **SNAP_TO_GRID_FEATURE.md** - Snap to grid functionality documentation

## Future Enhancements

### Export & Deployment
- [x] Static HTML export (with snapshot/live data) ✅
- [x] Full-stack package export (ZIP) ✅
- [ ] Desktop executable export (Electron/Tauri)
- [ ] Docker Compose generation
- [ ] Progressive Web App (PWA) export
- [ ] Mobile app export (React Native)
- [ ] CI/CD integration templates

### Projects
- [ ] Project templates and duplication
- [ ] Version history and restore
- [x] Project export (Static/Full-stack) ✅
- [ ] Auto-save functionality
- [ ] Project tags and search
- [ ] Canvas thumbnails

### Queries
- [ ] Query parameter support
- [ ] Query scheduling/cron jobs
- [ ] Export query results (CSV, JSON, Excel)
- [ ] Visual query builder (no SQL required)
- [ ] Query versioning and history
- [ ] Collaborative query editing

### Platform
- [ ] Performance monitoring
- [ ] Query optimization suggestions
- [ ] Multi-tenant support
- [ ] Role-based access control
- [ ] User authentication

## Contributing

This is a prototype application. Feel free to extend and customize for your needs.

## License

MIT License - feel free to use in your projects.

