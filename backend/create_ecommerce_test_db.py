"""
Create a sample E-commerce SQLite database for testing the Query Creator.
This provides an alternative schema to test.db with different tables and relationships.

Schema: E-commerce domain
- customers (buyer information)
- categories (product categories)
- products (items for sale)
- orders (customer orders)
- order_items (products in each order)
"""
import sqlite3
from datetime import datetime, timedelta
import random

def create_ecommerce_database():
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()

    print("Creating E-commerce test database...")

    # Drop existing tables
    cursor.execute('DROP TABLE IF EXISTS order_items')
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('DROP TABLE IF EXISTS categories')
    cursor.execute('DROP TABLE IF EXISTS customers')

    # Create customers table
    print("  Creating customers table...")
    cursor.execute('''
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'USA',
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_orders INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0.0
    )
    ''')

    # Create categories table
    print("  Creating categories table...")
    cursor.execute('''
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
    )
    ''')

    # Create products table
    print("  Creating products table...")
    cursor.execute('''
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        sku TEXT UNIQUE,
        category_id INTEGER,
        price REAL NOT NULL,
        cost REAL,
        stock_quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        is_active INTEGER DEFAULT 1,
        weight_kg REAL,
        manufacturer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    ''')

    # Create orders table
    print("  Creating orders table...")
    cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Pending',
        subtotal REAL NOT NULL,
        tax REAL DEFAULT 0.0,
        shipping REAL DEFAULT 0.0,
        total REAL NOT NULL,
        payment_method TEXT,
        shipping_address TEXT,
        tracking_number TEXT,
        notes TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    ''')

    # Create order_items table
    print("  Creating order_items table...")
    cursor.execute('''
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0.0,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    ''')

    # Insert sample customers
    print("  Inserting sample customers...")
    customers_data = [
        ('John', 'Smith', 'john.smith@email.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', 'USA', '2023-01-15 10:30:00', 5, 1250.75),
        ('Emma', 'Johnson', 'emma.j@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', '2023-02-20 14:15:00', 8, 2340.50),
        ('Michael', 'Williams', 'mike.w@email.com', '555-0103', '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA', '2023-03-10 09:00:00', 3, 890.25),
        ('Sophia', 'Brown', 'sophia.b@email.com', '555-0104', '321 Elm St', 'Houston', 'TX', '77001', 'USA', '2023-03-25 16:45:00', 12, 3200.00),
        ('William', 'Jones', 'will.jones@email.com', '555-0105', '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'USA', '2023-04-05 11:20:00', 6, 1560.90),
        ('Olivia', 'Garcia', 'olivia.g@email.com', '555-0106', '987 Cedar Ln', 'Philadelphia', 'PA', '19101', 'USA', '2023-04-18 13:30:00', 4, 980.40),
        ('James', 'Miller', 'james.m@email.com', '555-0107', '147 Birch Ct', 'San Antonio', 'TX', '78201', 'USA', '2023-05-02 10:00:00', 2, 450.00),
        ('Ava', 'Davis', 'ava.davis@email.com', '555-0108', '258 Spruce Way', 'San Diego', 'CA', '92101', 'USA', '2023-05-15 15:45:00', 7, 1890.75),
        ('Alexander', 'Rodriguez', 'alex.r@email.com', '555-0109', '369 Willow Blvd', 'Dallas', 'TX', '75201', 'USA', '2023-06-01 09:30:00', 9, 2750.60),
        ('Isabella', 'Martinez', 'isabella.m@email.com', '555-0110', '741 Ash Pl', 'San Jose', 'CA', '95101', 'USA', '2023-06-20 14:00:00', 5, 1340.85),
    ]

    cursor.executemany(
        'INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code, country, registration_date, total_orders, total_spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        customers_data
    )

    # Insert sample categories
    print("  Inserting sample categories...")
    categories_data = [
        ('Electronics', 'Electronic devices and accessories', None),
        ('Computers', 'Desktop and laptop computers', 1),
        ('Mobile Devices', 'Smartphones and tablets', 1),
        ('Clothing', 'Apparel and fashion', None),
        ('Men\'s Clothing', 'Men\'s apparel', 4),
        ('Women\'s Clothing', 'Women\'s apparel', 4),
        ('Home & Garden', 'Home improvement and garden supplies', None),
        ('Furniture', 'Indoor and outdoor furniture', 7),
        ('Books', 'Physical and digital books', None),
        ('Sports & Outdoors', 'Sporting goods and outdoor equipment', None),
    ]

    cursor.executemany(
        'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)',
        categories_data
    )

    # Insert sample products
    print("  Inserting sample products...")
    products_data = [
        ('MacBook Pro 16"', 'High-performance laptop for professionals', 'COMP-001', 2, 2499.00, 1800.00, 15, 5, 1, 2.0, 'Apple', '2023-01-01 00:00:00'),
        ('iPhone 14 Pro', 'Latest flagship smartphone', 'MOB-001', 3, 1099.00, 750.00, 45, 10, 1, 0.24, 'Apple', '2023-01-01 00:00:00'),
        ('Samsung Galaxy S23', 'Android flagship phone', 'MOB-002', 3, 899.00, 650.00, 38, 10, 1, 0.23, 'Samsung', '2023-01-01 00:00:00'),
        ('Sony WH-1000XM5', 'Noise-canceling headphones', 'ELEC-001', 1, 399.00, 220.00, 62, 15, 1, 0.25, 'Sony', '2023-01-01 00:00:00'),
        ('Men\'s Leather Jacket', 'Genuine leather jacket', 'CLO-M-001', 5, 189.99, 95.00, 25, 8, 1, 1.5, 'Fashion Co', '2023-01-01 00:00:00'),
        ('Women\'s Winter Coat', 'Warm winter coat', 'CLO-W-001', 6, 159.99, 80.00, 30, 10, 1, 1.2, 'Fashion Co', '2023-01-01 00:00:00'),
        ('Office Desk', 'Ergonomic office desk', 'FURN-001', 8, 349.00, 180.00, 12, 5, 1, 35.0, 'Office Pro', '2023-01-01 00:00:00'),
        ('Gaming Chair', 'Comfortable gaming chair', 'FURN-002', 8, 299.00, 150.00, 18, 6, 1, 22.0, 'GameMax', '2023-01-01 00:00:00'),
        ('The Great Gatsby', 'Classic American novel', 'BOOK-001', 9, 14.99, 6.00, 150, 30, 1, 0.3, 'Penguin Books', '2023-01-01 00:00:00'),
        ('Yoga Mat', 'Premium yoga mat', 'SPORT-001', 10, 49.99, 20.00, 85, 20, 1, 1.8, 'FitLife', '2023-01-01 00:00:00'),
        ('Tennis Racket', 'Professional tennis racket', 'SPORT-002', 10, 189.00, 95.00, 22, 8, 1, 0.32, 'Wilson', '2023-01-01 00:00:00'),
        ('Wireless Mouse', 'Ergonomic wireless mouse', 'ELEC-002', 1, 29.99, 12.00, 120, 25, 1, 0.1, 'Logitech', '2023-01-01 00:00:00'),
        ('USB-C Hub', '7-in-1 USB-C hub', 'ELEC-003', 1, 49.99, 20.00, 95, 20, 1, 0.15, 'Anker', '2023-01-01 00:00:00'),
        ('Running Shoes', 'Lightweight running shoes', 'SPORT-003', 10, 129.99, 65.00, 42, 15, 1, 0.4, 'Nike', '2023-01-01 00:00:00'),
        ('Coffee Table', 'Modern coffee table', 'FURN-003', 8, 199.00, 100.00, 8, 4, 1, 18.0, 'Home Style', '2023-01-01 00:00:00'),
    ]

    cursor.executemany(
        'INSERT INTO products (name, description, sku, category_id, price, cost, stock_quantity, reorder_level, is_active, weight_kg, manufacturer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        products_data
    )

    # Insert sample orders
    print("  Inserting sample orders...")
    orders_data = [
        (1, '2024-01-15 10:30:00', 'Delivered', 2498.99, 199.92, 0.00, 2698.91, 'Credit Card', '123 Main St, New York, NY 10001', 'TRK-001', 'Gift wrap requested'),
        (2, '2024-01-20 14:20:00', 'Delivered', 1198.00, 95.84, 15.00, 1308.84, 'PayPal', '456 Oak Ave, Los Angeles, CA 90001', 'TRK-002', None),
        (1, '2024-02-05 09:45:00', 'Delivered', 399.00, 31.92, 0.00, 430.92, 'Credit Card', '123 Main St, New York, NY 10001', 'TRK-003', None),
        (3, '2024-02-10 16:00:00', 'Shipped', 538.98, 43.12, 12.00, 594.10, 'Credit Card', '789 Pine Rd, Chicago, IL 60601', 'TRK-004', 'Leave at door'),
        (4, '2024-02-15 11:30:00', 'Processing', 1098.00, 87.84, 0.00, 1185.84, 'Credit Card', '321 Elm St, Houston, TX 77001', 'TRK-005', None),
        (2, '2024-02-20 13:15:00', 'Delivered', 648.00, 51.84, 18.00, 717.84, 'Debit Card', '456 Oak Ave, Los Angeles, CA 90001', 'TRK-006', None),
        (5, '2024-03-01 10:00:00', 'Delivered', 189.99, 15.20, 8.00, 213.19, 'PayPal', '654 Maple Dr, Phoenix, AZ 85001', 'TRK-007', None),
        (6, '2024-03-05 15:45:00', 'Cancelled', 899.00, 71.92, 0.00, 970.92, 'Credit Card', '987 Cedar Ln, Philadelphia, PA 19101', None, 'Customer requested cancellation'),
        (4, '2024-03-10 09:20:00', 'Delivered', 598.00, 47.84, 22.00, 667.84, 'Credit Card', '321 Elm St, Houston, TX 77001', 'TRK-008', None),
        (7, '2024-03-15 14:30:00', 'Shipped', 449.98, 36.00, 0.00, 485.98, 'PayPal', '147 Birch Ct, San Antonio, TX 78201', 'TRK-009', None),
    ]

    cursor.executemany(
        'INSERT INTO orders (customer_id, order_date, status, subtotal, tax, shipping, total, payment_method, shipping_address, tracking_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        orders_data
    )

    # Insert sample order items
    print("  Inserting sample order_items...")
    order_items_data = [
        # Order 1 - Customer 1
        (1, 1, 1, 2499.00, 0.00, 2499.00),
        # Order 2 - Customer 2
        (2, 2, 1, 1099.00, 0.00, 1099.00),
        (2, 12, 1, 29.99, 0.00, 29.99),
        (2, 13, 1, 49.99, 10.00, 39.99),
        # Order 3 - Customer 1
        (3, 4, 1, 399.00, 0.00, 399.00),
        # Order 4 - Customer 3
        (4, 5, 1, 189.99, 0.00, 189.99),
        (4, 7, 1, 349.00, 0.00, 349.00),
        # Order 5 - Customer 4
        (5, 2, 1, 1099.00, 0.00, 1099.00),
        # Order 6 - Customer 2
        (6, 8, 1, 299.00, 0.00, 299.00),
        (6, 7, 1, 349.00, 0.00, 349.00),
        # Order 7 - Customer 5
        (7, 5, 1, 189.99, 0.00, 189.99),
        # Order 8 - Customer 6 (cancelled)
        (8, 3, 1, 899.00, 0.00, 899.00),
        # Order 9 - Customer 4
        (9, 14, 2, 129.99, 0.00, 259.98),
        (9, 10, 2, 49.99, 0.00, 99.98),
        (9, 9, 10, 14.99, 0.00, 149.90),
        # Order 10 - Customer 7
        (10, 8, 1, 299.00, 0.00, 299.00),
        (10, 15, 1, 199.00, 48.02, 150.98),
    ]

    cursor.executemany(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        order_items_data
    )

    conn.commit()
    conn.close()

    print("\n" + "="*60)
    print("✓ E-commerce test database created successfully!")
    print("="*60)
    print("\nDatabase: ecommerce.db")
    print("\nTables created:")
    print("  - customers (10 records)")
    print("  - categories (10 records)")
    print("  - products (15 records)")
    print("  - orders (10 records)")
    print("  - order_items (17 records)")
    print("\nExample queries to try:")
    print("\n1. Get all products with their categories:")
    print("   SELECT p.name, p.price, c.name as category")
    print("   FROM products p")
    print("   JOIN categories c ON p.category_id = c.id")
    print("\n2. Get customer order history:")
    print("   SELECT c.first_name, c.last_name, o.order_date, o.total, o.status")
    print("   FROM customers c")
    print("   JOIN orders o ON c.id = o.customer_id")
    print("   ORDER BY o.order_date DESC")
    print("\n3. Get best-selling products:")
    print("   SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue")
    print("   FROM products p")
    print("   JOIN order_items oi ON p.id = oi.product_id")
    print("   GROUP BY p.id, p.name")
    print("   ORDER BY total_sold DESC")
    print("\n4. Get order details with items:")
    print("   SELECT o.id, c.first_name, c.last_name, p.name, oi.quantity, oi.subtotal")
    print("   FROM orders o")
    print("   JOIN customers c ON o.customer_id = c.id")
    print("   JOIN order_items oi ON o.id = oi.order_id")
    print("   JOIN products p ON oi.product_id = p.id")
    print("   WHERE o.id = 2")
    print("\n5. Get low stock products:")
    print("   SELECT name, stock_quantity, reorder_level")
    print("   FROM products")
    print("   WHERE stock_quantity <= reorder_level")
    print("   ORDER BY stock_quantity ASC")
    print("\n6. Get category sales summary:")
    print("   SELECT c.name, COUNT(DISTINCT o.id) as orders, SUM(oi.subtotal) as revenue")
    print("   FROM categories c")
    print("   JOIN products p ON c.id = p.category_id")
    print("   JOIN order_items oi ON p.id = oi.product_id")
    print("   JOIN orders o ON oi.order_id = o.id")
    print("   WHERE o.status != 'Cancelled'")
    print("   GROUP BY c.id, c.name")
    print("   ORDER BY revenue DESC")
    print("\n7. Get customer lifetime value:")
    print("   SELECT first_name, last_name, email, total_orders, total_spent")
    print("   FROM customers")
    print("   ORDER BY total_spent DESC")
    print("   LIMIT 5")
    print("="*60)

if __name__ == '__main__':
    create_ecommerce_database()

