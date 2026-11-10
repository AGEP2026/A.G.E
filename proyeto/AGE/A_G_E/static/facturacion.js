document.addEventListener('DOMContentLoaded', function () {
    const formatoMoneda = new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
    });

    function obtenerCookie(nombre) {
        const prefijo = `${nombre}=`;
        const cookie = document.cookie.split(';').map(valor => valor.trim())
            .find(valor => valor.startsWith(prefijo));
        return cookie ? decodeURIComponent(cookie.slice(prefijo.length)) : '';
    }

    function mensaje(elemento, texto, error = false) {
        if (!elemento) return;
        elemento.textContent = texto;
        elemento.style.color = error ? '#b91c1c' : '';
    }

    function descargarFacturaPdf(factura) {
        if (!window.jspdf) {
            window.alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        const anchoTexto = documento.internal.pageSize.getWidth() - 40;
        const altoPagina = documento.internal.pageSize.getHeight();
        let y = 20;

        function escribirLinea(texto, opciones = {}) {
            const lineas = documento.splitTextToSize(String(texto), anchoTexto);
            if (y + lineas.length * 6 > altoPagina - 20) {
                documento.addPage();
                y = 20;
            }
            documento.text(lineas, 20, y);
            y += lineas.length * 6 + (opciones.espacio || 1);
        }

        documento.setFont('helvetica', 'bold');
        documento.setFontSize(18);
        escribirLinea(factura.empresa.nombre);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(10);
        escribirLinea(`RNC: ${factura.empresa.rnc}`);
        escribirLinea(factura.empresa.direccion);
        escribirLinea(factura.empresa.correo);
        y += 3;
        documento.setFont('helvetica', 'bold');
        documento.setFontSize(14);
        escribirLinea(`FACTURA ${factura.numero}`);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(10);
        escribirLinea(`Fecha: ${factura.fecha}`);
        escribirLinea(`Tipo: ${factura.tipo === 'credito' ? 'Crédito fiscal' : 'Normal'}`);
        escribirLinea(`Estado: ${factura.estado}`);
        escribirLinea(`Cliente: ${factura.cliente}`);
        if (factura.rnc) escribirLinea(`RNC del cliente: ${factura.rnc}`);
        escribirLinea(`Dirección del cliente: ${factura.direccion}`);
        escribirLinea(`Correo del cliente: ${factura.correo}`);
        escribirLinea(`RNC para comprobante fiscal: ${factura.comprobante_fiscal}`);
        escribirLinea(`Método de pago: ${factura.metodoPago}`);
        y += 3;
        documento.setFont('helvetica', 'bold');
        escribirLinea('ARTÍCULOS');
        documento.setFont('helvetica', 'normal');
        factura.items.forEach(item => {
            escribirLinea(
                `${item.producto} x ${item.cantidad} | ${formatoMoneda.format(Number(item.precio))} c/u | ${formatoMoneda.format(Number(item.total))}`
            );
        });
        y += 3;
        documento.setFont('helvetica', 'bold');
        escribirLinea(`Subtotal: ${formatoMoneda.format(Number(factura.subtotal))}`);
        documento.setFont('helvetica', 'normal');
        escribirLinea(`ITBIS (${factura.tasa_impuesto}%): ${formatoMoneda.format(Number(factura.impuesto))}`);
        documento.setFont('helvetica', 'bold');
        escribirLinea(`TOTAL: ${formatoMoneda.format(Number(factura.total))}`);
        documento.save(`factura-${factura.numero}.pdf`);
    }

    const formulario = document.getElementById('form-factura');
    if (formulario) {
        const contenedor = document.querySelector('.formulario[data-create-url]');
        const listaItems = [];
        const itemsContenedor = document.getElementById('factura-items');
        const vistaPrevia = document.querySelector('.factura-preview');
        const botonCotizar = document.getElementById('fact-cotizar');
        const botonGenerar = document.getElementById('fact-generar');
        const botonPdf = document.getElementById('fact-imprimir');
        const etiquetaImpuesto = document.getElementById('etiqueta-itbis');
        const mensajeFactura = document.getElementById('factura-mensaje');
        let cotizacionActual = false;
        let ultimaFactura = null;

        const campo = id => document.getElementById(id);
        const comprobanteFiscal = campo('comprobante-fiscal');
        const ayudaRncComprobante = campo('ayuda-rnc-comprobante');
        const datosEmpresa = document.getElementById('datos-empresa-factura');
        const tasaImpuesto = () => Number(campo('tasa-impuesto-factura').value);
        const redondear = valor => Math.round((valor + Number.EPSILON) * 100) / 100;
        const subtotalActual = () => redondear(listaItems.reduce(
            (suma, item) => suma + item.cantidad * item.precio, 0
        ));

        function invalidarCotizacion() {
            cotizacionActual = false;
            botonGenerar.disabled = true;
            mensaje(mensajeFactura, '');
        }

        function mostrarItems() {
            itemsContenedor.textContent = '';
            if (!listaItems.length) {
                itemsContenedor.textContent = 'Sin artículos aún';
            }
            listaItems.forEach((item, indice) => {
                const fila = document.createElement('div');
                fila.className = 'item-factura';
                fila.textContent = `${item.producto} x${item.cantidad} - ${formatoMoneda.format(item.cantidad * item.precio)}`;
                const eliminar = document.createElement('button');
                eliminar.type = 'button';
                eliminar.textContent = 'Eliminar';
                eliminar.addEventListener('click', function () {
                    listaItems.splice(indice, 1);
                    invalidarCotizacion();
                    mostrarItems();
                    actualizarTotales();
                });
                fila.appendChild(eliminar);
                itemsContenedor.appendChild(fila);
            });
        }

        function actualizarTotales() {
            const subtotal = subtotalActual();
            const impuesto = redondear(subtotal * tasaImpuesto() / 100);
            document.getElementById('fact-subtotal').textContent = formatoMoneda.format(subtotal);
            document.getElementById('fact-iva').textContent = formatoMoneda.format(impuesto);
            document.getElementById('fact-total').textContent = formatoMoneda.format(subtotal + impuesto);
            etiquetaImpuesto.textContent = String(tasaImpuesto());
        }

        function leerDatosFactura() {
            const items = listaItems.map(item => ({ ...item }));
            const esCreditoFiscal = campo('tipo-factura').value === 'credito';
            return {
                confirmacion_cotizacion: true,
                tipo: campo('tipo-factura').value,
                cliente: campo('cliente-nombre').value.trim(),
                rnc: esCreditoFiscal ? campo('cliente-rfc').value.trim() : '',
                direccion: campo('cliente-direccion').value.trim(),
                correo: campo('cliente-correo').value.trim(),
                comprobante_fiscal: campo('comprobante-fiscal').value.trim(),
                metodo_pago: campo('fact-metodo-pago').value,
                estado: campo('fact-estado').value,
                tasa_impuesto: tasaImpuesto(),
                items
            };
        }

        function mostrarCotizacion(datos) {
            const empresa = document.getElementById('datos-empresa-factura');
            const subtotal = subtotalActual();
            const impuesto = redondear(subtotal * datos.tasa_impuesto / 100);
            const total = subtotal + impuesto;
            vistaPrevia.textContent = '';
            const titulo = document.createElement('h4');
            titulo.textContent = 'COTIZACIÓN (sin guardar)';
            vistaPrevia.appendChild(titulo);
            [...Array.from(empresa.children, linea => linea.textContent.trim()),
                `Cliente: ${datos.cliente}`,
                ...(datos.tipo === 'credito' ? [`RNC del cliente: ${datos.rnc}`] : []),
                `Dirección: ${datos.direccion}`, `Correo: ${datos.correo}`,
                `RNC para comprobante fiscal: ${datos.comprobante_fiscal}`]
                .forEach(texto => {
                    const linea = document.createElement('p');
                    linea.textContent = texto;
                    vistaPrevia.appendChild(linea);
                });
            datos.items.forEach(item => {
                const linea = document.createElement('p');
                linea.textContent = `${item.producto} x ${item.cantidad} - ${formatoMoneda.format(item.cantidad * item.precio)}`;
                vistaPrevia.appendChild(linea);
            });
            [`Subtotal: ${formatoMoneda.format(subtotal)}`,
                `ITBIS (${datos.tasa_impuesto}%): ${formatoMoneda.format(impuesto)}`,
                `TOTAL: ${formatoMoneda.format(total)}`].forEach(texto => {
                const linea = document.createElement('p');
                linea.textContent = texto;
                vistaPrevia.appendChild(linea);
            });
        }

        function actualizarRncComprobante() {
            const esCreditoFiscal = campo('tipo-factura').value === 'credito';
            const campoRncCliente = campo('campo-rnc-cliente');
            campo('cliente-rfc').required = esCreditoFiscal;
            campoRncCliente.hidden = !esCreditoFiscal;
            comprobanteFiscal.value = esCreditoFiscal
                ? campo('cliente-rfc').value.trim()
                : (datosEmpresa.dataset.rnc || '');
            ayudaRncComprobante.textContent = esCreditoFiscal
                ? 'Factura de crédito fiscal: se usará el RNC del cliente.'
                : 'Factura normal: se usará el RNC de la empresa.';
        }

        campo('tipo-factura').addEventListener('change', actualizarRncComprobante);
        campo('cliente-rfc').addEventListener('input', function () {
            if (campo('tipo-factura').value === 'credito') actualizarRncComprobante();
        });

        campo('fact-agregar-item').addEventListener('click', function () {
            const producto = campo('fact-producto-manual').value.trim() || campo('fact-producto').value.trim();
            const cantidad = Number(campo('fact-cantidad').value);
            const precio = Number(campo('fact-precio').value);
            if (!producto || !Number.isInteger(cantidad) || cantidad < 1
                || !Number.isFinite(precio) || precio < 0 || !campo('fact-precio').value) {
                mensaje(mensajeFactura, 'Indica un artículo, cantidad entera y precio válidos.', true);
                return;
            }
            listaItems.push({ producto, cantidad, precio: redondear(precio) });
            campo('fact-producto').value = '';
            campo('fact-producto-manual').value = '';
            campo('fact-cantidad').value = '';
            campo('fact-precio').value = '';
            invalidarCotizacion();
            mostrarItems();
            actualizarTotales();
        });

        botonCotizar.addEventListener('click', function () {
            if (!formulario.reportValidity()) return;
            if (!listaItems.length) {
                mensaje(mensajeFactura, 'Agrega al menos un artículo antes de cotizar.', true);
                return;
            }
            const datos = leerDatosFactura();
            mostrarCotizacion(datos);
            cotizacionActual = true;
            botonGenerar.disabled = false;
            mensaje(mensajeFactura, 'Revisa la cotización. La factura solo se guardará al confirmarla.');
        });

        formulario.addEventListener('input', invalidarCotizacion);
        formulario.addEventListener('change', function () {
            invalidarCotizacion();
            actualizarRncComprobante();
            actualizarTotales();
        });

        botonGenerar.addEventListener('click', async function () {
            if (!cotizacionActual) {
                mensaje(mensajeFactura, 'Primero genera y revisa la cotización.', true);
                return;
            }
            const token = formulario.querySelector('[name=csrfmiddlewaretoken]')?.value || obtenerCookie('csrftoken');
            botonGenerar.disabled = true;
            try {
                const respuesta = await fetch(contenedor.dataset.createUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token
                    },
                    body: JSON.stringify(leerDatosFactura())
                });
                const resultado = await respuesta.json();
                if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo guardar la factura.');
                ultimaFactura = resultado.factura;
                cotizacionActual = false;
                botonPdf.disabled = false;
                registrarNotificacion(
                    'facturacion',
                    'Factura creada',
                    `Se creó la factura ${ultimaFactura.numero} para ${ultimaFactura.cliente}.`
                );
                mensaje(mensajeFactura, `Factura ${ultimaFactura.numero} guardada en la base de datos.`);
                mostrarFacturaGuardada(ultimaFactura);
                actualizarHistorial();
            } catch (error) {
                botonGenerar.disabled = false;
                mensaje(mensajeFactura, error.message, true);
            }
        });

        function mostrarFacturaGuardada(factura) {
            vistaPrevia.textContent = `${factura.numero} guardada para ${factura.cliente}. Total: ${formatoMoneda.format(Number(factura.total))}`;
        }

        botonPdf.addEventListener('click', function () {
            if (!ultimaFactura) {
                mensaje(mensajeFactura, 'Primero debes generar una factura.', true);
                return;
            }
            descargarFacturaPdf(ultimaFactura);
        });

        formulario.addEventListener('reset', function () {
            listaItems.length = 0;
            ultimaFactura = null;
            botonPdf.disabled = true;
            botonGenerar.disabled = true;
            cotizacionActual = false;
            vistaPrevia.textContent = 'La cotización aparecerá aquí';
            mensaje(mensajeFactura, '');
            window.setTimeout(function () {
                mostrarItems();
                actualizarRncComprobante();
                actualizarTotales();
            }, 0);
        });

        mostrarItems();
        actualizarRncComprobante();
        actualizarTotales();
    }

    const historial = document.querySelector('.historial-facturas[data-list-url]');
    if (!historial) return;
    const cuerpo = document.getElementById('historial-body');
    const modalFactura = document.getElementById('modal-ver-factura');
    let facturas = [];
    const urlDetalle = id => historial.dataset.detailUrl.replace('123456789', String(id));

    function actualizarResumen() {
        document.getElementById('resumen-emitidas').textContent = String(facturas.length);
        document.getElementById('resumen-pendientes').textContent = String(
            facturas.filter(factura => factura.estado === 'Pendiente').length
        );
        document.getElementById('resumen-total').textContent = formatoMoneda.format(
            facturas.filter(factura => factura.estado !== 'Anulada')
                .reduce((total, factura) => total + Number(factura.total), 0)
        );
    }

    function mostrarHistorial() {
        const busqueda = (document.getElementById('buscar-factura').value || '').toLowerCase().trim();
        const estado = document.getElementById('estado-factura').value;
        const desde = document.getElementById('fecha-factura').value;
        const filtradas = facturas.filter(factura =>
            `${factura.numero} ${factura.cliente} ${factura.rnc}`.toLowerCase().includes(busqueda)
            && (!estado || factura.estado === estado)
            && (!desde || factura.fecha >= desde)
        );
        cuerpo.textContent = '';
        filtradas.forEach(factura => {
            const fila = document.createElement('tr');
            fila.dataset.id = String(factura.id);
            fila.dataset.estado = factura.estado;
            [factura.numero, factura.cliente, new Date(`${factura.fecha}T00:00:00`).toLocaleDateString('es-DO'),
                formatoMoneda.format(Number(factura.total))].forEach(valor => {
                const celda = document.createElement('td');
                celda.textContent = valor;
                fila.appendChild(celda);
            });
            const estadoCelda = document.createElement('td');
            const distintivo = document.createElement('span');
            distintivo.className = `estado estado-${factura.estado.toLowerCase()}`;
            distintivo.textContent = factura.estado;
            estadoCelda.appendChild(distintivo);
            fila.appendChild(estadoCelda);
            const acciones = document.createElement('td');
            acciones.className = 'acciones-factura';
            const ver = document.createElement('button');
            ver.type = 'button';
            ver.className = 'btn-accion btn-ver-factura';
            ver.title = 'Ver factura';
            ver.setAttribute('aria-label', 'Ver factura');
            const iconoVer = document.createElement('i');
            iconoVer.className = 'fa-regular fa-eye';
            ver.appendChild(iconoVer);
            ver.addEventListener('click', () => mostrarFactura(factura));
            acciones.appendChild(ver);

            const descargar = document.createElement('button');
            descargar.type = 'button';
            descargar.className = 'btn-accion btn-pdf-factura';
            descargar.title = 'Descargar factura en PDF';
            descargar.setAttribute('aria-label', 'Descargar factura en PDF');
            const iconoPdf = document.createElement('i');
            iconoPdf.className = 'fa-regular fa-file-pdf';
            descargar.appendChild(iconoPdf);
            descargar.addEventListener('click', () => descargarFacturaPdf(factura));
            acciones.appendChild(descargar);

            if (factura.estado !== 'Anulada') {
                const cambiarEstado = document.createElement('button');
                cambiarEstado.type = 'button';
                cambiarEstado.className = 'btn-accion btn-estado-factura';
                cambiarEstado.title = factura.estado === 'Pagada' ? 'Marcar pendiente' : 'Marcar pagada';
                cambiarEstado.setAttribute('aria-label', cambiarEstado.title);
                const iconoEstado = document.createElement('i');
                iconoEstado.className = factura.estado === 'Pagada'
                    ? 'fa-solid fa-clock'
                    : 'fa-solid fa-circle-check';
                cambiarEstado.appendChild(iconoEstado);
                cambiarEstado.addEventListener('click', () => cambiarEstadoFactura(factura));
                acciones.appendChild(cambiarEstado);
            }
            const eliminar = document.createElement('button');
            eliminar.type = 'button';
            eliminar.className = 'btn-accion btn-eliminar-factura';
            eliminar.title = 'Eliminar factura';
            eliminar.setAttribute('aria-label', 'Eliminar factura');
            const iconoEliminar = document.createElement('i');
            iconoEliminar.className = 'fa-regular fa-trash-can';
            eliminar.appendChild(iconoEliminar);
            eliminar.addEventListener('click', () => eliminarFactura(factura));
            acciones.appendChild(eliminar);
            fila.appendChild(acciones);
            cuerpo.appendChild(fila);
        });
        document.getElementById('sin-resultados').hidden = filtradas.length > 0;
        actualizarResumen();
    }

    function mostrarFactura(factura) {
        const contenido = document.getElementById('detalle-factura');
        contenido.textContent = '';
        const lineas = [
            ['Empresa', factura.empresa.nombre],
            ['RNC de la empresa', factura.empresa.rnc],
            ['Dirección de la empresa', factura.empresa.direccion],
            ['Correo de la empresa', factura.empresa.correo],
            ['Factura', factura.numero],
            ['Fecha', factura.fecha],
            ['Tipo', factura.tipo === 'credito' ? 'Crédito fiscal' : 'Normal'],
            ['Estado', factura.estado],
            ['Cliente', factura.cliente],
            ...(factura.rnc ? [['RNC del cliente', factura.rnc]] : []),
            ['Dirección del cliente', factura.direccion],
            ['Correo del cliente', factura.correo],
            ['RNC para comprobante fiscal', factura.comprobante_fiscal],
            ['Método de pago', factura.metodoPago]
        ];
        lineas.forEach(([etiqueta, valor]) => {
            const linea = document.createElement('p');
            const nombre = document.createElement('strong');
            nombre.textContent = `${etiqueta}: `;
            linea.append(nombre, document.createTextNode(valor || '—'));
            contenido.appendChild(linea);
        });

        const tituloItems = document.createElement('h3');
        tituloItems.textContent = 'Artículos';
        contenido.appendChild(tituloItems);
        const tabla = document.createElement('table');
        const encabezado = document.createElement('tr');
        ['Artículo', 'Cantidad', 'Precio unitario', 'Importe'].forEach(texto => {
            const celda = document.createElement('th');
            celda.textContent = texto;
            encabezado.appendChild(celda);
        });
        const thead = document.createElement('thead');
        thead.appendChild(encabezado);
        tabla.appendChild(thead);
        const tbody = document.createElement('tbody');
        factura.items.forEach(item => {
            const fila = document.createElement('tr');
            [item.producto, item.cantidad, formatoMoneda.format(Number(item.precio)),
                formatoMoneda.format(Number(item.total))].forEach(texto => {
                const celda = document.createElement('td');
                celda.textContent = String(texto);
                fila.appendChild(celda);
            });
            tbody.appendChild(fila);
        });
        tabla.appendChild(tbody);
        contenido.appendChild(tabla);
        [
            ['Subtotal', formatoMoneda.format(Number(factura.subtotal))],
            [`ITBIS (${factura.tasa_impuesto}%)`, formatoMoneda.format(Number(factura.impuesto))],
            ['Total', formatoMoneda.format(Number(factura.total))]
        ].forEach(([etiqueta, valor]) => {
            const linea = document.createElement('p');
            const nombre = document.createElement('strong');
            nombre.textContent = `${etiqueta}: `;
            linea.append(nombre, document.createTextNode(valor));
            contenido.appendChild(linea);
        });

        modalFactura.hidden = false;
        document.getElementById('cerrar-detalle-factura').focus();
    }

    async function actualizarHistorial() {
        try {
            const respuesta = await fetch(historial.dataset.listUrl);
            if (!respuesta.ok) throw new Error('No se pudo cargar el historial de facturas.');
            const datos = await respuesta.json();
            facturas = datos.facturas;
            mostrarHistorial();
        } catch (error) {
            cuerpo.textContent = '';
            const fila = document.createElement('tr');
            const celda = document.createElement('td');
            celda.colSpan = 6;
            celda.textContent = error.message;
            fila.appendChild(celda);
            cuerpo.appendChild(fila);
        }
    }

    async function cambiarEstadoFactura(factura) {
        const estado = factura.estado === 'Pagada' ? 'Pendiente' : 'Pagada';
        await enviarCambio(factura.id, 'PATCH', { estado });
    }

    async function eliminarFactura(factura) {
        if (window.confirm(`¿Eliminar la factura ${factura.numero}?`)) {
            await enviarCambio(factura.id, 'DELETE');
        }
    }

    async function enviarCambio(id, metodo, datos) {
        try {
            const respuesta = await fetch(urlDetalle(id), {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': obtenerCookie('csrftoken')
                },
                body: datos ? JSON.stringify(datos) : undefined
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo actualizar la factura.');
            if (metodo === 'PATCH') {
                registrarNotificacion(
                    'facturacion',
                    'Estado de factura actualizado',
                    `La factura ${facturas.find(factura => factura.id === id)?.numero || id} ahora está ${datos.estado.toLowerCase()}.`
                );
            } else if (metodo === 'DELETE') {
                const factura = facturas.find(item => item.id === id);
                registrarNotificacion(
                    'facturacion',
                    'Factura eliminada',
                    `Se eliminó la factura ${factura?.numero || id}${factura?.cliente ? ` de ${factura.cliente}` : ''}.`,
                    'fa-trash-can'
                );
            }
            await actualizarHistorial();
        } catch (error) {
            window.alert(error.message);
        }
    }

    document.getElementById('exportar-facturas').addEventListener('click', function () {
        if (!facturas.length) {
            window.alert('No hay facturas para exportar.');
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
        URL.revokeObjectURL(url);
    });

    document.getElementById('compartir-facturas').addEventListener('click', async function () {
        if (!facturas.length) {
            window.alert('No hay facturas para compartir.');
            return;
        }
        const resumen = facturas.map(factura =>
            `${factura.numero} | ${factura.cliente} | ${factura.fecha} | ${factura.estado} | ${formatoMoneda.format(Number(factura.total))}`
        ).join('\n');
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Resumen de facturas', text: resumen });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(resumen);
                window.alert('Resumen de facturas copiado al portapapeles.');
            } else {
                window.alert('Este navegador no permite compartir ni copiar el resumen.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') window.alert(`No se pudo compartir: ${error.message}`);
        }
    });

    document.getElementById('imprimir-facturas').addEventListener('click', function () {
        if (!facturas.length || !window.jspdf) {
            window.alert(facturas.length ? 'No se pudo cargar el generador de PDF.' : 'No hay facturas para generar el PDF.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        let y = 20;
        documento.setFontSize(16);
        documento.text('REPORTE DE FACTURAS', 16, y);
        y += 12;
        documento.setFontSize(10);
        facturas.forEach(factura => {
            if (y > 275) {
                documento.addPage();
                y = 20;
            }
            documento.text(
                `${factura.numero} | ${factura.fecha} | ${factura.cliente} | ${factura.estado} | ${formatoMoneda.format(Number(factura.total))}`,
                16, y, { maxWidth: 178 }
            );
            y += 8;
        });
        documento.save('reporte-facturas-age.pdf');
    });

    document.getElementById('cerrar-detalle-factura').addEventListener('click', function () {
        modalFactura.hidden = true;
    });
    modalFactura.addEventListener('click', function (event) {
        if (event.target === modalFactura) modalFactura.hidden = true;
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !modalFactura.hidden) modalFactura.hidden = true;
    });

    ['buscar-factura', 'estado-factura', 'fecha-factura'].forEach(id => {
        document.getElementById(id).addEventListener('input', mostrarHistorial);
        document.getElementById(id).addEventListener('change', mostrarHistorial);
    });
    actualizarHistorial();
});
