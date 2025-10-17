"""
Database configuration and models for storing SQL queries and DB connectors.
Uses SQLite for storing metadata about queries and connections.
"""
from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

# SQLite database for storing queries and connectors metadata
SQLALCHEMY_DATABASE_URL = "sqlite:///./proto_queries.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    """Stores user accounts with authentication"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="owner")
    queries = relationship("SQLQuery", back_populates="owner")
    connectors = relationship("DBConnector", back_populates="owner")


class DBConnector(Base):
    """Stores database connection configurations"""
    __tablename__ = "db_connectors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    db_type = Column(String)  # postgres, mysql, sqlite
    host = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    database = Column(String)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)  # In production, encrypt this!
    connection_string = Column(String, nullable=True)  # For custom connections
    is_active = Column(Boolean, default=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="connectors")


class SQLQuery(Base):
    """Stores SQL queries with metadata"""
    __tablename__ = "sql_queries"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    sql_query = Column(Text)
    connector_id = Column(String, index=True)  # References DBConnector.id
    project_id = Column(String, index=True)  # For multi-project support
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_valid = Column(Boolean, default=True)
    validation_error = Column(Text, nullable=True)
    last_executed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="queries")


class Project(Base):
    """Stores canvas projects with components and their configurations"""
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    components = Column(Text)  # JSON array of ComponentInstance objects
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    visibility = Column(String, default="private")  # private, public, shared
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="projects")
    api_keys = relationship("APIKey", back_populates="project", cascade="all, delete-orphan")
    shared_with = relationship("ProjectShare", back_populates="project", cascade="all, delete-orphan")


class APIKey(Base):
    """API keys for public project access"""
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)  # The actual API key
    name = Column(String)  # Human-readable name
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="api_keys")


class ProjectShare(Base):
    """Shared projects - which users can access which projects"""
    __tablename__ = "project_shares"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    permission = Column(String, default="view")  # view, edit
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="shared_with")


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

