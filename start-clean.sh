#!/bin/bash

echo "🧹 Cleaning up existing dev servers..."

# Kill all Next.js processes
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "node.*next" 2>/dev/null

# Kill anything on ports 3000-3010
for port in {3000..3010}; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

echo "✅ All processes killed"
sleep 1

# Verify port 3000 is free
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "❌ Port 3000 still in use. Please check manually."
  exit 1
fi

echo "✅ Port 3000 is free"
echo "🚀 Starting dev server on port 3000..."

# Start dev server on port 3000
PORT=3000 npm run dev

