import json
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.db import transaction
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from users.models import UserRole
from django.contrib.auth import logout
from .models import CompanyProfile, Invoice, InvoiceItem

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
    perfil, _ = CompanyProfile.objects.get_or_create(
        pk=1,
        defaults={
            'nombre': '',
            'rnc': '',
            'correo': '',
            'direccion': '',
        },
    )
    if request.method == 'POST':
        perfil.nombre = request.POST.get('nombre-empresa', '').strip()
        perfil.rnc = request.POST.get('rnc', '').strip()
        perfil.telefono = request.POST.get('telefono', '').strip()
        perfil.correo = request.POST.get('email', '').strip()
        perfil.direccion = request.POST.get('direccion', '').strip()
        if not all((perfil.nombre, perfil.rnc, perfil.correo, perfil.direccion)):
            messages.error(request, 'Completa el nombre, RNC, correo y dirección de la empresa.')
        elif (len(perfil.nombre) > 150 or len(perfil.rnc) > 20
                or len(perfil.telefono) > 30 or len(perfil.direccion) > 255
                or len(perfil.correo) > 254):
            messages.error(request, 'Uno o más datos del perfil superan el límite permitido.')
        else:
            try:
                validate_email(perfil.correo)
            except ValidationError:
                messages.error(request, 'Introduce un correo válido para la empresa.')
            else:
                perfil.save()
                messages.success(request, 'Perfil de empresa guardado correctamente.')
                return redirect('perfilEmpresa')
    return render(request, 'A_G_E/configPerfilEmpresa.html', {'perfil': perfil})


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
    return render(request, 'A_G_E/agregarFactura.html', {
        'perfil_empresa': CompanyProfile.objects.filter(pk=1).first(),
    })


def _invoice_json(factura):
    return {
        'id': factura.pk,
        'numero': factura.numero,
        'tipo': factura.tipo,
        'empresa': {
            'nombre': factura.empresa_nombre,
            'rnc': factura.empresa_rnc,
            'direccion': factura.empresa_direccion,
            'correo': factura.empresa_correo,
        },
        'cliente': factura.cliente,
        'rnc': factura.rnc,
        'direccion': factura.direccion,
        'correo': factura.correo,
        'comprobante_fiscal': factura.comprobante_fiscal,
        'metodoPago': factura.metodo_pago,
        'estado': factura.estado,
        'tasa_impuesto': str(factura.tasa_impuesto),
        'subtotal': str(factura.subtotal),
        'impuesto': str(factura.impuesto),
        'iva': str(factura.impuesto),
        'total': str(factura.total),
        'fecha': factura.fecha.date().isoformat(),
        'items': [
            {
                'producto': item.producto,
                'cantidad': item.cantidad,
                'precio': str(item.precio_unitario),
                'total': str(item.importe),
            }
            for item in factura.items.all()
        ],
    }


@require_GET
def facturas_api(request):
    facturas = Invoice.objects.prefetch_related('items').all()
    return JsonResponse({'facturas': [_invoice_json(factura) for factura in facturas]})


