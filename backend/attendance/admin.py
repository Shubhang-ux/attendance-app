from django.contrib import admin
from .models import AttendanceRecord, LeaveRequest

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'clock_in', 'clock_out', 'status']
    list_filter = ['status', 'date']
    search_fields = ['user__username']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'leave_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'leave_type']
    list_editable = ['status']  # Approve/reject directly from the list!
