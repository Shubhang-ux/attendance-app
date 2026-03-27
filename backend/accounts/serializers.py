"""
Serializers
===========
Serializers are the BRIDGE between Django models and JSON.

WHAT THEY DO:
  1. Serialization:   Python object → JSON  (for API responses)
  2. Deserialization:  JSON → Python object  (for API requests)
  3. Validation:       Check that incoming data is valid

ANALOGY:
  Think of a serializer like a customs officer at an airport:
  - Incoming passengers (data) get checked (validated)
  - Their passport info gets converted to the local format
  - Outgoing passengers get their info formatted for the destination

HOW IT WORKS WITH DRF:
  Request comes in with JSON body
    → Serializer validates the data
    → Serializer converts it to Python objects
    → View uses it to create/update database records
    → Serializer converts the result back to JSON
    → JSON response sent back
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EmployeeProfile


class EmployeeProfileSerializer(serializers.ModelSerializer):
    """
    ModelSerializer auto-generates fields from the model.
    It's like saying "make a form for this database table."
    """
    class Meta:
        model = EmployeeProfile
        fields = ['employee_id', 'department', 'designation', 'phone', 'date_joined_company']
        read_only_fields = ['date_joined_company']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes User data + nested profile data.
    'source' tells DRF where to find the data on the model.
    """
    employee_id = serializers.CharField(source='profile.employee_id', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    designation = serializers.CharField(source='profile.designation', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'employee_id', 'department', 'designation']


class RegisterSerializer(serializers.Serializer):
    """
    Custom serializer for registration.
    We use a plain Serializer (not ModelSerializer) because we need
    to create TWO objects: a User AND a Profile.

    validate_<fieldname> methods are called automatically by DRF
    for field-level validation.
    """
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    employee_id = serializers.CharField(max_length=20)
    department = serializers.ChoiceField(choices=EmployeeProfile.DEPARTMENT_CHOICES)
    designation = serializers.CharField(max_length=100, default='Employee')

    def validate_username(self, value):
        """Check username isn't already taken"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        """Check email isn't already registered"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_employee_id(self, value):
        """Check employee ID is unique"""
        if EmployeeProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already exists.")
        return value

    def create(self, validated_data):
        """
        This runs after validation passes.
        Creates both User and EmployeeProfile in one go.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],  # auto-hashes!
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        EmployeeProfile.objects.create(
            user=user,
            employee_id=validated_data['employee_id'],
            department=validated_data['department'],
            designation=validated_data.get('designation', 'Employee'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Simple serializer for login - just username and password"""
    username = serializers.CharField()
    password = serializers.CharField()
