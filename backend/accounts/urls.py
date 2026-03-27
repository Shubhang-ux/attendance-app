"""
Account URL Routes
==================
Maps URL paths to views.

Each path() takes:
  1. A URL pattern (string)
  2. A view (the class/function to handle it)
  3. A name (for reverse URL lookups)

.as_view() converts a class-based view into a callable function
that Django's URL dispatcher can use.

RESULTING ENDPOINTS:
  POST /api/accounts/register/  → Create new account
  POST /api/accounts/login/     → Get auth token
  POST /api/accounts/logout/    → Delete auth token
  GET  /api/accounts/profile/   → Get profile
  PUT  /api/accounts/profile/   → Update profile
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]
