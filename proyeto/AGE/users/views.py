from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LoginForm
from django.contrib.auth import get_user_model

User = get_user_model()

def login_view(request):

    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')

        else:
            messages.error(
                request,
                'Usuario o contraseña incorrectos.'
            )

    else:
        form = LoginForm()

    return render(request, 'users/login.html', {
        'form': form
    })

# Create your views here.
@login_required
def logout_view(request):

    logout(request)

    messages.success(
        request,
        'Has cerrado sesión exitosamente.'
    )

    return redirect('login')

def register(request):
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        if password != confirm_password:
            messages.error(request, 'Las contraseñas no coinciden.')
            return redirect('register')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'El usuario ya existe')
            return redirect('register')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'El correo ya esta registrado')
            return redirect('register')
        
        User.objects.create_user(username=username, email=email, password=password)
        
        messages.success(request, 'Usuario registrado exitosamente')
        return redirect('login')
    return render(request, 'users/register.html')




    
    