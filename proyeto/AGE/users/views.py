from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LoginForm
from .models import UserRole, Role

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == "post":
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request,user)
                return redirect('dashboard')
            else: 
                messages.error(request, 'Usuario o contrasenia invalido.')
    else:
        form = LoginForm()
    return render(request, 'A_G_E/login.html', {'form': form})

@login_required
def logout_view(request):
    logout(request)
    messages.success(request, 'Has cerrado sesion exitosamente')
    return redirect ('login')

# Create your views here.
