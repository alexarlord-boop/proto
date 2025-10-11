# Visual User Guide

## 🎯 Quick Reference

### One-Command Startup
```bash
./start.sh
```
Then open: http://localhost:5173

---

## 📋 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE A DATABASE CONNECTOR                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Click "Query Creator" button (top-right)                    │
│  2. Go to "Connectors" tab                                       │
│  3. Click "+ New Connector"                                      │
│  4. Fill in:                                                     │
│     • Name: My Database                                          │
│     • Type: SQLite / PostgreSQL / MySQL                          │
│     • Connection details                                         │
│  5. Click "Create Connector"                                     │
│                                                                   │
│  ✓ Connection tested automatically                               │
│  ✓ Schema loaded automatically                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: BROWSE DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Connector selected → Schema appears below                    │
│  2. Click on any table to expand                                 │
│  3. See columns with:                                            │
│     • Name                                                       │
│     • Type (INTEGER, TEXT, etc.)                                 │
│     • Nullable (Yes/No)                                          │
│     • Primary Key (🔑)                                          │
│  4. Use this info to write queries                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: CREATE A SQL QUERY                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Go to "Queries" tab                                          │
│  2. Click "+ New Query"                                          │
│  3. Fill in:                                                     │
│     • Name: Get All Users                                        │
│     • Description: Fetch user data                               │
│     • Connector: My Database                                     │
│     • SQL Query: SELECT * FROM users                             │
│  4. Click "Validate" → Green ✓ means valid                      │
│  5. Click "Execute" → Preview results                            │
│  6. Click "Save Query"                                           │
│                                                                   │
│  ✓ Query saved with validation status                            │
│  ✓ Ready to use in tables                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: USE QUERY IN TABLE COMPONENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Click "← Back to Editor"                                    │
│  2. From palette (left), drag "📊 Table" to canvas             │
│  3. Click table to select it                                     │
│  4. In Property Panel (right):                                   │
│     • Go to "Data" tab                                           │
│     • Data Source Type: SQL Query                                │
│     • SQL Query: Get All Users                                   │
│  5. Table automatically populates! 🎉                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Layout Reference

### Query Creator Screen
```
┌──────────────────────────────────────────────────────────────────┐
│  SQL Query Creator                    [← Back to Editor]         │
├──────────────┬───────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT AREA                                 │
│              │                                                    │
│ [Queries]    │ ┌─────────────────────────────────────┐          │
│ [Connectors] │ │ Query Form                          │          │
│              │ │                                     │          │
│ ┌──────────┐ │ │ Name: ___________________           │          │
│ │+ New     │ │ │ Connector: [Select ▼]              │          │
│ │  Query   │ │ │ Description: ____________           │          │
│ └──────────┘ │ │                                     │          │
│              │ │ SQL Query:                          │          │
│ Query List:  │ │ ┌─────────────────────────────────┐ │          │
│              │ │ │ SELECT * FROM users             │ │          │
│ ┌──────────┐ │ │ │                                 │ │          │
│ │Query 1   │ │ │ │                                 │ │          │
│ │✓ Valid   │ │ │ └─────────────────────────────────┘ │          │
│ └──────────┘ │ │                                     │          │
│              │ │ [Validate] [Execute] [Save Query]   │          │
│ ┌──────────┐ │ └─────────────────────────────────────┘          │
│ │Query 2   │ │                                                  │
│ │✓ Valid   │ │ ┌─────────────────────────────────────┐          │
│ └──────────┘ │ │ Database Schema                     │          │
│              │ │                                     │          │
│              │ │ ▼ users                             │          │
│              │ │   id      INTEGER  PK 🔑           │          │
│              │ │   name    TEXT                     │          │
│              │ │   email   TEXT                     │          │
│              │ │                                     │          │
│              │ │ ▶ projects                          │          │
│              │ └─────────────────────────────────────┘          │
│              │                                                    │
└──────────────┴───────────────────────────────────────────────────┘
```

### Visual Editor Screen
```
┌──────────────────────────────────────────────────────────────────┐
│  Proto Editor                         [Query Creator]            │
├──────────┬────────────────────────────┬──────────────────────────┤
│ PALETTE  │ CANVAS                     │ PROPERTY PANEL           │
│          │                            │                          │
│ 🔘 Button│   ┌──────────────────────┐ │ Selected: Table          │
│          │   │                      │ │                          │
│ 📝 Input │   │     [Button]         │ │ [Data] [Methods] [Layout]│
│          │   │                      │ │                          │
│ 📑 Tabs  │   │  [Input Field]       │ │ Data Source Type:        │
│          │   │                      │ │ ○ URL/API Endpoint       │
│ 📋 Select│   │ ┌──────────────────┐ │ │ ● SQL Query              │
│          │   │ │ Table Component  │◄┼─┤                          │
│ 📊 Table │   │ │                  │ │ │ SQL Query:               │
│          │   │ │ ID | Name | Role │ │ │ [Get All Users    ▼]     │
│          │   │ │ 1  | Alice| Admin│ │ │                          │
│          │   │ │ 2  | Bob  | Dev  │ │ │ [Open Query Creator]     │
│          │   │ └──────────────────┘ │ │                          │
│          │   │                      │ │ Striped Rows: [✓]        │
│          │   └──────────────────────┘ │ Bordered: [✓]            │
│          │                            │                          │
└──────────┴────────────────────────────┴──────────────────────────┘
```

---

## 🔍 Feature Details

