from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from users.models import UserRole
from django.contrib.auth import logout

def A_G_E(request):
    return render(request, 'A_G_E/index.html')


def login(request):
    return render(request, 'users/login.html')


def register(request):
    return render(request, 'A_G_E/register.html')


def recuperarCuenta(request):
    return render(request, 'A_G_E/recuperarCuenta.html')


@login_required
def dashboard(request):
    return render(request, 'A_G_E/dashboard.html')


def configuracion(request):
    return render(request, 'A_G_E/configuracion.html')


def clientes(request):
    return render(request, 'A_G_E/clientes.html')


def facturacion(request):
    return render(request, 'A_G_E/facturacion.html')


def empleados(request):
    return render(request, 'A_G_E/empleados.html')


def inventario(request):
    return render(request, 'A_G_E/inventario.html')


def produccion(request):
    return render(request, 'A_G_E/produccion.html')


def estadisticas(request):
    return render(request, 'A_G_E/estadisticasGenerales.html')


def notificaciones(request):
    return render(request, 'A_G_E/notificaciones.html')


def perfilEmpresa(request):
    return render(request, 'A_G_E/configPerfilEmpresa.html')


def usuarios(request):
    return render(request, 'A_G_E/configUsuario.html')


def preferencias(request):
    return render(request, 'A_G_E/preferencias.html')


def impuestos(request):
    return render(request, 'A_G_E/configImpuestos.html')


def respaldos(request):
    return render(request, 'A_G_E/configRespaldos.html')


def seguridad(request):
    return render(request, 'A_G_E/configSeguridad.html')


def acercade(request):
    return render(request, 'A_G_E/configAcercaDe.html')


def aclientes(request):
    return render(request, 'A_G_E/aniadirCliente.html')


def verclientes(request):
    return render(request, 'A_G_E/verCliente.html')


def verempleados(request):
    return render(request, 'A_G_E/verEmpleado.html')

def empleados(request):
    return render(request, 'A_G_E/empleados.html')

def afactura(request):
    return render(request, 'A_G_E/agregarFactura.html')

def aempleado(request):
    return render(request, 'A_G_E/agregarEmpleado.html')

def aproducto(request):
    return render(request, 'A_G_E/agregarProducto.html')

def aorden(request):
    return render(request, 'A_G_E/agregarOrden.html')

@login_required
def dashboard_view(request):
    user_roles = UserRole.objects.filter(user_id=request.user)

    permissions = {
        'clientes': 0,
        'facturacion': 0,
        'empleado': 0,
        'inventario': 0,
        'produccion': 0,
        'estadisticas': 0,
        'impuestos': 0,
        'empresa': 0,
        'usuarios': 0,
        'respaldos': 0,
        'seguridad': 0,
    }
    for user_role in user_roles:
        role = user_role.role
        for module in permissions.keys():
            current_permissions = getattr(role,module)
            if current_permissions > permissions[module]:
                permissions[module] = current_permissions
    context = {
        'user': request.user,
        'permissions': permissions,
        'roles': [ur.role.role_name for ur in user_roles],
    }
    return render(request, 'A_G_E/dashboard.html', context)
@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

