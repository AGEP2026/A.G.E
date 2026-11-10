from django.db import models


class CompanyProfile(models.Model):
    nombre = models.CharField(max_length=150)
    rnc = models.CharField(max_length=20)
    telefono = models.CharField(max_length=30, blank=True)
    correo = models.EmailField()
    direccion = models.CharField(max_length=255)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_profile'

    def __str__(self):
        return self.nombre


class Invoice(models.Model):
    TIPOS = [
        ('normal', 'Factura Normal'),
        ('credito', 'Factura de Crédito Fiscal'),
    ]
    ESTADOS = [
        ('Pendiente', 'Pendiente'),
        ('Pagada', 'Pagada'),
        ('Anulada', 'Anulada'),
    ]

    empresa_nombre = models.CharField(max_length=150)
    empresa_rnc = models.CharField(max_length=20)
    empresa_direccion = models.CharField(max_length=255)
    empresa_correo = models.EmailField()
    tipo = models.CharField(max_length=10, choices=TIPOS, default='normal')
    cliente = models.CharField(max_length=150)
    rnc = models.CharField(max_length=20)
    direccion = models.CharField(max_length=255)
    correo = models.EmailField()
    comprobante_fiscal = models.CharField(max_length=30, blank=True)
    metodo_pago = models.CharField(max_length=30)
    estado = models.CharField(max_length=12, choices=ESTADOS, default='Pendiente')
    tasa_impuesto = models.DecimalField(max_digits=4, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-fecha', '-id']

    @property
    def numero(self):
        return f'F-{self.pk:04d}'

    def __str__(self):
        return self.numero


class InvoiceItem(models.Model):
    factura = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    producto = models.CharField(max_length=150)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    importe = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'invoice_items'

    def __str__(self):
        return f'{self.producto} x {self.cantidad}'
