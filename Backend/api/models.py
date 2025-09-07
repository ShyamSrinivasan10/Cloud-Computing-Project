from django.db import models

class Room(models.Model):
    roomNumber = models.CharField(max_length=10, unique=True)
    floor = models.IntegerField()
    capacity = models.IntegerField()
    occupied = models.IntegerField(default=0)
    type = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    lastMaintenance = models.DateField(null=True, blank=True)
    amenities = models.TextField(blank=True)

    def __str__(self):
        return f"Room {self.roomNumber} (Floor {self.floor})"

class Student(models.Model):
    name = models.CharField(max_length=100)
    rollNumber = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    roomNumber = models.CharField(max_length=10, blank=True, null=True)
    course = models.CharField(max_length=100)
    year = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    joinDate = models.DateField()
    feeStatus = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class FeeRecord(models.Model):
    studentName = models.CharField(max_length=100)
    rollNumber = models.CharField(max_length=20)
    roomNumber = models.CharField(max_length=10)
    month = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    dueDate = models.DateField()
    paidDate = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50)
    paymentMethod = models.CharField(max_length=50, null=True, blank=True)
    transactionId = models.CharField(max_length=100, null=True, blank=True)
    lateFee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Fee for {self.studentName} - {self.month}"

class Complaint(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    studentName = models.CharField(max_length=100)
    roomNumber = models.CharField(max_length=10)
    category = models.CharField(max_length=50)
    priority = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='pending')
    dateSubmitted = models.DateField(auto_now_add=True)
    dateResolved = models.DateField(null=True, blank=True)
    assignedTo = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title

class Activity(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.timestamp} - {self.type}'
