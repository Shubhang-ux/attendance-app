"""
Attendance Models
=================
Two main models:

1. AttendanceRecord - Tracks daily clock in/out times
   - One record per user per day
   - Automatically calculates hours worked

2. LeaveRequest - Tracks leave/vacation requests
   - Employees submit requests
   - Status goes: pending → approved/rejected

DATABASE RELATIONSHIPS:
  User (1) ──── (many) AttendanceRecord   (one user, many days)
  User (1) ──── (many) LeaveRequest       (one user, many leave requests)

DJANGO MODEL TIPS:
  - Each class = one database table
  - Each field = one column
  - Django auto-creates an 'id' primary key
  - ForeignKey = "this record belongs to a User"
  - unique_together = compound unique constraint
"""
from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta


class AttendanceRecord(models.Model):
    """
    Tracks daily attendance: when you clocked in and out.
    
    unique_together: A user can only have ONE record per date.
    This prevents duplicate clock-ins for the same day.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendance_records'  # user.attendance_records.all()
    )
    date = models.DateField()
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('half_day', 'Half Day'),
            ('on_leave', 'On Leave'),
        ],
        default='present'
    )
    notes = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']  # Most recent first

    @property
    def hours_worked(self):
        """
        @property makes this callable as record.hours_worked
        instead of record.hours_worked()
        
        Calculates time between clock_in and clock_out.
        Returns float hours (e.g., 8.5 for 8 hours 30 min).
        """
        if self.clock_in and self.clock_out:
            delta = self.clock_out - self.clock_in
            return round(delta.total_seconds() / 3600, 2)
        return 0

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"


class LeaveRequest(models.Model):
    """
    Leave/vacation request system.
    
    WORKFLOW:
      1. Employee creates request (status='pending')
      2. Manager approves or rejects
      3. If approved, attendance records are marked 'on_leave'
    """
    LEAVE_TYPES = [
        ('casual', 'Casual Leave'),
        ('sick', 'Sick Leave'),
        ('earned', 'Earned Leave'),
        ('unpaid', 'Unpaid Leave'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)  # Set once on creation
    updated_on = models.DateTimeField(auto_now=True)       # Updated every save

    class Meta:
        ordering = ['-applied_on']

    @property
    def total_days(self):
        """Calculate number of leave days (inclusive of start and end)"""
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return f"{self.user.username} - {self.leave_type} ({self.start_date} to {self.end_date})"
