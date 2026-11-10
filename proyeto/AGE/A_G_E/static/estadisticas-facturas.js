document.addEventListener('DOMContentLoaded', async function () {
    const pagina = document.querySelector('[data-facturas-url]');
    if (!pagina) return;

    try {
        const respuesta = await fetch(pagina.dataset.facturasUrl);
        if (!respuesta.ok) throw new Error('No se pudieron cargar las estadísticas de facturación.');
        const datos = await respuesta.json();
        if (!Array.isArray(datos.facturas)) {
            throw new Error('La respuesta de facturación no tiene el formato esperado.');
        }

        const facturas = datos.facturas.filter(factura => factura.estado !== 'Anulada');
        window.facturasPersistidas = facturas;
        window.dispatchEvent(new CustomEvent('facturasDbActualizadas', {
            detail: { facturas }
        }));

        const totalMes = document.getElementById('dashboard-facturas-mes');
        if (totalMes) {
            const hoy = new Date();
            const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
            const ventasMes = facturas
                .filter(factura => factura.fecha.startsWith(mesActual))
                .reduce((total, factura) => total + Number(factura.total || 0), 0);
            totalMes.textContent = new Intl.NumberFormat('es-DO', {
                style: 'currency',
                currency: 'DOP'
            }).format(ventasMes);
        }
    } catch (error) {
        const estado = document.createElement('p');
        estado.className = 'error-estadisticas-facturas';
        estado.setAttribute('role', 'alert');
        estado.textContent = error.message;
        pagina.prepend(estado);
    }
});
