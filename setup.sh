#!/bin/bash
# Setup script for Linux/macOS

echo "🏦 Bank Management System - Setup Script"
echo "========================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "📦 Please install PostgreSQL first:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if C++ compiler is available
if ! command -v g++ &> /dev/null && ! command -v clang++ &> /dev/null; then
    echo "❌ C++ compiler not found"
    echo "📦 Please install a C++ compiler (g++ or clang)"
    exit 1
fi

echo "✅ C++ compiler found"

# Create database
echo ""
echo "📝 Creating database and schema..."

# Try to create database
sudo -u postgres psql -c "CREATE DATABASE bank_management;" 2>/dev/null || echo "Database may already exist"

# Run schema
sudo -u postgres psql -d bank_management -f sql/schema.sql

echo "✅ Database created and schema applied"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo apt-get update
    sudo apt-get install -y libpqxx-dev libpq-dev nlohmann-json3-dev cmake
    
    # Clone and install Crow
    if [ ! -d "Crow" ]; then
        git clone https://github.com/CrowCpp/Crow.git
        cd Crow
        mkdir build && cd build
        cmake .. && cmake --build . && sudo cmake --install .
        cd ../..
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first."
        exit 1
    fi
    
    brew install libpqxx nlohmann-json cmake
    
    # Clone and install Crow
    if [ ! -d "Crow" ]; then
        git clone https://github.com/CrowCpp/Crow.git
        cd Crow
        mkdir build && cd build
        cmake .. && cmake --build . && sudo cmake --install .
        cd ../..
    fi
fi

echo "✅ Dependencies installed"

# Build C++ server
echo ""
echo "🔨 Building C++ server..."

cd server
mkdir -p build
cd build
cmake ..
cmake --build . --config Release

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Setup complete! To run the application:"
    echo ""
    echo "Terminal 1 (Start C++ server):"
    echo "  cd server/build"
    echo "  ./BankServer"
    echo ""
    echo "Terminal 2 (Serve frontend):"
    echo "  cd public"
    echo "  python3 -m http.server 8000"
    echo ""
    echo "Then open: http://127.0.0.1:8000"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi
