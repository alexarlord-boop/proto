#!/bin/bash

# Proto Startup Script
# Starts both backend and frontend servers

echo "🚀 Starting Proto Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
echo "✓ Backend dependencies installed"

# Create test database if it doesn't exist
if [ ! -f "test.db" ]; then
    echo "Creating test database..."
    python create_test_db.py
fi

cd ..

# Install frontend dependencies
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi
echo "✓ Frontend dependencies installed"

cd ..

echo ""
echo "🎉 Starting servers..."
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend:    http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
pnpm dev &
FRONTEND_PID=$!

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait

