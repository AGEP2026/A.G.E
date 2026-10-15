from django.shortcuts import render


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