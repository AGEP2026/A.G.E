from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LoginForm
from django.contrib.auth import get_user_model
import secrets
from datetime import timedelta
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from .models import CodigoRecuperacion

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

        User.objects.create_user(
            username=username, email=email, password=password)

        messages.success(request, 'Usuario registrado exitosamente')
        return redirect('login')
    return render(request, 'users/register.html')

def recuperar_cuenta(request):
    if request.method == 'POST':
        identificador = request.POST.get('email', '').strip()
        usuarios = User.objects.filter(Q(username__iexact=identificador) |Q(email__iexact=identificador)).distinct()
        if usuarios.count() == 1:
            usuario = usuarios.first()
            if usuario.email:
                codigo = str(secrets.randbelow(900000) + 100000)
                CodigoRecuperacion.objects.filter(
                    usuario=usuario,
                    utilizado=False
                ).update(utilizado=True)
                registro = CodigoRecuperacion.objects.create(
                    usuario=usuario,
                    codigo_hash=make_password(codigo),
                    fecha_expiracion=timezone.now() + timedelta(minutes=10)
                )

                try:
                    enviado = send_mail(
                        'Código para recuperar tu cuenta AGE',f'Tu código de recuperación es: {codigo}\n\n''Este código vence en 10 minutos.',
                        None,
                        [usuario.email],
                        fail_silently=False
                    )

                    if enviado:
                        request.session['recuperacion_id'] = registro.id
                        request.session.pop('codigo_verificado', None)

                        messages.success(request,'Código enviado a tu correo electrónico.')
                        return redirect('verificar_codigo')
                except Exception:
                    registro.utilizado = True
                    registro.save()
        messages.error(request, 'No se pudo enviar el código.')
    return render(request, 'A_G_E/recuperarCuenta.html')
def verificar_codigo(request):
    registro_id = request.session.get('recuperacion_id')

    if not registro_id:
        return redirect('recuperar_cuenta')
    try:
        registro = CodigoRecuperacion.objects.get(
            id=registro_id,
            utilizado=False
        )
    except CodigoRecuperacion.DoesNotExist:
        return redirect('recuperar_cuenta')

    if timezone.now() > registro.fecha_expiracion:

        registro.utilizado = True
        registro.save()
        request.session.pop('recuperacion_id', None)
        messages.error(request, 'El código ha caducado.')
        return redirect('recuperar_cuenta')
    if request.method == 'POST':
        codigo = request.POST.get('codigo', '').strip()
        if check_password(codigo, registro.codigo_hash):
            request.session['codigo_verificado'] = True
            return redirect('nueva_contrasena')
        messages.error(request, 'El código es incorrecto.')
    return render(request, 'users/verificar_codigo.html')

def nueva_contrasena(request):
    registro_id = request.session.get('recuperacion_id')
    if not registro_id or not request.session.get('codigo_verificado'):
        return redirect('recuperar_cuenta')
    try:
        registro = CodigoRecuperacion.objects.get(
            id=registro_id,
            utilizado=False
        )
    except CodigoRecuperacion.DoesNotExist:
        return redirect('recuperar_cuenta')
    if timezone.now() > registro.fecha_expiracion:

        registro.utilizado = True
        registro.save()
        request.session.pop('recuperacion_id', None)
        request.session.pop('codigo_verificado', None)
        messages.error(request, 'El código ha caducado.')
        return redirect('recuperar_cuenta')
    if request.method == 'POST':

        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        if password != confirm_password:
            messages.error(request, 'Las contraseñas no coinciden.')
            return render(request, 'users/nueva_contrasena.html')
        try:
            validate_password(password, registro.usuario)

        except ValidationError as errores:
            for error in errores.messages:
                messages.error(request, error)

            return render(request, 'users/nueva_contrasena.html')
        
        registro.usuario.set_password(password)
        registro.usuario.save()
        registro.utilizado = True
        registro.save()
        request.session.pop('recuperacion_id', None)
        request.session.pop('codigo_verificado', None)

        messages.success(
            request,
            'Tu contraseña ha sido cambiada correctamente.'
        )

        return redirect('login')
    return render(request, 'users/nueva_contrasena.html')
