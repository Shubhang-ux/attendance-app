# ◉ ATTENDR — Office Attendance Tracker

A full-stack attendance management app built with **Django REST Framework** (backend) and **React** (frontend). Designed as a learning project to understand how APIs work end-to-end.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐         HTTP (JSON)         ┌─────────────────────┐
│                  │  ←───── GET, POST ────────→ │                     │
│  React Frontend  │                             │  Django Backend     │
│  (Port 3000)     │  Authorization: Token xxx   │  (Port 8000)        │
│                  │  ←──────────────────────→   │                     │
└─────────────────┘                              └──────────┬──────────┘
                                                            │
                                                     ┌──────▼──────┐
                                                     │   SQLite    │
                                                     │   Database  │
                                                     └─────────────┘
```

### How a Request Flows:

1. User clicks "Clock In" in React
2. React calls `fetch('POST /api/attendance/clock-in/')`
3. Request includes header: `Authorization: Token abc123...`
4. Django receives it → CORS middleware allows cross-origin
5. TokenAuthentication reads the token → finds the User
6. View runs business logic → creates AttendanceRecord
7. Serializer converts the record to JSON
8. JSON response sent back to React
9. React updates the UI

---

## 📁 Project Structure

```
attendance-app/
├── backend/                    # Django project
│   ├── config/                 # Project config
│   │   ├── settings.py         # ⚙️  DB, auth, CORS, installed apps
│   │   └── urls.py             # 🔀 Main URL router
│   ├── accounts/               # User auth app
│   │   ├── models.py           # 👤 EmployeeProfile model
│   │   ├── serializers.py      # 🔄 JSON ↔ Python converters
│   │   ├── views.py            # 📡 Login/Register/Profile endpoints
│   │   └── urls.py             # 🔀 /api/accounts/* routes
│   ├── attendance/             # Attendance app
│   │   ├── models.py           # 📋 AttendanceRecord, LeaveRequest
│   │   ├── serializers.py      # 🔄 JSON converters
│   │   ├── views.py            # 📡 Clock in/out, Leave, Dashboard
│   │   └── urls.py             # 🔀 /api/attendance/* routes
│   └── manage.py               # Django CLI tool
│
└── frontend/
    └── src/
        ├── api.js              # 🌐 All API calls (fetch wrapper)
        └── App.jsx             # ⚛️  React UI (all pages)
```

---

## 🚀 How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend (Django)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install django djangorestframework django-cors-headers

# Create database tables
python manage.py migrate

# Seed demo data (creates test user)
python manage.py seed_data

# Start the server
python manage.py runserver
```

Server runs at **http://localhost:8000**

### 2. Frontend (React)

```bash
# In a new terminal
cd frontend

# Create React app (if starting fresh)
npx create-react-app . 
# Then replace src/App.js with App.jsx content
# And add src/api.js

# OR if you're copying the files into an existing React project:
npm start
```

Frontend runs at **http://localhost:3000**

### Demo Login
```
Username: demo
Password: demo1234
```

---

## 📡 API Reference

### Authentication

All endpoints (except login/register) require the header:
```
Authorization: Token <your-token-here>
```

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/api/accounts/register/` | No | Create account |
| POST | `/api/accounts/login/` | No | Get auth token |
| POST | `/api/accounts/logout/` | Yes | Invalidate token |
| GET | `/api/accounts/profile/` | Yes | Get your profile |
| PUT | `/api/accounts/profile/` | Yes | Update profile |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/clock-in/` | Clock in for today |
| POST | `/api/attendance/clock-out/` | Clock out for today |
| GET | `/api/attendance/today/` | Today's record |
| GET | `/api/attendance/history/?month=3&year=2026` | History with filters |
| GET | `/api/attendance/dashboard/` | Monthly stats |

### Leave

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/leave/` | List your requests |
| POST | `/api/attendance/leave/` | Submit request |
| GET | `/api/attendance/leave/<id>/` | Single request |
| DELETE | `/api/attendance/leave/<id>/` | Cancel pending |

---

## 🧪 Test APIs with curl

```bash
# 1. Login (get your token)
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo1234"}'

# Response: {"token":"abc123...","user":{...}}

# 2. Use the token for authenticated requests
TOKEN="your-token-here"

# Get dashboard
curl http://localhost:8000/api/attendance/dashboard/ \
  -H "Authorization: Token $TOKEN"

# Clock in
curl -X POST http://localhost:8000/api/attendance/clock-in/ \
  -H "Authorization: Token $TOKEN"

# Submit leave request
curl -X POST http://localhost:8000/api/attendance/leave/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"leave_type":"casual","start_date":"2026-04-10","end_date":"2026-04-12","reason":"Family trip"}'

# Get attendance history
curl "http://localhost:8000/api/attendance/history/?month=3&year=2026" \
  -H "Authorization: Token $TOKEN"
```

---

## 🧠 Key Concepts to Learn

### 1. **REST API Pattern**
- Resources are nouns: `/attendance/`, `/leave/`
- HTTP methods are verbs: GET (read), POST (create), PUT (update), DELETE (remove)
- Stateless: Each request carries its own auth token

### 2. **Token Authentication**
```
Client stores token → sends in header → Django reads it → identifies user
```
This is simpler than JWT. Token stays in DB. Logout = delete token.

### 3. **Serializers (DRF)**
Think of them as smart translators:
- **Input**: Validate JSON → convert to Python → save to DB
- **Output**: Read from DB → convert to JSON → send to client

### 4. **Django ORM**
```python
# These Python calls become SQL automatically:
User.objects.filter(username='demo')     # SELECT * FROM users WHERE username='demo'
record.save()                            # INSERT INTO or UPDATE
AttendanceRecord.objects.get_or_create() # SELECT or INSERT
```

### 5. **CORS**
Browsers block requests between different origins (ports count!).
`django-cors-headers` adds the right headers to allow localhost:3000 → localhost:8000.

---

## 🛠️ Admin Panel

Django comes with a built-in admin panel where you can manage data directly.

```bash
# Create admin user
python manage.py createsuperuser

# Visit http://localhost:8000/admin/
# You can approve/reject leave requests from here!
```

---

## 📝 Next Steps (Ideas to Extend)

- [ ] Add JWT authentication (django-rest-framework-simplejwt)
- [ ] Add manager role who can approve leave
- [ ] Add email notifications on leave approval
- [ ] Add team/department view for managers
- [ ] Deploy: Gunicorn + Nginx + PostgreSQL
- [ ] Add tests with pytest
- [ ] Add Swagger/OpenAPI docs (drf-spectacular)
