from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import json

from database import get_db, init_db, DBConnector, SQLQuery, Project
from db_manager import db_manager


app = FastAPI(title="Proto Query Builder API", version="1.0.0")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

origins = [
    "http://localhost:5173",
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
    developer_id: str = "default"


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
    developer_id: str
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


class QueryValidateRequest(BaseModel):
    sql_query: str
    connector_id: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    components: List[dict] = []
    developer_id: str = "default"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    components: Optional[List[dict]] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    components: List[dict]
    developer_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


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
            "validate": "/api/queries/validate",
            "schema": "/api/connectors/{id}/schema"
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
# DB Connector Endpoints
# ============================================================================

@app.post("/api/connectors", response_model=DBConnectorResponse)
async def create_connector(connector: DBConnectorCreate, db: Session = Depends(get_db)):
    """Create a new database connector"""
    # Check if name already exists
    existing = db.query(DBConnector).filter(DBConnector.name == connector.name).first()
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
        is_active=True
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
async def list_connectors(db: Session = Depends(get_db)):
    """List all database connectors"""
    connectors = db.query(DBConnector).filter(DBConnector.is_active == True).all()
    return connectors


@app.get("/api/connectors/{connector_id}", response_model=DBConnectorResponse)
async def get_connector(connector_id: str, db: Session = Depends(get_db)):
    """Get a specific connector by ID"""
    connector = db.query(DBConnector).filter(DBConnector.id == connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector


@app.delete("/api/connectors/{connector_id}")
async def delete_connector(connector_id: str, db: Session = Depends(get_db)):
    """Delete a connector (soft delete)"""
    connector = db.query(DBConnector).filter(DBConnector.id == connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector.is_active = False
    db.commit()
    
    return {"message": "Connector deleted successfully"}


@app.get("/api/connectors/{connector_id}/schema")
async def get_connector_schema(connector_id: str, db: Session = Depends(get_db)):
    """Get database schema for a connector"""
    connector = db.query(DBConnector).filter(DBConnector.id == connector_id).first()
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


# ============================================================================
# SQL Query Endpoints
# ============================================================================

@app.post("/api/queries", response_model=SQLQueryResponse)
async def create_query(query: SQLQueryCreate, db: Session = Depends(get_db)):
    """Create a new SQL query"""
    # Verify connector exists
    connector = db.query(DBConnector).filter(DBConnector.id == query.connector_id).first()
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
        developer_id=query.developer_id,
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
    developer_id: Optional[str] = None,
    connector_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all SQL queries with optional filters"""
    query = db.query(SQLQuery)
    
    if project_id:
        query = query.filter(SQLQuery.project_id == project_id)
    if developer_id:
        query = query.filter(SQLQuery.developer_id == developer_id)
    if connector_id:
        query = query.filter(SQLQuery.connector_id == connector_id)
    
    queries = query.order_by(SQLQuery.created_at.desc()).all()
    return queries


@app.get("/api/queries/{query_id}", response_model=SQLQueryResponse)
async def get_query(query_id: str, db: Session = Depends(get_db)):
    """Get a specific query by ID"""
    query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    return query


@app.put("/api/queries/{query_id}", response_model=SQLQueryResponse)
async def update_query(
    query_id: str,
    query_update: SQLQueryUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing query"""
    query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
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
async def delete_query(query_id: str, db: Session = Depends(get_db)):
    """Delete a query"""
    query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    db.delete(query)
    db.commit()
    
    return {"message": "Query deleted successfully"}


@app.post("/api/queries/validate")
async def validate_query(request: QueryValidateRequest, db: Session = Depends(get_db)):
    """Validate a SQL query without saving it"""
    connector = db.query(DBConnector).filter(DBConnector.id == request.connector_id).first()
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
async def execute_query(request: QueryExecuteRequest, db: Session = Depends(get_db)):
    """Execute a saved query and return results"""
    query = db.query(SQLQuery).filter(SQLQuery.id == request.query_id).first()
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
    
    result = db_manager.execute_query(query.sql_query, connector_dict, request.limit)
    
    # Update last_executed timestamp
    query.last_executed = datetime.utcnow()
    db.commit()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result


@app.get("/api/queries/{query_id}/execute")
async def execute_query_by_id(
    query_id: str,
    limit: Optional[int] = 1000,
    db: Session = Depends(get_db)
):
    """Execute a saved query by ID (GET endpoint for direct use in dataSource)"""
    query = db.query(SQLQuery).filter(SQLQuery.id == query_id).first()
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
    
    result = db_manager.execute_query(query.sql_query, connector_dict, limit)
    
    # Update last_executed timestamp
    query.last_executed = datetime.utcnow()
    db.commit()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    # Return in format expected by Table component
    return {
        "columns": result.get("columns", []),
        "data": result.get("data", [])
    }


# ============================================================================
# Project Endpoints
# ============================================================================

@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new canvas project"""
    db_project = Project(
        id=str(uuid.uuid4()),
        name=project.name,
        description=project.description,
        components=json.dumps(project.components),
        developer_id=project.developer_id
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
    developer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all projects with optional filters"""
    query = db.query(Project)
    
    if developer_id:
        query = query.filter(Project.developer_id == developer_id)
    
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
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
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
    db: Session = Depends(get_db)
):
    """Update an existing project"""
    project = db.query(Project).filter(Project.id == project_id).first()
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
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}