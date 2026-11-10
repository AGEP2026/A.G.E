document.addEventListener('DOMContentLoaded', function () {
    const panel = document.querySelector('.panel-estadisticas-produccion');
    const resumenDashboard = document.getElementById('dashboard-ordenes-produccion');
    if (!panel && !resumenDashboard) return;

    const claveOrdenes = 'ordenesProduccionAGE';
    const moneda = new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
    });

    function mostrarError(mensaje) {
        const errorEstadisticas = document.getElementById('estadisticas-produccion-error');
        if (errorEstadisticas) {
            errorEstadisticas.textContent = mensaje;
            errorEstadisticas.hidden = false;
        }
        if (resumenDashboard) {
            let errorDashboard = document.getElementById('dashboard-produccion-error');
            if (!errorDashboard) {
                errorDashboard = document.createElement('p');
                errorDashboard.id = 'dashboard-produccion-error';
                errorDashboard.className = 'error-estadisticas-facturas';
                errorDashboard.setAttribute('role', 'alert');
                document.querySelector('.dashboard-main-content')?.prepend(errorDashboard);
            }
            errorDashboard.textContent = mensaje;
        }
    }

    function cargarOrdenes() {
        try {
            const texto = localStorage.getItem(claveOrdenes);
            if (texto === null) return [];
            const ordenes = JSON.parse(texto);
            if (!Array.isArray(ordenes) || ordenes.some(orden =>
                !orden || typeof orden.estado !== 'string'
                || !Number.isFinite(Number(orden.costoTotal))
            )) {
                throw new Error('Los datos guardados no tienen el formato esperado.');
            }
            return ordenes;
        } catch (error) {
            mostrarError(`No se pudieron cargar las estadísticas de producción: ${error.message}`);
            return null;
        }
    }

    function actualizar() {
        const ordenes = cargarOrdenes();
        if (!ordenes) return;
        const errorEstadisticas = document.getElementById('estadisticas-produccion-error');
        if (errorEstadisticas) errorEstadisticas.hidden = true;
        document.getElementById('dashboard-produccion-error')?.remove();

        const activas = ordenes.filter(orden =>
            orden.estado === 'Pendiente' || orden.estado === 'En proceso'
        );
        const terminadas = ordenes.filter(orden =>
            orden.estado === 'Terminado' || orden.estado === 'Completada'
        );

        const total = document.getElementById('estadisticas-ordenes-total');
        const enProceso = document.getElementById('estadisticas-ordenes-proceso');
        const terminadasElemento = document.getElementById('estadisticas-ordenes-terminadas');
        const costo = document.getElementById('estadisticas-costo-produccion');
        if (total) total.textContent = String(ordenes.length);
        if (enProceso) enProceso.textContent = String(ordenes.filter(orden => orden.estado === 'En proceso').length);
        if (terminadasElemento) terminadasElemento.textContent = String(terminadas.length);
        if (costo) {
            costo.textContent = moneda.format(activas.reduce(
                (suma, orden) => suma + (Number(orden.costoTotal) || 0),
                0
            ));
        }
        if (resumenDashboard) resumenDashboard.textContent = `${activas.length} activas`;
    }

    actualizar();
    window.addEventListener('storage', function (evento) {
        if (evento.key === claveOrdenes) actualizar();
    });
});
