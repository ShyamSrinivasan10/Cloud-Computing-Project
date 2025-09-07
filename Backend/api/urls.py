from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'fee-records', views.FeeRecordViewSet)
router.register(r'complaints', views.ComplaintViewSet)
router.register(r'activities', views.ActivityViewSet, basename='activity')

urlpatterns = [
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('generate-bills/', views.generate_bills, name='generate_bills'),
    path('', include(router.urls)),
]
