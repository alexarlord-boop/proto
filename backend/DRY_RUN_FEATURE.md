# Dry-Run Query Validation & Execution

## Overview

The Proto Query Builder now supports **dry-run mode** for both validation and execution of SQL queries. This allows developers to safely test queries without affecting the database.

---

## 🔍 Dry-Run Validation

### What it does
Validates SQL queries by executing them with `LIMIT 0` or in a transaction that gets rolled back, ensuring:
- ✅ Syntax is correct
- ✅ Tables exist
- ✅ Columns exist
- ✅ Permissions are valid
- ❌ **No data is fetched or modified**

### Endpoint
```
POST /api/queries/validate
```

### Request Body
```json
{
  "sql_query": "SELECT * FROM users WHERE id > 10",
  "connector_id": "your-connector-id"
}
```

### Response Examples

#### Valid Query
```json
{
  "valid": true,
  "message": "Query is valid (dry-run successful)",
  "query_type": "SELECT"
}
```

#### Invalid Query
```json
{
  "valid": false,
  "message": "no such table: userz",
  "error": "..."
}
```

### How it works

**For SELECT queries:**
```sql
-- Original query
SELECT id, name FROM users WHERE status = 'active';

-- Dry-run validation wraps it like this:
SELECT * FROM (
  SELECT id, name FROM users WHERE status = 'active'
) AS validation_subquery LIMIT 0;
```

**For DML queries (INSERT/UPDATE/DELETE):**
```sql
-- Executes in a transaction and then rolls back
BEGIN TRANSACTION;
UPDATE users SET status = 'inactive' WHERE id = 5;
ROLLBACK;  -- Changes never committed
```

---

## 🚀 Dry-Run Execution

### What it does
Executes DML queries (INSERT, UPDATE, DELETE) and shows what **would** happen without actually committing the changes.

### Endpoints

#### POST Method
```
POST /api/queries/execute
```

Request body:
```json
{
  "query_id": "your-query-id",
  "limit": 1000,
  "dry_run": true  // ← Enable dry-run mode
}
```

#### GET Method
```
GET /api/queries/{query_id}/execute?dry_run=true&limit=1000
```

### Response Examples

#### SELECT Query (dry_run has no effect)
```json
{
  "success": true,
  "columns": [
    {"key": "id", "label": "Id"},
    {"key": "name", "label": "Name"}
  ],
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "row_count": 2,
  "query_type": "SELECT",
  "dry_run": false  // SELECT queries never modify data
}
```

#### DML Query with `dry_run: true`
```json
{
  "success": true,
  "message": "Dry-run successful: 5 row(s) would be affected",
  "affected_rows": 5,
  "query_type": "UPDATE",
  "dry_run": true,
  "warning": "Changes were NOT committed (dry-run mode)"
}
```

#### DML Query with `dry_run: false` (real execution)
```json
{
  "success": true,
  "message": "Query executed successfully: 5 row(s) affected",
  "affected_rows": 5,
  "query_type": "UPDATE",
  "dry_run": false
}
```

---

## 📊 Query Type Support

| Query Type | Validation | Dry-Run Execution | Notes |
|------------|------------|-------------------|-------|
| **SELECT** | ✅ LIMIT 0 | N/A (read-only) | No side effects |
| **INSERT** | ✅ Transaction + Rollback | ✅ Transaction + Rollback | Safe testing |
| **UPDATE** | ✅ Transaction + Rollback | ✅ Transaction + Rollback | Preview changes |
| **DELETE** | ✅ Transaction + Rollback | ✅ Transaction + Rollback | Preview deletions |
| **DDL** (CREATE/DROP/ALTER) | ⚠️ Limited | ❌ Not supported | Cannot rollback DDL |

---

## 🎯 Use Cases

### 1. Test Query Before Saving
```bash
# Validate query syntax and table/column existence
curl -X POST http://localhost:8000/api/queries/validate \
  -H "Content-Type: application/json" \
  -d '{
    "sql_query": "SELECT * FROM orders WHERE user_id = 123",
    "connector_id": "abc-123"
  }'
```

