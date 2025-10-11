"""
Create a sample SQLite database for testing the Query Creator.
Run this script to quickly set up test data.
"""
import sqlite3
from datetime import datetime, timedelta
import random

def create_test_database():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT,
        status TEXT,
        department TEXT,
        salary REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create projects table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT,
        budget REAL,
        start_date DATE,
        end_date DATE,
        manager_id INTEGER,
        FOREIGN KEY (manager_id) REFERENCES users(id)
    )
    ''')

    # Create tasks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        project_id INTEGER,
        assigned_to INTEGER,
        status TEXT,
        priority TEXT,
        due_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
    ''')

    # Clear existing data
    cursor.execute('DELETE FROM tasks')
    cursor.execute('DELETE FROM projects')
    cursor.execute('DELETE FROM users')

    # Insert sample users
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
        'INSERT INTO users (name, email, role, status, department, salary) VALUES (?, ?, ?, ?, ?, ?)',
        users_data
    )

    # Insert sample projects
    projects_data = [
        ('Website Redesign', 'Complete overhaul of company website', 'In Progress', 150000, '2024-01-15', '2024-06-30', 4),
        ('Mobile App', 'Develop native mobile application', 'Planning', 250000, '2024-03-01', '2024-12-31', 9),
        ('API Integration', 'Integrate third-party APIs', 'Completed', 50000, '2023-10-01', '2024-02-28', 1),
        ('Security Audit', 'Comprehensive security review', 'In Progress', 75000, '2024-02-01', '2024-05-31', 4),
        ('Database Migration', 'Migrate to new database system', 'Planning', 120000, '2024-04-01', '2024-08-31', 10),
    ]

    cursor.executemany(
        'INSERT INTO projects (name, description, status, budget, start_date, end_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        projects_data
    )

    # Insert sample tasks
    statuses = ['To Do', 'In Progress', 'Review', 'Done', 'Blocked']
    priorities = ['Low', 'Medium', 'High', 'Critical']
    
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
        'INSERT INTO tasks (title, description, project_id, assigned_to, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        tasks_data
    )

    conn.commit()
    conn.close()

    print("✓ Test database created successfully: test.db")
    print("\nDatabase contains:")
    print("  - 10 users")
    print("  - 5 projects")
    print("  - 10 tasks")
    print("\nExample queries to try:")
    print("  1. SELECT * FROM users")
    print("  2. SELECT * FROM projects WHERE status = 'In Progress'")
    print("  3. SELECT u.name, t.title, t.status FROM tasks t JOIN users u ON t.assigned_to = u.id")
    print("  4. SELECT department, COUNT(*) as count, AVG(salary) as avg_salary FROM users GROUP BY department")
    print("  5. SELECT p.name as project, COUNT(t.id) as task_count FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id")

if __name__ == '__main__':
    create_test_database()

