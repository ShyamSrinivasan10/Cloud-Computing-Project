from django.http import JsonResponse
from rest_framework import viewsets, status
from .models import Room, Student, FeeRecord, Complaint, Activity
from .serializers import RoomSerializer, StudentSerializer, FeeRecordSerializer, ComplaintSerializer, ActivitySerializer
from django.db.models import Sum, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

# Imports for Custom Login View
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token as AuthToken
from django.db.utils import ProgrammingError, OperationalError

# Restore the CustomAuthToken class
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        try:
            token, created = AuthToken.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email
            })
        except (ProgrammingError, OperationalError):
            return Response(
                {
                    'code': 'AUTHTOKEN_MIGRATIONS_PENDING',
                    'detail': 'Authentication token tables are missing. Run `python manage.py migrate` to create them.',
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

def log_activity(type, description):
    Activity.objects.create(type=type, description=description)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity('room_added', f'New room {instance.roomNumber} was added.')

    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity('room_updated', f'Room {instance.roomNumber} details were updated.')

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity('student_added', f'New student {instance.name} ({instance.rollNumber}) was registered.')

class FeeRecordViewSet(viewsets.ModelViewSet):
    queryset = FeeRecord.objects.all()
    serializer_class = FeeRecordSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'paid':
            log_activity('payment_received', f'Fee payment of ₹{instance.amount} received from {instance.studentName}.')

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity('complaint_filed', f'New complaint filed: "{instance.title}"')

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'resolved':
            log_activity('complaint_resolved', f'Complaint "{instance.title}" has been resolved.')

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.all().order_by('-timestamp')[:10]
    serializer_class = ActivitySerializer

@api_view(['POST'])
def generate_bills(request):
    today = date.today()
    month_year = today.strftime('%B %Y')
    due_date = today + timedelta(days=10)
    active_students = Student.objects.filter(status='active')
    bills_created = 0
    for student in active_students:
        if student.roomNumber and not FeeRecord.objects.filter(rollNumber=student.rollNumber, month=month_year).exists():
            try:
                room = Room.objects.get(roomNumber=student.roomNumber)
                FeeRecord.objects.create(
                    studentName=student.name, rollNumber=student.rollNumber, roomNumber=student.roomNumber,
                    month=month_year, amount=room.rent, dueDate=due_date, status='pending'
                )
                bills_created += 1
            except Room.DoesNotExist:
                pass
    if bills_created > 0:
        log_activity('bills_generated', f'{bills_created} fee bills were generated for {month_year}.')
    return Response({'message': f'{bills_created} bills generated successfully for {month_year}'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def dashboard_stats(request):
    today = date.today()
    current_month_start = today.replace(day=1)
    last_month_end = current_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    def get_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    total_students = Student.objects.count()
    total_rooms = Room.objects.count()
    occupied_rooms = Room.objects.filter(status='occupied').count()
    pending_complaints = Complaint.objects.filter(status='pending').count()
    current_revenue = FeeRecord.objects.filter(paidDate__gte=current_month_start).aggregate(total=Sum('amount'))['total'] or 0

    prev_students = Student.objects.filter(joinDate__lt=current_month_start).count()
    prev_revenue = FeeRecord.objects.filter(paidDate__gte=last_month_start, paidDate__lt=current_month_start).aggregate(total=Sum('amount'))['total'] or 0
    prev_complaints = Complaint.objects.filter(dateSubmitted__lt=current_month_start, status='pending').count()

    data = {
        'totalStudents': {'value': total_students, 'change': get_change(total_students, prev_students)},
        'totalRooms': {'value': total_rooms, 'change': 0},
        'occupiedRooms': {'value': occupied_rooms, 'change': 0},
        'pendingComplaints': {'value': pending_complaints, 'change': get_change(pending_complaints, prev_complaints)},
        'totalRevenue': {'value': current_revenue, 'change': get_change(current_revenue, prev_revenue)},
        'pendingFees': FeeRecord.objects.filter(Q(status='pending') | Q(status='overdue')).count(),
    }
    return Response(data)
