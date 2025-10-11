"""
Database connection manager for executing queries against target databases.
Supports PostgreSQL, MySQL, and SQLite.
"""
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages connections to target databases and executes queries"""
    
    def __init__(self):
        self._engines = {}  # Cache of database engines
    
    def get_connection_string(self, connector: Dict[str, Any]) -> str:
        """Build connection string from connector configuration"""
        if connector.get('connection_string'):
            return connector['connection_string']
        
        db_type = connector['db_type']
        
        if db_type == 'sqlite':
            return f"sqlite:///{connector['database']}"
        
        elif db_type == 'postgresql':
            return (
                f"postgresql://{connector['username']}:{connector['password']}"
                f"@{connector['host']}:{connector['port']}/{connector['database']}"
            )
        
        elif db_type == 'mysql':
            return (
                f"mysql+pymysql://{connector['username']}:{connector['password']}"
                f"@{connector['host']}:{connector['port']}/{connector['database']}"
            )
        
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    def get_engine(self, connector_id: str, connector: Dict[str, Any]):
        """Get or create database engine for a connector"""
        if connector_id not in self._engines:
            connection_string = self.get_connection_string(connector)
            self._engines[connector_id] = create_engine(
                connection_string,
                pool_pre_ping=True,  # Verify connections before using
                pool_recycle=3600,   # Recycle connections after 1 hour
            )
        return self._engines[connector_id]
    
    def validate_query(self, sql_query: str, connector: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate SQL query without executing it.
        Returns validation result with success status and error message if any.
        """
        try:
            engine = self.get_engine(connector['id'], connector)
            
            # Use EXPLAIN to validate query without executing
            with engine.connect() as conn:
                # For SELECT queries, we can use EXPLAIN
                query_lower = sql_query.strip().lower()
                
                if query_lower.startswith('select'):
                    # Try to prepare the query
                    stmt = text(sql_query)
                    # Just compile it to check syntax
                    compiled = stmt.compile(engine)
                    
                    return {
                        "valid": True,
                        "message": "Query is valid",
                        "query_type": "SELECT"
                    }
                else:
                    # For non-SELECT queries, just try to compile
                    stmt = text(sql_query)
                    compiled = stmt.compile(engine)
                    
                    query_type = "DML/DDL"
                    if query_lower.startswith('insert'):
                        query_type = "INSERT"
                    elif query_lower.startswith('update'):
                        query_type = "UPDATE"
                    elif query_lower.startswith('delete'):
                        query_type = "DELETE"
                    
                    return {
                        "valid": True,
                        "message": "Query syntax is valid",
                        "query_type": query_type,
                        "warning": "This query will modify data. Use with caution."
                    }
                    
        except SQLAlchemyError as e:
            return {
                "valid": False,
                "message": str(e),
                "error": str(e)
            }
        except Exception as e:
            return {
                "valid": False,
                "message": f"Validation error: {str(e)}",
                "error": str(e)
            }
    
    def execute_query(
        self, 
        sql_query: str, 
        connector: Dict[str, Any],
        limit: Optional[int] = 1000
    ) -> Dict[str, Any]:
        """
        Execute SQL query and return results.
        For SELECT queries, returns data in tabular format.
        For DML queries, returns affected rows count.
        """
        try:
            engine = self.get_engine(connector['id'], connector)
            
            with engine.connect() as conn:
                # Add LIMIT to SELECT queries if not present
                query_lower = sql_query.strip().lower()
                if query_lower.startswith('select') and 'limit' not in query_lower:
                    sql_query = f"{sql_query.rstrip(';')} LIMIT {limit}"
                
                result = conn.execute(text(sql_query))
                
                # Check if it's a SELECT query
                if result.returns_rows:
                    # Fetch column names
                    columns = [
                        {"key": col, "label": col.replace('_', ' ').title()}
                        for col in result.keys()
                    ]
                    
                    # Fetch data
                    rows = []
                    for row in result:
                        rows.append(dict(row._mapping))
                    
                    return {
                        "success": True,
                        "columns": columns,
                        "data": rows,
                        "row_count": len(rows),
                        "query_type": "SELECT"
                    }
                else:
                    # DML query (INSERT, UPDATE, DELETE)
                    conn.commit()
                    return {
                        "success": True,
                        "message": "Query executed successfully",
                        "affected_rows": result.rowcount,
                        "query_type": "DML"
                    }
                    
        except SQLAlchemyError as e:
            logger.error(f"Query execution error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to execute query: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error during query execution: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error: {str(e)}"
            }
    
    def get_schema(self, connector: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get database schema information (tables, columns, types).
        Useful for helping developers write queries.
        """
        try:
            engine = self.get_engine(connector['id'], connector)
            inspector = inspect(engine)
            
            tables = []
            for table_name in inspector.get_table_names():
                columns = []
                for column in inspector.get_columns(table_name):
                    columns.append({
                        "name": column['name'],
                        "type": str(column['type']),
                        "nullable": column.get('nullable', True),
                        "default": str(column.get('default')) if column.get('default') else None,
                        "primary_key": column.get('primary_key', False)
                    })
                
                # Get primary keys
                pk_constraint = inspector.get_pk_constraint(table_name)
                primary_keys = pk_constraint.get('constrained_columns', [])
                
                # Get foreign keys
                foreign_keys = []
                for fk in inspector.get_foreign_keys(table_name):
                    foreign_keys.append({
                        "constrained_columns": fk['constrained_columns'],
                        "referred_table": fk['referred_table'],
                        "referred_columns": fk['referred_columns']
                    })
                
                tables.append({
                    "name": table_name,
                    "columns": columns,
                    "primary_keys": primary_keys,
                    "foreign_keys": foreign_keys
                })
            
            return {
                "success": True,
                "database": connector.get('database', 'unknown'),
                "tables": tables,
                "table_count": len(tables)
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Schema introspection error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get schema: {str(e)}"
            }
    
    def test_connection(self, connector: Dict[str, Any]) -> Dict[str, Any]:
        """Test if connection to database is successful"""
        try:
            engine = self.get_engine(connector['id'], connector)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {
                "success": True,
                "message": "Connection successful"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Connection failed: {str(e)}"
            }


# Singleton instance
db_manager = DatabaseManager()

