#!/bin/bash

echo "🎨 Starting Restaurant POS Frontend..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "next.config.js" ] && [ ! -f "next.config.mjs" ] && [ ! -f "package.json" ]; then
    echo "❌ Error: Next.js project not found!"
    echo "Please run this script from the frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found!"
    echo "Creating default .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
fi

echo "🚀 Starting frontend server on port 3000..."
echo "Press Ctrl+C to stop"
echo ""

npm run dev
