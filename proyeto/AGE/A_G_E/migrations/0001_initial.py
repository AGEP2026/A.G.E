from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CompanyProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=150)),
                ('rnc', models.CharField(max_length=20)),
                ('telefono', models.CharField(blank=True, max_length=30)),
                ('correo', models.EmailField(max_length=254)),
                ('direccion', models.CharField(max_length=255)),
                ('actualizado', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'company_profile',
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('empresa_nombre', models.CharField(max_length=150)),
                ('empresa_rnc', models.CharField(max_length=20)),
                ('empresa_direccion', models.CharField(max_length=255)),
                ('empresa_correo', models.EmailField(max_length=254)),
                ('tipo', models.CharField(choices=[('normal', 'Factura Normal'), ('credito', 'Factura de Crédito Fiscal')], default='normal', max_length=10)),
                ('cliente', models.CharField(max_length=150)),
                ('rnc', models.CharField(max_length=20)),
                ('direccion', models.CharField(max_length=255)),
                ('correo', models.EmailField(max_length=254)),
                ('comprobante_fiscal', models.CharField(blank=True, max_length=30)),
                ('metodo_pago', models.CharField(max_length=30)),
                ('estado', models.CharField(choices=[('Pendiente', 'Pendiente'), ('Pagada', 'Pagada'), ('Anulada', 'Anulada')], default='Pendiente', max_length=12)),
                ('tasa_impuesto', models.DecimalField(decimal_places=2, max_digits=4)),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=12)),
                ('impuesto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('total', models.DecimalField(decimal_places=2, max_digits=12)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'invoices',
                'ordering': ['-fecha', '-id'],
            },
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('producto', models.CharField(max_length=150)),
                ('cantidad', models.PositiveIntegerField()),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=12)),
                ('importe', models.DecimalField(decimal_places=2, max_digits=12)),
                ('factura', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='A_G_E.invoice')),
            ],
            options={
                'db_table': 'invoice_items',
            },
        ),
    ]
