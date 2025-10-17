# Authentication System Guide

## Overview

The Proto Query Builder now includes a comprehensive user authentication system with the following features:

- **User Management**: Admin users can create and manage additional users
- **Role-Based Access**: Admin role with special privileges
- **JWT Authentication**: Secure token-based authentication
- **Protected Resources**: Projects, queries, and database connectors are owned by users
- **Auto-initialization**: First-time setup for creating the initial admin account

## Architecture

### Backend (Python/FastAPI)

#### Database Models (`backend/database.py`)

**User Model:**
- `id`: Unique identifier
- `username`: Unique username
- `email`: Unique email address
- `hashed_password`: BCrypt hashed password
- `is_active`: Account status
- `is_admin`: Admin flag
- Relationships: `projects`, `queries`, `connectors`

**Updated Models:**
- `Project`, `SQLQuery`, `DBConnector` now have `user_id` foreign key
- All resources are owned by a specific user

#### Authentication (`backend/auth.py`)

**Key Functions:**
- `get_password_hash()`: Hash passwords using BCrypt
- `verify_password()`: Verify password against hash
- `create_access_token()`: Generate JWT tokens
- `get_current_user()`: Dependency for protected routes
- `get_current_admin_user()`: Dependency for admin-only routes

**Security Configuration:**
- JWT algorithm: HS256
- Token expiration: 7 days
- Password hashing: BCrypt

#### API Endpoints (`backend/main.py`)

**Authentication Endpoints:**
- `POST /api/admin/init`: Initialize first admin (only works when no users exist)
- `POST /api/auth/login`: Login and receive JWT token
- `POST /api/auth/register`: Register new user (admin only)
- `GET /api/auth/me`: Get current user info
- `GET /api/auth/check`: Check authentication status

**Protected Endpoints:**
All project, query, and connector endpoints now require authentication:
- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/{id}`
- `GET/POST /api/queries`
- `GET/PUT/DELETE /api/queries/{id}`
- `GET/POST /api/connectors`
- `GET/DELETE /api/connectors/{id}`

### Frontend (React/TypeScript)

#### Authentication Service (`frontend/src/lib/auth.ts`)

**AuthService Class:**
- Manages authentication state
- Stores JWT token and user data in localStorage
- Provides methods for login, logout, registration
- Handles token persistence across page reloads

#### Auth Context (`frontend/src/contexts/AuthContext.tsx`)

**AuthProvider:**
- React context for authentication state
- Provides `useAuth()` hook
- Handles authentication verification on app load
- Manages user login/logout flow

**Available via `useAuth()`:**
- `user`: Current user object
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state during initialization
- `authStatus`: System authentication status
- `login()`: Login function
- `logout()`: Logout function
- `initializeAdmin()`: Initialize first admin

#### API Client (`frontend/src/lib/api-client.ts`)

**ApiClient:**
- Centralized API client with automatic authentication
- Automatically adds `Authorization: Bearer <token>` header
- Handles 401 responses by clearing auth and reloading
- Provides `get()`, `post()`, `put()`, `delete()` methods

#### UI Components

**LoginPage** (`frontend/src/components/Auth/LoginPage.tsx`):
- Login form with username/password
- Error handling and display
- Automatic redirect after successful login

**InitAdminPage** (`frontend/src/components/Auth/InitAdminPage.tsx`):
- First-time setup wizard
- Creates initial admin account
- Email and password validation
- Automatic login after creation

## Setup & Installation

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `passlib[bcrypt]==1.7.4` - Password hashing
- `python-jose[cryptography]==3.3.0` - JWT tokens
- `python-multipart==0.0.6` - Form data handling

### 2. Initialize Database

The database will automatically migrate when you start the backend:

```bash
cd backend
python main.py
```

This creates the `users` table and updates existing tables with `user_id` foreign keys.

### 3. First-Time Setup

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open the app in your browser
4. You'll see the "Initialize Admin" screen
5. Create your admin account with:
   - Username
   - Email
   - Password (minimum 6 characters)

6. You'll be automatically logged in after creation

## Usage

### For Admins

#### Creating Additional Users

Currently, admins can create new users via the API:

```bash
POST /api/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Note**: A UI for user management can be added as a future enhancement.

