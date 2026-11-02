from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=120)

    USERNAME_FIELD = 'username'

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Role(models.Model):
    PERMISOS = [
        (0, 'No tiene acceso'),
        (1, 'Solo Ver'),
        (2, 'Ver y Editar')
    ]

    rol_nombre = models.CharField(max_length=50, primary_key=True)
    clientes = models.IntegerField(choices=PERMISOS, default=0)
    facturacion = models.IntegerField(choices=PERMISOS, default=0)
    empleados = models.IntegerField(choices=PERMISOS, default=0)
    inventario = models.IntegerField(choices=PERMISOS, default=0)
    produccion = models.IntegerField(choices=PERMISOS, default=0)
    estadisticas = models.IntegerField(choices=PERMISOS, default=0)
    impuestos = models.IntegerField(choices=PERMISOS, default=0)
    empresa = models.IntegerField(choices=PERMISOS, default=0)
    usuarios = models.IntegerField(choices=PERMISOS, default=0)
    respaldos = models.IntegerField(choices=PERMISOS, default=0)
    seguridad = models.IntegerField(choices=PERMISOS, default=0)

    class Meta:
        db_table = 'roles'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return str(self.rol_nombre)

class UserRole(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        unique_together = ('user_id', 'role')

    def __str__(self):
        return f"{self.user_id.username} - {self.role.rol_nombre}" 


