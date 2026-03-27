#!/bin/bash
# ╔══════════════════════════════════════════════╗
# ║   ATTENDR — One-Click Setup Script           ║
# ║   Run: bash setup.sh                         ║
# ╚══════════════════════════════════════════════╝

set -e
echo ""
echo "◉ ATTENDR — Setting up..."
echo "=========================="

# ─── Step 1: Backend Setup ───
echo ""
echo "📦 [1/5] Installing Python packages..."
cd backend
pip install django djangorestframework django-cors-headers -q
echo "   ✅ Done"

# ─── Step 2: Database ───
echo ""
echo "🗄️  [2/5] Creating database..."
python manage.py migrate --run-syncdb -v 0
echo "   ✅ Done"

# ─── Step 3: Demo Data ───
echo ""
echo "🌱 [3/5] Seeding demo data..."
python manage.py seed_data
echo "   ✅ Done"

# ─── Step 4: Frontend Setup ───
echo ""
echo "⚛️  [4/5] Setting up React frontend..."
cd ../frontend

# Only create react app if package.json doesn't exist
if [ ! -f "package.json" ]; then
    npx create-react-app . --template default
fi

# Copy our files into the React app
cp src/api.js src/api.js.bak 2>/dev/null || true
cp src/App.jsx src/App.js 2>/dev/null || true
echo "   ✅ Done"

cd ..

# ─── Step 5: Instructions ───
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║            ◉ ATTENDR IS READY!                  ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Open TWO terminals:                             ║"
echo "║                                                  ║"
echo "║  Terminal 1 (Backend):                           ║"
echo "║    cd attendance-app/backend                     ║"
echo "║    python manage.py runserver                    ║"
echo "║                                                  ║"
echo "║  Terminal 2 (Frontend):                          ║"
echo "║    cd attendance-app/frontend                    ║"
echo "║    npm start                                     ║"
echo "║                                                  ║"
echo "║  Login:  demo / demo1234                         ║"
echo "║                                                  ║"
echo "║  Backend:  http://localhost:8000                  ║"
echo "║  Frontend: http://localhost:3000                  ║"
echo "║  Admin:    http://localhost:8000/admin/           ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
