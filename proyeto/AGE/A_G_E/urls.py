from django.urls import path

from . import view as views

urlpatterns = [
    path('', views.A_G_E, name='A_G_E'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('recuperarCuenta/', views.recuperarCuenta, name='recuperarCuenta'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('configuracion/', views.configuracion, name='configuracion'),
    path('clientes/', views.clientes, name='clientes'),
    path('facturacion/', views.facturacion, name='facturacion'),
    path('empleados/', views.empleados, name='empleados'),
    path('inventario/', views.inventario, name='inventario'),
    path('produccion/', views.produccion, name='produccion'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
    path('notificaciones/', views.notificaciones, name='notificaciones'),
    path('perfilEmpresa/', views.perfilEmpresa, name='perfilEmpresa'),
    path('usuarios/', views.usuarios, name='usuarios'),
    path('preferencias/', views.preferencias, name='preferencias'),
    path('impuestos/', views.impuestos, name='impuestos'),
    path('respaldos/', views.respaldos, name='respaldos'),
    path('seguridad/', views.seguridad, name='seguridad'),
    path('acercade/', views.acercade, name='acercade'),
    path('aclientes/', views.aclientes, name='aclientes'),
    path('verclientes/', views.verclientes, name='verclientes'),
    path('verempleados/', views.verempleados, name='verempleados'),
    path('empleados/', views.empleados, name='empleados'),
    path('afactura/', views.afactura, name='agregar_factura'),
    path('aempleado/', views.aempleado, name='aempleado'),
    path('aproducto/', views.aproducto, name='aproducto'),
    path('aorden/', views.aorden, name='agregar_orden'),
]