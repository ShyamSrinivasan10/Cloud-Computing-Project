from rest_framework import serializers
from .models import Room, Student, FeeRecord, Complaint, Activity

class RoomSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id',
            'roomNumber',
            'floor',
            'capacity',
            'occupied',
            'type',
            'status',
            'rent',
            'lastMaintenance',
            'amenities',
            'students'
        ]

    def get_students(self, obj):
        students_in_room = Student.objects.filter(roomNumber=obj.roomNumber)
        return [student.name for student in students_in_room]

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class FeeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeRecord
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'
