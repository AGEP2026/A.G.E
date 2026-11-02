from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, UserRole

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
# Register your models here.

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('rol_nombre', 'clientes', 'facturacion', 'empleados', 'inventario', 'produccion', 'estadisticas', 'impuestos', 'empresa', 'usuarios', 'respaldos', 'seguridad')
    list_filter = ('clientes', 'facturacion', 'empleados', 'inventario', 'produccion', 'estadisticas', 'impuestos', 'empresa', 'usuarios', 'respaldos', 'seguridad')
    search_fields = ('rol_nombre',)

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'role')
    list_filter = ('role',)
    search_fields = ('user_id__username', 'role__rol_nombre')