### For Regular Users

1. **Login**: Use your username and password
2. **Access Resources**: All your projects, queries, and connectors
3. **Create Projects**: Build visual query interfaces
4. **Create Queries**: Connect to databases and create SQL queries
5. **Logout**: Click the logout button in the header

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     App Initialization                       │
│                                                              │
│  1. Check /api/auth/check                                   │
│     ├─ requires_init: true  → Show InitAdminPage           │
│     ├─ auth_required: false → Show InitAdminPage           │
│     └─ auth_required: true  → Check token                   │
│                                                              │
│  2. Verify stored token                                     │
│     ├─ Valid token   → Show main app                        │
│     └─ No/invalid    → Show LoginPage                       │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### Production Deployment

**IMPORTANT**: Before deploying to production:

1. **Change the SECRET_KEY** in `backend/auth.py`:
   ```python
   SECRET_KEY = "your-production-secret-key"  # Use a strong random key
   ```
   
   Generate a secure key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use HTTPS**: JWT tokens should only be transmitted over HTTPS

3. **Environment Variables**: Store secrets in environment variables:
   ```python
   import os
   SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-dev-key")
   ```

4. **Database Security**: 
   - Move to PostgreSQL for production
   - Enable SSL connections
   - Encrypt sensitive data (especially connector passwords)

5. **Token Expiration**: Consider shorter token lifetimes for production

6. **Rate Limiting**: Add rate limiting to login endpoints

7. **CORS Configuration**: Restrict CORS origins to your actual domains

### Password Policy

Current requirements:
- Minimum 6 characters
- No complexity requirements (can be enhanced)

Enhanced policy recommendations:
- Minimum 12 characters
- Require uppercase, lowercase, numbers, symbols
- Password strength meter
- Prevent common passwords
- Password expiration policy

## API Authentication

### Making Authenticated Requests

**Frontend (using apiClient):**
```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const projects = await apiClient.get('/api/projects');

// POST request
const newProject = await apiClient.post('/api/projects', {
  name: 'My Project',
  description: 'Description',
  components: []
});

// PUT request
const updated = await apiClient.put(`/api/projects/${id}`, { name: 'New Name' });

// DELETE request
await apiClient.delete(`/api/projects/${id}`);
```

**External API Calls (using curl):**
```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Response: {"access_token": "eyJ...", "token_type": "bearer", "user": {...}}

# Use token in requests
curl http://localhost:8000/api/projects \
  -H "Authorization: Bearer eyJ..."
```

## Troubleshooting

### "Could not validate credentials"
- Token expired or invalid
- Solution: Logout and login again

### "Admin user already exists"
- Trying to initialize admin when one exists
- Solution: Use login page instead

### "Unauthorized" errors on API calls
- Token missing or invalid
- Solution: Check browser localStorage for `auth_token` and `auth_user`
- Clear storage and login again if needed

### Database Migration Issues
If you're upgrading from a version without authentication:
1. Backup your database: `cp proto_queries.db proto_queries.db.backup`
2. The app will attempt to add new columns, but may fail if data exists
3. You may need to manually migrate data or start fresh

## Future Enhancements

Potential improvements:
- [ ] User management UI (admin dashboard)
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Session management (revoke tokens)
- [ ] User activity logs
- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Team/Organization support
- [ ] Resource sharing between users
- [ ] Fine-grained permissions system
- [ ] API key authentication for programmatic access

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Foreign Keys
```sql
-- Projects
ALTER TABLE projects ADD COLUMN user_id VARCHAR NOT NULL REFERENCES users(id);

-- Queries
ALTER TABLE sql_queries ADD COLUMN user_id VARCHAR NOT NULL REFERENCES users(id);

-- Connectors
ALTER TABLE db_connectors ADD COLUMN user_id VARCHAR NOT NULL REFERENCES users(id);
```

## Support

For issues or questions:
1. Check this guide first
2. Review the code comments
3. Check browser console for errors
4. Check backend logs for API errors