### Connector Management
```
┌────────────────────────────────────────┐
│ Connector Card                         │
├────────────────────────────────────────┤
│ 📦 My SQLite Database                  │
│    sqlite - test.db                    │
│    ✓ Active                            │
│                                        │
│ [Click to select for queries]          │
└────────────────────────────────────────┘
```

### Query Status Indicators
```
✓ Valid    - Query syntax correct, ready to use
✗ Invalid  - Query has errors, needs fixing
⏱ Executing - Query running
✓ Executed - Query completed successfully
```

### Data Source Types
```
1. URL/API Endpoint
   └─ Enter: https://api.example.com/data
   └─ Returns: { columns: [], data: [] }

2. SQL Query (NEW!)
   └─ Select saved query from dropdown
   └─ Data fetched automatically
   └─ Columns extracted from query results

3. Static Data
   └─ Enter JSON directly
   └─ Quick prototyping
```

---

## 💡 Usage Examples

### Example 1: User Management Table
```sql
-- Query Name: Active Users
-- Description: Get all active users with roles

SELECT 
  id,
  name,
  email,
  role,
  department,
  status
FROM users
WHERE status = 'Active'
ORDER BY name
```

### Example 2: Project Dashboard
```sql
-- Query Name: Project Summary
-- Description: Projects with task counts

SELECT 
  p.name as project_name,
  p.status,
  p.budget,
  COUNT(t.id) as task_count,
  u.name as manager
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN users u ON p.manager_id = u.id
GROUP BY p.id
```

### Example 3: Department Statistics
```sql
-- Query Name: Dept Stats
-- Description: Employee stats by department

SELECT 
  department,
  COUNT(*) as employee_count,
  AVG(salary) as avg_salary,
  MIN(salary) as min_salary,
  MAX(salary) as max_salary
FROM users
GROUP BY department
ORDER BY employee_count DESC
```

---

## 🎓 Best Practices

### Query Naming Convention
```
✓ Good:
  - Get All Users
  - Active Projects By Department
  - Monthly Sales Report

✗ Avoid:
  - query1
  - test
  - asdf
```

### Query Organization
```
Use Descriptions:
  Name: User List
  Description: All users with email and role for admin panel
  
Use Naming Patterns:
  Get [Resource] By [Criteria]
  List [Resource] For [Purpose]
  Count [Resource] Per [Group]
```

### Testing Workflow
```
1. Write query in Query Creator
   ↓
2. Validate syntax
   ↓
3. Execute and check results
   ↓
4. Adjust if needed
   ↓
5. Save query
   ↓
6. Use in table component
```

---

## 🚨 Common Issues & Solutions

### Issue: "Connection failed"
```
Problem: Can't connect to database
Solution: 
  ✓ Check database is running
  ✓ Verify connection details
  ✓ Use absolute path for SQLite
  ✓ Test with simple query first
```

### Issue: "Query validation failed"
```
Problem: SQL syntax error
Solution:
  ✓ Check table names exist in schema
  ✓ Verify column names are correct
  ✓ Check for typos in SQL keywords
  ✓ Use schema browser for reference
```

### Issue: "Table not showing data"
```
Problem: Table component empty
Solution:
  ✓ Ensure Data Source Type = "SQL Query"
  ✓ Check query is selected in dropdown
  ✓ Verify query is marked as valid
  ✓ Try executing query in Query Creator
```

### Issue: "Queries not appearing in dropdown"
```
Problem: Query list empty
Solution:
  ✓ Make sure query is saved (not just validated)
  ✓ Check query has is_valid = true
  ✓ Try refreshing the page
  ✓ Check browser console for errors
```

---

## 📱 Keyboard Shortcuts

```
Query Creator:
  Ctrl/Cmd + S     - Save query (when focused)
  Ctrl/Cmd + Enter - Execute query
  Esc              - Clear form

Visual Editor:
  Delete           - Delete selected component
  Ctrl/Cmd + Z     - Undo (coming soon)
  Ctrl/Cmd + C/V   - Copy/Paste (coming soon)
```

---

## 🎯 Tips for Success

1. **Start Small**: Test with simple `SELECT *` queries first
2. **Use Schema**: Always check schema before writing queries
3. **Validate First**: Never save without validating
4. **Name Clearly**: Use descriptive names for queries
5. **Add Descriptions**: Help future you understand the query
6. **Test Execution**: Run queries before using in tables
7. **Check Results**: Verify data looks correct
8. **Iterate**: Adjust and re-save as needed

---

## 📊 Feature Matrix

```
┌─────────────────────┬──────────┬─────────────────────┐
│ Feature             │ Status   │ How to Use          │
├─────────────────────┼──────────┼─────────────────────┤
│ SQLite Support      │ ✅ Ready │ Direct file path    │
│ PostgreSQL Support  │ ✅ Ready │ Host + credentials  │
│ MySQL Support       │ ✅ Ready │ Host + credentials  │
│ Query Validation    │ ✅ Ready │ Click "Validate"    │
│ Query Execution     │ ✅ Ready │ Click "Execute"     │
│ Schema Browser      │ ✅ Ready │ Select connector    │
│ Table Data Binding  │ ✅ Ready │ Select in dropdown  │
│ Query Export        │ 🚧 Soon  │ Coming soon         │
│ Query History       │ 🚧 Soon  │ Coming soon         │
│ Visual Query Builder│ 💡 Idea  │ Future release      │
└─────────────────────┴──────────┴─────────────────────┘
```

---

## 🎉 You're Ready!

Follow the workflow diagram above, and you'll have your first data-driven table in minutes!

Need help? Check:
- README.md - Full documentation
- QUICKSTART.md - Step-by-step guide
- ARCHITECTURE.md - Technical details

