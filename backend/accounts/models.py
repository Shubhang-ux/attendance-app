"""
Accounts Models
===============
We extend Django's built-in User model with a Profile.

WHY NOT MODIFY User DIRECTLY?
  Django's User model handles auth (password hashing, tokens, etc.)
  We use a "Profile" linked via OneToOneField to add extra fields
  like department, employee_id, etc. This is a common Django pattern.

DATABASE RELATIONSHIP:
  User (1) ──── (1) EmployeeProfile
  Each user has exactly one profile, and vice versa.
"""
from django.db import models
from django.contrib.auth.models import User


class EmployeeProfile(models.Model):
    DEPARTMENT_CHOICES = [
        ('engineering', 'Engineering'),
        ('design', 'Design'),
        ('marketing', 'Marketing'),
        ('hr', 'Human Resources'),
        ('finance', 'Finance'),
        ('operations', 'Operations'),
    ]

    # OneToOneField = This profile belongs to exactly ONE user
    # on_delete=CASCADE = If user is deleted, delete profile too
    # related_name='profile' = Access via user.profile
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    designation = models.CharField(max_length=100, default='Employee')
    phone = models.CharField(max_length=15, blank=True)
    date_joined_company = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"
