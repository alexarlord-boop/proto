# Project Export Feature

## Overview

The Export feature allows you to transform your visual projects built in the Proto editor into **distributable, standalone applications**. This is the ultimate step in the low-code development workflow - turning your canvas-based prototype into a production-ready artifact.

## Export Formats

### 1. Static Bundle (HTML) ⭐ **Recommended for Most Cases**

**What you get:** A single, self-contained HTML file that can be opened in any browser.

**Perfect for:**
- Quick prototypes and demos
- Static landing pages
- Internal dashboards
- Embedding in documentation
- Sharing via email or cloud storage

**Benefits:**
- ✅ Zero dependencies - works offline (with snapshot data)
- ✅ Deploy anywhere - Vercel, Netlify, GitHub Pages, S3
- ✅ Instant access - just double-click the file
- ✅ Single file - easy to share and distribute
- ✅ CDN-powered - uses React, Tailwind from CDN

**File size:** Typically 50-200 KB (depending on component count and snapshot data)

---

### 2. Full-Stack Package (ZIP) 🚀 **For Production Apps**

**What you get:** A complete project folder with:
- **Frontend:** `frontend/index.html` (standalone React app)
- **Backend:** `backend/main.py` (minimal FastAPI server)
- **Database config:** `backend/queries.json` (queries + connectors)
- **Documentation:** `README.md` (setup and deployment guide)

**Perfect for:**
- Production applications with live data
- Apps that need dynamic query execution
- Multi-environment deployments (dev, staging, prod)
- Apps requiring database authentication
- Scalable, maintainable projects

**Benefits:**
- ✅ Live data - queries execute against real databases
- ✅ Independent - no dependency on original Proto instance
- ✅ Deployable - ready for Docker, Heroku, AWS, etc.
- ✅ Maintainable - clean code structure
- ✅ Extensible - easy to add custom logic

---

## Data Strategies

### Snapshot Data 📸

**How it works:** 
- Executes all SQL queries at export time
- Embeds current results directly in the HTML
- Tables display this static snapshot

**Use cases:**
- Reports and analytics (fixed point-in-time data)
- Offline presentations
- Demos without database access
- Historical data snapshots

**Pros:**
- Works completely offline
- No backend required
- Instant loading
- Zero configuration

**Cons:**
- Data doesn't update
- Larger file size if data is large

---

### Live Queries 🔄

**How it works:**
- Keeps API calls to backend server
- Queries execute on-demand when tables load
- Data refreshes on each page load

**Use cases:**
- Real-time dashboards
- Production applications
- Multi-user apps
- Dynamic data visualization

**Pros:**
- Always fresh data
- Smaller initial file size
- Reflects database changes

**Cons:**
- Requires backend to be running
- Needs database access
- Requires network connection

---

## Export Flow

```
┌─────────────────────────────────────────────────────┐
│  1. USER CLICKS "EXPORT" BUTTON IN EDITOR          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  2. EXPORT DIALOG OPENS                             │
│     - Choose Format (Static / Full-Stack)           │
│     - Choose Data Strategy (Snapshot / Live)        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  3. BACKEND PROCESSES REQUEST                       │
│                                                      │
│     If Static + Snapshot:                           │
│     • Fetch project components                      │
│     • Execute all queries                           │
│     • Generate HTML with embedded data              │
│     • Return single .html file                      │
│                                                      │
│     If Static + Live:                               │
│     • Fetch project components                      │
│     • Generate HTML with API calls                  │
│     • Return single .html file                      │
│                                                      │
│     If Full-Stack:                                  │
│     • Fetch project + queries + connectors          │
│     • Generate frontend HTML                        │
│     • Generate mini backend (main.py)               │
│     • Create queries.json config                    │
│     • Write requirements.txt                        │
│     • Write README.md                               │
│     • ZIP everything                                │
│     • Return .zip file                              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  4. USER DOWNLOADS FILE                             │
│     - project_name.html (static)                    │
│     - project_name.zip (full-stack)                 │
└─────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Frontend Components

**DnDEditor.tsx:**
- Export button in top toolbar
- Export dialog with format/strategy selection
- File download handling

**ProjectRenderer.tsx:**
- Pure runtime component renderer
- No editor UI, just components
- Production-ready rendering

### Backend Architecture

**Endpoint:** `POST /api/projects/{project_id}/export`

**Query Parameters:**
- `format`: "static" | "fullstack"
- `data_strategy`: "snapshot" | "live"

**Functions:**

1. **`generate_static_bundle()`**
   - Generates standalone HTML file
   - Embeds React, Tailwind, Babel from CDN
   - Includes component definitions
   - Optionally embeds query snapshots
   - Returns HTML string

2. **`generate_fullstack_bundle()`**
   - Creates temp directory structure
   - Writes frontend HTML
   - Generates mini FastAPI backend
   - Extracts query and connector data
   - Writes configuration files
   - Creates ZIP archive
   - Returns ZIP path

### Generated Static Bundle Structure

```html
<!DOCTYPE html>
<html>
<head>
  <script src="cdn.tailwindcss.com"></script>
  <script src="react@18 CDN"></script>
  <script src="react-dom@18 CDN"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    // Component data (injected)
    const COMPONENTS = [...];
    const SNAPSHOT_DATA = {...};
    
    // Component renderers (Button, Input, Table, etc.)
    function Button({ text, variant, size, onClick }) { ... }
    function DataTable({ columns, data, queryId }) { ... }
    
    // Main App
    function App() {
      return COMPONENTS.map(component => 
        renderComponent(component)
      );
    }
    
    // Render
    ReactDOM.createRoot(...).render(<App />);
  </script>
  
  <script src="babel-standalone CDN"></script>
