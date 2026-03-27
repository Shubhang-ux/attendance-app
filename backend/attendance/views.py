"""
Attendance Views
================
The core API endpoints for the attendance system.

ENDPOINT OVERVIEW:
  POST /api/attendance/clock-in/       → Start your day
  POST /api/attendance/clock-out/      → End your day
  GET  /api/attendance/today/          → Today's record
  GET  /api/attendance/history/        → All your records
  GET  /api/attendance/dashboard/      → Stats summary
  POST /api/attendance/leave/          → Request leave
  GET  /api/attendance/leave/          → Your leave requests
  GET  /api/attendance/leave/<id>/     → Single leave request

KEY CONCEPTS:
  - get_or_create(): Gets existing record or creates new one
  - timezone.now(): Current time (timezone-aware)
  - request.user: Auto-set from auth token
  - @property on model → computed field available in serializer
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, timedelta
from .models import AttendanceRecord, LeaveRequest
from .serializers import AttendanceRecordSerializer, LeaveRequestSerializer


class ClockInView(APIView):
    """
    POST /api/attendance/clock-in/

    Records when an employee starts their work day.
    
    LOGIC:
      1. Check if already clocked in today
      2. If not → create record with clock_in = now
      3. If yes → return error
    
    get_or_create returns a tuple: (object, was_created)
      - If record exists: (existing_record, False)
      - If new:           (new_record, True)
    """
    def post(self, request):
        today = timezone.now().date()

        record, created = AttendanceRecord.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={
                'clock_in': timezone.now(),
                'status': 'present',
            }
        )

        if not created:
            if record.clock_in:
                return Response(
                    {'error': 'Already clocked in today',
                     'clock_in': record.clock_in},
                    status=status.HTTP_400_BAD_REQUEST
                )
            record.clock_in = timezone.now()
            record.status = 'present'
            record.save()

        serializer = AttendanceRecordSerializer(record)
        return Response({
            'message': 'Clocked in successfully!',
            'record': serializer.data
        }, status=status.HTTP_201_CREATED)


class ClockOutView(APIView):
    """
    POST /api/attendance/clock-out/

    Records when an employee ends their work day.
    
    LOGIC:
      1. Find today's record
      2. Check they clocked in first
      3. Check they haven't already clocked out
      4. Set clock_out = now
    """
    def post(self, request):
        today = timezone.now().date()

        try:
            record = AttendanceRecord.objects.get(
                user=request.user,
                date=today
            )
        except AttendanceRecord.DoesNotExist:
            return Response(
                {'error': 'You haven\'t clocked in today'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if record.clock_out:
            return Response(
                {'error': 'Already clocked out today'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.clock_out = timezone.now()
        record.save()

        serializer = AttendanceRecordSerializer(record)
        return Response({
            'message': 'Clocked out successfully!',
            'record': serializer.data
        })


class TodayAttendanceView(APIView):
    """
    GET /api/attendance/today/

    Returns today's attendance record for the current user.
    Used by the frontend to show current clock-in status.
    """
    def get(self, request):
        today = timezone.now().date()
        try:
            record = AttendanceRecord.objects.get(
                user=request.user,
                date=today
            )
            serializer = AttendanceRecordSerializer(record)
            return Response(serializer.data)
        except AttendanceRecord.DoesNotExist:
            return Response({
                'date': today,
                'clock_in': None,
                'clock_out': None,
                'status': 'not_started'
            })


class AttendanceHistoryView(APIView):
    """
    GET /api/attendance/history/
    GET /api/attendance/history/?month=3&year=2026

    Returns attendance history. Optionally filter by month/year.
    
    request.query_params = URL parameters after the ?
    e.g., ?month=3&year=2026 → {'month': '3', 'year': '2026'}
    """
    def get(self, request):
        records = AttendanceRecord.objects.filter(user=request.user)

        # Optional filters from query params
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if month and year:
            records = records.filter(
                date__month=int(month),
                date__year=int(year)
            )
        elif year:
            records = records.filter(date__year=int(year))

        serializer = AttendanceRecordSerializer(records, many=True)
        # many=True tells serializer to handle a list of objects
        return Response(serializer.data)


class DashboardView(APIView):
    """
    GET /api/attendance/dashboard/

    Returns summary statistics for the current month.
    This is a custom endpoint - not a standard CRUD operation.
    Shows how you can return any JSON shape you want!
    
    AGGREGATE QUERIES:
      .filter() → narrows down records
      .count()  → counts matching records
      These translate to SQL: SELECT COUNT(*) FROM ... WHERE ...
    """
    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Get this month's records for current user
        month_records = AttendanceRecord.objects.filter(
            user=request.user,
            date__gte=month_start,  # gte = greater than or equal
            date__lte=today,         # lte = less than or equal
        )

        present_days = month_records.filter(status='present').count()
        absent_days = month_records.filter(status='absent').count()
        half_days = month_records.filter(status='half_day').count()
        leave_days = month_records.filter(status='on_leave').count()

        # Calculate total hours this month
        total_hours = sum(r.hours_worked for r in month_records)
        avg_hours = round(total_hours / present_days, 2) if present_days > 0 else 0

        # Pending leave count
        pending_leaves = LeaveRequest.objects.filter(
            user=request.user,
            status='pending'
        ).count()

        # Today's status
        try:
            today_record = month_records.get(date=today)
            today_status = {
                'clocked_in': today_record.clock_in is not None,
                'clocked_out': today_record.clock_out is not None,
                'clock_in_time': today_record.clock_in,
                'clock_out_time': today_record.clock_out,
                'hours_worked': today_record.hours_worked,
            }
        except AttendanceRecord.DoesNotExist:
            today_status = {
                'clocked_in': False,
                'clocked_out': False,
                'clock_in_time': None,
                'clock_out_time': None,
                'hours_worked': 0,
            }

        return Response({
            'month_summary': {
                'present_days': present_days,
                'absent_days': absent_days,
                'half_days': half_days,
                'leave_days': leave_days,
                'total_hours': round(total_hours, 2),
                'avg_hours_per_day': avg_hours,
            },
            'today': today_status,
            'pending_leaves': pending_leaves,
            'current_month': today.strftime('%B %Y'),
        })


class LeaveRequestView(APIView):
    """
    GET  /api/attendance/leave/     → List your leave requests
    POST /api/attendance/leave/     → Submit new leave request

    This single view handles both reading AND creating.
    DRF routes GET → get() and POST → post() automatically.
    """
    def get(self, request):
        leaves = LeaveRequest.objects.filter(user=request.user)
        serializer = LeaveRequestSerializer(leaves, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LeaveRequestSerializer(data=request.data)

        if serializer.is_valid():
            # perform_create pattern: set the user before saving
            serializer.save(user=request.user)
            return Response({
                'message': 'Leave request submitted!',
                'leave': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LeaveDetailView(APIView):
    """
    GET    /api/attendance/leave/<id>/  → View single leave request
    DELETE /api/attendance/leave/<id>/  → Cancel leave request

    The 'pk' parameter comes from the URL pattern.
    We filter by user too so users can only see their OWN leaves.
    """
    def get(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk, user=request.user)
            serializer = LeaveRequestSerializer(leave)
            return Response(serializer.data)
        except LeaveRequest.DoesNotExist:
            return Response(
                {'error': 'Leave request not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk, user=request.user)
            if leave.status != 'pending':
                return Response(
                    {'error': 'Can only cancel pending requests'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            leave.delete()
            return Response({'message': 'Leave request cancelled'})
        except LeaveRequest.DoesNotExist:
            return Response(
                {'error': 'Leave request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
