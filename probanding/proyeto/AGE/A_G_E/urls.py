from django.urls import path

# Importar desde la ubicación donde está el archivo
from . import views

urlpatterns = [
    path('', views.A_G_E, name='A_G_E'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('recuperarCuenta/', views.recuperarCuenta, name='recuperarCuenta'),
    path('dashboard/', views.dashboard, name='dashboard'),
]