</body>
</html>
```

### Generated Full-Stack Package Structure

```
project_name/
├── frontend/
│   └── index.html              # React app (same as static)
├── backend/
│   ├── main.py                 # Minimal FastAPI server
│   ├── queries.json            # Queries + connectors config
│   └── requirements.txt        # Python dependencies
└── README.md                   # Setup instructions
```

**Backend (`main.py`):**
- Lightweight FastAPI server
- Query execution endpoint: `GET /api/queries/{id}/execute`
- Loads config from `queries.json`
- Creates database engines on demand
- Zero external dependencies (besides DB drivers)

**Configuration (`queries.json`):**
```json
{
  "queries": [
    {
      "id": "query-uuid",
      "name": "Get Users",
      "sql_query": "SELECT * FROM users",
      "connector_id": "connector-uuid"
    }
  ],
  "connectors": [
    {
      "id": "connector-uuid",
      "name": "Main DB",
      "db_type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "mydb",
      "username": "user",
      "password": "pass"
    }
  ]
}
```

---

## Usage Guide

### Exporting a Project

1. **Open your project** in the visual editor
2. **Click "Export"** button in the top toolbar (green button next to Save)
3. **Choose your export format:**
   - **Static Bundle** - Single HTML file
   - **Full-Stack Package** - ZIP with frontend + backend
4. **Choose data strategy:**
   - **Snapshot Data** - Current results embedded (works offline)
   - **Live Queries** - Dynamic data from backend (requires server)
5. **Click "Export Project"**
6. **Download** will start automatically

### Using Exported Static Bundle

**Option 1: Local Usage**
```bash
# Just double-click the .html file
open project_name.html
```

**Option 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod project_name.html
```

**Option 3: Deploy to Netlify**
```bash
# Drag and drop the .html file to netlify.com
```

**Option 4: Deploy to GitHub Pages**
```bash
# Rename to index.html and push to gh-pages branch
mv project_name.html index.html
git add index.html
git commit -m "Deploy"
git push origin gh-pages
```

### Using Exported Full-Stack Package

**Step 1: Extract ZIP**
```bash
unzip project_name.zip
cd project_name
```

**Step 2: Start Backend**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

**Step 3: Open Frontend**
```bash
# Open in browser
open frontend/index.html

# Or serve with simple HTTP server
cd frontend
python -m http.server 3000
# Visit http://localhost:3000
```

**Step 4: Configure Database (if needed)**

Edit `backend/queries.json` to update database connections:
```json
{
  "connectors": [
    {
      "host": "your-db-host.com",
      "database": "production_db",
      "username": "prod_user",
      "password": "prod_password"
    }
  ]
}
```

---

## Deployment Strategies

### Static Bundle Deployment

