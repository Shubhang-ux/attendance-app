"""
Attendance Serializers
======================
Convert attendance models to/from JSON.

SerializerMethodField: A read-only field that gets its value
from a method on the serializer (get_<fieldname>).
Useful for computed/derived values.
"""
from rest_framework import serializers
from .models import AttendanceRecord, LeaveRequest


class AttendanceRecordSerializer(serializers.ModelSerializer):
    # These fields don't exist on the model directly
    # They're computed via methods below
    hours_worked = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'user', 'date', 'clock_in', 'clock_out',
            'status', 'notes', 'hours_worked', 'username'
        ]
        read_only_fields = ['user']  # Set automatically from request.user

    def get_hours_worked(self, obj):
        """Called automatically for the 'hours_worked' field"""
        return obj.hours_worked

    def get_username(self, obj):
        """Called automatically for the 'username' field"""
        return obj.user.get_full_name() or obj.user.username


class LeaveRequestSerializer(serializers.ModelSerializer):
    total_days = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'user', 'leave_type', 'start_date', 'end_date',
            'reason', 'status', 'applied_on', 'updated_on',
            'total_days', 'username'
        ]
        read_only_fields = ['user', 'status', 'applied_on', 'updated_on']

    def get_total_days(self, obj):
        return obj.total_days

    def get_username(self, obj):
        return obj.user.get_full_name() or obj.user.username
