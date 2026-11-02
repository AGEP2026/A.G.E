from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LoginForm


def login_view(request):

    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':

        print("LOGIN: POST RECIBIDO")

        form = LoginForm(request, data=request.POST)

        if form.is_valid():

            print("LOGIN: FORMULARIO VALIDO")

            user = form.get_user()

            print("LOGIN: USUARIO:", user.username)

            login(request, user)

            return redirect('dashboard')

        else:

            print("LOGIN: FORMULARIO INVALIDO")
            print("ERRORES:", form.errors)

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