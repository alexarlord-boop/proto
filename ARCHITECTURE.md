# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                │
│                        http://localhost:5173                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────┐        ┌──────────────────────────┐     │
│  │   Visual Editor       │        │    Query Creator         │     │
│  │   (DnDEditor)         │◄──────►│    (QueryCreator)        │     │
│  │                       │  Nav   │                          │     │
│  │  ┌─────────────────┐ │        │  ┌────────────────────┐  │     │
│  │  │ Canvas          │ │        │  │ Connector Manager  │  │     │
│  │  │ - Components    │ │        │  │ - Create           │  │     │
│  │  │ - Drag & Drop   │ │        │  │ - List             │  │     │
│  │  └─────────────────┘ │        │  │ - Schema Browser   │  │     │
│  │                       │        │  └────────────────────┘  │     │
│  │  ┌─────────────────┐ │        │                          │     │
│  │  │ Property Panel  │ │        │  ┌────────────────────┐  │     │
│  │  │ - Properties    │ │        │  │ Query Manager      │  │     │
│  │  │ - Events        │ │        │  │ - Create           │  │     │
│  │  │ - Query Select  │◄┼────────┼──┤ - Validate         │  │     │
│  │  └─────────────────┘ │        │  │ - Execute          │  │     │
│  │                       │        │  │ - Save             │  │     │
│  │  ┌─────────────────┐ │        │  └────────────────────┘  │     │
│  │  │ Component       │ │        │                          │     │
│  │  │ Palette         │ │        │  ┌────────────────────┐  │     │
│  │  │ - Button        │ │        │  │ Results Viewer     │  │     │
│  │  │ - Input         │ │        │  │ - Table            │  │     │
│  │  │ - Table ◄───────┼─┼────────┼──┤ - Export           │  │     │
│  │  │ - Tabs          │ │        │  └────────────────────┘  │     │
│  │  │ - Select        │ │        │                          │     │
│  │  └─────────────────┘ │        └──────────────────────────┘     │
│  └───────────────────────┘                                         │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                    │
│                        http://localhost:8000                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      API Endpoints (main.py)                 │   │
│  │                                                              │   │
│  │  ┌──────────────────┐         ┌──────────────────────┐    │   │
│  │  │ Connector API    │         │ Query API            │    │   │
│  │  │ - POST /create   │         │ - POST /create       │    │   │
│  │  │ - GET /list      │         │ - GET /list          │    │   │
│  │  │ - GET /schema    │         │ - PUT /update        │    │   │
│  │  │ - DELETE /remove │         │ - DELETE /remove     │    │   │
│  │  └──────────────────┘         │ - POST /validate     │    │   │
│  │                                │ - GET /execute       │    │   │
│  │                                └──────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Database Manager (db_manager.py)                │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │ Connection   │  │ Validation   │  │ Schema       │    │   │
│  │  │ Management   │  │ Engine       │  │ Inspector    │    │   │
│  │  │ - Pool       │  │ - Syntax     │  │ - Tables     │    │   │
│  │  │ - Cache      │  │ - Type Check │  │ - Columns    │    │   │
│  │  │ - Health     │  │ - Warnings   │  │ - Relations  │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │            Query Executor                         │    │   │
│  │  │  - Safe execution with limits                    │    │   │
│  │  │  - Column extraction                             │    │   │
│  │  │  - Error handling                                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              ORM Models (database.py)                        │   │
│  │                                                              │   │
│  │  ┌────────────────────┐       ┌────────────────────────┐  │   │
│  │  │ DBConnector        │       │ SQLQuery               │  │   │
│  │  │ - id               │       │ - id                   │  │   │
│  │  │ - name             │       │ - name                 │  │   │
│  │  │ - db_type          │       │ - sql_query            │  │   │
│  │  │ - connection_info  │       │ - connector_id (FK)    │  │   │
│  │  │ - is_active        │       │ - project_id           │  │   │
│  │  │ - timestamps       │       │ - developer_id         │  │   │
│  │  │                    │       │ - is_valid             │  │   │
│  │  │                    │       │ - validation_error     │  │   │
│  │  │                    │       │ - last_executed        │  │   │
│  │  │                    │       │ - timestamps           │  │   │
│  │  └────────────────────┘       └────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                  ┌──────────────┴────────────────┐
                  │                                │
        ┌─────────▼──────────┐         ┌─────────▼──────────┐
        │  Metadata Storage  │         │  Target Databases  │
        │   (SQLite)         │         │                    │
        │  proto_queries.db  │         │  ┌──────────────┐ │
        │                    │         │  │ SQLite       │ │
        │  - db_connectors   │         │  │ PostgreSQL   │ │
        │  - sql_queries     │         │  │ MySQL        │ │
        │                    │         │  └──────────────┘ │
        └────────────────────┘         └────────────────────┘
