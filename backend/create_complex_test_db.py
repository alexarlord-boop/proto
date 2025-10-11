"""
Create a complex SQLite database with extensive relationships for testing the Query Creator.
This database represents an online learning platform with complex interconnections.
"""
import sqlite3
from datetime import datetime, timedelta
import random

def create_complex_database():
    conn = sqlite3.connect('complex_test.db')
    cursor = conn.cursor()

    # Enable foreign keys in SQLite
    cursor.execute('PRAGMA foreign_keys = ON')

    # Drop existing tables (in reverse dependency order)
    tables_to_drop = [
        'course_prerequisites', 'course_instructors', 'enrollment_progress', 
        'lesson_completions', 'assignment_submissions', 'discussion_replies',
        'discussion_posts', 'review_responses', 'course_reviews', 'student_enrollments',
        'lesson_resources', 'lessons', 'course_modules', 'assignments', 
        'courses', 'course_categories', 'instructors', 'students', 'users'
    ]
    for table in tables_to_drop:
        cursor.execute(f'DROP TABLE IF EXISTS {table}')

    # ====== CORE ENTITIES ======
    
    # Users table (base for students and instructors)
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        status TEXT CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active'
    )
    ''')

    # Students table (extends users)
    cursor.execute('''
    CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        enrollment_date DATE NOT NULL,
        grade_level TEXT,
        points_earned INTEGER DEFAULT 0,
        certificates_earned INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # Instructors table (extends users)
    cursor.execute('''
    CREATE TABLE instructors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        hire_date DATE NOT NULL,
        specialization TEXT,
        rating REAL DEFAULT 0.0,
        total_students INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # Course categories (hierarchical - self-referential)
    cursor.execute('''
    CREATE TABLE course_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        parent_category_id INTEGER,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        FOREIGN KEY (parent_category_id) REFERENCES course_categories(id) ON DELETE SET NULL
    )
    ''')

    # Courses
    cursor.execute('''
    CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category_id INTEGER NOT NULL,
        difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
        price REAL DEFAULT 0.0,
        duration_hours INTEGER,
        thumbnail_url TEXT,
        published BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        enrollment_count INTEGER DEFAULT 0,
        average_rating REAL DEFAULT 0.0,
        FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT
    )
    ''')

    # Course prerequisites (many-to-many self-referential)
    cursor.execute('''
    CREATE TABLE course_prerequisites (
        course_id INTEGER NOT NULL,
        prerequisite_course_id INTEGER NOT NULL,
        required BOOLEAN DEFAULT 1,
        PRIMARY KEY (course_id, prerequisite_course_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CHECK (course_id != prerequisite_course_id)
    )
    ''')

    # Course instructors (many-to-many)
    cursor.execute('''
    CREATE TABLE course_instructors (
        course_id INTEGER NOT NULL,
        instructor_id INTEGER NOT NULL,
        role TEXT DEFAULT 'instructor',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (course_id, instructor_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
    )
    ''')

    # Course modules (sections within a course)
    cursor.execute('''
    CREATE TABLE course_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        module_order INTEGER NOT NULL,
        duration_minutes INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
    ''')

    # Lessons (within modules)
    cursor.execute('''
    CREATE TABLE lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        lesson_order INTEGER NOT NULL,
        video_url TEXT,
        duration_minutes INTEGER,
        lesson_type TEXT CHECK(lesson_type IN ('video', 'reading', 'quiz', 'interactive', 'live')),
        is_preview BOOLEAN DEFAULT 0,
        FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
    )
    ''')

    # Lesson resources (files, links attached to lessons)
    cursor.execute('''
    CREATE TABLE lesson_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        resource_type TEXT CHECK(resource_type IN ('pdf', 'video', 'link', 'code', 'document')),
        url TEXT NOT NULL,
        file_size_kb INTEGER,
        download_count INTEGER DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
    ''')

    # Assignments
    cursor.execute('''
    CREATE TABLE assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        max_points INTEGER DEFAULT 100,
        assignment_type TEXT CHECK(assignment_type IN ('quiz', 'project', 'essay', 'code', 'peer_review')),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
    ''')

    # Student enrollments
    cursor.execute('''
    CREATE TABLE student_enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('active', 'completed', 'dropped', 'suspended')) DEFAULT 'active',
        progress_percentage REAL DEFAULT 0.0,
        last_accessed DATETIME,
        completion_date DATETIME,
        certificate_issued BOOLEAN DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
    )
    ''')

    # Enrollment progress (tracks lesson completion)
    cursor.execute('''
    CREATE TABLE enrollment_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollment_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
        time_spent_minutes INTEGER DEFAULT 0,
        FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE(enrollment_id, lesson_id)
    )
    ''')

    # Lesson completions (duplicate tracking for analytics)
    cursor.execute('''
    CREATE TABLE lesson_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        score REAL,
        attempts INTEGER DEFAULT 1,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
    ''')

    # Assignment submissions
    cursor.execute('''
    CREATE TABLE assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        submission_content TEXT,
        file_url TEXT,
        grade REAL,
        graded_by INTEGER,
        graded_at DATETIME,
        feedback TEXT,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES instructors(id) ON DELETE SET NULL,
        UNIQUE(assignment_id, student_id)
    )
    ''')

    # Course reviews
    cursor.execute('''
    CREATE TABLE course_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        helpful_count INTEGER DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(course_id, student_id)
    )
    ''')

    # Review responses (instructors responding to reviews)
    cursor.execute('''
    CREATE TABLE review_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        review_id INTEGER NOT NULL,
        instructor_id INTEGER NOT NULL,
        response_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES course_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
    )
    ''')

    # Discussion posts
    cursor.execute('''
    CREATE TABLE discussion_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        edited_at DATETIME,
        pinned BOOLEAN DEFAULT 0,
        locked BOOLEAN DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # Discussion replies (self-referential - can reply to posts or other replies)
    cursor.execute('''
    CREATE TABLE discussion_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        parent_reply_id INTEGER,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        edited_at DATETIME,
        helpful_count INTEGER DEFAULT 0,
        FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_reply_id) REFERENCES discussion_replies(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # ====== INSERT SAMPLE DATA ======

    # Insert users
    users_data = [
        ('john_doe', 'john@example.com', 'John Doe', 'https://avatar.com/john', 'Passionate learner', 'active'),
        ('jane_smith', 'jane@example.com', 'Jane Smith', 'https://avatar.com/jane', 'Tech enthusiast', 'active'),
        ('prof_wilson', 'wilson@example.com', 'Prof. Robert Wilson', 'https://avatar.com/wilson', 'PhD in Computer Science', 'active'),
        ('dr_chen', 'chen@example.com', 'Dr. Lisa Chen', 'https://avatar.com/chen', 'Data Science Expert', 'active'),
        ('mike_student', 'mike@example.com', 'Mike Johnson', 'https://avatar.com/mike', 'Learning enthusiast', 'active'),
        ('sarah_teacher', 'sarah@example.com', 'Sarah Williams', 'https://avatar.com/sarah', 'Creative educator', 'active'),
        ('alex_learner', 'alex@example.com', 'Alex Brown', 'https://avatar.com/alex', 'Career switcher', 'active'),
        ('prof_davis', 'davis@example.com', 'Prof. James Davis', 'https://avatar.com/davis', 'Veteran instructor', 'active'),
        ('emily_student', 'emily@example.com', 'Emily Taylor', 'https://avatar.com/emily', 'Curious mind', 'active'),
        ('tom_instructor', 'tom@example.com', 'Tom Anderson', 'https://avatar.com/tom', 'Industry professional', 'active'),
    ]
    
    cursor.executemany('''
        INSERT INTO users (username, email, full_name, avatar_url, bio, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', users_data)

    # Insert students (users 1, 2, 5, 7, 9)
    students_data = [
        (1, '2023-01-15', 'Undergraduate', 850, 3),
        (2, '2023-02-20', 'Graduate', 920, 5),
        (5, '2023-03-10', 'Professional', 560, 1),
        (7, '2023-04-05', 'Undergraduate', 430, 2),
        (9, '2023-05-12', 'Graduate', 780, 4),
    ]
    
    cursor.executemany('''
        INSERT INTO students (user_id, enrollment_date, grade_level, points_earned, certificates_earned)
        VALUES (?, ?, ?, ?, ?)
    ''', students_data)

    # Insert instructors (users 3, 4, 6, 8, 10)
    instructors_data = [
        (3, '2020-01-15', 'Computer Science', 4.8, 1250, 1),
        (4, '2019-06-01', 'Data Science', 4.9, 890, 1),
        (6, '2021-03-20', 'Design', 4.7, 650, 1),
        (8, '2018-09-01', 'Business', 4.6, 1500, 1),
        (10, '2022-01-10', 'Programming', 4.5, 420, 0),
    ]
    
    cursor.executemany('''
        INSERT INTO instructors (user_id, hire_date, specialization, rating, total_students, verified)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', instructors_data)

    # Insert course categories (hierarchical)
    categories_data = [
        ('Technology', 'All technology-related courses', None, '💻', 1),
        ('Programming', 'Learn to code', 1, '👨‍💻', 1),
        ('Data Science', 'Data analysis and ML', 1, '📊', 2),
        ('Web Development', 'Build websites', 2, '🌐', 1),
        ('Mobile Development', 'iOS and Android apps', 2, '📱', 2),
        ('Business', 'Business and management', None, '💼', 2),
        ('Marketing', 'Digital marketing courses', 6, '📈', 1),
        ('Design', 'Creative design courses', None, '🎨', 3),
        ('UI/UX Design', 'User interface design', 8, '🖌️', 1),
        ('Graphic Design', 'Visual design', 8, '🎭', 2),
    ]
    
    cursor.executemany('''
        INSERT INTO course_categories (name, description, parent_category_id, icon, display_order)
        VALUES (?, ?, ?, ?, ?)
    ''', categories_data)

    # Insert courses
    courses_data = [
        ('Python Programming Fundamentals', 'Learn Python from scratch', 2, 'beginner', 49.99, 40, 'https://img.com/python', 1, 145, 4.6),
        ('Advanced JavaScript', 'Master modern JavaScript', 4, 'advanced', 79.99, 60, 'https://img.com/js', 1, 89, 4.7),
        ('Data Science with Python', 'Complete data science bootcamp', 3, 'intermediate', 99.99, 80, 'https://img.com/ds', 1, 234, 4.8),
        ('React & Redux Mastery', 'Build modern web apps', 4, 'intermediate', 69.99, 50, 'https://img.com/react', 1, 176, 4.5),
        ('Machine Learning A-Z', 'ML from basics to advanced', 3, 'advanced', 129.99, 100, 'https://img.com/ml', 1, 312, 4.9),
        ('iOS Development Swift', 'Build iOS apps', 5, 'beginner', 89.99, 70, 'https://img.com/ios', 1, 98, 4.4),
        ('Digital Marketing Strategy', 'Modern marketing techniques', 7, 'beginner', 59.99, 30, 'https://img.com/marketing', 1, 156, 4.3),
        ('UI/UX Design Principles', 'Design beautiful interfaces', 9, 'beginner', 49.99, 35, 'https://img.com/uiux', 1, 203, 4.6),
        ('Android Kotlin Development', 'Modern Android apps', 5, 'intermediate', 89.99, 65, 'https://img.com/android', 1, 87, 4.5),
        ('Deep Learning Specialization', 'Neural networks and DL', 3, 'expert', 149.99, 120, 'https://img.com/dl', 1, 145, 4.9),
    ]
    
    cursor.executemany('''
        INSERT INTO courses (title, description, category_id, difficulty_level, price, duration_hours, 
                           thumbnail_url, published, enrollment_count, average_rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', courses_data)

    # Insert course prerequisites (create dependencies)
    prerequisites_data = [
        (2, 1, 1),  # Advanced JS requires Python Fundamentals
        (3, 1, 1),  # Data Science requires Python Fundamentals
        (4, 2, 1),  # React requires Advanced JS
        (5, 3, 1),  # ML requires Data Science
        (10, 5, 1), # Deep Learning requires ML
        (9, 1, 0),  # Android recommends Python (not required)
    ]
    
    cursor.executemany('''
        INSERT INTO course_prerequisites (course_id, prerequisite_course_id, required)
        VALUES (?, ?, ?)
    ''', prerequisites_data)

    # Insert course instructors (many-to-many)
    course_instructors_data = [
        (1, 1, 'lead_instructor'),
        (1, 5, 'assistant'),
        (2, 1, 'lead_instructor'),
        (3, 2, 'lead_instructor'),
        (4, 1, 'lead_instructor'),
        (5, 2, 'lead_instructor'),
        (6, 1, 'lead_instructor'),
        (6, 5, 'assistant'),
        (7, 4, 'lead_instructor'),
        (8, 3, 'lead_instructor'),
        (9, 1, 'lead_instructor'),
        (10, 2, 'lead_instructor'),
    ]
    
    cursor.executemany('''
        INSERT INTO course_instructors (course_id, instructor_id, role)
        VALUES (?, ?, ?)
    ''', course_instructors_data)

    # Insert course modules
    modules_data = [
        (1, 'Introduction to Python', 'Getting started with Python', 1, 120),
        (1, 'Python Data Structures', 'Lists, tuples, dictionaries', 2, 180),
        (1, 'Functions and OOP', 'Advanced Python concepts', 3, 240),
        (2, 'Modern JavaScript Syntax', 'ES6+ features', 1, 150),
        (2, 'Async Programming', 'Promises and async/await', 2, 200),
        (3, 'Data Analysis with Pandas', 'Working with data', 1, 300),
        (3, 'Machine Learning Basics', 'Introduction to ML', 2, 400),
        (4, 'React Fundamentals', 'Components and props', 1, 180),
        (4, 'State Management', 'Redux and context', 2, 220),
    ]
    
    cursor.executemany('''
        INSERT INTO course_modules (course_id, title, description, module_order, duration_minutes)
        VALUES (?, ?, ?, ?, ?)
    ''', modules_data)

    # Insert lessons
    lessons_data = [
        (1, 'Installing Python', 'Setup your environment', 1, 'https://video.com/1', 15, 'video', 1),
        (1, 'Your First Program', 'Hello World in Python', 2, 'https://video.com/2', 20, 'video', 1),
        (1, 'Variables and Types', 'Understanding data types', 3, 'https://video.com/3', 25, 'video', 0),
        (2, 'Lists in Python', 'Working with lists', 1, 'https://video.com/4', 30, 'video', 0),
        (2, 'Dictionaries', 'Key-value pairs', 2, 'https://video.com/5', 35, 'video', 0),
        (3, 'Functions Basics', 'Creating functions', 1, 'https://video.com/6', 28, 'video', 0),
        (3, 'Classes and Objects', 'Object-oriented programming', 2, 'https://video.com/7', 45, 'video', 0),
        (4, 'Let and Const', 'Modern variable declarations', 1, 'https://video.com/8', 20, 'video', 1),
        (5, 'Promises', 'Handling async operations', 1, 'https://video.com/9', 40, 'video', 0),
    ]
    
    cursor.executemany('''
        INSERT INTO lessons (module_id, title, content, lesson_order, video_url, duration_minutes, lesson_type, is_preview)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', lessons_data)

    # Insert lesson resources
    resources_data = [
        (1, 'Python Installation Guide', 'pdf', 'https://resources.com/python-install.pdf', 2048, 156),
        (2, 'Sample Code', 'code', 'https://resources.com/hello.py', 5, 89),
        (3, 'Variables Cheat Sheet', 'pdf', 'https://resources.com/variables.pdf', 1024, 234),
        (4, 'Lists Tutorial', 'link', 'https://docs.python.org/lists', 0, 45),
        (7, 'OOP Examples', 'code', 'https://resources.com/oop-examples.zip', 5120, 67),
    ]
    
    cursor.executemany('''
        INSERT INTO lesson_resources (lesson_id, title, resource_type, url, file_size_kb, download_count)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', resources_data)

    # Insert assignments
    assignments_data = [
        (1, 'Python Basics Quiz', 'Test your Python knowledge', '2024-12-31 23:59:59', 100, 'quiz'),
        (1, 'Build a Calculator', 'Create a simple calculator', '2024-12-31 23:59:59', 150, 'project'),
        (2, 'JavaScript Challenge', 'Solve coding problems', '2024-12-31 23:59:59', 100, 'code'),
        (3, 'Data Analysis Project', 'Analyze real-world dataset', '2024-12-31 23:59:59', 200, 'project'),
        (4, 'React App Project', 'Build a React application', '2024-12-31 23:59:59', 200, 'project'),
    ]
    
    cursor.executemany('''
        INSERT INTO assignments (course_id, title, description, due_date, max_points, assignment_type)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', assignments_data)

    # Insert student enrollments
    enrollments_data = [
        (1, 1, 'active', 65.5),
        (1, 3, 'completed', 100.0),
        (2, 1, 'active', 45.0),
        (2, 2, 'active', 30.0),
        (2, 4, 'completed', 100.0),
        (3, 1, 'active', 15.0),
        (3, 7, 'active', 55.0),
        (4, 8, 'active', 70.0),
        (5, 3, 'active', 80.0),
        (5, 5, 'active', 25.0),
    ]
    
    cursor.executemany('''
        INSERT INTO student_enrollments (student_id, course_id, status, progress_percentage)
        VALUES (?, ?, ?, ?)
    ''', enrollments_data)

    # Insert assignment submissions
    submissions_data = [
        (1, 1, 'Great work on basics!', 'https://submissions.com/1', 95.0, 1, '2024-02-15 14:30:00', 'Excellent understanding'),
        (2, 1, 'Calculator working perfectly', 'https://submissions.com/2', 145.0, 1, '2024-02-20 16:00:00', 'Well structured code'),
        (3, 2, 'Good problem solving', 'https://submissions.com/3', 88.0, 1, '2024-03-01 10:00:00', 'Could improve efficiency'),
        (4, 5, 'Comprehensive analysis', 'https://submissions.com/4', 190.0, 2, '2024-03-10 18:00:00', 'Outstanding work'),
    ]
    
    cursor.executemany('''
        INSERT INTO assignment_submissions (assignment_id, student_id, submission_content, file_url, 
                                           grade, graded_by, graded_at, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', submissions_data)

    # Insert course reviews
    reviews_data = [
        (1, 1, 5, 'Amazing course! Learned so much.', 45),
        (1, 2, 4, 'Very comprehensive, but could use more examples.', 23),
        (2, 2, 5, 'Best JavaScript course I have taken!', 67),
        (3, 5, 5, 'The instructor is fantastic.', 89),
        (4, 2, 4, 'Good course, React finally makes sense.', 34),
    ]
    
    cursor.executemany('''
        INSERT INTO course_reviews (course_id, student_id, rating, review_text, helpful_count)
        VALUES (?, ?, ?, ?, ?)
    ''', reviews_data)

    # Insert review responses
    responses_data = [
        (2, 1, 'Thank you for the feedback! We are adding more examples in the next update.'),
        (4, 2, 'Glad you enjoyed it! Keep learning!'),
    ]
    
    cursor.executemany('''
        INSERT INTO review_responses (review_id, instructor_id, response_text)
        VALUES (?, ?, ?)
    ''', responses_data)

    # Insert discussion posts
    posts_data = [
        (1, 1, 'Question about list comprehensions', 'Can someone explain list comprehensions?', 0, 0, 45),
        (1, 2, 'Great course!', 'Really enjoying this course so far!', 0, 0, 23),
        (3, 5, 'Pandas DataFrame help', 'Having trouble with DataFrame operations', 0, 0, 67),
        (2, 2, 'Async/await confusion', 'When should I use async/await vs promises?', 0, 0, 89),
    ]
    
    cursor.executemany('''
        INSERT INTO discussion_posts (course_id, author_id, title, content, pinned, locked, view_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', posts_data)

    # Insert discussion replies (including nested replies)
    replies_data = [
        (1, None, 3, 'List comprehensions are a concise way to create lists...', 12),
        (1, 1, 1, 'Thanks! That makes sense now.', 5),
        (2, None, 3, 'Glad to hear it! Keep up the good work.', 8),
        (3, None, 4, 'Try using .groupby() method. Here is an example...', 23),
        (4, None, 3, 'Use async/await when you want cleaner syntax...', 34),
        (4, 5, 2, 'Perfect explanation, thank you!', 15),
    ]
    
    cursor.executemany('''
        INSERT INTO discussion_replies (post_id, parent_reply_id, author_id, content, helpful_count)
        VALUES (?, ?, ?, ?, ?)
    ''', replies_data)

    conn.commit()
    conn.close()

    print("✓ Complex test database created successfully: complex_test.db")
    print("\n" + "="*60)
    print("DATABASE STRUCTURE OVERVIEW")
    print("="*60)
    print("\n📊 Tables Created: 19")
    print("\n┌─ Core Entities:")
    print("│  ├─ users (10 records)")
    print("│  ├─ students (5 records) → users")
    print("│  └─ instructors (5 records) → users")
    print("\n├─ Course Structure:")
    print("│  ├─ course_categories (10 records, hierarchical)")
    print("│  ├─ courses (10 records)")
    print("│  ├─ course_instructors (12 records, many-to-many)")
    print("│  ├─ course_prerequisites (6 records, self-referential)")
    print("│  ├─ course_modules (9 records)")
    print("│  ├─ lessons (9 records)")
    print("│  └─ lesson_resources (5 records)")
    print("\n├─ Student Activities:")
    print("│  ├─ student_enrollments (10 records)")
    print("│  ├─ assignments (5 records)")
    print("│  └─ assignment_submissions (4 records)")
    print("\n├─ Reviews & Feedback:")
    print("│  ├─ course_reviews (5 records)")
    print("│  └─ review_responses (2 records)")
    print("\n└─ Discussions:")
    print("   ├─ discussion_posts (4 records)")
    print("   └─ discussion_replies (6 records, self-referential)")
    print("\n" + "="*60)
    print("RELATIONSHIP TYPES")
    print("="*60)
    print("\n✓ One-to-Many: 12 relationships")
    print("✓ Many-to-Many: 2 relationships (via junction tables)")
    print("✓ Self-Referential: 2 relationships (categories, replies)")
    print("✓ Hierarchical: 1 relationship (course prerequisites)")
    print("\n" + "="*60)
    print("CONNECTION SETTINGS FOR APP")
    print("="*60)
    print("\nType: SQLite")
    print("Database Path: ./complex_test.db")
    print("\n" + "="*60)
    print("SAMPLE QUERIES TO TEST")
    print("="*60)
    print("""
1. All courses with their instructors:
   SELECT c.title, u.full_name as instructor, ci.role
   FROM courses c
   JOIN course_instructors ci ON c.id = ci.course_id
   JOIN instructors i ON ci.instructor_id = i.id
   JOIN users u ON i.user_id = u.id

2. Student enrollment details:
   SELECT u.full_name, c.title, se.progress_percentage, se.status
   FROM student_enrollments se
   JOIN students s ON se.student_id = s.id
   JOIN users u ON s.user_id = u.id
   JOIN courses c ON se.course_id = c.id

3. Course prerequisites chain:
   SELECT c1.title as course, c2.title as prerequisite
   FROM course_prerequisites cp
   JOIN courses c1 ON cp.course_id = c1.id
   JOIN courses c2 ON cp.prerequisite_course_id = c2.id

4. Course category hierarchy:
   SELECT c1.name as category, c2.name as parent_category
   FROM course_categories c1
   LEFT JOIN course_categories c2 ON c1.parent_category_id = c2.id

5. Discussion threads with replies:
   SELECT dp.title, u1.full_name as author, 
          COUNT(dr.id) as reply_count
   FROM discussion_posts dp
   JOIN users u1 ON dp.author_id = u1.id
   LEFT JOIN discussion_replies dr ON dp.id = dr.post_id
   GROUP BY dp.id, dp.title, u1.full_name

6. Assignment completion rates:
   SELECT a.title, COUNT(asub.id) as submissions,
          AVG(asub.grade) as avg_grade
   FROM assignments a
   LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
   GROUP BY a.id, a.title
""")
    print("="*60)

if __name__ == '__main__':
    create_complex_database()

