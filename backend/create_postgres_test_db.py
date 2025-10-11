"""
Create a sample PostgreSQL database for testing the Query Creator.
Run this script to quickly set up test data in PostgreSQL.

Requirements:
- PostgreSQL server running (default: localhost:5432)
- Database 'proto_test' should exist (or will be created)
- User with permissions (default: postgres/postgres)

You can customize connection settings via environment variables:
- POSTGRES_HOST (default: localhost)
- POSTGRES_PORT (default: 5432)
- POSTGRES_USER (default: postgres)
- POSTGRES_PASSWORD (default: postgres)
- POSTGRES_DB (default: proto_test)
"""
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from datetime import datetime, timedelta
import random

# Database connection settings
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', '5432'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'postgres'),
    'database': os.getenv('POSTGRES_DB', 'proto_test')
}

def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (not to specific database)
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database='postgres'  # Connect to default postgres database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (DB_CONFIG['database'],)
        )
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(
                sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier(DB_CONFIG['database'])
                )
            )
            print(f"✓ Database '{DB_CONFIG['database']}' created")
        else:
            print(f"✓ Database '{DB_CONFIG['database']}' already exists")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Error creating database: {e}")
        return False

def create_test_database():
    """Create tables and insert test data"""
    try:
        # Connect to the test database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print(f"\n✓ Connected to PostgreSQL at {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print(f"  Database: {DB_CONFIG['database']}")

        # Drop existing tables (for clean slate)
        print("\nDropping existing tables...")
        cursor.execute('DROP TABLE IF EXISTS tasks CASCADE')
        cursor.execute('DROP TABLE IF EXISTS projects CASCADE')
        cursor.execute('DROP TABLE IF EXISTS users CASCADE')

        # Create users table
        print("Creating users table...")
        cursor.execute('''
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            role VARCHAR(100),
            status VARCHAR(50),
            department VARCHAR(100),
            salary DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Create projects table
        print("Creating projects table...")
        cursor.execute('''
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50),
            budget DECIMAL(12, 2),
            start_date DATE,
            end_date DATE,
            manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL
        )
        ''')

        # Create tasks table
        print("Creating tasks table...")
        cursor.execute('''
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
            assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
            status VARCHAR(50),
            priority VARCHAR(50),
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Insert sample users
        print("Inserting sample users...")
        users_data = [
            ('Alice Johnson', 'alice@example.com', 'Admin', 'Active', 'Engineering', 95000),
            ('Bob Smith', 'bob@example.com', 'Developer', 'Active', 'Engineering', 85000),
            ('Carol White', 'carol@example.com', 'Designer', 'Away', 'Design', 75000),
            ('David Brown', 'david@example.com', 'Manager', 'Active', 'Management', 105000),
            ('Eve Davis', 'eve@example.com', 'Developer', 'Active', 'Engineering', 88000),
            ('Frank Miller', 'frank@example.com', 'QA Engineer', 'Inactive', 'Quality', 70000),
            ('Grace Lee', 'grace@example.com', 'Developer', 'Active', 'Engineering', 90000),
            ('Henry Wilson', 'henry@example.com', 'Designer', 'Active', 'Design', 72000),
            ('Iris Taylor', 'iris@example.com', 'Product Manager', 'Active', 'Product', 110000),
            ('Jack Anderson', 'jack@example.com', 'DevOps', 'Active', 'Engineering', 92000),
        ]

        cursor.executemany(
            'INSERT INTO users (name, email, role, status, department, salary) VALUES (%s, %s, %s, %s, %s, %s)',
            users_data
        )

        # Insert sample projects
        print("Inserting sample projects...")
        projects_data = [
            ('Website Redesign', 'Complete overhaul of company website', 'In Progress', 150000, '2024-01-15', '2024-06-30', 4),
            ('Mobile App', 'Develop native mobile application', 'Planning', 250000, '2024-03-01', '2024-12-31', 9),
            ('API Integration', 'Integrate third-party APIs', 'Completed', 50000, '2023-10-01', '2024-02-28', 1),
            ('Security Audit', 'Comprehensive security review', 'In Progress', 75000, '2024-02-01', '2024-05-31', 4),
            ('Database Migration', 'Migrate to new database system', 'Planning', 120000, '2024-04-01', '2024-08-31', 10),
        ]

        cursor.executemany(
            'INSERT INTO projects (name, description, status, budget, start_date, end_date, manager_id) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            projects_data
        )

        # Insert sample tasks
        print("Inserting sample tasks...")
        tasks_data = [
            ('Design homepage mockup', 'Create high-fidelity mockups for homepage', 1, 3, 'Done', 'High', '2024-02-15'),
            ('Implement user authentication', 'Set up OAuth and JWT authentication', 1, 2, 'In Progress', 'Critical', '2024-03-01'),
            ('Write API documentation', 'Document all API endpoints', 1, 5, 'To Do', 'Medium', '2024-03-15'),
            ('Set up CI/CD pipeline', 'Configure automated deployment', 1, 10, 'In Progress', 'High', '2024-02-28'),
            ('Create mobile wireframes', 'Design wireframes for mobile app', 2, 8, 'In Progress', 'High', '2024-03-10'),
            ('Research payment gateways', 'Evaluate payment integration options', 2, 9, 'To Do', 'Medium', '2024-03-20'),
            ('Fix security vulnerabilities', 'Address reported security issues', 4, 2, 'In Progress', 'Critical', '2024-02-20'),
            ('Performance testing', 'Load test critical endpoints', 4, 6, 'To Do', 'High', '2024-03-01'),
            ('Database schema design', 'Design new database structure', 5, 1, 'In Progress', 'High', '2024-04-15'),
            ('Data migration script', 'Write migration scripts', 5, 2, 'To Do', 'Critical', '2024-05-01'),
        ]

        cursor.executemany(
            'INSERT INTO tasks (title, description, project_id, assigned_to, status, priority, due_date) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            tasks_data
        )

        conn.commit()
        cursor.close()
        conn.close()

        print("\n" + "="*60)
        print("✓ PostgreSQL test database created successfully!")
        print("="*60)
        print(f"\nConnection Details:")
        print(f"  Host: {DB_CONFIG['host']}")
        print(f"  Port: {DB_CONFIG['port']}")
        print(f"  Database: {DB_CONFIG['database']}")
        print(f"  User: {DB_CONFIG['user']}")
        print("\nDatabase contains:")
        print("  - 10 users")
        print("  - 5 projects")
        print("  - 10 tasks")
        print("\nExample queries to try:")
        print("  1. SELECT * FROM users")
        print("  2. SELECT * FROM projects WHERE status = 'In Progress'")
        print("  3. SELECT u.name, t.title, t.status FROM tasks t JOIN users u ON t.assigned_to = u.id")
        print("  4. SELECT department, COUNT(*) as count, AVG(salary) as avg_salary FROM users GROUP BY department")
        print("  5. SELECT p.name as project, COUNT(t.id) as task_count FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id, p.name")
        print("\nTo connect from your app, use these settings in the DB connector:")
        print(f"  - Type: PostgreSQL")
        print(f"  - Host: {DB_CONFIG['host']}")
        print(f"  - Port: {DB_CONFIG['port']}")
        print(f"  - Database: {DB_CONFIG['database']}")
        print(f"  - Username: {DB_CONFIG['user']}")
        print(f"  - Password: {DB_CONFIG['password']}")
        print("="*60)
        
        return True

    except Exception as e:
        print(f"\n✗ Error creating test database: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure PostgreSQL is running")
        print("  2. Check connection settings")
        print("  3. Verify user has appropriate permissions")
        print(f"  4. Try: psql -U {DB_CONFIG['user']} -h {DB_CONFIG['host']} -p {DB_CONFIG['port']}")
        return False

if __name__ == '__main__':
    print("="*60)
    print("PostgreSQL Test Database Setup")
    print("="*60)
    
    # First, ensure database exists
    if create_database_if_not_exists():
        # Then create tables and data
        create_test_database()
    else:
        print("\n✗ Failed to create/connect to database")
        print("\nPlease ensure PostgreSQL is installed and running.")
        print("\nQuick setup with Docker:")
        print("  docker run --name proto-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16")