```

## Data Flow

### 1. Creating a Query

```
User → Query Creator UI → POST /api/queries
                               ↓
                    Validate with target DB
                               ↓
                    Save to metadata DB
                               ↓
                    Return query object
```

### 2. Using Query in Table Component

```
User drags Table → Property Panel → Select Query
                                        ↓
                            Component stores queryId
                                        ↓
                            Component mounts
                                        ↓
                    GET /api/queries/{id}/execute
                                        ↓
                    Fetch from target DB
                                        ↓
                    Format for table display
                                        ↓
                    Return columns + data
                                        ↓
                    Table renders data
```

### 3. Schema Browsing

```
User selects connector → GET /api/connectors/{id}/schema
                                    ↓
                        Connect to target DB
                                    ↓
                        Introspect tables
                                    ↓
                        Get columns & relations
                                    ↓
                        Return structured schema
                                    ↓
                        Display in UI
```

## Technology Stack

### Frontend
```
React 19.1.1
├── TypeScript (Type safety)
├── Vite (Build tool)
├── Tailwind CSS (Styling)
├── Shadcn UI (Components)
└── DndKit (Drag & Drop)
```

### Backend
```
FastAPI 0.104.1
├── SQLAlchemy 2.0.23 (ORM + Direct queries)
├── Pydantic 2.5.0 (Validation)
├── Uvicorn 0.24.0 (ASGI server)
├── psycopg2-binary (PostgreSQL)
├── pymysql (MySQL)
└── aiosqlite (SQLite async)
```

## Security Layers

```
┌────────────────────────────────────┐
│ Frontend Input Validation          │
│ - Required fields                  │
│ - Type checking                    │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│ Backend Validation (Pydantic)      │
│ - Schema validation                │
│ - Type coercion                    │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│ SQL Query Validation               │
│ - Syntax check                     │
│ - Compilation                      │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│ Connection Testing                 │
│ - Pre-save connection test         │
│ - Pool health checks               │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│ Safe Execution                     │
│ - Automatic LIMIT                  │
│ - Error handling                   │
│ - Transaction management           │
└────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                   (nginx/CloudFlare)                    │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
    ┌────────▼────────┐      ┌───────▼────────┐
    │  Frontend App   │      │  Backend API   │
    │  (Static Files) │      │  (Containers)  │
    │  CDN/S3         │      │  Auto-scaling  │
    └─────────────────┘      └───────┬────────┘
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                ┌───────▼────────┐      ┌────────▼─────────┐
                │ Metadata DB    │      │ Connection Pool  │
                │ (PostgreSQL)   │      │ (Redis Cache)    │
                │ Managed/RDS    │      └────────┬─────────┘
                └────────────────┘               │
                                      ┌──────────▼──────────┐
                                      │  Target Databases   │
                                      │  (Customer DBs)     │
                                      └─────────────────────┘
```

## Component Relationships

```
ComponentInstance
├── BaseComponentMetadata
│   ├── id: string
│   ├── type: string
│   ├── position: Position
│   └── eventHandlers: EventHandler[]
│
└── ComponentSpecificProps
    └── TableProps
        ├── columns: Column[]
        ├── dataSourceType: 'url' | 'query'
        ├── dataSource?: string
        ├── queryId?: string  ◄─── Links to SQLQuery.id
        └── data?: any[]

SQLQuery
├── id: string  ◄─────────────────────┘
├── name: string
├── sql_query: string
├── connector_id: string  ◄─── Links to DBConnector.id
├── is_valid: boolean
└── timestamps

DBConnector
├── id: string  ◄─────────────────────┘
├── name: string
├── db_type: 'sqlite' | 'postgresql' | 'mysql'
├── connection_info
└── is_active: boolean
```

## State Management

### Frontend State
```
App Level:
- currentPath (routing)

Query Creator:
- connectors[]
- queries[]
- selectedConnector
- schema[]
- form state

Property Panel:
- savedQueries[] (cached)
- component (selected)

Table Component:
- data[]
- columns[]
- loading
- error
```

### Backend State
```
Database Manager:
- engines{} (cached connections)

Request State:
- db session (per request)
- validation results (ephemeral)
```

## Error Handling Flow

```
User Action
    ↓
Try: Operation
    ↓
    ├─ Success → Update UI → Show feedback
    │
    └─ Error → Catch → Log
                 ↓
            Format message
                 ↓
            Return to user
                 ↓
            Display in UI
```

## Performance Considerations

1. **Connection Pooling**: Reuse DB connections
2. **Query Limits**: Default 1000 rows max
3. **Caching**: Engine caching in backend
4. **Lazy Loading**: Queries loaded on demand
5. **Pagination**: Ready for implementation
6. **Indexes**: On foreign keys and search fields

## Scalability Path

1. **Horizontal Scaling**: Stateless API servers
2. **Database Sharding**: By project_id
3. **Caching Layer**: Redis for results
4. **CDN**: Static frontend assets
5. **Queue System**: For long-running queries
6. **Monitoring**: Metrics and logging

