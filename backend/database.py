"""
Database configuration and models for storing SQL queries and DB connectors.
Uses SQLite for storing metadata about queries and connections.
"""
from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

# SQLite database for storing queries and connectors metadata
SQLALCHEMY_DATABASE_URL = "sqlite:///./proto_queries.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class DBConnector(Base):
    """Stores database connection configurations"""
    __tablename__ = "db_connectors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    db_type = Column(String)  # postgres, mysql, sqlite
    host = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    database = Column(String)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)  # In production, encrypt this!
    connection_string = Column(String, nullable=True)  # For custom connections
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SQLQuery(Base):
    """Stores SQL queries with metadata"""
    __tablename__ = "sql_queries"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    sql_query = Column(Text)
    connector_id = Column(String, index=True)  # References DBConnector.id
    project_id = Column(String, index=True)  # For multi-project support
    developer_id = Column(String, index=True)  # User who created it
    is_valid = Column(Boolean, default=True)
    validation_error = Column(Text, nullable=True)
    last_executed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Project(Base):
    """Stores canvas projects with components and their configurations"""
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    components = Column(Text)  # JSON array of ComponentInstance objects
    developer_id = Column(String, index=True)  # User who created it
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    """Dependency for FastAPI to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

