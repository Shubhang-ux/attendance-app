"""
Custom management command to seed demo data.
Run with: python manage.py seed_data

Creates a test user with attendance records so you can
see the app in action immediately.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from accounts.models import EmployeeProfile
from attendance.models import AttendanceRecord, LeaveRequest
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seeds demo data for testing'

    def handle(self, *args, **options):
        # Create demo user
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@attendr.io',
                'first_name': 'Raj',
                'last_name': 'Sharma',
            }
        )
        if created:
            user.set_password('demo1234')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created demo user'))

        # Create profile
        EmployeeProfile.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': 'EMP001',
                'department': 'engineering',
                'designation': 'Software Developer',
                'phone': '9876543210',
            }
        )

        # Create auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Seed attendance for the last 20 working days
        today = timezone.now().date()
        for i in range(20, 0, -1):
            day = today - timedelta(days=i)
            if day.weekday() >= 5:  # Skip weekends
                continue

            clock_in_time = timezone.now().replace(
                year=day.year, month=day.month, day=day.day,
                hour=random.randint(8, 10),
                minute=random.randint(0, 59),
                second=0, microsecond=0,
            )
            clock_out_time = clock_in_time + timedelta(
                hours=random.randint(7, 9),
                minutes=random.randint(0, 59),
            )

            AttendanceRecord.objects.get_or_create(
                user=user,
                date=day,
                defaults={
                    'clock_in': clock_in_time,
                    'clock_out': clock_out_time,
                    'status': 'present',
                }
            )

        # Seed some leave requests
        LeaveRequest.objects.get_or_create(
            user=user,
            start_date=today + timedelta(days=10),
            defaults={
                'leave_type': 'casual',
                'end_date': today + timedelta(days=12),
                'reason': 'Family function in hometown',
                'status': 'pending',
            }
        )
        LeaveRequest.objects.get_or_create(
            user=user,
            start_date=today - timedelta(days=30),
            defaults={
                'leave_type': 'sick',
                'end_date': today - timedelta(days=29),
                'reason': 'Not feeling well, fever',
                'status': 'approved',
            }
        )

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Demo data ready!'
            f'\n   Username: demo'
            f'\n   Password: demo1234'
            f'\n   Token:    {token.key}\n'
        ))
