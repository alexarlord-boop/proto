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
        Validate SQL query using dry-run execution (LIMIT 0 for SELECT queries).
        This validates syntax, table existence, and column validity without fetching data.
        Returns validation result with success status and error message if any.
        """
        try:
            engine = self.get_engine(connector['id'], connector)
            
            with engine.connect() as conn:
                query_lower = sql_query.strip().lower()
                
                if query_lower.startswith('select'):
                    # Dry-run validation: Execute query with LIMIT 0
                    # This validates syntax, tables, and columns without fetching data
                    # Wrap in subquery to handle queries that already have LIMIT/ORDER BY
                    dry_run_query = f"SELECT * FROM ({sql_query.rstrip(';')}) AS validation_subquery LIMIT 0"
                    
                    try:
                        conn.execute(text(dry_run_query))
                    except SQLAlchemyError:
                        # If subquery approach fails (e.g., for simple queries), try direct LIMIT 0
                        # Remove existing LIMIT clause if present and add LIMIT 0
                        if 'limit' in query_lower:
                            # Replace existing limit with LIMIT 0
                            import re
                            query_no_limit = re.sub(r'\s+limit\s+\d+\s*', ' ', sql_query, flags=re.IGNORECASE)
                            dry_run_query = f"{query_no_limit.rstrip(';')} LIMIT 0"
                        else:
                            dry_run_query = f"{sql_query.rstrip(';')} LIMIT 0"
                        
                        conn.execute(text(dry_run_query))
                    
                    return {
                        "valid": True,
                        "message": "Query is valid (dry-run successful)",
                        "query_type": "SELECT"
                    }
                    
                elif query_lower.startswith(('insert', 'update', 'delete')):
                    # For DML queries, use transaction rollback for validation
                    trans = conn.begin()
                    try:
                        # Execute the query in a transaction
                        conn.execute(text(sql_query))
                        # Rollback to not commit changes
                        trans.rollback()
                        
                        query_type = "DML"
                        if query_lower.startswith('insert'):
                            query_type = "INSERT"
                        elif query_lower.startswith('update'):
                            query_type = "UPDATE"
                        elif query_lower.startswith('delete'):
                            query_type = "DELETE"
                        
                        return {
                            "valid": True,
                            "message": "Query syntax is valid (dry-run successful)",
                            "query_type": query_type,
                            "warning": "This query will modify data. Use with caution."
                        }
                    except Exception:
                        trans.rollback()
                        raise
                        
                else:
                    # For DDL or other queries, just try to parse
                    # We can't easily dry-run DDL statements
                    stmt = text(sql_query)
                    compiled = stmt.compile(engine)
                    
                    return {
                        "valid": True,
                        "message": "Query syntax appears valid (limited validation for DDL)",
                        "query_type": "DDL/Other",
                        "warning": "DDL queries cannot be fully validated without execution."
                    }
                    
        except SQLAlchemyError as e:
            # Extract just the relevant error message
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            # Clean up the error message (remove extra details)
            if '\n' in error_msg:
                error_msg = error_msg.split('\n')[0]
            
            return {
                "valid": False,
                "message": error_msg,
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
        limit: Optional[int] = 1000,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Execute SQL query and return results.
        For SELECT queries, returns data in tabular format.
        For DML queries, returns affected rows count.
        
        Args:
            sql_query: SQL query to execute
            connector: Database connector configuration
            limit: Maximum rows to return for SELECT queries
            dry_run: If True, DML queries will be rolled back (preview mode)
        """
        try:
            engine = self.get_engine(connector['id'], connector)
            
            with engine.connect() as conn:
                query_lower = sql_query.strip().lower()
                
                # SELECT queries
                if query_lower.startswith('select'):
                    # Add LIMIT to SELECT queries if not present
                    if 'limit' not in query_lower:
                        sql_query = f"{sql_query.rstrip(';')} LIMIT {limit}"
                    
                    result = conn.execute(text(sql_query))
                    
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
                        "query_type": "SELECT",
                        "dry_run": False  # SELECT queries don't modify data
                    }
                
                # DML queries (INSERT, UPDATE, DELETE)
                elif query_lower.startswith(('insert', 'update', 'delete')):
                    trans = conn.begin()
                    
                    try:
                        result = conn.execute(text(sql_query))
                        affected_rows = result.rowcount
                        
                        query_type = "DML"
                        if query_lower.startswith('insert'):
                            query_type = "INSERT"
                        elif query_lower.startswith('update'):
                            query_type = "UPDATE"
                        elif query_lower.startswith('delete'):
                            query_type = "DELETE"
                        
                        if dry_run:
                            # Rollback for dry-run mode
                            trans.rollback()
                            return {
                                "success": True,
                                "message": f"Dry-run successful: {affected_rows} row(s) would be affected",
                                "affected_rows": affected_rows,
                                "query_type": query_type,
                                "dry_run": True,
                                "warning": "Changes were NOT committed (dry-run mode)"
                            }
                        else:
                            # Commit for real execution
                            trans.commit()
                            return {
                                "success": True,
                                "message": f"Query executed successfully: {affected_rows} row(s) affected",
                                "affected_rows": affected_rows,
                                "query_type": query_type,
                                "dry_run": False
                            }
                    except Exception:
                        trans.rollback()
                        raise
                
                # DDL or other queries
                else:
                    if dry_run:
                        return {
                            "success": False,
                            "message": "Dry-run mode is not supported for DDL queries",
                            "query_type": "DDL",
                            "dry_run": True
                        }
                    
                    result = conn.execute(text(sql_query))
                    conn.commit()
                    
                    return {
                        "success": True,
                        "message": "Query executed successfully",
                        "query_type": "DDL/Other",
                        "dry_run": False
                    }
                    
        except SQLAlchemyError as e:
            logger.error(f"Query execution error: {e}")
            # Extract just the relevant error message
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if '\n' in error_msg:
                error_msg = error_msg.split('\n')[0]
            
            return {
                "success": False,
                "error": error_msg,
                "message": f"Failed to execute query: {error_msg}"
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
    
    def generate_default_queries(self, connector: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate default queries for all tables in the database schema.
        Creates basic SELECT * queries for each table.
        """
        try:
            # Get schema first
            schema_result = self.get_schema(connector)
            if not schema_result.get('success'):
                return schema_result
            
            tables = schema_result.get('tables', [])
            default_queries = []
            
            for table in tables:
                table_name = table['name']
                # Generate basic SELECT query
                default_queries.append({
                    "table_name": table_name,
                    "query_name": f"Select all from {table_name}",
                    "description": f"Get all records from {table_name} table",
                    "sql_query": f"SELECT * FROM {table_name}",
                    "query_type": "SELECT"
                })
            
            return {
                "success": True,
                "connector_id": connector['id'],
                "queries": default_queries,
                "query_count": len(default_queries)
            }
            
        except Exception as e:
            logger.error(f"Error generating default queries: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to generate default queries: {str(e)}"
            }


# Singleton instance
db_manager = DatabaseManager()