| Platform | Steps | Cost | Notes |
|----------|-------|------|-------|
| **Vercel** | `vercel project.html` | Free | Best for demos |
| **Netlify** | Drag & drop to netlify.com | Free | Instant SSL |
| **GitHub Pages** | Push to gh-pages branch | Free | Great for docs |
| **AWS S3** | Upload to S3 bucket | Cents/month | Scalable |
| **Cloudflare Pages** | Git push or upload | Free | Fast CDN |

### Full-Stack Deployment

| Platform | Backend | Frontend | Setup |
|----------|---------|----------|-------|
| **Heroku** | Deploy backend/ | Serve from backend | `git push heroku main` |
| **Railway** | Auto-deploy | Serve static | Link GitHub repo |
| **DigitalOcean** | Droplet + Python | Nginx | Manual setup |
| **AWS EC2** | Install Python | Nginx/Apache | Full control |
| **Fly.io** | Dockerfile | Serve static | `fly deploy` |

---

## Security Considerations

### ⚠️ Important for Production

1. **Database Credentials**
   - Full-stack exports include plain-text passwords in `queries.json`
   - Use environment variables in production
   - Rotate credentials before deployment

2. **Query Validation**
   - Exported backend has no query sandboxing
   - All queries execute as-is
   - Review queries before export

3. **CORS Configuration**
   - Full-stack backend allows all origins (`*`)
   - Restrict in production to your frontend domain

4. **Rate Limiting**
   - No rate limiting in exported backend
   - Add middleware for production use

5. **SSL/HTTPS**
   - Static exports work with HTTPS automatically
   - Full-stack requires SSL certificate setup

### Recommended Production Hardening

**For Full-Stack Exports:**

```python
# backend/main.py - Add to production

# 1. Environment variables for secrets
import os
DB_PASSWORD = os.getenv('DB_PASSWORD')

# 2. Restricted CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET"],  # Only GET for queries
    allow_headers=["*"],
)

# 3. Rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.get("/api/queries/{query_id}/execute")
@limiter.limit("10/minute")
async def execute_query(...):
    ...
```

---

## Troubleshooting

### Static Bundle Issues

**Problem:** "Cannot load React"
- **Cause:** CDN blocked or offline
- **Fix:** Check internet connection, try different browser

**Problem:** "Failed to load data" (with live queries)
- **Cause:** Backend not running or wrong URL
- **Fix:** Update API endpoint in HTML, ensure backend is accessible

**Problem:** Tables show "No data available" (with snapshot)
- **Cause:** Queries failed during export
- **Fix:** Re-export after verifying queries work in editor

### Full-Stack Issues

**Problem:** "Module not found" when starting backend
- **Cause:** Dependencies not installed
- **Fix:** `pip install -r requirements.txt`

**Problem:** "Connection refused" to database
- **Cause:** Wrong connection string or DB not accessible
- **Fix:** Update `queries.json`, check firewall rules

**Problem:** Frontend can't reach backend API
- **Cause:** CORS issue or wrong port
- **Fix:** Check backend is running, verify API URL in HTML

---

## Advanced Customization

### Customizing Static Bundle

You can modify the exported HTML to:

1. **Change styling:**
   ```html
   <style>
     /* Add custom CSS */
     .bg-gradient-to-br { 
       background: linear-gradient(to bottom right, #your-colors); 
     }
   </style>
   ```

2. **Add analytics:**
   ```html
   <script>
     // Google Analytics, PostHog, etc.
   </script>
   ```

3. **Modify component behavior:**
   ```javascript
   // Edit component renderers in <script type="text/babel">
   function Button({ text, onClick }) {
     // Custom logic
     return <button onClick={onClick}>{text}</button>;
   }
   ```

### Customizing Full-Stack Backend

**Add authentication:**
```python
# backend/main.py
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/api/queries/{query_id}/execute")
async def execute_query(
    query_id: str, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Verify token
    if not verify_token(credentials.credentials):
        raise HTTPException(401, "Unauthorized")
    # ... execute query
```

**Add caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def execute_cached_query(query_id: str):
    # Results cached for 5 minutes
    return execute_query(query_id)
```

**Add logging:**
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/api/queries/{query_id}/execute")
async def execute_query(query_id: str):
    logger.info(f"Executing query: {query_id}")
    # ... execute
```

---

## Comparison Matrix