### 2. Preview UPDATE Results
```bash
# See how many rows would be affected without actually updating
curl -X POST http://localhost:8000/api/queries/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": "query-456",
    "dry_run": true
  }'
```

### 3. Safe DELETE Testing
```bash
# Test DELETE query without actually deleting data
curl "http://localhost:8000/api/queries/{query_id}/execute?dry_run=true"
```

---

## 🔒 Safety Features

1. **No timestamp update on dry-run**: The `last_executed` field is only updated when `dry_run=false`
2. **Transaction rollback**: All DML changes are rolled back in dry-run mode
3. **Clear warnings**: Response includes `dry_run` flag and warning messages
4. **Error catching**: Invalid queries fail validation before execution

---

## 💡 Best Practices

### ✅ Do
- Always validate queries before saving them
- Use dry-run mode when testing UPDATE/DELETE queries
- Check `affected_rows` in dry-run response before real execution
- Validate queries when connector changes

### ❌ Don't
- Don't rely on dry-run for DDL queries (CREATE/DROP/ALTER)
- Don't assume dry-run shows exact results for complex transactions
- Don't use dry-run as a substitute for backups

---

## 🐛 Common Validation Errors

| Error | Query | Why it fails |
|-------|-------|-------------|
| `no such table: userz` | `SELECT * FROM userz` | Table doesn't exist (typo) |
| `no such column: emaill` | `SELECT emaill FROM users` | Column doesn't exist (typo) |
| `syntax error at or near "FROM"` | `SELECT id, name;` | Missing FROM clause |
| `syntax error at or near "SELCT"` | `SELCT * FROM users` | SQL keyword typo |

---

## 📝 Implementation Details

### Validation Logic
```python
# db_manager.py - validate_query()

# For SELECT: Wraps query in subquery with LIMIT 0
dry_run_query = f"SELECT * FROM ({sql_query}) AS validation_subquery LIMIT 0"

# For DML: Executes in transaction and rolls back
trans = conn.begin()
conn.execute(text(sql_query))
trans.rollback()  # Never commits
```

### Execution Logic
```python
# db_manager.py - execute_query(dry_run=True)

if dry_run:
    trans.rollback()
    return {
        "affected_rows": result.rowcount,
        "dry_run": True,
        "warning": "Changes were NOT committed"
    }
else:
    trans.commit()
    return {
        "affected_rows": result.rowcount,
        "dry_run": False
    }
```

---

## 🔄 API Version

- **Version**: 1.0.0
- **Endpoints Updated**:
  - `POST /api/queries/validate` (enhanced)
  - `POST /api/queries/execute` (new `dry_run` param)
  - `GET /api/queries/{query_id}/execute` (new `dry_run` param)

---

## 🎉 Benefits

1. **Safer development**: Test queries without risk
2. **Faster debugging**: Catch errors before execution
3. **Better UX**: Preview changes before committing
4. **Production safety**: Validate queries in real database environment
5. **No data loss**: DML operations can be tested safely

---

## Example: Complete Workflow

```bash
# Step 1: Validate query syntax
curl -X POST http://localhost:8000/api/queries/validate \
  -d '{"sql_query": "UPDATE users SET status = '\''inactive'\'' WHERE last_login < '\''2024-01-01'\''", "connector_id": "conn-1"}'

# Response: {"valid": true, "query_type": "UPDATE"}

# Step 2: Dry-run to see impact
curl -X POST http://localhost:8000/api/queries/execute \
  -d '{"query_id": "query-1", "dry_run": true}'

# Response: {"affected_rows": 42, "dry_run": true, "warning": "Changes were NOT committed"}

# Step 3: Execute for real
curl -X POST http://localhost:8000/api/queries/execute \
  -d '{"query_id": "query-1", "dry_run": false}'

# Response: {"affected_rows": 42, "dry_run": false, "message": "Query executed successfully"}
```

---

## Questions or Issues?

Check the main API documentation at `http://localhost:8000/` or review the source code in:
- `backend/db_manager.py` - Validation and execution logic
- `backend/main.py` - API endpoints

