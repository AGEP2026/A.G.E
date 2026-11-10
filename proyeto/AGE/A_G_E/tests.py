import json

from django.test import TestCase
from django.urls import reverse

from .models import CompanyProfile, Invoice, InvoiceItem


class InvoicePersistenceTests(TestCase):
    def setUp(self):
        CompanyProfile.objects.create(
            pk=1,
            nombre='Empresa de prueba',
            rnc='101010101',
            correo='empresa@example.com',
            direccion='Calle Principal 123',
        )

    def invoice_payload(self, tasa='18'):
        return {
            'confirmacion_cotizacion': True,
            'tipo': 'normal',
            'cliente': 'Cliente de prueba',
            'rnc': '202020202',
            'direccion': 'Calle Cliente 456',
            'correo': 'cliente@example.com',
            'comprobante_fiscal': 'B0100000001',
            'metodo_pago': 'efectivo',
            'estado': 'Pendiente',
            'tasa_impuesto': tasa,
            'items': [
                {'producto': 'Artículo A', 'cantidad': 2, 'precio': '50.00'},
            ],
        }

    def test_creates_invoice_and_lines_with_18_percent_tax(self):
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(self.invoice_payload()),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        factura = Invoice.objects.get()
        self.assertEqual(factura.empresa_nombre, 'Empresa de prueba')
        self.assertEqual(factura.subtotal, 100)
        self.assertEqual(factura.impuesto, 18)
        self.assertEqual(factura.total, 118)
        self.assertEqual(InvoiceItem.objects.filter(factura=factura).count(), 1)

    def test_accepts_16_percent_tax_and_persists_invoice_history(self):
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(self.invoice_payload('16')),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Invoice.objects.get().total, 116)
        historial = self.client.get(reverse('facturas_api'))
        self.assertEqual(historial.status_code, 200)
        self.assertEqual(historial.json()['facturas'][0]['numero'], 'F-0001')

    def test_credit_invoice_uses_client_rnc_for_fiscal_receipt(self):
        payload = self.invoice_payload()
        payload['tipo'] = 'credito'
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        factura = Invoice.objects.get()
        self.assertEqual(factura.rnc, '202020202')
        self.assertEqual(factura.comprobante_fiscal, '202020202')

    def test_normal_invoice_uses_company_rnc_for_fiscal_receipt(self):
        payload = self.invoice_payload()
        payload['rnc'] = ''
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        factura = Invoice.objects.get()
        self.assertEqual(factura.rnc, '')
        self.assertEqual(factura.empresa_rnc, '101010101')
        self.assertEqual(factura.comprobante_fiscal, '101010101')

    def test_credit_invoice_requires_client_rnc(self):
        payload = self.invoice_payload()
        payload['tipo'] = 'credito'
        payload['rnc'] = ''
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Invoice.objects.exists())

    def test_invoice_requires_quote_confirmation(self):
        payload = self.invoice_payload()
        payload.pop('confirmacion_cotizacion')
        response = self.client.post(
            reverse('crear_factura_api'),
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Invoice.objects.exists())

    def test_profile_form_saves_company_details(self):
        response = self.client.post(reverse('perfilEmpresa'), {
            'nombre-empresa': 'Empresa actualizada',
            'rnc': '303030303',
            'telefono': '8095550101',
            'email': 'nueva@example.com',
            'direccion': 'Nueva dirección 789',
        })

        self.assertEqual(response.status_code, 302)
        perfil = CompanyProfile.objects.get(pk=1)
        self.assertEqual(perfil.nombre, 'Empresa actualizada')
        self.assertEqual(perfil.correo, 'nueva@example.com')

# Create your tests here.