| Feature | Static + Snapshot | Static + Live | Full-Stack |
|---------|-------------------|---------------|------------|
| **Offline work** | ✅ Yes | ❌ No | ❌ No |
| **Live data** | ❌ No | ✅ Yes | ✅ Yes |
| **Setup complexity** | ⭐ Simple | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Deployment** | Anywhere | Static hosts | Server required |
| **File size** | Medium | Small | Large |
| **Database access** | Not needed | Needed | Needed |
| **Customization** | Limited | Limited | Full |
| **Production ready** | No | Partially | Yes |
| **Cost** | Free | Free | Server costs |

---

## Best Practices

### ✅ Do

- **Export frequently** to test your deployments
- **Use snapshot data** for demos and presentations
- **Use full-stack** for production applications
- **Version your exports** (add timestamps to filenames)
- **Test exported files** before sharing/deploying
- **Document database setup** in full-stack exports
- **Use environment variables** for production secrets

### ❌ Don't

- **Don't commit credentials** to version control
- **Don't export with live queries** without backend plan
- **Don't deploy full-stack** without security review
- **Don't share exports** with sensitive data
- **Don't rely on snapshot data** for dynamic apps
- **Don't skip testing** exported artifacts

---

## API Reference

### Export Endpoint

```
POST /api/projects/{project_id}/export
```

**Query Parameters:**
- `format` (string, required): "static" | "fullstack"
- `data_strategy` (string, required): "snapshot" | "live"

**Response:**
- **Static:** HTML file download (Content-Type: text/html)
- **Full-Stack:** ZIP file download (Content-Type: application/zip)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/projects/PROJECT_ID/export?format=static&data_strategy=snapshot" \
  -o my_project.html
```

**Response Headers:**
```
Content-Disposition: attachment; filename="Project_Name.html"
Content-Type: text/html
```

---

## Future Enhancements

### Planned Features

- [ ] **Desktop Executables** - Electron/Tauri packaging
- [ ] **Mobile Exports** - React Native bundle generation
- [ ] **Docker Compose** - Full containerized deployment
- [ ] **CI/CD Integration** - GitHub Actions, GitLab CI
- [ ] **Progressive Web App** - PWA manifest generation
- [ ] **Offline-First** - Service worker for cached data
- [ ] **Custom Templates** - User-defined export templates
- [ ] **Incremental Updates** - Update deployed apps without full re-export
- [ ] **Analytics Dashboard** - Built-in usage tracking
- [ ] **A/B Testing** - Multiple export variants

### Community Requests

Vote for features: https://github.com/yourrepo/issues

---

## Examples

### Example 1: Dashboard Export

**Scenario:** Analytics dashboard with sales data

**Export Config:**
- Format: Static Bundle
- Data Strategy: Snapshot
- Components: 4 Tables, 6 Buttons, 2 Select dropdowns

**Result:**
- File: `sales_dashboard.html` (127 KB)
- Deployment: Netlify (free)
- Access: Share link with team
- Update frequency: Weekly re-export

### Example 2: Production App Export

**Scenario:** Customer portal with live data

**Export Config:**
- Format: Full-Stack Package
- Data Strategy: Live Queries
- Components: 8 Tables, 12 Buttons, 3 Tabs, 2 Inputs

**Result:**
- Package: `customer_portal.zip` (15 KB)
- Deployment: Railway (Python)
- Database: PostgreSQL on AWS RDS
- Users: 500+ concurrent

### Example 3: Documentation Site

**Scenario:** API documentation with code examples

**Export Config:**
- Format: Static Bundle
- Data Strategy: Snapshot (no queries)
- Components: 20 Containers, 50 Buttons (navigation)

**Result:**
- File: `api_docs.html` (84 KB)
- Deployment: GitHub Pages
- Updates: CI/CD on Git push
- Traffic: 10k+ monthly visitors

---

## Support

**Questions?** Open an issue in the GitHub repo

**Bugs?** Report export-related bugs with:
- Project ID
- Export format used
- Error messages
- Browser/platform info

**Feature requests?** Tag with `enhancement` and `export`

---

## Changelog

### v1.0.0 (Current)
- ✨ Initial release
- ✨ Static bundle export
- ✨ Full-stack package export
- ✨ Snapshot data embedding
- ✨ Live query support
- ✨ Automatic README generation

---

## License

Same as parent project (MIT)

---

**Happy Exporting! 🚀**

Transform your prototypes into production apps in seconds.

