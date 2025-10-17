@echo off
REM Proto - Demo Databases Setup Script (Windows)
REM This script creates all demo databases for testing and demonstrations

echo ================================================
echo Proto - Demo Databases Setup
echo ================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo Python found: %PYTHON_VERSION%
echo.

REM Check if we're in the backend directory
if not exist "create_test_db.py" (
    echo ERROR: Please run this script from the backend directory
    echo Usage: cd backend ^&^& setup_demo_dbs.bat
    exit /b 1
)

echo ================================================
echo Creating Demo Databases...
echo ================================================
echo.

REM Create simple test database
echo 1. Creating simple test database ^(test.db^)...
python create_test_db.py
if errorlevel 1 (
    echo Failed to create test.db
    exit /b 1
)
echo SUCCESS: test.db created successfully
echo.

REM Create e-commerce database
echo 2. Creating e-commerce database ^(ecommerce.db^)...
python create_ecommerce_test_db.py
if errorlevel 1 (
    echo Failed to create ecommerce.db
    exit /b 1
)
echo SUCCESS: ecommerce.db created successfully
echo.

REM Create complex learning platform database
echo 3. Creating complex learning platform database ^(complex_test.db^)...
python create_complex_test_db.py
if errorlevel 1 (
    echo Failed to create complex_test.db
    exit /b 1
)
echo SUCCESS: complex_test.db created successfully
echo.

echo ================================================
echo SUCCESS: All demo databases created successfully!
echo ================================================
echo.
echo Databases created:
echo   * test.db           - Simple project management ^(users, projects, tasks^)
echo   * ecommerce.db      - E-commerce platform ^(customers, products, orders^)
echo   * complex_test.db   - Learning platform ^(courses, students, enrollments^)
echo.
echo Next steps:
echo   1. Start the backend: uvicorn main:app --reload
echo   2. Start the frontend: cd ..\frontend ^&^& pnpm dev
echo   3. Open http://localhost:5173 in your browser
echo   4. Create a database connector in the Query Creator
echo.
echo Database paths to use when creating connectors:
echo   * .\test.db
echo   * .\ecommerce.db
echo   * .\complex_test.db
echo.
echo Happy building!
echo.
pause

