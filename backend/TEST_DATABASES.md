# Test Databases Guide

This directory contains scripts to create test databases with sample data for testing the Query Creator. You can choose from three different relational database systems.

## Available Test Databases

### 1. SQLite (Default - No Setup Required)
**Script:** `create_test_db.py`

✅ **Advantages:**
- No installation required
- File-based (portable)
- Perfect for quick testing
- Works out of the box

**Usage:**
```bash
cd backend
python create_test_db.py
```

This creates `test.db` file in the backend directory.

**Connection Settings in App:**
- Type: SQLite
- Database Path: `./test.db` (relative to backend)

---

### 2. PostgreSQL (Production-Grade)
**Script:** `create_postgres_test_db.py`

✅ **Advantages:**
- Industry-standard database
- Advanced features (JSONB, full-text search, etc.)
- Better performance for complex queries
- ACID compliant with robust constraints

#### Quick Setup with Docker:
```bash
# Start PostgreSQL container
docker run --name proto-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

# Wait a few seconds, then run the script
cd backend
python create_postgres_test_db.py
```

#### Custom Configuration:
Set environment variables before running:
```bash
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=proto_test

python create_postgres_test_db.py
```

**Connection Settings in App:**
- Type: PostgreSQL
- Host: localhost
- Port: 5432
- Database: proto_test
- Username: postgres
- Password: postgres

---

### 3. MySQL (Popular Alternative)
**Script:** `create_mysql_test_db.py`

✅ **Advantages:**
- Widely used database
- InnoDB engine with foreign keys
- UTF-8 support (including emojis)
- Good documentation and community

#### Quick Setup with Docker:
```bash
# Start MySQL container
docker run --name proto-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -p 3306:3306 \
  -d mysql:8

# Wait ~10 seconds for MySQL to initialize, then run
cd backend
python create_mysql_test_db.py
```

#### Custom Configuration:
Set environment variables before running:
```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=root
export MYSQL_PASSWORD=password
export MYSQL_DB=proto_test

python create_mysql_test_db.py
```

**Connection Settings in App:**
- Type: MySQL
- Host: localhost
- Port: 3306
- Database: proto_test
- Username: root
- Password: password

---

## Test Data Schema

All three databases contain the same schema and data:

### Tables

**users** (10 records)
- id, name, email, role, status, department, salary, created_at
- Sample departments: Engineering, Design, Management, Quality, Product

**projects** (5 records)
- id, name, description, status, budget, start_date, end_date, manager_id
- Sample projects: Website Redesign, Mobile App, API Integration, etc.

**tasks** (10 records)
- id, title, description, project_id, assigned_to, status, priority, due_date, created_at
- Various statuses and priorities

### Relationships
- `projects.manager_id` → `users.id`
- `tasks.project_id` → `projects.id`
- `tasks.assigned_to` → `users.id`

---

## Example Queries to Test

All these queries work across all three databases:

1. **Simple Select:**
   ```sql
   SELECT * FROM users
   ```

2. **Filtering:**
   ```sql
   SELECT * FROM projects WHERE status = 'In Progress'
   ```

3. **Join Query:**
   ```sql
   SELECT u.name, t.title, t.status 
   FROM tasks t 
   JOIN users u ON t.assigned_to = u.id
   ```

4. **Aggregation:**
   ```sql
   SELECT department, COUNT(*) as count, AVG(salary) as avg_salary 
   FROM users 
   GROUP BY department
   ```

5. **Complex Join with Aggregation:**
   ```sql
   SELECT p.name as project, COUNT(t.id) as task_count 
   FROM projects p 
   LEFT JOIN tasks t ON p.id = t.project_id 
   GROUP BY p.id, p.name
   ```

---

## Comparison Matrix

| Feature | SQLite | PostgreSQL | MySQL |
|---------|--------|------------|-------|
| Setup Complexity | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium |
| Installation | None | Docker/Local | Docker/Local |
| Performance | Good | Excellent | Excellent |
| Concurrent Writes | Limited | Excellent | Excellent |
| Storage | File | Server | Server |
| Best For | Development, Testing | Production, Complex Queries | Production, Web Apps |

---

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep proto-postgres

# View logs
docker logs proto-postgres

# Connect manually to test
psql -U postgres -h localhost -p 5432 -d proto_test
```

### MySQL Connection Issues
```bash
# Check if MySQL is running
docker ps | grep proto-mysql

# View logs
docker logs proto-mysql

# Connect manually to test
mysql -u root -p -h localhost -P 3306 -D proto_test
# Password: password
```

### Common Errors

**"Connection refused"**
- Ensure the database server is running
- Check the port is not already in use
- Verify firewall settings

**"Access denied"**
- Check username and password
- Verify user has appropriate permissions
- For PostgreSQL: Check `pg_hba.conf` settings

**"Database does not exist"**
- The scripts automatically create the database
- Ensure user has CREATE DATABASE permission

---

## Clean Up

### Stop and Remove Docker Containers:
```bash
# PostgreSQL
docker stop proto-postgres
docker rm proto-postgres

# MySQL
docker stop proto-mysql
docker rm proto-mysql
```

### Delete SQLite Database:
```bash
rm backend/test.db
```

---

## Adding to Your Application

After running any of the test database scripts, add the connection in your application:

1. Start the backend server
2. Open the application in your browser
3. Go to Query Creator
4. Click "Add Database Connection"
5. Enter the connection details (see above)
6. Test the connection
7. Start running queries!

---

## Notes

- All scripts are idempotent - you can run them multiple times safely
- They will drop and recreate tables each time
- The data is identical across all three database types
- Perfect for testing database portability and SQL compatibility

