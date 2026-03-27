"""
Attendance URL Routes
=====================
"""
from django.urls import path
from . import views

urlpatterns = [
    path('clock-in/', views.ClockInView.as_view(), name='clock-in'),
    path('clock-out/', views.ClockOutView.as_view(), name='clock-out'),
    path('today/', views.TodayAttendanceView.as_view(), name='today'),
    path('history/', views.AttendanceHistoryView.as_view(), name='history'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('leave/', views.LeaveRequestView.as_view(), name='leave'),
    path('leave/<int:pk>/', views.LeaveDetailView.as_view(), name='leave-detail'),
]
