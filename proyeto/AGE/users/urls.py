from django.urls import path
from . import views
from A_G_E import view as views

urlpatterns = [
    path('login/', views.login, name='login'),
]