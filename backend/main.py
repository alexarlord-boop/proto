from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import json
import os
import tempfile
import shutil
import zipfile

from database import get_db, init_db, DBConnector, SQLQuery, Project, User
from db_manager import db_manager
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin_user
)


app = FastAPI(title="Proto Query Builder API", version="1.0.0")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",  # Common local server port
    "http://localhost:8080",  # Another common port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "null",  # Allow file:// protocol (for exported HTML files opened locally)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Models for Request/Response
# ============================================================================

class DBConnectorCreate(BaseModel):
    name: str
    db_type: str  # postgres, mysql, sqlite
    host: Optional[str] = None
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    connection_string: Optional[str] = None


class DBConnectorResponse(BaseModel):
    id: str
    name: str
    db_type: str
    host: Optional[str]
    port: Optional[int]
    database: str
    username: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SQLQueryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sql_query: str
    connector_id: str
    project_id: str = "default"


class SQLQueryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sql_query: Optional[str] = None
    connector_id: Optional[str] = None


class SQLQueryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    sql_query: str
    connector_id: str
    project_id: str
    user_id: str
    is_valid: bool
    validation_error: Optional[str]
    last_executed: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QueryExecuteRequest(BaseModel):
    query_id: str
    limit: Optional[int] = 1000
    dry_run: Optional[bool] = False


class QueryValidateRequest(BaseModel):
    sql_query: str
    connector_id: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    components: List[dict] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    components: Optional[List[dict]] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    components: List[dict]
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class InitAdminRequest(BaseModel):
    username: str
    email: str
    password: str


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "Proto Query Builder API",
        "version": "1.0.0",
        "endpoints": {
            "connectors": "/api/connectors",
            "queries": "/api/queries",
            "projects": "/api/projects",
            "execute": "/api/queries/execute",
            "validate": "/api/queries/validate (dry-run validation)",
            "schema": "/api/connectors/{id}/schema"
        },
        "features": {
            "dry_run_validation": "Validates queries without execution using LIMIT 0",
            "dry_run_execution": "Execute DML queries without committing (add dry_run=true parameter)"
        }
    }


@app.get("/test")
async def test():
    """Returns sample tabular data for Table component"""
    return {
        "columns": [
            {"key": "id", "label": "ID"},
            {"key": "name", "label": "Name"},
            {"key": "email", "label": "Email"},
            {"key": "role", "label": "Role"},
            {"key": "status", "label": "Status"}
        ],
        "data": [
            {"id": "1", "name": "Alice Johnson", "email": "alice@example.com", "role": "Admin", "status": "Active"},
            {"id": "2", "name": "Bob Smith", "email": "bob@example.com", "role": "Developer", "status": "Active"},
            {"id": "3", "name": "Carol White", "email": "carol@example.com", "role": "Designer", "status": "Away"},
            {"id": "4", "name": "David Brown", "email": "david@example.com", "role": "Manager", "status": "Active"},
            {"id": "5", "name": "Eve Davis", "email": "eve@example.com", "role": "Developer", "status": "Active"},
            {"id": "6", "name": "Frank Miller", "email": "frank@example.com", "role": "QA Engineer", "status": "Inactive"},
            {"id": "7", "name": "Grace Lee", "email": "grace@example.com", "role": "Developer", "status": "Active"},
            {"id": "8", "name": "Henry Wilson", "email": "henry@example.com", "role": "Designer", "status": "Active"},
        ]
    }


# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.post("/api/admin/init", response_model=UserResponse)
async def initialize_admin(request: InitAdminRequest, db: Session = Depends(get_db)):
    """Initialize the first admin user (only works if no users exist)"""
    # Check if any users exist
    existing_users = db.query(User).count()
    if existing_users > 0:
        raise HTTPException(
            status_code=400,
            detail="Admin user already exists. Use login instead."
        )
    
    # Check if username or email already exists (shouldn't happen, but safe check)
    existing = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        username=request.username,
        email=request.email,
        hashed_password=get_password_hash(request.password),
        is_active=True,
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return admin_user


