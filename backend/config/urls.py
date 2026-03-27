"""
URL Configuration
=================
This is the main router. It connects URL paths to the right app.

How Django URLs work:
  1. A request comes in (e.g., POST /api/accounts/login/)
  2. Django checks each path() in urlpatterns top-to-bottom
  3. When it finds a match, it hands off to that app's urls.py
  4. The app's urls.py maps it to the correct View function

The 'api/' prefix means ALL our API endpoints start with /api/
  - /api/accounts/...  → user registration, login, logout
  - /api/attendance/... → clock in/out, leave, history
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/attendance/', include('attendance.urls')),
]