@require_POST
def crear_factura_api(request):
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({'error': 'La solicitud no contiene JSON válido.'}, status=400)

    if not isinstance(payload, dict):
        return JsonResponse({'error': 'Los datos de la factura tienen un formato inválido.'}, status=400)

    tipo = payload.get('tipo')
    if not isinstance(tipo, str) or tipo not in {'normal', 'credito'}:
        return JsonResponse({'error': 'Selecciona un tipo de factura válido.'}, status=400)

    required = ('cliente', 'direccion', 'correo', 'metodo_pago')
    values = {key: str(payload.get(key, '')).strip() for key in required}
    values['rnc'] = str(payload.get('rnc', '')).strip()
    if not all(values[key] for key in required):
        return JsonResponse({'error': 'Completa todos los datos del cliente y el método de pago.'}, status=400)
    if tipo == 'credito' and not values['rnc']:
        return JsonResponse({'error': 'El RNC del cliente es obligatorio para la factura de crédito fiscal.'}, status=400)
    if (len(values['cliente']) > 150 or len(values['rnc']) > 20
            or len(values['direccion']) > 255):
        return JsonResponse({'error': 'Uno o más datos del cliente son demasiado largos.'}, status=400)
    if values['metodo_pago'] not in {'tarjeta', 'transferencia', 'efectivo', 'digital'}:
        return JsonResponse({'error': 'Selecciona un método de pago válido.'}, status=400)
    if len(values['correo']) > 254:
        return JsonResponse({'error': 'El correo del cliente es demasiado largo.'}, status=400)
    try:
        validate_email(values['correo'])
    except ValidationError:
        return JsonResponse({'error': 'Introduce un correo válido para el cliente.'}, status=400)
    if payload.get('confirmacion_cotizacion') is not True:
        return JsonResponse({'error': 'Cotiza y confirma los datos antes de generar la factura.'}, status=400)
    try:
        tasa = Decimal(str(payload.get('tasa_impuesto')))
    except (InvalidOperation, TypeError, ValueError):
        return JsonResponse({'error': 'La tasa de impuesto debe ser 16% o 18%.'}, status=400)
    if not tasa.is_finite() or tasa not in {Decimal('16'), Decimal('18')}:
        return JsonResponse({'error': 'La tasa de impuesto debe ser 16% o 18%.'}, status=400)

    items_payload = payload.get('items')
    if not isinstance(items_payload, list) or not items_payload:
        return JsonResponse({'error': 'Agrega al menos un artículo a la factura.'}, status=400)

    items = []
    subtotal = Decimal('0.00')
    try:
        for item in items_payload:
            if not isinstance(item, dict):
                raise ValueError
            nombre = str(item.get('producto', '')).strip()
            cantidad_decimal = Decimal(str(item.get('cantidad')))
            if not cantidad_decimal.is_finite() or cantidad_decimal != cantidad_decimal.to_integral_value():
                raise ValueError
            cantidad = int(cantidad_decimal)
            precio = Decimal(str(item.get('precio')))
            if (not nombre or len(nombre) > 150 or cantidad < 1 or cantidad > 2147483647
                    or precio < 0 or not precio.is_finite() or precio > Decimal('9999999999.99')):
                raise ValueError
            importe = (precio * cantidad).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            items.append((nombre, cantidad, precio.quantize(Decimal('0.01')), importe))
            subtotal += importe
            if subtotal > Decimal('9999999999.99'):
                raise ValueError
    except (InvalidOperation, TypeError, ValueError, OverflowError):
        return JsonResponse({'error': 'Revisa los nombres, cantidades y precios de los artículos.'}, status=400)

    perfil = CompanyProfile.objects.filter(pk=1).first()
    if not perfil or not all((perfil.nombre, perfil.rnc, perfil.correo, perfil.direccion)):
        return JsonResponse({'error': 'Primero completa y guarda el perfil de la empresa.'}, status=400)
    comprobante_fiscal = values['rnc'] if tipo == 'credito' else perfil.rnc

    subtotal = subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    impuesto = (subtotal * tasa / Decimal('100')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total = subtotal + impuesto
    estado = payload.get('estado', 'Pendiente')
    if not isinstance(estado, str) or estado not in {'Pendiente', 'Pagada'}:
        return JsonResponse({'error': 'Selecciona un estado de pago válido.'}, status=400)

    with transaction.atomic():
        factura = Invoice.objects.create(
            empresa_nombre=perfil.nombre,
            empresa_rnc=perfil.rnc,
            empresa_direccion=perfil.direccion,
            empresa_correo=perfil.correo,
            tipo=payload['tipo'],
            cliente=values['cliente'],
            rnc=values['rnc'],
            direccion=values['direccion'],
            correo=values['correo'],
            comprobante_fiscal=comprobante_fiscal,
            metodo_pago=values['metodo_pago'],
            estado=estado,
            tasa_impuesto=tasa,
            subtotal=subtotal,
            impuesto=impuesto,
            total=total,
        )
        InvoiceItem.objects.bulk_create([
            InvoiceItem(
                factura=factura,
                producto=nombre,
                cantidad=cantidad,
                precio_unitario=precio,
                importe=importe,
            )
            for nombre, cantidad, precio, importe in items
        ])

    factura = Invoice.objects.prefetch_related('items').get(pk=factura.pk)
    return JsonResponse({'factura': _invoice_json(factura)}, status=201)


@require_http_methods(['PATCH', 'DELETE'])
def factura_api_detalle(request, factura_id):
    factura = get_object_or_404(Invoice, pk=factura_id)
    if request.method == 'DELETE':
        factura.delete()
        return JsonResponse({'ok': True})

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({'error': 'La solicitud no contiene JSON válido.'}, status=400)
    estado = payload.get('estado') if isinstance(payload, dict) else None
    if not isinstance(estado, str) or estado not in {'Pendiente', 'Pagada', 'Anulada'}:
        return JsonResponse({'error': 'El estado de factura no es válido.'}, status=400)
    factura.estado = estado
    factura.save(update_fields=['estado'])
    return JsonResponse({'factura': _invoice_json(factura)})

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