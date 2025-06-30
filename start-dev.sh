#!/bin/bash

echo "🚀 Restaurant POS Development Setup"
echo "=================================="
echo ""
echo "This will start both servers in separate terminal windows/tabs"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: backend or frontend directory not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "🔧 Starting Backend Server..."
echo "Opening new terminal for backend..."

# For macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && npm run dev"'
# For Linux with gnome-terminal
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal --tab --title="Backend" -- bash -c "cd backend && npm run dev; exec bash"
# For Linux with xterm
elif command -v xterm &> /dev/null; then
    xterm -T "Backend" -e "cd backend && npm run dev" &
fi

sleep 2

echo "🎨 Starting Frontend Server..."
echo "Opening new terminal for frontend..."

# For macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/frontend && npm run dev"'
# For Linux with gnome-terminal
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal --tab --title="Frontend" -- bash -c "cd frontend && npm run dev; exec bash"
# For Linux with xterm
elif command -v xterm &> /dev/null; then
    xterm -T "Frontend" -e "cd frontend && npm run dev" &
fi

echo ""
echo "✅ Both servers should be starting in separate terminals!"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "🔐 Admin Login:"
echo "  Username: admin"
echo "  Password: admin123"
