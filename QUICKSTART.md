# Quick Start Guide

Get up and running with Proto in 5 minutes!

## Overview

Proto is a visual application builder with:
- **Project Management**: Create and manage multiple canvas projects
- **Drag & Drop Editor**: Build UIs with pre-built components
- **Query Management**: Create reusable SQL queries
- **Data Binding**: Link components to database queries

## 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

The database will be automatically initialized with the following tables:
- `db_connectors` - Database connection configurations
- `sql_queries` - Saved SQL queries
- `projects` - Canvas projects with components

## 2. Start the Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will be available at `http://localhost:5173`

## 3. Create a Test Database (SQLite Example)

Create a sample SQLite database for testing:

```python
# create_test_db.py
import sqlite3

conn = sqlite3.connect('test.db')
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Insert sample data
users = [
    ('Alice Johnson', 'alice@example.com', 'Admin', 'Active'),
    ('Bob Smith', 'bob@example.com', 'Developer', 'Active'),
    ('Carol White', 'carol@example.com', 'Designer', 'Away'),
    ('David Brown', 'david@example.com', 'Manager', 'Active'),
    ('Eve Davis', 'eve@example.com', 'Developer', 'Active'),
]

cursor.executemany(
    'INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)',
    users
)

conn.commit()
conn.close()

print("Test database created: test.db")
```

Run it:
```bash
cd backend
python create_test_db.py
```

## 4. Create Your First Connector

1. Open the app: `http://localhost:5173`
2. Click **Query Creator** button (top-right)
3. Go to **Connectors** tab
4. Click **+ New Connector**
5. Enter:
   - **Name**: Test Database
   - **Type**: SQLite
   - **Database**: test.db (or full path: `/path/to/backend/test.db`)
6. Click **Create Connector**

## 5. Create Your First Query

1. Select "Test Database" from the connectors list
2. Go to **Queries** tab
3. Click **+ New Query**
4. Enter:
   - **Name**: Get All Users
   - **Description**: Fetch all users
   - **SQL Query**: `SELECT * FROM users`
5. Click **Validate** (should show green success)
6. Click **Execute** (should show data in table)
7. Click **Save Query**

## 6. Use Query in Visual Editor

1. Click **← Back to Editor**
2. From the palette (left side), drag a **Table** component onto the canvas
3. Click on the table to select it
4. In the **Property Panel** (right side):
   - Go to **Data** tab
   - Set **Data Source Type** to "SQL Query"
   - Select "Get All Users" from **SQL Query** dropdown
5. The table will automatically populate with data!

## 7. Try Different Database Types

### PostgreSQL Example

```bash
# Using Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

Create connector:
- **Name**: Postgres DB
- **Type**: PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres
- **Password**: password

### MySQL Example

```bash
# Using Docker
docker run --name mysql-test -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql
```

Create connector:
- **Name**: MySQL DB
- **Type**: MySQL
- **Host**: localhost
- **Port**: 3306
- **Database**: mysql
- **Username**: root
- **Password**: password

## 8. Explore Features

### Schema Browser
- Select a connector in Query Creator
- Expand tables to see columns, types, and keys
- Use this to help write queries

### Query Validation
- Write any SQL query
- Click **Validate** to check syntax
- See query type (SELECT, INSERT, etc.)

### Multiple Tables
- Create different queries for different data
- Add multiple table components to your canvas
- Each can use a different query

### Static Data
You can also use static data without queries:
1. Add a Table component
2. Keep **Data Source Type** as "URL/API Endpoint"
3. Leave **Data Source URL** empty
4. Edit **Static Data** with JSON:
```json
[
  {"id": "1", "name": "Item 1", "status": "Active"},
  {"id": "2", "name": "Item 2", "status": "Inactive"}
]
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore other component types (Buttons, Inputs, Tabs, Selects)
- Try adding event handlers to components
- Connect to your real databases

## Common Issues

**"Connection failed"**
- Check if database file exists
- For SQLite, use absolute path if relative doesn't work
- For PostgreSQL/MySQL, ensure server is running

**"Query not found"**
- Make sure you saved the query
- Try refreshing the queries list
- Check browser console for errors

**Table not showing data**
- Ensure query is valid (green checkmark)
- Try executing query in Query Creator first
- Check that **Data Source Type** is set to "SQL Query"

## Working with Projects

### Creating a New Project

1. From the home page, click "New Project"
2. Enter a project name and optional description
3. Click "Create" - you'll be taken to the canvas editor
4. Drag components from the palette to the canvas
5. Configure component properties in the right panel
6. Link Table components to saved queries
7. Click "Save" to persist your project

### Managing Projects

- **Open**: Click "Open" to edit a project in the canvas
- **Edit**: Click the pencil icon to update project name/description
- **Delete**: Click the trash icon to remove a project (with confirmation)

### Reusing Queries

Queries are independent of projects and can be reused:
1. Create queries in the Query Creator
2. In any project, select a Table component
3. Set "Data Source Type" to "SQL Query"
4. Choose from your saved queries in the dropdown
5. The table will automatically load data from that query

Each project stores:
- All component instances and their positions
- Component properties and configurations
- References to queries (not the queries themselves)
- Custom event handlers and layouts

## Tips

1. **Use the schema browser** to understand your database structure
2. **Always validate** queries before saving
3. **Test execution** in Query Creator before using in tables
4. **Name queries clearly** so they're easy to find later
5. **Add descriptions** to queries for better documentation

Happy building! 🚀

