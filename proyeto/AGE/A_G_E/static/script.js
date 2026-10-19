
// ESTOS SON LOS SCRIPTS DEL LOGIN, REGISTRO Y RECUPERACION DE CONTRASEÑA, SOLO COMPRUEBAN QUE SE INTRODUJERON DATOS
// Y TAMBIEN GUARDAN EL NOMBRE DEL USUARIO EN EL LOCALSTORAGE PARA MOSTRARLO EN EL DASHBOARD
document.addEventListener('DOMContentLoaded', function () {
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	const recoveryForm = document.getElementById('recovery-form');
	const usuarioDashboard = document.getElementById('usuario-dashboard');
	const historialBody = document.getElementById('historial-body');

	if (loginForm) {
		loginForm.addEventListener('submit', function () {
			const usuario = document.getElementById('nombre').value.trim();
			localStorage.setItem('usuario', usuario);
		});
	}

	if (registerForm) {
		registerForm.addEventListener('submit', function (event) {
			const password = document.getElementById('pass').value;
			const confirmPassword = document.getElementById('confirm_pass').value;

			if (password !== confirmPassword) {
				event.preventDefault();
				alert('Las contraseñas no coinciden.');
				return;
			}

			localStorage.setItem('usuario', document.getElementById('nombre').value.trim());
		});
	}
// ESTOS SON LOS SCRIPTS PARA EL FORMULARIO DE RECUPERACION DE CONTRASEÑA, SIMULAN EL ENVIO DE UN CODIGO AL CORREO DEL USUARIO Y MUESTRAN MENSAJES DE ESTADO
	if (recoveryForm) {
		const emailInput = document.getElementById('email');
		const sendCodeButton = document.getElementById('send-code');
		const resendCodeLink = document.getElementById('resend-code');
		const codeStep = document.getElementById('code-step');
		const recoveryStatus = document.getElementById('recovery-status');

		const sendCode = function (event) {
			if (event) {
				event.preventDefault();
			}

			if (!emailInput.value.trim()) {
				emailInput.reportValidity();
				return;
			}

			codeStep.hidden = false;
			recoveryStatus.hidden = false;
			recoveryStatus.textContent = 'Código enviado. Revisa tu correo para continuar.';
			sendCodeButton.textContent = 'Código enviado';
			sendCodeButton.disabled = true;
		};

		sendCodeButton.addEventListener('click', sendCode);
		resendCodeLink.addEventListener('click', function (event) {
			sendCode(event);
			sendCodeButton.disabled = false;
			sendCodeButton.textContent = 'Enviar código nuevamente';
		});
	}

	if (usuarioDashboard) {
		const usuarioGuardado = localStorage.getItem('usuario');
		if (usuarioGuardado) {
			usuarioDashboard.textContent = usuarioGuardado;
		}
	}
// ESTOS SON LOS SCRIPTS PARA FILTRAR LAS TABLAS DE HISTORIAL DE FACTURAS Y ORDENES DE PRODUCCION
	if (historialBody) {
		const searchInput = document.getElementById('buscar-factura');
		const statusSelect = document.getElementById('estado-factura');
		const noResults = document.getElementById('sin-resultados');

		const filterInvoices = function () {
			const search = searchInput.value.toLowerCase().trim();
			const status = statusSelect.value;
			let visibleRows = 0;

			historialBody.querySelectorAll('tr').forEach(function (row) {
				const matchesSearch = row.textContent.toLowerCase().includes(search);
				const matchesStatus = !status || row.dataset.estado === status;
				row.hidden = !matchesSearch || !matchesStatus;
				if (!row.hidden) visibleRows += 1;
			});

			noResults.hidden = visibleRows !== 0;
		};

		searchInput.addEventListener('input', filterInvoices);
		statusSelect.addEventListener('change', filterInvoices);
	}
});
// --------------------------------------------- FACTURACION ---------------------------------------------------------------------
// FACTURACION: crea facturas, calcula sus totales y las conserva en el navegador.
document.addEventListener('DOMContentLoaded', function () {
    const FACTURAS_KEY = 'facturasAGE';
    const IVA = 0.16;
    // Formato monetario de República Dominicana.
    const formatoPesos = new Intl.NumberFormat('es-DO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const formatoMoneda = {
        format: valor => `RD$ ${formatoPesos.format(valor)}`
    };

    function leerFacturas() {
        try {
            return JSON.parse(localStorage.getItem(FACTURAS_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function guardarFacturas(facturas) {
        localStorage.setItem(FACTURAS_KEY, JSON.stringify(facturas));
    }

    function obtenerFechaActual() {
        const fecha = new Date();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${fecha.getFullYear()}-${mes}-${dia}`;
    }

    function actualizarResumen(facturas) {
        // Actualiza las tarjetas superiores con los datos almacenados.
        const emitidas = document.getElementById('resumen-emitidas');
        const pendientes = document.getElementById('resumen-pendientes');
        const total = document.getElementById('resumen-total');

        if (!emitidas || !pendientes || !total) return;

        emitidas.textContent = facturas.length;
        pendientes.textContent = facturas.filter(factura => factura.estado === 'Pendiente').length;
        total.textContent = formatoMoneda.format(
            facturas
                .filter(factura => factura.estado !== 'Anulada')
                .reduce((suma, factura) => suma + factura.total, 0)
        );
    }

    function mostrarFacturas() {
        // Dibuja el historial aplicando los filtros de búsqueda, estado y fecha.
        const cuerpo = document.getElementById('historial-body');
        if (!cuerpo) return;

        const facturas = leerFacturas();
        const busqueda = (document.getElementById('buscar-factura')?.value || '').toLowerCase().trim();
        const estado = document.getElementById('estado-factura')?.value || '';
        const desde = document.getElementById('fecha-factura')?.value || '';
        const sinResultados = document.getElementById('sin-resultados');

        cuerpo.textContent = '';
        const filtradas = facturas.filter(factura => {
            const coincideTexto = `${factura.numero} ${factura.cliente} ${factura.rnc}`
                .toLowerCase().includes(busqueda);
            const coincideEstado = !estado || factura.estado === estado;
            const coincideFecha = !desde || factura.fecha >= desde;
            return coincideTexto && coincideEstado && coincideFecha;
        });

        filtradas.forEach(factura => {
            const fila = document.createElement('tr');
            fila.dataset.estado = factura.estado;
            fila.dataset.id = factura.id;
            const accionEstado = factura.estado === 'Anulada'
                ? ''
                : `<a href="#" data-accion="cambiar-estado" title="Marcar como ${factura.estado === 'Pagada' ? 'Pendiente' : 'Pagada'}" aria-label="Marcar como ${factura.estado === 'Pagada' ? 'Pendiente' : 'Pagada'}"><i class="fa-solid fa-circle-check"></i></a>`;
            fila.innerHTML = `
                <td>${factura.numero}</td>
                <td>${factura.cliente}</td>
                <td>${new Date(`${factura.fecha}T00:00:00`).toLocaleDateString('es-DO')}</td>
                <td>${formatoMoneda.format(factura.total)}</td>
                <td><span class="estado estado-${factura.estado.toLowerCase()}">${factura.estado}</span></td>
                <td>
                    <a href="#" data-accion="ver" title="Ver factura"><i class="fa-regular fa-eye eye"></i></a>
                    ${accionEstado}
                    <a href="#" data-accion="eliminar" title="Eliminar factura"><i class="fa-regular fa-trash-can falista"></i></a>
                </td>`;
            cuerpo.appendChild(fila);
        });

        if (sinResultados) sinResultados.hidden = filtradas.length !== 0;
        actualizarResumen(facturas);
    }

    const historialBody = document.getElementById('historial-body');
    if (historialBody) {
        // Los eventos se registran solo cuando estamos en la página de facturación.
        mostrarFacturas();

        ['buscar-factura', 'estado-factura', 'fecha-factura'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', mostrarFacturas);
            document.getElementById(id)?.addEventListener('change', mostrarFacturas);
        });

        historialBody.addEventListener('click', function (event) {
            const enlace = event.target.closest('[data-accion]');
            if (!enlace) return;

            event.preventDefault();
            const fila = enlace.closest('tr');
            const id = fila?.dataset.id;
            const factura = leerFacturas().find(item => item.id === id);
            if (!factura) return;

            if (enlace.dataset.accion === 'eliminar') {
                if (confirm(`¿Eliminar la factura ${factura.numero}?`)) {
                    guardarFacturas(leerFacturas().filter(item => item.id !== id));
                    registrarNotificacion('facturacion', 'Factura eliminada', `Se eliminó la factura ${factura.numero}.`, 'fa-trash-can');
                    mostrarFacturas();
                }
                return;
            }

            if (enlace.dataset.accion === 'cambiar-estado') {
                if (factura.estado === 'Pendiente' || factura.estado === 'Pagada') {
                    factura.estado = factura.estado === 'Pagada' ? 'Pendiente' : 'Pagada';
                    const facturas = leerFacturas().map(item => item.id === id ? factura : item);
                    guardarFacturas(facturas);
                    registrarNotificacion(
                        'facturacion',
                        'Estado de factura actualizado',
                        `La factura ${factura.numero} ahora está ${factura.estado.toLowerCase()}.`
                    );
                    mostrarFacturas();
                }
                return;
            }

            alert(`Factura ${factura.numero}\nCliente: ${factura.cliente}\nTotal: ${formatoMoneda.format(factura.total)}`);
        });
    }

    document.getElementById('compartir-facturas')?.addEventListener('click', async function () {
        const facturas = leerFacturas();
        if (!facturas.length) {
            alert('No hay facturas para compartir.');
            return;
        }
        const resumen = facturas.map(factura =>
            `${factura.numero} | ${factura.cliente} | ${factura.fecha} | ${factura.estado} | ${formatoMoneda.format(Number(factura.total) || 0)}`
        ).join('\n');
        const texto = `Resumen de facturas (${facturas.length})\n${resumen}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Resumen de facturas', text: texto });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(texto);
                alert('Resumen de facturas copiado al portapapeles.');
            } else {
                alert('Este navegador no permite compartir ni copiar el resumen.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                alert(`No se pudo compartir el resumen: ${error.message}`);
            }
        }
    });

    document.getElementById('imprimir-facturas')?.addEventListener('click', function () {
        const facturas = leerFacturas();
        if (!facturas.length) {
            alert('No hay facturas para generar el PDF.');
            return;
        }
        if (!window.jspdf) {
            alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        const anchoPagina = documento.internal.pageSize.getWidth();
        const altoPagina = documento.internal.pageSize.getHeight();
        const margen = 16;
        const anchoTexto = anchoPagina - margen * 2;
        let posicionY = 20;

        function asegurarEspacio(altura) {
            if (posicionY + altura > altoPagina - margen) {
                documento.addPage();
                posicionY = margen;
            }
        }

        function escribirLinea(texto, opciones = {}) {
            const lineas = documento.splitTextToSize(String(texto), anchoTexto);
            asegurarEspacio(lineas.length * 5 + 2);
            documento.text(lineas, margen, posicionY);
            posicionY += lineas.length * 5 + (opciones.espacio || 2);
        }

        documento.setFont('helvetica', 'bold');
        documento.setFontSize(18);
        escribirLinea('REPORTE DE FACTURAS', { espacio: 3 });
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(10);
        escribirLinea(`Generado: ${new Date().toLocaleString('es-DO')}`);
        escribirLinea(`Facturas incluidas: ${facturas.length}`);
        escribirLinea(`Total no anulado: ${formatoMoneda.format(facturas
            .filter(factura => factura.estado !== 'Anulada')
            .reduce((suma, factura) => suma + (Number(factura.total) || 0), 0))}`, { espacio: 5 });

        facturas.forEach((factura, indice) => {
            asegurarEspacio(30);
            documento.setDrawColor(190);
            documento.line(margen, posicionY, anchoPagina - margen, posicionY);
            posicionY += 6;
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(12);
            escribirLinea(`${factura.numero} - ${factura.estado}`, { espacio: 2 });
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(10);
            escribirLinea(`Cliente: ${factura.cliente} | RNC: ${factura.rnc}`);
            escribirLinea(`Fecha: ${factura.fecha} | Método de pago: ${factura.metodoPago || 'No especificado'}`);
            (factura.items || []).forEach(item => {
                escribirLinea(`- ${item.producto} x${item.cantidad}: ${formatoMoneda.format(Number(item.total) || 0)}`);
            });
            documento.setFont('helvetica', 'bold');
            escribirLinea(`Total: ${formatoMoneda.format(Number(factura.total) || 0)}`, { espacio: 4 });
            documento.setFont('helvetica', 'normal');
            if (indice < facturas.length - 1) posicionY += 2;
        });

        documento.save('reporte-facturas-age.pdf');
    });

    document.getElementById('exportar-facturas')?.addEventListener('click', function () {
        const facturas = leerFacturas();
        if (!facturas.length) {
            alert('No hay facturas para exportar.');
            return;
        }

        const archivo = new Blob([JSON.stringify(facturas, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'facturas-age.json';
        enlace.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        registrarNotificacion('facturacion', 'Facturas exportadas', `Se exportaron ${facturas.length} facturas.`, 'fa-download');
    });

    const entradaImportarFacturas = document.getElementById('importar-facturas');
    entradaImportarFacturas?.addEventListener('change', function () {
        const archivo = entradaImportarFacturas.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function () {
            try {
                const importadas = JSON.parse(lector.result);
                const estadosValidos = ['Pagada', 'Pendiente', 'Anulada'];
                if (!Array.isArray(importadas) || importadas.some(factura =>
                    !factura || typeof factura.id !== 'string' || typeof factura.numero !== 'string'
                    || typeof factura.cliente !== 'string' || typeof factura.rnc !== 'string'
                    || !estadosValidos.includes(factura.estado)
                    || !Number.isFinite(Number(factura.total))
                    || !Array.isArray(factura.items)
                )) {
                    throw new Error('El archivo no tiene el formato de facturas esperado.');
                }

                if (!confirm(`Se importarán ${importadas.length} facturas. Las facturas con el mismo ID se actualizarán. ¿Continuar?`)) return;
                const actuales = leerFacturas();
                importadas.forEach(factura => {
                    const indice = actuales.findIndex(actual => actual.id === factura.id);
                    if (indice >= 0) actuales[indice] = factura;
                    else actuales.push(factura);
                });
                guardarFacturas(actuales);
                registrarNotificacion('facturacion', 'Facturas importadas', `Se importaron ${importadas.length} facturas.`, 'fa-upload');
                mostrarFacturas();
                alert('Facturas importadas correctamente.');
            } catch (error) {
                alert(`No se pudieron importar las facturas: ${error.message}`);
            } finally {
                entradaImportarFacturas.value = '';
            }
        };
        lector.onerror = function () {
            entradaImportarFacturas.value = '';
            alert('No se pudo leer el archivo seleccionado.');
        };
        lector.readAsText(archivo);
    });

    const botonAgregar = document.getElementById('fact-agregar-item');
    if (!botonAgregar) return;

    const items = [];
    const tipoFactura = document.getElementById('tipo-factura');
    const producto = document.getElementById('fact-producto');
    const productoManual = document.getElementById('fact-producto-manual');
    const cantidad = document.getElementById('fact-cantidad');
    const precio = document.getElementById('fact-precio');
    let ultimaFactura = null;
    const itemsContenedor = document.getElementById('factura-items');
    const interesContenedor = document.getElementById('interes-container');
    const tasaInteres = document.getElementById('tasa-interes');

    function cargarProductos() {
        // El inventario todavía no es obligatorio; si existe un catálogo, se carga aquí.
        let productos = [];
        try {
            productos = JSON.parse(localStorage.getItem('productosAGE')) || [];
        } catch (error) {
            productos = [];
        }

        productos.forEach(item => {
            const nombre = item.nombre || item.name;
            if (!nombre) return;
            const opcion = document.createElement('option');
            opcion.value = nombre;
            opcion.textContent = nombre;
            opcion.dataset.precio = item.precio || item.price || '';
            producto.appendChild(opcion);
        });
    }

    function actualizarTotales() {
        // Una factura vacía mantiene todos sus importes en cero.
        const subtotal = items.reduce((suma, item) => suma + item.total, 0);
        const iva = subtotal * IVA;
        const interes = tipoFactura.value === 'credito' ? subtotal * (Number(tasaInteres.value) || 0) / 100 : 0;

        document.getElementById('fact-subtotal').textContent = formatoMoneda.format(subtotal);
        document.getElementById('fact-iva').textContent = formatoMoneda.format(iva);
        document.getElementById('fact-interes').textContent = formatoMoneda.format(interes);
        document.getElementById('fact-total').textContent = formatoMoneda.format(subtotal + iva + interes);
        interesContenedor.style.display = tipoFactura.value === 'credito' ? 'block' : 'none';
    }

    function mostrarItems() {
        // Muestra los productos agregados o un mensaje cuando aún no hay ninguno.
        itemsContenedor.textContent = '';
        if (!items.length) {
            itemsContenedor.textContent = 'Sin productos aún';
            actualizarTotales();
            return;
        }

        items.forEach((item, indice) => {
            const fila = document.createElement('div');
            fila.className = 'item-factura';
            fila.textContent = `${item.producto} x${item.cantidad} - ${formatoMoneda.format(item.total)}`;

            const eliminar = document.createElement('button');
            eliminar.type = 'button';
            eliminar.textContent = 'Eliminar';
            eliminar.addEventListener('click', function () {
                items.splice(indice, 1);
                mostrarItems();
            });
            fila.appendChild(eliminar);
            itemsContenedor.appendChild(fila);
        });
        actualizarTotales();
    }

    function limpiarFactura() {
        items.length = 0;
        document.getElementById('cliente-nombre').value = '';
        document.getElementById('cliente-rfc').value = '';
        document.getElementById('fact-metodo-pago').value = '';
        document.getElementById('fact-estado').value = 'Pendiente';
        cantidad.value = '';
        precio.value = '';
        productoManual.value = '';
        mostrarItems();
        document.querySelector('.factura-preview').textContent = 'La factura aparecerá aquí';
    }

    cargarProductos();
    producto.addEventListener('change', function () {
        if (producto.selectedOptions[0]?.dataset.precio) precio.value = producto.selectedOptions[0].dataset.precio;
    });
    tipoFactura.addEventListener('change', actualizarTotales);
    tasaInteres.addEventListener('input', actualizarTotales);

    botonAgregar.addEventListener('click', function (event) {
        // Los productos son opcionales por ahora, pero los que se agreguen deben ser válidos.
        event.preventDefault();
        const nombreProducto = productoManual.value.trim() || producto.value.trim();
        const cantidadProducto = Number(cantidad.value);
        const precioProducto = Number(precio.value);

        if (!nombreProducto || cantidadProducto < 1 || precioProducto < 0 || !precio.value) {
            alert('Selecciona un producto e indica una cantidad y un precio válidos.');
            return;
        }

        items.push({ producto: nombreProducto, cantidad: cantidadProducto, precio: precioProducto, total: cantidadProducto * precioProducto });
        producto.value = '';
        productoManual.value = '';
        cantidad.value = '';
        precio.value = '';
        mostrarItems();
    });

    document.getElementById('fact-limpiar').addEventListener('click', function (event) {
        event.preventDefault();
        limpiarFactura();
    });

    document.getElementById('fact-generar').addEventListener('click', function (event) {
        event.preventDefault();
        const cliente = document.getElementById('cliente-nombre').value.trim();
        const rnc = document.getElementById('cliente-rfc').value.trim();
        const metodoPago = document.getElementById('fact-metodo-pago').value;
        const estado = document.getElementById('fact-estado').value;

        // Por ahora se permite guardar la factura sin productos del inventario.
        if (!cliente || !rnc || !metodoPago) {
            alert('Completa los datos del cliente y selecciona un método de pago.');
            return;
        }

        const subtotal = items.reduce((suma, item) => suma + item.total, 0);
        const iva = subtotal * IVA;
        const interes = tipoFactura.value === 'credito' ? subtotal * (Number(tasaInteres.value) || 0) / 100 : 0;
        const facturas = leerFacturas();
        const siguienteNumero = facturas.reduce((mayor, factura) => Math.max(mayor, Number(factura.numero.replace('F-', '')) || 0), 0) + 1;
        const factura = {
            id: `FAC-${Date.now()}`,
            numero: `F-${String(siguienteNumero).padStart(4, '0')}`,
            tipo: tipoFactura.value,
            cliente,
            rnc,
            metodoPago,
            fecha: obtenerFechaActual(),
            estado,
            tasaInteres: Number(tasaInteres.value) || 0,
            items: [...items],
            subtotal,
            iva,
            interes,
            total: subtotal + iva + interes
        };

        // Conserva la última factura para que pueda descargarse como PDF.
        ultimaFactura = factura;
        guardarFacturas([factura, ...facturas]);
        registrarNotificacion('facturacion', 'Factura creada', `Se creó la factura ${factura.numero} para ${factura.cliente}.`);
        alert(`Factura ${factura.numero} guardada correctamente.`);
        limpiarFactura();
        document.querySelector('.factura-preview').textContent = `Factura ${factura.numero} creada para ${factura.cliente}. Total: ${formatoMoneda.format(factura.total)}`;
    });

    document.getElementById('fact-imprimir').addEventListener('click', function (event) {
        event.preventDefault();

        // jsPDF crea el archivo directamente sin abrir el diálogo de impresión.
        if (!ultimaFactura) {
            ultimaFactura = leerFacturas()[0] || null;
        }

        if (!ultimaFactura) {
            alert('Primero debes generar una factura.');
            return;
        }

        if (!window.jspdf) {
            alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        const factura = ultimaFactura;

        documento.setFontSize(20);
        documento.text('FACTURA', 20, 25);
        documento.setFontSize(11);
        documento.text(`Número: ${factura.numero}`, 20, 38);
        documento.text(`Fecha: ${new Date(`${factura.fecha}T00:00:00`).toLocaleDateString('es-DO')}`, 20, 46);
        documento.text(`Cliente: ${factura.cliente}`, 20, 58);
        documento.text(`RNC: ${factura.rnc}`, 20, 66);

        let posicionY = 82;
        documento.setFont('helvetica', 'bold');
        documento.text('Producto', 20, posicionY);
        documento.text('Cantidad', 115, posicionY);
        documento.text('Total', 160, posicionY);
        documento.setFont('helvetica', 'normal');
        posicionY += 10;

        factura.items.forEach(item => {
            documento.text(String(item.producto), 20, posicionY);
            documento.text(String(item.cantidad), 115, posicionY);
            documento.text(formatoMoneda.format(item.total), 160, posicionY);
            posicionY += 8;
        });

        posicionY += 8;
        documento.text(`Subtotal: ${formatoMoneda.format(factura.subtotal)}`, 125, posicionY);
        documento.text(`IVA: ${formatoMoneda.format(factura.iva)}`, 125, posicionY + 8);
        documento.text(`Interés: ${formatoMoneda.format(factura.interes)}`, 125, posicionY + 16);
        documento.setFont('helvetica', 'bold');
        documento.text(`TOTAL: ${formatoMoneda.format(factura.total)}`, 125, posicionY + 28);
        documento.save(`factura-${factura.numero}.pdf`);
    });

    mostrarItems();
});
// --------------------------------------------- FACTURACION ---------------------------------------------------------------------
// --------------------------------------------- ORDENES DE PRODUCCION ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const ORDENES_KEY = 'ordenesProduccionAGE';
    const historial = document.getElementById('historial-produccion-body');
    const productos = [];
    const formatoMoneda = new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
    });

    function leerOrdenes() {
        try {
            const guardadas = JSON.parse(localStorage.getItem(ORDENES_KEY)) || [];
            return Array.isArray(guardadas) ? guardadas : [];
        } catch (error) {
            return [];
        }
    }

    function guardarOrdenes(ordenes) {
        localStorage.setItem(ORDENES_KEY, JSON.stringify(ordenes));
    }

    function obtenerFechaActual() {
        const fecha = new Date();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${fecha.getFullYear()}-${mes}-${dia}`;
    }

    function actualizarResumen(ordenes) {
        const total = document.getElementById('resumen-ordenes');
        const pendientes = document.getElementById('resumen-ordenes-pendientes');
        const costo = document.getElementById('resumen-costo-produccion');
        if (!total || !pendientes || !costo) return;

        total.textContent = String(ordenes.length);
        pendientes.textContent = String(ordenes.filter(orden =>
            orden.estado === 'Pendiente' || orden.estado === 'En proceso'
        ).length);
        costo.textContent = formatoMoneda.format(ordenes
            .filter(orden => orden.estado !== 'Anulada')
            .reduce((suma, orden) => suma + (Number(orden.costoTotal) || 0), 0));
    }

    function mostrarOrdenes() {
        if (!historial) return;
        const ordenes = leerOrdenes();
        const busqueda = (document.getElementById('buscar-orden')?.value || '').toLowerCase().trim();
        const estado = document.getElementById('estado-orden')?.value || '';
        const fecha = document.getElementById('fecha-orden')?.value || '';
        const sinResultados = document.getElementById('sin-resultados-produccion');
        const filtradas = ordenes.filter(orden => {
            const productosOrden = (orden.items || []).map(item => item.producto).join(' ');
            return `${orden.numero} ${orden.responsable} ${productosOrden}`.toLowerCase().includes(busqueda)
                && (!estado || orden.estado === estado)
                && (!fecha || orden.fecha >= fecha);
        });

        historial.textContent = '';
        filtradas.forEach(orden => {
            const fila = document.createElement('tr');
            fila.dataset.id = orden.id;
            fila.dataset.estado = orden.estado;

            const celdas = [
                orden.numero,
                (orden.items || []).map(item => `${item.producto} (x${item.cantidad})`).join(', '),
                orden.fecha ? new Date(`${orden.fecha}T00:00:00`).toLocaleDateString('es-DO') : '',
                orden.responsable,
                formatoMoneda.format(Number(orden.costoTotal) || 0)
            ];
            celdas.forEach(valor => {
                const celda = document.createElement('td');
                celda.textContent = valor || '';
                fila.appendChild(celda);
            });

            const estadoCelda = document.createElement('td');
            const etiqueta = document.createElement('span');
            const claseEstado = {
                'Pendiente': 'estado-pendiente',
                'En proceso': 'estado-proceso',
                'Completada': 'estado-completada',
                'Anulada': 'estado-anulada'
            }[orden.estado] || 'estado-pendiente';
            etiqueta.className = `estado ${claseEstado}`;
            etiqueta.textContent = orden.estado;
            estadoCelda.appendChild(etiqueta);
            fila.appendChild(estadoCelda);

            const acciones = document.createElement('td');
            const siguientesAcciones = [
                ['ver', 'Ver orden', 'fa-regular fa-eye'],
                ['cambiar-estado', 'Avanzar estado', 'fa-solid fa-circle-check'],
                ['pdf', 'Descargar orden en PDF', 'fa-regular fa-file-pdf'],
                ['eliminar', 'Eliminar orden', 'fa-regular fa-trash-can']
            ];
            siguientesAcciones.forEach(([accion, titulo, icono]) => {
                if (accion === 'cambiar-estado' && orden.estado === 'Anulada') return;
                const enlace = document.createElement('a');
                enlace.href = '#';
                enlace.dataset.accion = accion;
                enlace.title = titulo;
                enlace.setAttribute('aria-label', titulo);
                const elementoIcono = document.createElement('i');
                elementoIcono.className = icono;
                enlace.appendChild(elementoIcono);
                acciones.appendChild(enlace);
            });
            fila.appendChild(acciones);
            historial.appendChild(fila);
        });

        if (sinResultados) sinResultados.hidden = filtradas.length !== 0;
        actualizarResumen(ordenes);
    }

    function descargarPDF(orden) {
        if (!window.jspdf) {
            alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        documento.setFontSize(20);
        documento.text('ORDEN DE PRODUCCION', 20, 25);
        documento.setFontSize(11);
        documento.text(`Numero: ${orden.numero}`, 20, 38);
        documento.text(`Fecha: ${new Date(`${orden.fecha}T00:00:00`).toLocaleDateString('es-DO')}`, 20, 46);
        documento.text(`Responsable: ${orden.responsable}`, 20, 54);
        documento.text(`Estado: ${orden.estado}`, 20, 62);
        let posicionY = 78;
        documento.setFont('helvetica', 'bold');
        documento.text('Producto', 20, posicionY);
        documento.text('Cantidad', 100, posicionY);
        documento.text('Horas', 130, posicionY);
        documento.text('Costo', 160, posicionY);
        documento.setFont('helvetica', 'normal');
        posicionY += 9;
        (orden.items || []).forEach(item => {
            if (posicionY > 270) {
                documento.addPage();
                posicionY = 20;
            }
            documento.text(String(item.producto).slice(0, 38), 20, posicionY);
            documento.text(String(item.cantidad), 100, posicionY);
            documento.text(String(item.horas), 130, posicionY);
            documento.text(formatoMoneda.format(item.total), 160, posicionY);
            posicionY += 8;
        });
        documento.setFont('helvetica', 'bold');
        documento.text(`Horas estimadas: ${orden.horasTotal}`, 110, posicionY + 8);
        documento.text(`Costo total: ${formatoMoneda.format(orden.costoTotal)}`, 110, posicionY + 16);
        documento.save(`orden-${orden.numero}.pdf`);
    }

    function descargarReportePDF(ordenes) {
        if (!window.jspdf) {
            alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet.');
            return;
        }
        if (!ordenes.length) {
            alert('No hay órdenes para generar el PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        documento.setFontSize(18);
        documento.text('ORDENES DE PRODUCCION', 20, 22);
        documento.setFontSize(10);
        let posicionY = 34;
        ordenes.forEach((orden, indice) => {
            if (posicionY > 265) {
                documento.addPage();
                posicionY = 20;
            }
            const productosOrden = (orden.items || []).map(item =>
                `${item.producto} x${item.cantidad}`
            ).join(', ');
            documento.setFont('helvetica', 'bold');
            documento.text(`${orden.numero} - ${orden.estado}`, 20, posicionY);
            documento.setFont('helvetica', 'normal');
            documento.text(`Fecha: ${orden.fecha} | Responsable: ${orden.responsable}`, 20, posicionY + 6);
            documento.text(`Productos: ${productosOrden}`.slice(0, 110), 20, posicionY + 12);
            documento.text(
                `Horas: ${orden.horasTotal} | Costo: ${formatoMoneda.format(Number(orden.costoTotal) || 0)}`,
                20,
                posicionY + 18
            );
            posicionY += 28;
            if (indice < ordenes.length - 1) posicionY += 2;
        });
        documento.save('ordenes-produccion-age.pdf');
    }

    if (historial) {
        mostrarOrdenes();
        ['buscar-orden', 'estado-orden', 'fecha-orden'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', mostrarOrdenes);
            document.getElementById(id)?.addEventListener('change', mostrarOrdenes);
        });

        historial.addEventListener('click', function (event) {
            const enlace = event.target.closest('[data-accion]');
            if (!enlace) return;
            event.preventDefault();
            const fila = enlace.closest('tr');
            const orden = leerOrdenes().find(item => item.id === fila?.dataset.id);
            if (!orden) return;

            if (enlace.dataset.accion === 'ver') {
                const detalle = (orden.items || []).map(item =>
                    `${item.producto} x${item.cantidad} — ${item.horas} h — ${formatoMoneda.format(item.total)}`
                ).join('\n');
                alert(`Orden ${orden.numero}\nResponsable: ${orden.responsable}\nEstado: ${orden.estado}\n\n${detalle}\n\nCosto estimado: ${formatoMoneda.format(orden.costoTotal)}`);
                return;
            }
            if (enlace.dataset.accion === 'pdf') {
                descargarPDF(orden);
                return;
            }
            if (enlace.dataset.accion === 'eliminar') {
                if (!confirm(`¿Eliminar la orden ${orden.numero}? Esta acción no se puede deshacer.`)) return;
                guardarOrdenes(leerOrdenes().filter(item => item.id !== orden.id));
                registrarNotificacion('produccion', 'Orden eliminada', `Se eliminó la orden ${orden.numero}.`, 'fa-trash-can');
                mostrarOrdenes();
                return;
            }
            if (enlace.dataset.accion === 'cambiar-estado') {
                const estados = ['Pendiente', 'En proceso', 'Completada'];
                orden.estado = estados[(estados.indexOf(orden.estado) + 1) % estados.length];
                guardarOrdenes(leerOrdenes().map(item => item.id === orden.id ? orden : item));
                registrarNotificacion('produccion', 'Estado de orden actualizado', `La orden ${orden.numero} ahora está ${orden.estado.toLowerCase()}.`);
                mostrarOrdenes();
            }
        });
    }

    const botonPDF = document.getElementById('pdf-ordenes');
    botonPDF?.addEventListener('click', () => descargarReportePDF(leerOrdenes()));

    const botonExportar = document.getElementById('exportar-ordenes');
    botonExportar?.addEventListener('click', function () {
        const archivo = new Blob([JSON.stringify(leerOrdenes(), null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'ordenes-produccion-age.json';
        enlace.click();
        URL.revokeObjectURL(url);
        registrarNotificacion('produccion', 'Órdenes exportadas', 'Se exportaron las órdenes de producción.', 'fa-download');
    });

    const entradaImportar = document.getElementById('importar-ordenes');
    entradaImportar?.addEventListener('change', function () {
        const archivo = entradaImportar.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function () {
            try {
                const importadas = JSON.parse(lector.result);
                const estadosValidos = ['Pendiente', 'En proceso', 'Completada', 'Anulada'];
                if (!Array.isArray(importadas) || importadas.some(orden =>
                    !orden || typeof orden.id !== 'string' || typeof orden.numero !== 'string'
                    || typeof orden.responsable !== 'string' || !Array.isArray(orden.items)
                    || !estadosValidos.includes(orden.estado)
                    || !Number.isFinite(Number(orden.costoTotal))
                    || !orden.items.every(item => item && typeof item.producto === 'string'
                        && Number.isFinite(Number(item.cantidad))
                        && Number.isFinite(Number(item.total)))
                )) {
                    throw new Error('El archivo no tiene el formato de órdenes esperado.');
                }

                if (!confirm(`Se importarán ${importadas.length} órdenes. Las órdenes con el mismo ID se actualizarán. ¿Continuar?`)) return;
                const actuales = leerOrdenes();
                importadas.forEach(orden => {
                    const indice = actuales.findIndex(actual => actual.id === orden.id);
                    if (indice >= 0) actuales[indice] = orden;
                    else actuales.push(orden);
                });
                guardarOrdenes(actuales);
                registrarNotificacion('produccion', 'Órdenes importadas', `Se importaron ${importadas.length} órdenes de producción.`, 'fa-upload');
                mostrarOrdenes();
                alert('Órdenes importadas correctamente.');
            } catch (error) {
                alert(`No se pudieron importar las órdenes: ${error.message}`);
            } finally {
                entradaImportar.value = '';
            }
        };
        lector.onerror = function () {
            entradaImportar.value = '';
            alert('No se pudo leer el archivo seleccionado.');
        };
        lector.readAsText(archivo);
    });

    const botonGuardar = document.getElementById('guardar-ordenes');
    botonGuardar?.addEventListener('click', function () {
        try {
            guardarOrdenes(leerOrdenes());
            alert('Órdenes guardadas correctamente en este navegador.');
        } catch (error) {
            alert(`No se pudieron guardar las órdenes: ${error.message}`);
        }
    });

    const botonAgregar = document.getElementById('orden-agregar-item');
    if (!botonAgregar) return;

    const entradas = {
        responsable: document.getElementById('orden-responsable'),
        producto: document.getElementById('orden-producto'),
        cantidad: document.getElementById('orden-cantidad'),
        costo: document.getElementById('orden-costo-unitario'),
        horas: document.getElementById('orden-horas'),
        estado: document.getElementById('orden-estado')
    };
    const listaItems = document.getElementById('orden-items');
    let ultimaOrden = null;

    function mostrarItems() {
        listaItems.textContent = '';
        if (!productos.length) {
            listaItems.textContent = 'Agrega al menos un producto';
        } else {
            productos.forEach((item, indice) => {
                const fila = document.createElement('div');
                fila.className = 'item-factura';
                fila.textContent = `${item.producto} x${item.cantidad} — ${item.horas} h — ${formatoMoneda.format(item.total)}`;
                const quitar = document.createElement('button');
                quitar.type = 'button';
                quitar.textContent = 'Quitar';
                quitar.addEventListener('click', function () {
                    productos.splice(indice, 1);
                    mostrarItems();
                });
                fila.appendChild(quitar);
                listaItems.appendChild(fila);
            });
        }
        document.getElementById('orden-total-horas').textContent = String(
            productos.reduce((suma, item) => suma + item.horas, 0)
        );
        document.getElementById('orden-total-costo').textContent = formatoMoneda.format(
            productos.reduce((suma, item) => suma + item.total, 0)
        );
    }

    function limpiarFormulario(limpiarPreview) {
        productos.length = 0;
        entradas.responsable.value = '';
        entradas.producto.value = '';
        entradas.cantidad.value = '';
        entradas.costo.value = '';
        entradas.horas.value = '';
        entradas.estado.value = 'Pendiente';
        mostrarItems();
        if (limpiarPreview) {
            document.getElementById('orden-preview').textContent = 'La orden aparecerá aquí después de crearla.';
        }
    }

    botonAgregar.addEventListener('click', function (event) {
        event.preventDefault();
        const producto = entradas.producto.value.trim();
        const cantidad = Number(entradas.cantidad.value);
        const costo = Number(entradas.costo.value);
        const horas = Number(entradas.horas.value) || 0;
        if (!producto || !Number.isInteger(cantidad) || cantidad < 1
            || entradas.costo.value === '' || !Number.isFinite(costo) || costo < 0
            || !Number.isFinite(horas) || horas < 0) {
            alert('Indica un producto, una cantidad válida y un costo estimado válido.');
            return;
        }
        productos.push({ producto, cantidad, costoUnitario: costo, horas, total: cantidad * costo });
        entradas.producto.value = '';
        entradas.cantidad.value = '';
        entradas.costo.value = '';
        entradas.horas.value = '';
        mostrarItems();
    });

    document.getElementById('orden-limpiar').addEventListener('click', function (event) {
        event.preventDefault();
        limpiarFormulario(true);
    });

    document.getElementById('orden-generar').addEventListener('click', function (event) {
        event.preventDefault();
        const responsable = entradas.responsable.value.trim();
        if (!responsable || !productos.length) {
            alert('Indica el responsable y agrega al menos un producto a la orden.');
            return;
        }

        const ordenes = leerOrdenes();
        const numeroSiguiente = ordenes.reduce((mayor, orden) => {
            const numero = Number(String(orden.numero).replace('OP-', '')) || 0;
            return Math.max(mayor, numero);
        }, 0) + 1;
        const orden = {
            id: `OP-${Date.now()}`,
            numero: `OP-${String(numeroSiguiente).padStart(4, '0')}`,
            fecha: obtenerFechaActual(),
            responsable,
            estado: entradas.estado.value,
            items: [...productos],
            horasTotal: productos.reduce((suma, item) => suma + item.horas, 0),
            costoTotal: productos.reduce((suma, item) => suma + item.total, 0)
        };
        ultimaOrden = orden;
        guardarOrdenes([orden, ...ordenes]);
        registrarNotificacion('produccion', 'Orden de producción creada', `Se creó la orden ${orden.numero}.`, 'fa-gears');
        document.getElementById('orden-preview').textContent =
            `Orden ${orden.numero} creada. Costo estimado: ${formatoMoneda.format(orden.costoTotal)}.`;
        alert(`Orden ${orden.numero} creada correctamente.`);
        limpiarFormulario(false);
    });

    document.getElementById('orden-pdf').addEventListener('click', function (event) {
        event.preventDefault();
        if (!ultimaOrden) ultimaOrden = leerOrdenes()[0] || null;
        if (!ultimaOrden) {
            alert('Primero debes crear una orden de producción.');
            return;
        }
        descargarPDF(ultimaOrden);
    });

    mostrarItems();
});
// --------------------------------------------- PRODUCCION ---------------------------------------------------------------------
// Script para el nav
function abri() {
    const toggleBtn = document.getElementById('toggleBtn');
    const iconoBtn = toggleBtn.querySelector('i');
    const navlateral = document.getElementById('navlateral');
    
    toggleBtn.addEventListener('click', () => {
        navlateral.classList.toggle('open');
        
        if (navlateral.classList.contains('open')) {
            iconoBtn.style.color = '#000';
        } else {
            iconoBtn.style.color = '#fff';
        }
    });
} 
function abri2() {
  const toggleBtn = document.getElementById("toggleBtn2");
  const iconoBtn = toggleBtn.querySelector("i");
  const navConfig = document.getElementById("nav-Config");

  toggleBtn.addEventListener("click", () => {
    navConfig.classList.toggle("open");

    if (navConfig.classList.contains("open")) {
      iconoBtn.style.color = "#000";
    } else {
      iconoBtn.style.color = "#000";
    }
  });
} 


/*
A.G.E. - USUARIO

Por ahora se guarda un solo usuario en localStorage y ademas por ahora solo
se guarda el registro pero el inicio de seccion no.
*/


document.addEventListener("DOMContentLoaded", function () {
    // REGISTRO
    // Guarda los datos ingresados en register.html.

    const registro = document.getElementById("register-form");

    if (registro) {

        registro.addEventListener("submit", function (e) {

            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("email").value.trim();
            const password = document.getElementById("pass").value;
            const confirmar = document.getElementById("confirm_pass").value;

            if (password !== confirmar) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const fecha = new Date();

            const usuario = {
                id: "USR-0001",
                nombre: nombre,
                correo: correo,
                password: password,
                fechaCreacion: fecha.toLocaleDateString(),
                ultimoInicio: fecha.toLocaleString()
            };

            localStorage.setItem("usuarioAGE", JSON.stringify(usuario));

            localStorage.setItem("sesionAGE", "activa");

            window.location.href = document.body.dataset.dashboardUrl;
        });
    }

// CONFIGURACIÓN DE USUARIO
    // Coloca en configUsuario.html los datos del usuario
    // registrado y permite modificar nombre y correo.

    const campoNombre = document.getElementById("nombre-usuario");
    const campoCorreo = document.getElementById("correo");
    const campoFecha = document.getElementById("fecha-creacion");
    const campoInicio = document.getElementById("ultimo-inicio-sesion");
    const campoId = document.getElementById("id-usuario");

    if (
        campoNombre &&
        campoCorreo &&
        campoFecha &&
        campoInicio &&
        campoId
    ) {

        const usuario = JSON.parse(
            localStorage.getItem("usuarioAGE")
        );

         if (!usuario) {
             window.location.href = document.body.dataset.loginUrl;
             return;
         }

        campoNombre.value = usuario.nombre;
        campoCorreo.value = usuario.correo;
        campoFecha.value = usuario.fechaCreacion;
        campoInicio.value = usuario.ultimoInicio;
        campoId.value = usuario.id;

        const formulario = campoNombre.closest("form");

        formulario.addEventListener("submit", function (e) {

            e.preventDefault();

            usuario.nombre = campoNombre.value.trim();
            usuario.correo = campoCorreo.value.trim();

            localStorage.setItem(
                "usuarioAGE",
                JSON.stringify(usuario)
            );

            alert("Datos actualizados correctamente.");
        });
    }

});

// PERFIL DE EMPRESA
// Se encarga de poner los datos de configPerfildeEmpresa automaticamente en agregarFactura por ahora solo en RNC
// Hasta que el encargado de esa parte modifique los campos asi ya agrego los campos que faltan 
document.addEventListener("DOMContentLoaded", function () {

    const rncPerfil = document.getElementById("rnc");
    const rncFactura = document.getElementById("cliente-rfc");

    const empresa = JSON.parse(localStorage.getItem("empresaAGE")) || {};

    // Perfil de empresa
    if (rncPerfil) {

        rncPerfil.value = empresa.rnc || "";

        rncPerfil.closest("form").addEventListener("submit", function (e) {
            e.preventDefault();

            empresa.rnc = rncPerfil.value.trim();

            localStorage.setItem(
                "empresaAGE",
                JSON.stringify(empresa)
            );

            alert("Datos guardados correctamente.");
        });
    }

    // Agregar factura
    if (rncFactura) {
        rncFactura.value = empresa.rnc || "";
    }

});


// --------------------------------------------- NOTIFICACIONES -----------------------------------------------------------------
// Aqui se guardan y muestran las notificaciones
const NOTIFICACIONES_KEY = 'notificacionesAGE';

// Busca las notificaciones guardadas
function leerNotificaciones() {
    try {
        const notificaciones = JSON.parse(localStorage.getItem(NOTIFICACIONES_KEY)) || [];
        return Array.isArray(notificaciones) ? notificaciones : [];
    } catch (error) {
        return [];
    }
}

// Guarda una notificacion nueva y actualiza la campana
function registrarNotificacion(categoria, titulo, descripcion, icono) {
    const notificaciones = leerNotificaciones();
    notificaciones.unshift({
        id: `NOT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        categoria,
        titulo,
        descripcion,
        icono,
        fecha: new Date().toISOString(),
        leida: false
    });
    localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(notificaciones.slice(0, 100)));
    actualizarIndicadorNotificaciones();
}

// Muestra un punto en la campana si hay notificaciones sin leer
function actualizarIndicadorNotificaciones() {
    const sinLeer = leerNotificaciones().filter(notificacion => !notificacion.leida).length;
    document.querySelectorAll('a[href="notificaciones.html"]').forEach(enlace => {
        let indicador = enlace.querySelector('[data-indicador-notificacion]');
        if (!indicador) {
            indicador = document.createElement('span');
            indicador.dataset.indicadorNotificacion = 'true';
            indicador.setAttribute('aria-hidden', 'true');
            indicador.style.cssText = 'position:absolute;top:0;right:0;width:9px;height:9px;border-radius:50%;background:#ef4444;border:1px solid #fff;';
            enlace.style.position = 'relative';
            enlace.appendChild(indicador);
        }
        indicador.style.display = sinLeer ? 'block' : 'none';
        enlace.setAttribute('aria-label', sinLeer ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones');
    });
}

// Muestra hace cuanto llego la notificacion
function textoTiempoNotificacion(fecha) {
    const minutos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    return new Date(fecha).toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' });
}

// Muestra las notificaciones de hoy, ayer y dias anteriores
function mostrarNotificaciones() {
    const grupos = [
        document.querySelector('.tarjeta-grupo-hoy'),
        document.querySelector('.tarjeta-grupo-ayer'),
        document.querySelector('.tarjeta-grupo-semana')
    ];
    if (grupos.some(grupo => !grupo)) return;

    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
    const inicioAyer = inicioHoy - 86400000;
    const metadatos = {
        inventario: { nombre: 'Inventario', avatar: 'icono-naranja', etiqueta: 'categoria-naranja', icono: 'fa-boxes-stacked' },
        empleados: { nombre: 'Empleados', avatar: 'icono-azul', etiqueta: 'categoria-azul', icono: 'fa-user-plus' },
        clientes: { nombre: 'Clientes', avatar: 'icono-azul', etiqueta: 'categoria-azul', icono: 'fa-user-plus' },
        facturacion: { nombre: 'Facturación', avatar: 'icono-verde', etiqueta: 'categoria-verde', icono: 'fa-file-lines' },
        produccion: { nombre: 'Producción', avatar: 'icono-naranja', etiqueta: 'categoria-naranja', icono: 'fa-gears' },
        estadisticas: { nombre: 'Estadísticas', avatar: 'icono-azul', etiqueta: 'categoria-azul', icono: 'fa-chart-line' }
    };

    // Quita las tarjetas viejas antes de mostrar las actuales
    grupos.forEach(grupo => grupo.querySelectorAll('.item-notificacion').forEach(item => item.remove()));
    const notificaciones = leerNotificaciones();

    // Crea una tarjeta para cada notificacion y la pone en el grupo que corresponde
    notificaciones.forEach(notificacion => {
        const fecha = new Date(notificacion.fecha);
        const grupo = fecha.getTime() >= inicioHoy ? grupos[0] : fecha.getTime() >= inicioAyer ? grupos[1] : grupos[2];
        const datos = metadatos[notificacion.categoria] || metadatos.estadisticas;
        const tarjeta = document.createElement('div');
        tarjeta.className = `item-notificacion ${notificacion.leida ? 'leido' : 'no-leido'}`;
        tarjeta.dataset.categoria = notificacion.categoria;

        const indicadorIzquierdo = document.createElement('div');
        indicadorIzquierdo.className = `indicador-izquierdo${notificacion.leida ? ' transparente' : ''}`;
        const avatar = document.createElement('div');
        avatar.className = `icono-avatar ${datos.avatar}`;
        const icono = document.createElement('i');
        icono.className = `fa-solid ${notificacion.icono || datos.icono}`;
        avatar.appendChild(icono);

        const contenido = document.createElement('div');
        contenido.className = 'contenido-notificacion';
        const titulo = document.createElement('h4');
        titulo.textContent = notificacion.titulo;
        const descripcion = document.createElement('p');
        descripcion.textContent = notificacion.descripcion;
        contenido.append(titulo, descripcion);

        const etiqueta = document.createElement('span');
        etiqueta.className = `etiqueta-categoria ${datos.etiqueta}`;
        etiqueta.textContent = datos.nombre;
        const tiempo = document.createElement('span');
        tiempo.className = 'tiempo-notificacion';
        tiempo.textContent = textoTiempoNotificacion(notificacion.fecha);
        const indicadorDerecho = document.createElement('div');
        indicadorDerecho.className = `indicador-derecho${notificacion.leida ? ' leido' : ''}`;

        tarjeta.append(indicadorIzquierdo, avatar, contenido, etiqueta, tiempo, indicadorDerecho);
        grupo.appendChild(tarjeta);
    });

    // Actualiza los números y aplica los filtros
    grupos.forEach(grupo => {
        grupo.querySelector('.contador-grupo').textContent = grupo.querySelectorAll('.item-notificacion').length;
    });
    aplicarFiltrosNotificaciones();
}

// Filtra las notificaciones por categoria y por texto
function aplicarFiltrosNotificaciones() {
    const categoria = document.querySelector('.desplegable-filtro select')?.value || '';
    const busqueda = document.querySelector('.buscador-nf input')?.value.toLowerCase().trim() || '';
    document.querySelectorAll('.contenedor-grupos .item-notificacion').forEach(item => {
        const coincideCategoria = !categoria || item.dataset.categoria === categoria;
        const coincideTexto = item.textContent.toLowerCase().includes(busqueda);
        item.style.display = coincideCategoria && coincideTexto ? 'grid' : 'none';
    });
}

// Marca todas las notificaciones como leidas
function marcarTodoLeido() {
    const notificaciones = leerNotificaciones().map(notificacion => ({ ...notificacion, leida: true }));
    localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(notificaciones));
    mostrarNotificaciones();
    actualizarIndicadorNotificaciones();
}

// Prepara la campana, los filtros y la lista al abrir la página
document.addEventListener('DOMContentLoaded', function () {
    actualizarIndicadorNotificaciones();
    mostrarNotificaciones();

    document.querySelector('.desplegable-filtro select')?.addEventListener('change', aplicarFiltrosNotificaciones);
    document.querySelector('.buscador-nf input')?.addEventListener('input', aplicarFiltrosNotificaciones);
    window.addEventListener('storage', function (event) {
        if (event.key === NOTIFICACIONES_KEY) {
            actualizarIndicadorNotificaciones();
            mostrarNotificaciones();
        }
    });
});


// Buscar clientes.
document.addEventListener("DOMContentLoaded", function () {
    const buscadorClientes = document.getElementById("buscador-clientes1");
    const cuerpoTabla = document.getElementById("clientes-body");
    if (!cuerpoTabla) return;

    let clientes = [];
    try {
        const guardados = JSON.parse(localStorage.getItem("clientes")) || [];
        clientes = Array.isArray(guardados) ? guardados : [];
    } catch (error) {
        clientes = [];
    }

    function mostrarClientes() {
        const texto = buscadorClientes?.value.toLowerCase().trim() || "";
        cuerpoTabla.textContent = "";
        clientes.filter(cliente => `${cliente.nombre} ${cliente.telefono} ${cliente.ubicacion}`.toLowerCase().includes(texto))
            .forEach(cliente => {
                const fila = document.createElement("tr");
                [cliente.nombre, cliente.telefono, cliente.ubicacion].forEach(valor => {
                    const celda = document.createElement("th");
                    celda.textContent = valor || "";
                    fila.appendChild(celda);
                });

                const celdaAcciones = document.createElement("th");
                const botonVer = document.createElement("button");
                botonVer.className = "btn-ver";
                const enlaceVer = document.createElement("a");
                enlaceVer.href = `${document.body.dataset.verClienteUrl}?id=${encodeURIComponent(cliente.id || "")}`;
                const iconoVer = document.createElement("i");
                iconoVer.className = "fa-regular fa-eye eye";
                enlaceVer.appendChild(iconoVer);
                botonVer.appendChild(enlaceVer);
                celdaAcciones.appendChild(botonVer);
                fila.appendChild(celdaAcciones);
                cuerpoTabla.appendChild(fila);
            });
    }

    buscadorClientes?.addEventListener("input", mostrarClientes);
    mostrarClientes();
});


// Anadir empleado 

document.addEventListener("DOMContentLoaded", function () {

    const formularioEmpleado = document.getElementById("form-empleado");

    if (!formularioEmpleado) return;

    formularioEmpleado.addEventListener("submit", function (event) {
        event.preventDefault();

        // Obtener los datos del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const identificacion = document.getElementById("Identificacion").value.trim();
        const area = document.getElementById("area").value;
        const horario = document.getElementById("Horario").value;
        const descripcion = document.getElementById("Descripcion-cliente").value.trim();

        // Validar campos principales
        if (nombre === "" || telefono === "" || correo === "") {
            alert("Completa los campos obligatorios");
            return;
        }

        // Obtener empleados guardados
        let empleados = [];
        try {
            const guardados = JSON.parse(localStorage.getItemById("empleados")) || [];
            empleados = Array.isArray(guardados) ? guardados : [];
        } catch (error) {
            empleados = [];
        }

        // Crear nuevo empleado
        const nuevoEmpleado = {
            id: `EMP-${Date.now()}`,
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            identificacion: identificacion,
            area: area,
            horario: horario,
            descripcion: descripcion,
            estado: "Activo"
        };

        // Agregar empleado al array
        empleados.push(nuevoEmpleado);

        // Guardar nuevamente
        localStorage.setItem("empleados", JSON.stringify(empleados));

        alert("Empleado agregado correctamente");

        // Ir a la página de empleados
        window.location.href = document.body.dataset.empleadosUrl;
    });

});

// Anadir Clientes
document.addEventListener("DOMContentLoaded", function () {

    const formularioCliente = document.getElementById("form-cliente");

    if (!formularioCliente) return;

    formularioCliente.addEventListener("submit", function (event) {
        event.preventDefault();

        // Obtener los datos del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const ubi = document.getElementById("ubi").value.trim();
        const fecharegistro = document.getElementById("fecharegistro").value.trim();


        // Validar campos principales
        if (nombre === "" || telefono === "" || correo === "" || fecharegistro === "") {
            alert("Completa los campos obligatorios");
            return;
        }

        // Obtener clientes guardados
        let clientes = [];
        try {
            const guardados = JSON.parse(localStorage.getItem("clientes")) || [];
            clientes = Array.isArray(guardados) ? guardados : [];
        } catch (error) {
            clientes = [];
        }

        // Crear nuevo cliente
        const nuevoCliente = {
            id: `CLI-${Date.now()}`,
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            ubicacion: ubi,
            fechaRegistro: fecharegistro,
        };

        // Agregar cliente al array
        clientes.push(nuevoCliente);

        // Guardar nuevamente
        localStorage.setItem("clientes", JSON.stringify(clientes));
        registrarNotificacion("clientes", "Cliente agregado", `${nombre} fue agregado al sistema.`);

        alert("Cliente agregado correctamente");

        // Ir a la página de clientes
        window.location.href = document.body.dataset.clientesUrl;
    });

});

// Muestra la ficha seleccionada y permite eliminar ese cliente de los registros.
document.addEventListener("DOMContentLoaded", function () {
    const botonEliminar = document.getElementById("eliminarclientebtn");
    if (!botonEliminar) return;

    const esEmpleado = document.body.dataset.registroTipo === "empleado";
    const claveRegistros = esEmpleado ? "empleados" : "clientes";
    const categoriaRegistro = esEmpleado ? "empleados" : "clientes";
    const tipoRegistro = esEmpleado ? "empleado" : "cliente";
    const registroId = new URLSearchParams(window.location.search).get("id");
    let registros = [];
    try {
        const guardados = JSON.parse(localStorage.getItem(claveRegistros)) || [];
        registros = Array.isArray(guardados) ? guardados : [];
    } catch (error) {
        registros = [];
    }

    const registro = registros.find(item => item.id === registroId);
    if (!registro) {
        botonEliminar.disabled = true;
        alert(`No se encontró el ${tipoRegistro} seleccionado.`);
        window.location.href = document.body.dataset.listaUrl;
        return;
    }

    document.getElementById("nombre").value = registro.nombre || "";
    document.getElementById("telefono").value = registro.telefono || "";
    document.getElementById("correo").value = registro.correo || "";
    if (esEmpleado) {
        document.getElementById("Identificacion").value = registro.identificacion || "";
        document.getElementById("area").value = registro.area || "";
        document.getElementById("Horario").value = registro.horario || "";
    } else {
        document.getElementById("ubi").value = registro.ubicacion || "";
        document.getElementById("fecharegistro").value = registro.fechaRegistro || "";
    }
    document.getElementById("Descripcion-cliente").value = registro.descripcion || "";

    // Evita que el boton borre el formulario antes de confirmar la accion
    botonEliminar.type = "button";
    botonEliminar.addEventListener("click", function () {
        if (!confirm(`¿Eliminar al ${tipoRegistro} ${registro.nombre}? Esta acción no se puede deshacer.`)) return;
        localStorage.setItem(claveRegistros, JSON.stringify(registros.filter(item => item.id !== registroId)));
        registrarNotificacion(categoriaRegistro, `${tipoRegistro[0].toUpperCase()}${tipoRegistro.slice(1)} eliminado`, `${registro.nombre} fue eliminado del sistema.`, "fa-trash-can");
        window.location.href = document.body.dataset.listaUrl;
    });
});

// El panel de estadísticas se calcula a partir de los mismos registros guardados.
document.addEventListener("DOMContentLoaded", function () {
    const ventas = document.getElementById("estadisticas-ventas-totales");
    const pedidos = document.getElementById("estadisticas-pedidos");
    const clientesNuevos = document.getElementById("estadisticas-clientes-nuevos");
    const clientesTotales = document.getElementById("estadisticas-clientes-totales");
    const clientesActivos = document.getElementById("estadisticas-clientes-activos");
    const clientesPanelNuevos = document.getElementById("estadisticas-panel-clientes-nuevos");
    const clientesInactivos = document.getElementById("estadisticas-clientes-inactivos");
    const rangosTarjetas = [
        document.getElementById("estadisticas-ventas-rango"),
        document.getElementById("estadisticas-ganancias-rango"),
        document.getElementById("estadisticas-pedidos-rango"),
        document.getElementById("estadisticas-clientes-rango")
    ];
    if (!ventas && !pedidos && !clientesNuevos && !clientesTotales) return;

    function leerLista(clave) {
        try {
            const datos = JSON.parse(localStorage.getItem(clave)) || [];
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            return [];
        }
    }

    function fechaDesdePeriodo(periodo) {
        const hoy = new Date();
        const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
        if (periodo === "dia") return fechaLocal;
        if (periodo === "semana") {
            const diaSemana = (hoy.getDay() + 6) % 7;
            hoy.setDate(hoy.getDate() - diaSemana);
        } else if (periodo === "mes") {
            hoy.setDate(1);
        } else {
            hoy.setMonth(0, 1);
        }
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
    }

    function obtenerRangosMensuales() {
        const hoy = new Date();
        const inicioActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const inicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
        const finAnterior = new Date(inicioAnterior.getFullYear(), inicioAnterior.getMonth(), Math.min(hoy.getDate(), ultimoDiaMesAnterior));
        const aFechaISO = fecha => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
        const formatoFecha = fecha => fecha.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
        const fechaFinalActual = formatoFecha(hoy);
        const fechaFinalAnterior = formatoFecha(finAnterior);
        return {
            actualDesde: aFechaISO(inicioActual),
            actualHasta: aFechaISO(hoy),
            anteriorDesde: aFechaISO(inicioAnterior),
            anteriorHasta: aFechaISO(finAnterior),
            texto: `${fechaFinalAnterior} vs ${fechaFinalActual}`
        };
    }

    function porcentajeCambio(actual, anterior) {
        if (anterior === 0) {
            return { valor: actual === 0 ? "0%" : "Nuevo", estado: actual === 0 ? "igual" : "subio" };
        }

        const porcentaje = Math.round((actual - anterior) / anterior * 1000) / 10;
        return {
            valor: porcentaje > 0 ? `+${porcentaje}%` : `${porcentaje}%`,
            estado: porcentaje > 0 ? "subio" : porcentaje < 0 ? "bajo" : "igual"
        };
    }

    function mostrarCambio(id, cambio) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        const icono = elemento.querySelector("i");
        const valor = elemento.querySelector("span");
        const iconos = { subio: "fa-arrow-up", bajo: "fa-arrow-down", igual: "fa-minus" };
        elemento.className = `cf estadistica-variacion estadistica-variacion--${cambio.estado}`;
        if (icono) icono.className = `fa-solid ${iconos[cambio.estado]}`;
        if (valor) valor.textContent = cambio.valor;
    }

    function actualizarEstadisticas() {
        const facturas = leerLista("facturasAGE").filter(factura => factura.estado !== "Anulada");
        const clientes = leerLista("clientes");
        const periodo = document.querySelector(".panel-clientes .header-clientes .tiempo")?.value || "mes";
        const fechaInicio = fechaDesdePeriodo(periodo);
        const nuevos = clientes.filter(cliente => cliente.fechaRegistro && cliente.fechaRegistro >= fechaInicio).length;
        const activos = clientes.filter(cliente => cliente.estado !== "Inactivo").length;
        const inactivos = clientes.length - activos;
        const formatoMoneda = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" });
        const periodoMetodos = document.querySelector(".tarjeta-metodos-pago .header-metodos .tiempo")?.value || "mes";
        const fechaInicioMetodos = fechaDesdePeriodo(periodoMetodos);
        const facturasPorMetodo = facturas.filter(factura => factura.fecha >= fechaInicioMetodos && factura.metodoPago);
        const totalPorMetodo = facturasPorMetodo.reduce((suma, factura) => suma + (Number(factura.total) || 0), 0);
        const rangos = obtenerRangosMensuales();
        const facturasActuales = facturas.filter(factura => factura.fecha >= rangos.actualDesde && factura.fecha <= rangos.actualHasta);
        const facturasAnteriores = facturas.filter(factura => factura.fecha >= rangos.anteriorDesde && factura.fecha <= rangos.anteriorHasta);
        const clientesActuales = clientes.filter(cliente => cliente.fechaRegistro >= rangos.actualDesde && cliente.fechaRegistro <= rangos.actualHasta);
        const clientesAnteriores = clientes.filter(cliente => cliente.fechaRegistro >= rangos.anteriorDesde && cliente.fechaRegistro <= rangos.anteriorHasta);
        const ventasActuales = facturasActuales.reduce((suma, factura) => suma + (Number(factura.total) || 0), 0);
        const ventasAnteriores = facturasAnteriores.reduce((suma, factura) => suma + (Number(factura.total) || 0), 0);

        if (ventas) ventas.textContent = formatoMoneda.format(facturas.reduce((suma, factura) => suma + (Number(factura.total) || 0), 0));
        if (pedidos) pedidos.textContent = String(facturas.length);
        if (clientesNuevos) clientesNuevos.textContent = String(nuevos);
        if (clientesTotales) clientesTotales.textContent = String(clientes.length);
        if (clientesActivos) clientesActivos.textContent = String(activos);
        if (clientesPanelNuevos) clientesPanelNuevos.textContent = String(nuevos);
        if (clientesInactivos) clientesInactivos.textContent = String(inactivos);
        mostrarCambio("estadisticas-ventas-periodo", porcentajeCambio(ventasActuales, ventasAnteriores));
        mostrarCambio("estadisticas-pedidos-periodo", porcentajeCambio(facturasActuales.length, facturasAnteriores.length));
        mostrarCambio("estadisticas-clientes-periodo", porcentajeCambio(clientesActuales.length, clientesAnteriores.length));
        rangosTarjetas.forEach(elemento => {
            if (elemento) elemento.textContent = rangos.texto;
        });

        document.querySelectorAll(".lista-metodos .metodo-fila").forEach(fila => {
            const totalMetodo = facturasPorMetodo
                .filter(factura => factura.metodoPago === fila.dataset.metodo)
                .reduce((suma, factura) => suma + (Number(factura.total) || 0), 0);
            const porcentaje = totalPorMetodo ? Math.round(totalMetodo / totalPorMetodo * 100) : 0;
            const etiqueta = fila.querySelector(".metodo-porcentaje");
            const barra = fila.querySelector(".barra-progreso");
            if (etiqueta) etiqueta.textContent = `${porcentaje}%`;
            if (barra) barra.style.width = `${porcentaje}%`;
        });
    }

    document.querySelector(".panel-clientes .header-clientes .tiempo")?.addEventListener("change", actualizarEstadisticas);
    document.querySelector(".tarjeta-metodos-pago .header-metodos .tiempo")?.addEventListener("change", actualizarEstadisticas);
    window.addEventListener("storage", actualizarEstadisticas);
    actualizarEstadisticas();
});

// --------------------------------------------- INVENTARIO ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Referencias de la página y clave donde se guarda el catálogo.
    const PRODUCTOS_KEY = 'productosAGE';
    const formulario = document.getElementById('formAgregarProducto');
    const cuerpoInventario = document.getElementById('inventario-body');
    const busqueda = document.getElementById('buscar-inventario');
    const dialogoProducto = document.getElementById('dialogo-producto');
    const dialogoEliminar = document.getElementById('dialogo-eliminar');
    let productoPendienteEliminar = null;

    // Muestra los detalles del producto en un diálogo en lugar de usar alert().
    function mostrarDetalleProducto(producto) {
        if (!dialogoProducto) return;

        const cantidad = Number(producto.cantidad) || 0;
        const estado = cantidad <= 0 ? 'Agotado' : cantidad <= 10 ? 'Bajo stock' : 'Disponible';
        const formatoMoneda = new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        });

        document.getElementById('detalle-producto-nombre').textContent = producto.nombre || 'Sin nombre';
        document.getElementById('detalle-producto-codigo').textContent = producto.codigo || 'Sin código';
        document.getElementById('detalle-producto-categoria').textContent = producto.categoria || 'Sin categoría';
        document.getElementById('detalle-producto-proveedor').textContent = producto.proveedor || 'Sin proveedor';
        document.getElementById('detalle-producto-precio').textContent = formatoMoneda.format(Number(producto.precio) || 0);
        document.getElementById('detalle-producto-cantidad').textContent = String(cantidad);
        document.getElementById('detalle-producto-descripcion').textContent = producto.descripcion || 'Sin descripción';

        const etiquetaEstado = document.getElementById('detalle-producto-estado');
        etiquetaEstado.className = `dialogo-producto__estado dialogo-producto__estado--${cantidad <= 0 ? 'agotado' : cantidad <= 10 ? 'bajo' : 'disponible'}`;
        etiquetaEstado.textContent = estado;
        dialogoProducto.showModal();
    }

    // Funciones para leer, guardar y asignar códigos a los productos.
    function leerProductos() {
        try {
            const productos = JSON.parse(localStorage.getItem(PRODUCTOS_KEY)) || [];
            return Array.isArray(productos) ? productos : [];
        } catch (error) {
            return [];
        }
    }

    function guardarProductos(productos) {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
    }

    function siguienteCodigo(productos) {
        const mayor = productos.reduce((maximo, producto) => {
            const numero = Number(String(producto.codigo || '').replace(/\D/g, '')) || 0;
            return Math.max(maximo, numero);
        }, 0);
        return `PRD-${String(mayor + 1).padStart(4, '0')}`;
    }

    // TABLA Y BUSQUEDA: filtra productos, actualiza indicadores y dibuja las filas.
    function mostrarInventario() {
        if (!cuerpoInventario) return;

        const productos = leerProductos();
        const termino = busqueda.value.trim().toLowerCase();
        const filtrados = productos.filter(producto =>
            `${producto.codigo} ${producto.nombre} ${producto.categoria} ${producto.proveedor || ''} ${producto.descripcion || ''}`
                .toLowerCase().includes(termino)
        );
        const formatoMoneda = new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        });
        const agotados = productos.filter(producto => Number(producto.cantidad) <= 0).length;
        const bajoStock = productos.filter(producto => Number(producto.cantidad) > 0 && Number(producto.cantidad) <= 10).length;
        const porcentaje = cantidad => productos.length ? `${((cantidad / productos.length) * 100).toFixed(2)}% del inventario` : '0% del inventario';

        document.getElementById('total-productos').textContent = productos.length;
        document.getElementById('productos-agotados').textContent = agotados;
        document.getElementById('productos-bajo-stock').textContent = bajoStock;
        document.getElementById('porcentaje-disponible').textContent = porcentaje(productos.length - agotados - bajoStock);
        document.getElementById('porcentaje-agotado').textContent = porcentaje(agotados);
        document.getElementById('porcentaje-bajo-stock').textContent = porcentaje(bajoStock);
        document.getElementById('titulo-tabla-productos').textContent = `Productos (${productos.length})`;
        cuerpoInventario.textContent = '';

        if (!filtrados.length) {
            const filaVacia = document.createElement('tr');
            const mensajeVacio = document.createElement('td');
            mensajeVacio.className = 'inventario-vacio';
            mensajeVacio.colSpan = 8;
            mensajeVacio.textContent = termino ? 'No se encontraron productos.' : 'No hay productos en el inventario.';
            filaVacia.appendChild(mensajeVacio);
            cuerpoInventario.appendChild(filaVacia);
            return;
        }

        filtrados.forEach(producto => {
            const cantidad = Number(producto.cantidad) || 0;
            const estado = cantidad <= 0 ? 'Agotado' : cantidad <= 10 ? 'Bajo stock' : 'Disponible';
            const fila = document.createElement('tr');
            const valores = [
                producto.codigo,
                producto.nombre,
                producto.categoria,
                String(cantidad),
                formatoMoneda.format(Number(producto.precio) || 0),
                producto.proveedor || 'Sin proveedor',
                estado
            ];

            valores.forEach((valor, indice) => {
                const celda = document.createElement('td');
                celda.textContent = valor || '';
                if (indice === 3) celda.className = cantidad <= 0 ? 'stock-agotado' : cantidad <= 10 ? 'stock-bajo' : 'stock-disponible';
                if (indice === 6) {
                    const etiqueta = document.createElement('div');
                    etiqueta.className = cantidad <= 0 ? 'agotado' : cantidad <= 10 ? 'bajo-stock' : 'disponible';
                    etiqueta.textContent = estado;
                    celda.textContent = '';
                    celda.appendChild(etiqueta);
                }
                fila.appendChild(celda);
            });

            const acciones = document.createElement('td');
            acciones.innerHTML = `<div class="acciones">
                <button type="button" class="btn-accion btn-verr" data-accion="ver" aria-label="Ver producto"><i class="fa-regular fa-eye"></i></button>
                <button type="button" class="btn-accion btn-editar" data-accion="editar" aria-label="Editar producto"><i class="fa-regular fa-pen-to-square"></i></button>
                <button type="button" class="btn-accion btn-eliminar" data-accion="eliminar" aria-label="Eliminar producto"><i class="fa-regular fa-trash-can"></i></button>
            </div>`;
            fila.dataset.id = producto.id;
            fila.appendChild(acciones);
            cuerpoInventario.appendChild(fila);
        });
    }

    // FORMULARIO DE PRODUCTOS: carga los datos al editar y guarda altas o cambios.
    if (formulario) {
        const parametros = new URLSearchParams(window.location.search);
        const idEdicion = parametros.get('editar');
        const productos = leerProductos();
        const productoEdicion = productos.find(producto => producto.id === idEdicion);

        if (productoEdicion) {
            ['nombre', 'descripcion', 'categoria', 'proveedor', 'precio', 'cantidad'].forEach(campo => {
                formulario.elements[campo].value = productoEdicion[campo] ?? '';
            });
            formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
            document.querySelector('.tit').textContent = 'Editar Producto';
        }

        formulario.addEventListener('submit', function (event) {
            event.preventDefault();
            const datos = new FormData(formulario);
            const producto = {
                id: productoEdicion?.id || `PRD-${Date.now()}`,
                codigo: productoEdicion?.codigo || siguienteCodigo(productos),
                nombre: datos.get('nombre').trim(),
                descripcion: datos.get('descripcion').trim(),
                categoria: datos.get('categoria').trim(),
                precio: Number(datos.get('precio')),
                cantidad: Number(datos.get('cantidad')),
                proveedor: datos.get('proveedor').trim()
            };

            const nuevosProductos = productoEdicion
                ? productos.map(item => item.id === productoEdicion.id ? producto : item)
                : [...productos, producto];
            guardarProductos(nuevosProductos);
            registrarNotificacion(
                'inventario',
                productoEdicion ? 'Producto actualizado' : 'Producto agregado',
                `${producto.nombre} fue ${productoEdicion ? 'actualizado' : 'agregado'} al inventario.`,
                productoEdicion ? 'fa-pen-to-square' : 'fa-box'
            );
            window.location.href = document.body.dataset.inventarioUrl;
        });
    }

    // ACCIONES DE LA TABLA: ver detalles, editar o eliminar un producto.
    if (cuerpoInventario) {
        mostrarInventario();
        busqueda.addEventListener('input', mostrarInventario);

        cuerpoInventario.addEventListener('click', function (event) {
            const boton = event.target.closest('[data-accion]');
            if (!boton) return;

            const fila = boton.closest('tr');
            const producto = leerProductos().find(item => item.id === fila.dataset.id);
            if (!producto) return;

            if (boton.dataset.accion === 'editar') {
                window.location.href = `${document.body.dataset.productoUrl}?editar=${encodeURIComponent(producto.id)}`;
            } else if (boton.dataset.accion === 'eliminar') {
                // Solicita confirmación en el diálogo antes de borrar el producto.
                productoPendienteEliminar = producto;
                document.getElementById('nombre-producto-eliminar').textContent = producto.nombre || 'este producto';
                dialogoEliminar?.showModal();
            } else if (boton.dataset.accion === 'ver') {
                mostrarDetalleProducto(producto);
            }
        });

        dialogoProducto?.querySelectorAll('[data-cerrar-detalle]').forEach(boton => {
            boton.addEventListener('click', () => dialogoProducto.close());
        });

        dialogoProducto?.addEventListener('click', function (event) {
            if (event.target === dialogoProducto) dialogoProducto.close();
        });

        dialogoProducto?.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                dialogoProducto.close();
            }
        });

        dialogoEliminar?.querySelectorAll('[data-cancelar-eliminar]').forEach(boton => {
            boton.addEventListener('click', () => dialogoEliminar.close());
        });

        dialogoEliminar?.querySelector('[data-confirmar-eliminar]')?.addEventListener('click', function () {
            if (!productoPendienteEliminar) return;

            const idProducto = productoPendienteEliminar.id;
            guardarProductos(leerProductos().filter(item => item.id !== idProducto));
            registrarNotificacion('inventario', 'Producto eliminado', `${productoPendienteEliminar.nombre} fue eliminado del inventario.`, 'fa-trash-can');
            productoPendienteEliminar = null;
            dialogoEliminar.close();
            mostrarInventario();
        });

        dialogoEliminar?.addEventListener('click', function (event) {
            if (event.target === dialogoEliminar) dialogoEliminar.close();
        });

        dialogoEliminar?.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                dialogoEliminar.close();
            }
        });

        dialogoEliminar?.addEventListener('close', function () {
            productoPendienteEliminar = null;
        });

        // EXPORTAR INVENTARIO: descarga el catálogo actual como archivo JSON.
        document.querySelector('.btn-exportar').addEventListener('click', function (event) {
            event.preventDefault();
            const archivo = new Blob([JSON.stringify(leerProductos(), null, 2)], { type: 'application/json' });
            const enlace = document.createElement('a');
            enlace.href = URL.createObjectURL(archivo);
            enlace.download = 'inventario-age.json';
            enlace.click();
            URL.revokeObjectURL(enlace.href);
            registrarNotificacion('inventario', 'Inventario exportado', 'El inventario fue exportado correctamente.', 'fa-download');
        });

        // IMPORTAR INVENTARIO: valida un archivo JSON y combina sus productos con el catálogo.
        document.getElementById('archivo-custom').addEventListener('change', function () {
            const archivo = this.files[0];
            if (!archivo) return;

            const lector = new FileReader();
            lector.onload = () => {
                try {
                    const importados = JSON.parse(lector.result);
                    if (!Array.isArray(importados) || importados.some(item =>
                        !item || typeof item.nombre !== 'string' || typeof item.categoria !== 'string' ||
                        !Number.isFinite(Number(item.precio)) || !Number.isFinite(Number(item.cantidad))
                    )) {
                        throw new Error('Formato no válido');
                    }

                    if (!confirm(`Se importarán ${importados.length} productos. Los códigos existentes se actualizarán. ¿Continuar?`)) return;
                    const actuales = leerProductos();
                    importados.forEach(item => {
                        const producto = {
                            ...item,
                            id: item.id || `PRD-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            codigo: item.codigo || siguienteCodigo(actuales),
                            precio: Number(item.precio),
                            cantidad: Number(item.cantidad)
                        };
                        const indice = actuales.findIndex(actual => actual.codigo === producto.codigo);
                        if (indice >= 0) actuales[indice] = producto;
                        else actuales.push(producto);
                    });
                    guardarProductos(actuales);
                    registrarNotificacion('inventario', 'Inventario importado', `Se importaron ${importados.length} productos correctamente.`, 'fa-upload');
                    mostrarInventario();
                    alert('Inventario importado correctamente.');
                } catch (error) {
                    alert('No se pudo importar el archivo. Usa un JSON exportado desde el inventario.');
                } finally {
                    this.value = '';
                }
            };
            lector.readAsText(archivo);
        });
    }
});

// Modo oscuro para las paginas de configuracion
const modo_oscuro = document.getElementById("tema");

if(modo_oscuro) {
modo_oscuro.addEventListener("change", () => {

    if (modo_oscuro.value === "oscuro") {
        document.body.classList.add("activee");
        modo_oscuro.classList.add("activado");
        localStorage.setItem("modo-oscuro", "true");
    } else {
        document.body.classList.remove("activee");
        modo_oscuro.classList.remove("activado");
        localStorage.setItem("modo-oscuro", "false");
    }

});
}

if (localStorage.getItem("modo-oscuro") === "true") {
    document.body.classList.add("activee");

    if (modo_oscuro) {
        modo_oscuro.classList.add("activado");
        modo_oscuro.value = "oscuro";
    }

} else {
    document.body.classList.remove("activee");

    if (modo_oscuro) {
        modo_oscuro.classList.remove("activado");
        modo_oscuro.value = "claro";
    }
}