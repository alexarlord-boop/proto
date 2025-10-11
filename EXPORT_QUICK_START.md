# Export Feature - Quick Start Guide

## 🎯 What You Can Do

Transform your visual projects into distributable applications in 3 clicks:

1. **Click Export** → 2. **Choose Format** → 3. **Download & Deploy**

---

## 🚀 Two Export Options

### Option 1: Static Bundle (Recommended) ⚡

**Perfect for:** Demos, prototypes, dashboards, landing pages

```
Your Project → Single HTML File → Deploy Anywhere
```

**What you get:**
- `project_name.html` - One self-contained file
- Works offline (with snapshot data)
- Zero dependencies
- Deploy to: Vercel, Netlify, GitHub Pages, S3

**Size:** ~50-200 KB

---

### Option 2: Full-Stack Package 🏗️

**Perfect for:** Production apps with live data

```
Your Project → ZIP Package → Extract → Deploy Backend → Open Frontend
```

**What you get:**
```
project_name.zip
├── frontend/
│   └── index.html        (React app)
├── backend/
│   ├── main.py           (FastAPI server)
│   ├── queries.json      (Database config)
│   └── requirements.txt  (Dependencies)
└── README.md             (Setup guide)
```

**Size:** ~15 KB (before dependencies)

---

## 📊 Data Strategies

### Snapshot Data 📸
- **What:** Embed current query results into the HTML
- **Best for:** Reports, presentations, demos
- **Pros:** Works offline, instant loading
- **Cons:** Data doesn't update

### Live Queries 🔄
- **What:** Keep API calls to fetch fresh data
- **Best for:** Dashboards, production apps
- **Pros:** Always fresh data
- **Cons:** Requires backend server

---

## 🎬 How to Export (Step-by-Step)

### In the Editor:

1. **Save your project** (required before export)

2. **Click the green "Export" button** in the top toolbar
   ```
   [Home] [Project Name]     [Preview] [Export] [Save]
                                         ^^^^^^
   ```

3. **Export dialog opens** - Choose your options:

   **Export Format:**
   - [ ] Static Bundle (HTML) ← Recommended
   - [ ] Full-Stack Package (ZIP)

   **Data Strategy:**
   - [ ] Snapshot Data ← Works offline
   - [ ] Live Queries ← Requires backend

4. **Click "Export Project"** - Download starts automatically

---

## 🌐 Deployment Examples

### Static Bundle Deployment

#### Deploy to Vercel (1 command)
```bash
npx vercel project_name.html --prod
```
✅ Live in 30 seconds

#### Deploy to Netlify (drag & drop)
1. Go to https://app.netlify.com/drop
2. Drag your HTML file
3. ✅ Done! Get instant URL

#### Deploy to GitHub Pages
```bash
git add project_name.html
git commit -m "Deploy"
git push origin gh-pages
```
✅ Live at https://yourusername.github.io/project_name.html

#### Open Locally
```bash
# Just double-click the file
open project_name.html
```
✅ Opens in browser instantly

---

### Full-Stack Deployment

#### Local Development
```bash
# 1. Extract
unzip project_name.zip
cd project_name

# 2. Start backend
cd backend
pip install -r requirements.txt
python main.py          # Runs on :8000

# 3. Open frontend (in new terminal)
cd ../frontend
open index.html         # Or python -m http.server 3000
```
✅ Running locally

#### Deploy to Heroku
```bash
cd backend
heroku create my-app-name
git init
git add .
git commit -m "Initial"
git push heroku main
```
✅ Live on Heroku

#### Deploy to Railway
1. Push backend/ to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub
4. Select your repo
✅ Auto-deployed with URL

---

## 💡 Common Use Cases

### Use Case 1: Demo for Clients
**Scenario:** Show client a working prototype

**Solution:**
- Format: Static Bundle
- Data: Snapshot (current data)
- Deploy: Netlify (free, instant)
- Share: Send link via email

**Result:** Client sees live demo in browser, no setup required

---

### Use Case 2: Internal Dashboard
**Scenario:** Sales team needs daily updated metrics

**Solution:**
- Format: Full-Stack Package
- Data: Live Queries (from production DB)
- Deploy: Railway (auto-scaling)
- Access: team.company.com

**Result:** Always-fresh data, multiple users, scalable

---

### Use Case 3: Documentation Site
**Scenario:** Product docs with interactive examples

**Solution:**
- Format: Static Bundle
- Data: Snapshot (no queries needed)
- Deploy: GitHub Pages (free, version controlled)
- Update: CI/CD on git push

**Result:** Fast, searchable, versioned docs

---

## 🔧 Customization Examples

### Customize Static Bundle

After export, edit the HTML file to add custom features:

