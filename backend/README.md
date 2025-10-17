# Proto Backend

FastAPI backend for the Proto low-code platform.

## Quick Start

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate  # Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Server
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. View API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

---

## Demo Databases

The backend includes scripts to create demo databases for testing:

### Quick Setup (All Databases)

**macOS/Linux:**
```bash
./setup_demo_dbs.sh
```

**Windows:**
```bash
setup_demo_dbs.bat
```

### Individual Setup

Create specific databases:

```bash
# Simple test database (users, projects, tasks)
python create_test_db.py

# E-commerce database (customers, products, orders)
python create_ecommerce_test_db.py

# Complex learning platform (courses, students, enrollments)
python create_complex_test_db.py
```

---

## Files Overview

- **`main.py`** - FastAPI application with all API endpoints
- **`database.py`** - SQLAlchemy models for metadata storage
- **`db_manager.py`** - Database connection management for target databases
- **`requirements.txt`** - Python dependencies
- **`proto_queries.db`** - Metadata database (created automatically)
- **`test.db`**, **`ecommerce.db`**, **`complex_test.db`** - Demo databases (created by scripts)

---

## API Endpoints

### Projects
- `POST /api/projects` - Create a new project
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Database Connectors
- `POST /api/connectors` - Create database connector
- `GET /api/connectors` - List all connectors
- `GET /api/connectors/{id}` - Get connector by ID
- `PUT /api/connectors/{id}` - Update connector
- `DELETE /api/connectors/{id}` - Delete connector
- `GET /api/connectors/{id}/schema` - Get database schema

### SQL Queries
- `POST /api/queries` - Create SQL query
- `GET /api/queries` - List all queries (filterable by project/developer)
- `GET /api/queries/{id}` - Get query by ID
- `PUT /api/queries/{id}` - Update query
- `DELETE /api/queries/{id}` - Delete query
- `POST /api/queries/validate` - Validate SQL syntax
- `GET /api/queries/{id}/execute` - Execute query and return results

### Export
- `POST /api/export/static` - Export project as static HTML
- `POST /api/export/fullstack` - Export project as full-stack ZIP package

---

## Database Schema

### Metadata Database (`proto_queries.db`)

**projects**
- Project information and components (JSON)
- Created/updated timestamps

**db_connectors**
- Database connection configurations
- Supports SQLite, PostgreSQL, MySQL

**sql_queries**
- Stored SQL queries with metadata
- Links to connectors and projects
- Validation status and results

---

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Database URL (defaults to sqlite:///./proto_queries.db)
DATABASE_URL=sqlite:///./proto_queries.db

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server settings
HOST=0.0.0.0
PORT=8000
```

---

## Development

### Running Tests
```bash
# Run with pytest (if tests are added)
pytest
```

### Linting
```bash
# Using pylint
pylint *.py

# Using flake8
flake8 *.py
```

### Database Reset
To reset the metadata database:
```bash
rm proto_queries.db
# Restart the server - it will recreate the database
```

---

## Troubleshooting

**Port 8000 already in use:**
```bash
uvicorn main:app --reload --port 8001
```

**Database connection errors:**
- Check database file paths (use `./` for relative paths)
- Ensure database files exist
- For PostgreSQL/MySQL, verify server is running

**Import errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

---

For more information, see the main [project README](../README.md) or the [Quick Start Guide](../QUICKSTART.md).

