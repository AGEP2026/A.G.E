from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def A_G_E(request):
    return HttpResponse("Hola, participantes del DiCreSoft")

# Para indicar que queremos mostrar una plantilla HTML
def A_G_E(request):
    return render(request, 'A_G_E/index.html')

def login(request):
    return render(request, 'A_G_E/login.html')

def register(request):
    return render(request, 'A_G_E/register.html')

def recuperarCuenta(request):
    return render(request, 'A_G_E/recuperarCuenta.html')

def dashboard(request):
    return render(request, 'A_G_E/dashboard.html')