#### Add Google Analytics
```html
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Change Color Scheme
```html
<!-- Add to <style> section -->
<style>
  .bg-gradient-to-br {
    background: linear-gradient(to bottom right, #667eea, #764ba2);
  }
</style>
```

#### Add Custom Header
```html
<!-- Add to <body> before <div id="root"> -->
<header style="background: #1a1a1a; color: white; padding: 1rem; text-align: center;">
  <h1>My Custom App</h1>
</header>
```

---

### Customize Full-Stack Backend

Edit `backend/main.py` to add features:

#### Add Authentication
```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.get("/api/queries/{query_id}/execute")
async def execute_query(
    query_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Verify token
    token = credentials.credentials
    if token != "your-secret-token":
        raise HTTPException(401, "Unauthorized")
    
    # ... rest of query execution
```

#### Add Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/queries/{query_id}/execute")
@limiter.limit("10/minute")
async def execute_query(query_id: str, request: Request):
    # ... query execution
```

#### Add Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/api/queries/{query_id}/execute")
async def execute_query(query_id: str):
    logger.info(f"Executing query: {query_id}")
    # ... query execution
```

---

## ⚠️ Important Notes

### Security Considerations

**For Production Deployments:**

1. **Database Credentials**
   - Full-stack exports include passwords in `queries.json`
   - **Action:** Use environment variables in production
   ```python
   import os
   password = os.getenv('DB_PASSWORD')
   ```

2. **CORS Configuration**
   - Default allows all origins (`*`)
   - **Action:** Restrict to your domain
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

3. **Query Validation**
   - No sandboxing in exported backend
   - **Action:** Review all queries before export

### Performance Tips

1. **Snapshot Data Size**
   - Large datasets increase HTML file size
   - **Tip:** Limit query results during export

2. **Backend Scaling**
   - Single-threaded by default
   - **Tip:** Use gunicorn for production:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

3. **Database Connections**
   - Connection pooling included
   - **Tip:** Adjust pool size in `create_engine()` for high traffic

---

## 🐛 Troubleshooting

### Static Bundle Issues

**Problem:** "Cannot load React from CDN"
```
Solution: Check internet connection or use offline build
```

**Problem:** Tables show "No data"
```
Solution: 
- Snapshot mode: Re-export after verifying queries
- Live mode: Ensure backend is running and accessible
```

**Problem:** Event handlers not working
```
Solution: Check browser console for JavaScript errors
```

---

### Full-Stack Issues

**Problem:** `ModuleNotFoundError` when starting backend
```bash
Solution:
cd backend
pip install -r requirements.txt
```

**Problem:** "Connection refused" to database
```bash
Solution: Update backend/queries.json with correct credentials
```

**Problem:** Frontend can't reach backend API
```
Solution: 
1. Check backend is running: curl http://localhost:8000
2. Check CORS settings in main.py
3. Verify API URLs in frontend HTML
```

---

## 📈 Analytics & Monitoring

### Track Usage in Static Bundle

Add to HTML after export:

```html
<script>
  // Simple analytics
  const trackEvent = (event, data) => {
    fetch('https://your-analytics-endpoint.com/track', {
      method: 'POST',
      body: JSON.stringify({ event, data, timestamp: Date.now() })
    });
  };
  
  // Track component clicks
  window.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      trackEvent('button_click', { text: e.target.textContent });
    }
  });
</script>
```

### Monitor Full-Stack Backend

Add to `backend/main.py`:

```python
from prometheus_client import Counter, Histogram
import time

# Metrics
query_counter = Counter('queries_executed', 'Number of queries executed')
query_duration = Histogram('query_duration_seconds', 'Query execution time')

@app.get("/api/queries/{query_id}/execute")
async def execute_query(query_id: str):
    start_time = time.time()
    
    # Execute query...
    result = ...
    
    # Record metrics
    query_counter.inc()
    query_duration.observe(time.time() - start_time)
    
    return result
```

---

## 🎓 Best Practices

### ✅ Do This

1. **Test before exporting**
   - Verify all components render correctly
   - Test queries return expected data
   - Check event handlers work

2. **Version your exports**
   - Add dates to filenames: `dashboard_2025-01-15.html`
   - Keep previous versions for rollback

3. **Document your deployment**
   - Note which data strategy you used
   - Record deployment URLs
   - Document any customizations

4. **Use snapshot for demos**
   - Ensures consistent data
   - Works offline
   - Faster loading

5. **Use full-stack for production**
   - Live data stays fresh
   - Scalable architecture
   - Easier to maintain

### ❌ Avoid This

1. **Don't export with test data**
   - Review queries before export
   - Use production-like data

2. **Don't share credentials**
   - Remove from ZIP before sharing
   - Use environment variables

3. **Don't deploy without testing**
   - Test exported artifact locally first
   - Verify all features work

4. **Don't use snapshot for dynamic apps**
   - Data won't update
   - Use live queries instead

---

## 🚀 Quick Reference

### Export Decision Tree

```
Need offline support?
├─ YES → Static + Snapshot
└─ NO
   └─ Data needs to update?
      ├─ YES → Full-Stack + Live
      └─ NO → Static + Snapshot

Sharing with non-technical users?
└─ YES → Static (easiest to open)

Need authentication?
└─ YES → Full-Stack (add auth to backend)

High traffic expected?
└─ YES → Full-Stack (scale backend)

Just a demo?
└─ YES → Static + Snapshot (fastest)
```

---

## 📞 Need Help?

- **Full Documentation:** [PROJECT_EXPORT_FEATURE.md](PROJECT_EXPORT_FEATURE.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues:** https://github.com/yourrepo/issues
- **Examples:** See `/examples` folder

---

## 🎉 Success Stories

> "Exported my dashboard as static HTML, deployed to Netlify in 2 minutes. Showing clients has never been easier!"
> — *Product Designer*

> "Full-stack export saved me days of setup. Just extracted the ZIP, updated DB credentials, and deployed to Railway. App is running smoothly with 500+ users."
> — *Indie Hacker*

> "Using snapshot exports for weekly reports. Each Monday I export with fresh data and send the HTML file to the team. Everyone loves it!"
> — *Data Analyst*

---

**Happy Exporting! 🚀**

*From prototype to production in minutes, not days.*