@app.post("/api/auth/register", response_model=UserResponse)
async def register(
    request: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Register a new user (admin only)"""
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        username=request.username,
        email=request.email,
        hashed_password=get_password_hash(request.password),
        is_active=True,
        is_admin=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: UserLogin, db: Session = Depends(get_db)):
    """Login and receive an access token"""
    # Find user by username
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


@app.get("/api/auth/check")
async def check_auth_status(db: Session = Depends(get_db)):
    """Check if admin exists and authentication is required"""
    user_count = db.query(User).count()
    admin_exists = db.query(User).filter(User.is_admin == True).count() > 0
    
    return {
        "requires_init": user_count == 0,
        "admin_exists": admin_exists,
        "auth_required": user_count > 0
    }


# ============================================================================
# DB Connector Endpoints
# ============================================================================

@app.post("/api/connectors", response_model=DBConnectorResponse)
async def create_connector(
    connector: DBConnectorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new database connector (requires authentication)"""
    # Check if name already exists for this user
    existing = db.query(DBConnector).filter(
        DBConnector.name == connector.name,
        DBConnector.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Connector with this name already exists")
    
    db_connector = DBConnector(
        id=str(uuid.uuid4()),
        name=connector.name,
        db_type=connector.db_type,
        host=connector.host,
        port=connector.port,
        database=connector.database,
        username=connector.username,
        password=connector.password,
        connection_string=connector.connection_string,
        is_active=True,
        user_id=current_user.id
    )
    
    # Test connection before saving
    connector_dict = {
        "id": db_connector.id,
        "db_type": db_connector.db_type,
        "host": db_connector.host,
        "port": db_connector.port,
        "database": db_connector.database,
        "username": db_connector.username,
        "password": db_connector.password,
        "connection_string": db_connector.connection_string
    }
    
    test_result = db_manager.test_connection(connector_dict)
    if not test_result["success"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Connection test failed: {test_result['message']}"
        )
    
    db.add(db_connector)
    db.commit()
    db.refresh(db_connector)
    
    return db_connector


@app.get("/api/connectors", response_model=List[DBConnectorResponse])
async def list_connectors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all database connectors for current user"""
    connectors = db.query(DBConnector).filter(
        DBConnector.is_active == True,
        DBConnector.user_id == current_user.id
    ).all()
    return connectors


@app.get("/api/connectors/{connector_id}", response_model=DBConnectorResponse)
async def get_connector(
    connector_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific connector by ID"""
    connector = db.query(DBConnector).filter(
        DBConnector.id == connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector


@app.delete("/api/connectors/{connector_id}")
async def delete_connector(
    connector_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a connector (soft delete)"""
    connector = db.query(DBConnector).filter(
        DBConnector.id == connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector.is_active = False
    db.commit()
    
    return {"message": "Connector deleted successfully"}


@app.get("/api/connectors/{connector_id}/schema")
async def get_connector_schema(
    connector_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get database schema for a connector"""
    connector = db.query(DBConnector).filter(
        DBConnector.id == connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    schema = db_manager.get_schema(connector_dict)
    if not schema["success"]:
        raise HTTPException(status_code=500, detail=schema["message"])
    
    return schema


@app.get("/api/connectors/{connector_id}/default-queries")
async def get_connector_default_queries(
    connector_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get default queries for a connector based on its schema"""
    connector = db.query(DBConnector).filter(
        DBConnector.id == connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    default_queries = db_manager.generate_default_queries(connector_dict)
    if not default_queries["success"]:
        raise HTTPException(status_code=500, detail=default_queries.get("message", "Failed to generate default queries"))
    
    return default_queries


# ============================================================================
# SQL Query Endpoints
# ============================================================================

@app.post("/api/queries", response_model=SQLQueryResponse)
async def create_query(
    query: SQLQueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new SQL query (requires authentication)"""
    # Verify connector exists and belongs to user
    connector = db.query(DBConnector).filter(
        DBConnector.id == query.connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    # Validate query
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    validation = db_manager.validate_query(query.sql_query, connector_dict)
    
    sql_query = SQLQuery(
        id=str(uuid.uuid4()),
        name=query.name,
        description=query.description,
        sql_query=query.sql_query,
        connector_id=query.connector_id,
        project_id=query.project_id,
        user_id=current_user.id,
        is_valid=validation["valid"],
        validation_error=validation.get("message") if not validation["valid"] else None
    )
    
    db.add(sql_query)
    db.commit()
    db.refresh(sql_query)
    
    return sql_query


@app.get("/api/queries", response_model=List[SQLQueryResponse])
async def list_queries(
    project_id: Optional[str] = None,
    connector_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all SQL queries for current user with optional filters"""
    query = db.query(SQLQuery).filter(SQLQuery.user_id == current_user.id)
    
    if project_id:
        query = query.filter(SQLQuery.project_id == project_id)
    if connector_id:
        query = query.filter(SQLQuery.connector_id == connector_id)
    
    queries = query.order_by(SQLQuery.created_at.desc()).all()
    return queries


@app.get("/api/queries/{query_id}", response_model=SQLQueryResponse)
async def get_query(
    query_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific query by ID"""
    query = db.query(SQLQuery).filter(
        SQLQuery.id == query_id,
        SQLQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    return query


@app.put("/api/queries/{query_id}", response_model=SQLQueryResponse)
async def update_query(
    query_id: str,
    query_update: SQLQueryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing query"""
    query = db.query(SQLQuery).filter(
        SQLQuery.id == query_id,
        SQLQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    # Update fields if provided
    if query_update.name is not None:
        query.name = query_update.name
    if query_update.description is not None:
        query.description = query_update.description
    if query_update.sql_query is not None:
        query.sql_query = query_update.sql_query
        
        # Re-validate query
        connector = db.query(DBConnector).filter(DBConnector.id == query.connector_id).first()
        connector_dict = {
            "id": connector.id,
            "db_type": connector.db_type,
            "host": connector.host,
            "port": connector.port,
            "database": connector.database,
            "username": connector.username,
            "password": connector.password,
            "connection_string": connector.connection_string
        }
        
        validation = db_manager.validate_query(query.sql_query, connector_dict)
        query.is_valid = validation["valid"]
        query.validation_error = validation.get("message") if not validation["valid"] else None
    
    if query_update.connector_id is not None:
        query.connector_id = query_update.connector_id
    
    query.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(query)
    
    return query


@app.delete("/api/queries/{query_id}")
async def delete_query(
    query_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a query"""
    query = db.query(SQLQuery).filter(
        SQLQuery.id == query_id,
        SQLQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    db.delete(query)
    db.commit()
    
    return {"message": "Query deleted successfully"}


@app.post("/api/queries/validate")
async def validate_query(
    request: QueryValidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate a SQL query without saving it"""
    connector = db.query(DBConnector).filter(
        DBConnector.id == request.connector_id,
        DBConnector.user_id == current_user.id
    ).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    validation = db_manager.validate_query(request.sql_query, connector_dict)
    return validation


@app.post("/api/queries/execute")
async def execute_query(
    request: QueryExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute a saved query and return results (supports dry-run mode)"""
    query = db.query(SQLQuery).filter(
        SQLQuery.id == request.query_id,
        SQLQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    connector = db.query(DBConnector).filter(DBConnector.id == query.connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    result = db_manager.execute_query(
        query.sql_query, 
        connector_dict, 
        request.limit,
        dry_run=request.dry_run
    )
    
    # Update last_executed timestamp (only for real executions, not dry-runs)
    if not request.dry_run:
        query.last_executed = datetime.utcnow()
        db.commit()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result


@app.get("/api/queries/{query_id}/execute")
async def execute_query_by_id(
    query_id: str,
    limit: Optional[int] = 1000,
    dry_run: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute a saved query by ID (GET endpoint for direct use in dataSource, supports dry-run mode)"""
    query = db.query(SQLQuery).filter(
        SQLQuery.id == query_id,
        SQLQuery.user_id == current_user.id
    ).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    connector = db.query(DBConnector).filter(DBConnector.id == query.connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector_dict = {
        "id": connector.id,
        "db_type": connector.db_type,
        "host": connector.host,
        "port": connector.port,
        "database": connector.database,
        "username": connector.username,
        "password": connector.password,
        "connection_string": connector.connection_string
    }
    
    result = db_manager.execute_query(query.sql_query, connector_dict, limit, dry_run=dry_run)
    
    # Update last_executed timestamp (only for real executions, not dry-runs)
    if not dry_run:
        query.last_executed = datetime.utcnow()
        db.commit()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    # Return in format expected by Table component
    return {
        "columns": result.get("columns", []),
        "data": result.get("data", []),
        "dry_run": result.get("dry_run", False),
        "message": result.get("message"),
        "affected_rows": result.get("affected_rows")
    }


# ============================================================================
# Project Endpoints
# ============================================================================

@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new canvas project (requires authentication)"""
    db_project = Project(
        id=str(uuid.uuid4()),
        name=project.name,
        description=project.description,
        components=json.dumps(project.components),
        user_id=current_user.id
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Convert components back to list for response
    return {
        **db_project.__dict__,
        "components": json.loads(db_project.components)
    }


@app.get("/api/projects", response_model=List[ProjectResponse])
async def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all projects for current user"""
    query = db.query(Project).filter(Project.user_id == current_user.id)
    
    projects = query.order_by(Project.updated_at.desc()).all()
    
    # Convert components from JSON string to list for each project
    return [
        {
            **project.__dict__,
            "components": json.loads(project.components)
        }
        for project in projects
    ]


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific project by ID"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        **project.__dict__,
        "components": json.loads(project.components)
    }


@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields if provided
    if project_update.name is not None:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description
    if project_update.components is not None:
        project.components = json.dumps(project_update.components)
    
    project.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(project)
    
    return {
        **project.__dict__,
        "components": json.loads(project.components)
    }


@app.delete("/api/projects/{project_id}")
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}


@app.post("/api/projects/{project_id}/export")
async def export_project(
    project_id: str,
    format: str = "static",  # "static" or "fullstack"
    data_strategy: str = "snapshot",  # "snapshot" or "live"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export a project as a distributable artifact
    
    - format: 'static' (single HTML file) or 'fullstack' (ZIP with backend)
    - data_strategy: 'snapshot' (embed current data) or 'live' (keep API calls)
    """
    try:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        components = json.loads(project.components)
        
        if format == "static":
            # Generate standalone HTML file
            html_content = generate_static_bundle(
                project_name=project.name,
                components=components,
                data_strategy=data_strategy,
                db=db
            )
            
            return Response(
                content=html_content,
                media_type="text/html",
                headers={
                    "Content-Disposition": f'attachment; filename="{project.name.replace(" ", "_")}.html"'
                }
            )
        
        elif format == "fullstack":
            # Generate full-stack ZIP package
            zip_path = generate_fullstack_bundle(
                project_name=project.name,
                components=components,
                project_id=project_id,
                db=db
            )
            
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename=f"{project.name.replace(' ', '_')}.zip",
                background=None  # Delete file after sending
            )
        
        else:
            raise HTTPException(status_code=400, detail="Invalid export format")
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Export error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


def generate_static_bundle(
    project_name: str,
    components: List[dict],
    data_strategy: str,
    db: Session
) -> str:
    """Generate a standalone HTML file with embedded React app"""
    
    # If snapshot mode, fetch all query data
    snapshot_data = {}
    if data_strategy == "snapshot":
        for component in components:
            if component.get("type") == "Table":
                query_id = component.get("props", {}).get("queryId")
                if query_id and query_id not in snapshot_data:
                    # Fetch query data
                    query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
                    if query:
                        connector = db.query(DBConnector).filter(
                            DBConnector.id == query.connector_id
                        ).first()
                        if connector:
                            connector_dict = {
                                "id": connector.id,
                                "db_type": connector.db_type,
                                "host": connector.host,
                                "port": connector.port,
                                "database": connector.database,
                                "username": connector.username,
                                "password": connector.password,
                                "connection_string": connector.connection_string
                            }
                            result = db_manager.execute_query(
                                query.sql_query,
                                connector_dict,
                                limit=1000
                            )
                            if result["success"]:
                                snapshot_data[query_id] = result.get("data", [])
    
    # Generate HTML content
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{project_name}</title>
  
  <!-- Tailwind CSS (via CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React & ReactDOM (via CDN) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <style>
    /* Custom styles */
    body {{
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}
    
    * {{
      box-sizing: border-box;
    }}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" data-type="module">
    const {{ useState, useEffect }} = React;
    
    // Component data (injected during export)
    const COMPONENTS = {json.dumps(components)};
    const PROJECT_NAME = {json.dumps(project_name)};
    const DATA_STRATEGY = {json.dumps(data_strategy)};
    const SNAPSHOT_DATA = {json.dumps(snapshot_data)};
    
    // Component renderers
    function Button({{ text, variant, size, disabled, onClick }}) {{
      const variantClasses = {{
        default: 'bg-slate-900 text-white hover:bg-slate-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        ghost: 'hover:bg-slate-100',
        link: 'text-blue-600 underline hover:text-blue-700',
      }};
      
      const sizeClasses = {{
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
      }};
      
      return (
        <button
          onClick={{onClick}}
          disabled={{disabled}}
          className={{`rounded-md font-medium transition-colors ${{variantClasses[variant || 'default']}} ${{sizeClasses[size || 'default']}} ${{disabled ? 'opacity-50 cursor-not-allowed' : ''}}`}}
        >
          {{text}}
        </button>
      );
    }}
    
    function Input({{ placeholder, type, defaultValue, disabled }}) {{
      const [value, setValue] = useState(defaultValue || '');
      
      return (
        <input
          type={{type || 'text'}}
          value={{value}}
          onChange={{(e) => setValue(e.target.value)}}
          placeholder={{placeholder}}
          disabled={{disabled}}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      );
    }}
    
    function Select({{ placeholder, options, defaultValue, disabled }}) {{
      const [value, setValue] = useState(defaultValue || '');
      
      return (
        <select
          value={{value}}
          onChange={{(e) => setValue(e.target.value)}}
          disabled={{disabled}}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
        >
          <option value="">{{placeholder}}</option>
          {{options?.map((opt) => (
            <option key={{opt.value}} value={{opt.value}}>
              {{opt.label}}
            </option>
          ))}}
        </select>
      );
    }}
    
    // Table formatting evaluation functions
    function evaluateCondition(condition, row) {{
      const columnValue = row[condition.column];
      const compareValue = condition.value;
      
      switch (condition.operator) {{
        case 'eq': return columnValue == compareValue;
        case 'neq': return columnValue != compareValue;
        case 'gt': return Number(columnValue) > Number(compareValue);
        case 'gte': return Number(columnValue) >= Number(compareValue);
        case 'lt': return Number(columnValue) < Number(compareValue);
        case 'lte': return Number(columnValue) <= Number(compareValue);
        case 'contains': return String(columnValue).toLowerCase().includes(String(compareValue).toLowerCase());
        case 'notContains': return !String(columnValue).toLowerCase().includes(String(compareValue).toLowerCase());
        case 'startsWith': return String(columnValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
        case 'endsWith': return String(columnValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
        case 'isEmpty': return columnValue === null || columnValue === undefined || columnValue === '';
        case 'isNotEmpty': return columnValue !== null && columnValue !== undefined && columnValue !== '';
        default: return false;
      }}
    }}
    
    function evaluateRule(rule, row) {{
      if (!rule.enabled || !rule.conditions || rule.conditions.length === 0) return false;
      
      let result = evaluateCondition(rule.conditions[0], row);
      for (let i = 1; i < rule.conditions.length; i++) {{
        const prevLogic = rule.conditions[i - 1].logic || 'AND';
        const currentResult = evaluateCondition(rule.conditions[i], row);
        result = prevLogic === 'AND' ? (result && currentResult) : (result || currentResult);
      }}
      return result;
    }}
    
    function getRowFormatting(row, rules) {{
      const rowRules = (rules || []).filter(rule => rule.target === 'row');
      let combinedStyle = {{}};
      let hasAnyStyle = false;
      
      for (const rule of rowRules) {{
        if (evaluateRule(rule, row)) {{
          combinedStyle = {{ ...combinedStyle, ...rule.style }};
          hasAnyStyle = true;
        }}
      }}
      return hasAnyStyle ? combinedStyle : null;
    }}
    
    function getCellFormatting(row, columnKey, rules) {{
      const cellRules = (rules || []).filter(rule => rule.target === 'cell' && rule.targetColumn === columnKey);
      let combinedStyle = {{}};
      let hasAnyStyle = false;
      
      for (const rule of cellRules) {{
        if (evaluateRule(rule, row)) {{
          combinedStyle = {{ ...combinedStyle, ...rule.style }};
          hasAnyStyle = true;
        }}
      }}
      return hasAnyStyle ? combinedStyle : null;
    }}
    
    function formatStyleToCSS(style) {{
      return {{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
      }};
    }}
    
    function DataTable({{ columns, data, dataSource, dataSourceType, queryId, striped, bordered, columnConfigs, formattingRules, headerBackgroundColor, headerTextColor, rowHoverColor }}) {{
      const [tableData, setTableData] = useState(data || []);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      
      useEffect(() => {{
        // If snapshot mode and we have snapshot data, use it
        if (DATA_STRATEGY === 'snapshot' && queryId && SNAPSHOT_DATA[queryId]) {{
          setTableData(SNAPSHOT_DATA[queryId]);
        }}
        // Otherwise try to fetch live data
        else if (dataSourceType === 'query' && queryId) {{
          fetchQueryData(queryId);
        }} else if (dataSourceType === 'url' && dataSource) {{
          fetchUrlData(dataSource);
        }}
      }}, [dataSourceType, queryId, dataSource]);
      
      const fetchQueryData = async (id) => {{
        setLoading(true);
        try {{
          const response = await fetch(`http://localhost:8000/api/queries/${{id}}/execute`);
          const result = await response.json();
          setTableData(result.data || []);
        }} catch (err) {{
          setError('Failed to load data');
          console.error(err);
        }} finally {{
          setLoading(false);
        }}
      }};
      
      const fetchUrlData = async (url) => {{
        setLoading(true);
        try {{
          const response = await fetch(url);
          const result = await response.json();
          setTableData(result.data || result);
        }} catch (err) {{
          setError('Failed to load data');
          console.error(err);
        }} finally {{
          setLoading(false);
        }}
      }};
      
      if (loading) {{
        return <div className="p-4 text-slate-600">Loading...</div>;
      }}
      
      if (error) {{
        return <div className="p-4 text-red-600">{{error}}</div>;
      }}
      
      if (!tableData || tableData.length === 0) {{
        return <div className="p-4 text-slate-400">No data available</div>;
      }}
      
      // Auto-derive columns from data
      let derivedColumns = columns || Object.keys(tableData[0] || {{}}).map(key => ({{
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      }}));
      
      // Apply column configuration
      if (columnConfigs && columnConfigs.length > 0) {{
        const columnsMap = new Map(derivedColumns.map(col => [col.key, col]));
        derivedColumns = columnConfigs
          .filter(config => config.visible !== false)
          .map(config => {{
            const originalCol = columnsMap.get(config.key);
            if (originalCol) {{
              return {{
                key: config.key,
                label: config.label || originalCol.label,
                width: config.width
              }};
            }}
            return null;
          }})
          .filter(col => col !== null);
      }}
      
      const headerStyle = {{
        backgroundColor: headerBackgroundColor,
        color: headerTextColor
      }};
      
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className={{`w-full text-sm ${{bordered ? 'border-collapse' : ''}}`}}>
            <thead className="bg-slate-100">
              <tr>
                {{derivedColumns.map((col) => (
                  <th 
                    key={{col.key}} 
                    style={{{{...headerStyle, width: col.width}}}}
                    className={{`px-4 py-2 text-left font-medium text-slate-700 ${{bordered ? 'border border-slate-200' : ''}}`}}
                  >
                    {{col.label}}
                  </th>
                ))}}
              </tr>
            </thead>
            <tbody>
              {{tableData.map((row, idx) => {{
                const rowFormatStyle = getRowFormatting(row, formattingRules);
                const rowCSS = rowFormatStyle ? formatStyleToCSS(rowFormatStyle) : {{}};
                const stripedBg = striped && idx % 2 === 1 ? {{ backgroundColor: '#f8fafc' }} : {{}};
                const rowStyle = {{ ...stripedBg, ...rowCSS }};
                
                return (
                  <tr key={{idx}} style={{rowStyle}} className={{rowHoverColor ? 'hover:opacity-90' : ''}}>
                    {{derivedColumns.map((col) => {{
                      const cellFormatStyle = getCellFormatting(row, col.key, formattingRules);
                      const cellCSS = cellFormatStyle ? formatStyleToCSS(cellFormatStyle) : {{}};
                      const cellStyle = {{ ...cellCSS, width: col.width, minWidth: col.width }};
                      
                      return (
                        <td 
                          key={{col.key}} 
                          style={{cellStyle}}
                          className={{`px-4 py-2 text-slate-600 ${{bordered ? 'border border-slate-200' : ''}}`}}
                        >
                          {{row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '-'}}
                        </td>
                      );
                    }})}}
                  </tr>
                );
              }})}}
            </tbody>
          </table>
        </div>
      );
    }}
    
    function TabsComponent({{ tabs, defaultValue }}) {{
      const [activeTab, setActiveTab] = useState(defaultValue || tabs?.[0]?.value || '');
      
      return (
        <div className="w-full">
          <div className="border-b border-slate-200">
            <div className="flex gap-1">
              {{tabs?.map((tab) => (
                <button
                  key={{tab.value}}
                  onClick={{() => setActiveTab(tab.value)}}
                  className={{`px-4 py-2 text-sm font-medium transition-colors ${{
                    activeTab === tab.value
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }}`}}
                >
                  {{tab.label}}
                </button>
              ))}}
            </div>
          </div>
          <div className="p-4">
            {{tabs?.find(t => t.value === activeTab)?.content || ''}}
          </div>
        </div>
      );
    }}
    
    function Container({{ padding, backgroundColor, children }}) {{
      const style = {{
        padding: padding || '16px',
        backgroundColor: backgroundColor || 'transparent',
      }};
      
      return (
        <div style={{style}} className="rounded-lg">
          {{children}}
        </div>
      );
    }}
    
    function Grid({{ columns, gap, children }}) {{
      const style = {{
        display: 'grid',
        gridTemplateColumns: `repeat(${{columns || 2}}, 1fr)`,
        gap: gap || '16px',
      }};
      
      return <div style={{style}}>{{children}}</div>;
    }}
    
    function Stack({{ direction, gap, align, children }}) {{
      const style = {{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: gap || '8px',
        alignItems: align || 'stretch',
      }};
      
      return <div style={{style}}>{{children}}</div>;
    }}
    
    // Component renderer
    function renderComponent(component) {{
      const executeEventHandler = (code) => {{
        try {{
          const fn = new Function('component', 'event', code);
          return (e) => fn(component, e);
        }} catch (err) {{
          console.error('Error executing event handler:', err);
          return () => {{}};
        }}
      }};
      
      const commonProps = {{}};
      if (component.eventHandlers?.onClick) {{
        commonProps.onClick = executeEventHandler(component.eventHandlers.onClick.code);
      }}
      
      switch (component.type) {{
        case 'Button':
          return <Button {{...component.props}} {{...commonProps}} />;
        case 'Input':
          return <Input {{...component.props}} />;
        case 'Select':
          return <Select {{...component.props}} />;
        case 'Table':
          return <DataTable {{...component.props}} />;
        case 'Tabs':
          return <TabsComponent {{...component.props}} />;
        case 'Container':
          return (
            <Container {{...component.props}}>
              {{component.children?.map(child => (
                <div key={{child.id}} style={{{{ position: 'relative' }}}}>
                  {{renderComponent(child)}}
                </div>
              ))}}
            </Container>
          );
        case 'Grid':
          return (
            <Grid {{...component.props}}>
              {{component.children?.map(child => renderComponent(child))}}
            </Grid>
          );
        case 'Stack':
          return (
            <Stack {{...component.props}}>
              {{component.children?.map(child => renderComponent(child))}}
            </Stack>
          );
        default:
          return <div>Unknown component: {{component.type}}</div>;
      }}
    }}
    
    // Main App component
    function App() {{
      return (
        <div className="w-full min-h-screen bg-gradient-to-br from-white to-slate-50">
          <div className="relative w-full min-h-screen">
            {{COMPONENTS.map((component) => {{
              if (component.parentId) return null;
              
              const style = {{
                position: 'absolute',
                left: `${{component.position.x}}px`,
                top: `${{component.position.y}}px`,
                width: component.width ? `${{component.width}}px` : undefined,
                height: component.height ? `${{component.height}}px` : undefined,
              }};
              
              return (
                <div key={{component.id}} style={{style}}>
                  {{renderComponent(component)}}
                </div>
              );
            }})}}
          </div>
        </div>
      );
    }}
    
    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
  
  <!-- Babel standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</body>
</html>"""
    
    return html_template


def generate_fullstack_bundle(
    project_name: str,
    components: List[dict],
    project_id: str,
    db: Session
) -> str:
    """Generate a full-stack ZIP package with frontend + backend"""
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    project_dir = os.path.join(temp_dir, project_name.replace(" ", "_"))
    os.makedirs(project_dir)
    
    # Create directory structure
    frontend_dir = os.path.join(project_dir, "frontend")
    backend_dir = os.path.join(project_dir, "backend")
    os.makedirs(frontend_dir)
    os.makedirs(backend_dir)
    
    # Generate frontend (same as static bundle but without snapshot data)
    frontend_html = generate_static_bundle(
        project_name=project_name,
        components=components,
        data_strategy="live",  # Always use live data for fullstack
        db=db
    )
    with open(os.path.join(frontend_dir, "index.html"), "w") as f:
        f.write(frontend_html)
    
    # Generate minimal backend
    # Collect all queries used in the project
    query_ids = set()
    for component in components:
        if component.get("type") == "Table":
            query_id = component.get("props", {}).get("queryId")
            if query_id:
                query_ids.add(query_id)
    
    # Fetch query and connector data
    queries_data = []
    connectors_data = {}
    
    for query_id in query_ids:
        query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
        if query:
            connector = db.query(DBConnector).filter(
                DBConnector.id == query.connector_id
            ).first()
            if connector:
                queries_data.append({
                    "id": query.id,
                    "name": query.name,
                    "sql_query": query.sql_query,
                    "connector_id": query.connector_id
                })
                connectors_data[connector.id] = {
                    "id": connector.id,
                    "name": connector.name,
                    "db_type": connector.db_type,
                    "host": connector.host,
                    "port": connector.port,
                    "database": connector.database,
                    "username": connector.username,
                    "password": connector.password
                }
    
    # Write queries.json
    with open(os.path.join(backend_dir, "queries.json"), "w") as f:
        json.dump({
            "queries": queries_data,
            "connectors": list(connectors_data.values())
        }, f, indent=2)
    
    # Write mini backend main.py
    backend_code = '''from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import json
from pathlib import Path

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load queries and connectors
with open(Path(__file__).parent / "queries.json") as f:
    data = json.load(f)
    QUERIES = {q["id"]: q for q in data["queries"]}
    CONNECTORS = {c["id"]: c for c in data["connectors"]}

# Create database engines
ENGINES = {}

def get_engine(connector_id):
    if connector_id in ENGINES:
        return ENGINES[connector_id]
    
    connector = CONNECTORS.get(connector_id)
    if not connector:
        return None
    
    db_type = connector["db_type"]
    if db_type == "sqlite":
        conn_str = f"sqlite:///{connector['database']}"
    elif db_type == "postgresql":
        conn_str = f"postgresql://{connector['username']}:{connector['password']}@{connector['host']}:{connector['port']}/{connector['database']}"
    elif db_type == "mysql":
        conn_str = f"mysql+pymysql://{connector['username']}:{connector['password']}@{connector['host']}:{connector['port']}/{connector['database']}"
    else:
        return None
    
    engine = create_engine(conn_str)
    ENGINES[connector_id] = engine
    return engine

@app.get("/api/queries/{{query_id}}/execute")
async def execute_query(query_id: str, limit: int = 1000):
    query = QUERIES.get(query_id)
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    engine = get_engine(query["connector_id"])
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query["sql_query"]))
            rows = result.fetchmany(limit)
            columns = [{"key": col, "label": col.title()} for col in result.keys()]
            data = [dict(row._mapping) for row in rows]
            
        return {
            "columns": columns,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Project backend is running", "queries": len(QUERIES)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
    with open(os.path.join(backend_dir, "main.py"), "w") as f:
        f.write(backend_code)
    
    # Write requirements.txt
    with open(os.path.join(backend_dir, "requirements.txt"), "w") as f:
        f.write("""fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
psycopg2-binary==2.9.9
""")
    
    # Write README.md
    readme = f"""# {project_name} - Exported Project

## Quick Start

### Option 1: Static Frontend Only
Open `frontend/index.html` in your browser to view the app.
Note: This requires the backend to be running for live data.

### Option 2: Full Stack (Frontend + Backend)

1. **Start the Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Open Frontend:**
   Open `frontend/index.html` in your browser

3. **Access the app at:** `http://localhost:8000` (or open index.html)

### Option 3: Docker (Coming Soon)

```bash
docker-compose up
```

## Configuration

### Database Connections
Edit `backend/queries.json` to update database connection strings.

### Queries
All queries are stored in `backend/queries.json`.

## Deployment

### Static Frontend
Deploy `frontend/index.html` to any static host:
- Vercel
- Netlify  
- GitHub Pages
- AWS S3

### Backend
Deploy `backend/` to:
- Heroku
- Railway
- AWS EC2/Lambda
- Digital Ocean

## Project Info
- **Name:** {project_name}
- **Components:** {len(components)}
- **Queries:** {len(query_ids)}
- **Exported:** {datetime.utcnow().isoformat()}
"""
    with open(os.path.join(project_dir, "README.md"), "w") as f:
        f.write(readme)
    
    # Create ZIP file
    zip_path = os.path.join(temp_dir, f"{project_name.replace(' ', '_')}.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_dir)
                zipf.write(file_path, arcname)
    
    # Clean up project directory (keep ZIP)
    shutil.rmtree(project_dir)
    
    return zip_path