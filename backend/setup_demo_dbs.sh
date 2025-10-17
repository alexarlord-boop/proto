#!/bin/bash

# Proto - Demo Databases Setup Script
# This script creates all demo databases for testing and demonstrations

echo "================================================"
echo "Proto - Demo Databases Setup"
echo "================================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if we're in the backend directory
if [ ! -f "create_test_db.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Usage: cd backend && ./setup_demo_dbs.sh"
    exit 1
fi

echo "================================================"
echo "Creating Demo Databases..."
echo "================================================"
echo ""

# Create simple test database
echo "1️⃣  Creating simple test database (test.db)..."
python3 create_test_db.py
if [ $? -eq 0 ]; then
    echo "✅ test.db created successfully"
else
    echo "❌ Failed to create test.db"
    exit 1
fi
echo ""

# Create e-commerce database
echo "2️⃣  Creating e-commerce database (ecommerce.db)..."
python3 create_ecommerce_test_db.py
if [ $? -eq 0 ]; then
    echo "✅ ecommerce.db created successfully"
else
    echo "❌ Failed to create ecommerce.db"
    exit 1
fi
echo ""

# Create complex learning platform database
echo "3️⃣  Creating complex learning platform database (complex_test.db)..."
python3 create_complex_test_db.py
if [ $? -eq 0 ]; then
    echo "✅ complex_test.db created successfully"
else
    echo "❌ Failed to create complex_test.db"
    exit 1
fi
echo ""

echo "================================================"
echo "✅ All demo databases created successfully!"
echo "================================================"
echo ""
echo "Databases created:"
echo "  • test.db           - Simple project management (users, projects, tasks)"
echo "  • ecommerce.db      - E-commerce platform (customers, products, orders)"
echo "  • complex_test.db   - Learning platform (courses, students, enrollments)"
echo ""
echo "Next steps:"
echo "  1. Start the backend: uvicorn main:app --reload"
echo "  2. Start the frontend: cd ../frontend && pnpm dev"
echo "  3. Open http://localhost:5173 in your browser"
echo "  4. Create a database connector in the Query Creator"
echo ""
echo "Database paths to use when creating connectors:"
echo "  • ./test.db"
echo "  • ./ecommerce.db"
echo "  • ./complex_test.db"
echo ""
echo "Happy building! 🚀"
echo ""

