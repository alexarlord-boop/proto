# Proto - Quick Start Guide

Get up and running with Proto in under 5 minutes! 🚀

## Prerequisites

- **Python 3.8+** (check with `python3 --version`)
- **Node.js 16+** (check with `node --version`)
- **pnpm** (or npm/yarn) - Install with `npm install -g pnpm`

---

## 1️⃣ Backend Setup (Python)

### Step 1: Navigate to backend directory
```bash
cd backend
```

### Step 2: Create virtual environment
```bash
python3 -m venv venv
```

### Step 3: Activate virtual environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Start the backend server
```bash
uvicorn main:app --reload
```

✅ **Backend is now running at:** `http://localhost:8000`

> **Note:** Keep this terminal window open. The backend must stay running.

---

## 2️⃣ Frontend Setup (React + TypeScript)

Open a **new terminal window/tab** and:

### Step 1: Navigate to frontend directory
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
pnpm install
```

> **Using npm or yarn?** Run `npm install` or `yarn install` instead.

### Step 3: Start the development server
```bash
pnpm dev
```

✅ **Frontend is now running at:** `http://localhost:5173`

---

## 3️⃣ Populate Demo Databases

Open a **third terminal window/tab** for database setup:

### Navigate to backend directory
```bash
cd backend
# Activate venv if not already active
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate  # Windows
```

### Quick Setup: Create All Databases at Once

**The easiest way** - use the setup script:

**On macOS/Linux:**
```bash
./setup_demo_dbs.sh
```

**On Windows:**
```bash
setup_demo_dbs.bat
```

This will create all three demo databases automatically! ✨

---

### Manual Setup: Create Databases Individually

Proto includes three demo databases with sample data:

#### Option 1: Simple Test Database (Recommended for first-time users)
```bash
python create_test_db.py
```
Creates `test.db` with:
- 10 users (employees)
- 5 projects
- 10 tasks

**Example queries:**
- `SELECT * FROM users`
- `SELECT * FROM projects WHERE status = 'In Progress'`
- `SELECT u.name, t.title FROM tasks t JOIN users u ON t.assigned_to = u.id`

---

#### Option 2: E-commerce Database
```bash
python create_ecommerce_test_db.py
```
Creates `ecommerce.db` with:
- 10 customers
- 10 product categories (hierarchical)
- 15 products
- 10 orders
- 17 order items

**Example queries:**
- `SELECT p.name, p.price, c.name as category FROM products p JOIN categories c ON p.category_id = c.id`
- `SELECT c.first_name, o.total FROM customers c JOIN orders o ON c.id = o.customer_id`

---

#### Option 3: Complex Learning Platform Database
```bash
python create_complex_test_db.py
```
Creates `complex_test.db` with:
- 19 interconnected tables
- Users, students, instructors
- Courses, modules, lessons
- Enrollments, assignments, reviews
- Discussion forums with nested replies

**Example queries:**
- `SELECT c.title, u.full_name FROM courses c JOIN course_instructors ci ON c.id = ci.course_id JOIN instructors i ON ci.instructor_id = i.id JOIN users u ON i.user_id = u.id`

---

## 4️⃣ Connect to Databases in the App

1. Open the app at `http://localhost:5173`
2. Click **"Query Creator"** button (top right)
3. Go to **"Connectors"** tab
4. Click **"+ New Connector"**
5. Fill in the details:
   - **Name:** Test Database (or any name you prefer)
   - **Database Type:** SQLite
   - **Database Path:** `./test.db` (or `./ecommerce.db`, `./complex_test.db`)
6. Click **"Create Connector"**

✅ **You're all set!** You can now:
- Browse the database schema
- Create and execute SQL queries
- Build visual components that connect to your data

---

## 5️⃣ Quick Tour

### Create Your First Query

1. Select your connector in **Query Creator**
2. Click **"+ New Query"**
3. Enter this query:
   ```sql
   SELECT * FROM users LIMIT 5
   ```
4. Click **"Validate"** then **"Execute"** to see results
5. Click **"Save Query"** and give it a name

### Build Your First Visual Component

1. Click **"Home"** to go back to the main page
2. Click **"+ New Project"**
3. Give your project a name
4. Drag a **Table** component from the left palette onto the canvas
5. Select the table component
6. In the right panel:
   - Set **Data Source Type** to "SQL Query"
   - Select your saved query
7. Click **"Save"** to save your project
8. Click **"Preview"** to see it in action!

---

## 🎯 Next Steps

- **Explore the Schema Visualizer:** See your database structure visually
- **Try Advanced Queries:** Join multiple tables, use aggregations
- **Build Complex UIs:** Add buttons, inputs, tabs, and more components
- **Export Your Project:** Create standalone HTML or full-stack packages

---

## 🐳 Docker (Optional)

Docker is **not required** for the current setup. All demo databases use SQLite which doesn't need Docker.

If you want to test with **PostgreSQL or MySQL**, you can:

### PostgreSQL
```bash
docker run --name proto-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16
```

### MySQL
```bash
docker run --name proto-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -p 3306:3306 \
  -d mysql:8
```

Then create a connector in the app with the appropriate connection details.

---

## 🆘 Troubleshooting

### Backend won't start
- **Error:** `ModuleNotFoundError`
  - **Solution:** Activate venv and run `pip install -r requirements.txt`
- **Error:** `Address already in use`
  - **Solution:** Another process is using port 8000. Stop it or use a different port: `uvicorn main:app --reload --port 8001`

### Frontend won't start
- **Error:** `Command not found: pnpm`
  - **Solution:** Install pnpm: `npm install -g pnpm` or use `npm dev` instead
- **Error:** `Port 5173 already in use`
  - **Solution:** Vite will automatically try the next available port (5174, etc.)

### Database connection fails
- **Error:** `Connection failed`
  - **Solution:** Ensure database path is correct. Use `./test.db` for relative path or full absolute path
- **Error:** `No such table`
  - **Solution:** Run the database creation script again

### "Failed to fetch" errors in browser
- **Solution:** Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors

---

## 📚 More Documentation

- **[README.md](README.md)** - Full project documentation with all features
- **[PROJECT_EXPORT_FEATURE.md](PROJECT_EXPORT_FEATURE.md)** - Export and deployment guide
- **API Documentation:** Visit `http://localhost:8000/docs` after starting the backend

---

## ✅ Quick Verification Checklist

Before you start building:

- [ ] Backend running at `http://localhost:8000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] At least one demo database created
- [ ] Database connector created in the app
- [ ] Able to execute a test query successfully

---

## 💡 Pro Tips

1. **Keep terminals organized:** Use three terminal tabs/windows - one for backend, one for frontend, one for commands
2. **Use SQLite for demos:** It's the easiest to set up and requires no additional services
3. **Start with the simple test.db:** It's perfect for learning the basics
4. **Save your work frequently:** Click the "Save" button in the editor to persist your projects
5. **Use the Preview mode:** Test your UI without the editor interface
6. **Export your projects:** Share standalone demos with colleagues or clients

---

## 🚀 You're Ready!

Open `http://localhost:5173` in your browser and start building! 🎉

Need help? Check the main [README.md](README.md) for detailed documentation.

