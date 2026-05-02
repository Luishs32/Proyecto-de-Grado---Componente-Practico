'use strict';

/**
 * views/pedido.js — Pedido Sugerido (vista principal)
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * RF4/RF6: Genera la sugerencia de pedido por tienda considerando
 * la capacidad física de exhibición en góndola.
 */

function renderPedido() {
  const session  = getSession();
  const tiendaId = App.tiendaActiva;
  const tienda   = TIENDAS.find(t => t.id === tiendaId);
  const todos    = calcularTodos(App.leadTime).filter(c => c.tiendaId === tiendaId);

  const datos = App.filtroRiesgo === 'TODOS'
    ? todos
    : todos.filter(c => c.resultado.nivelRiesgo === App.filtroRiesgo);

  const totalPed = datos.reduce((s, c) => s + c.resultado.cantidadSugerida, 0);
  const totalVal = datos.reduce((s, c) => s + (c.resultado.cantidadSugerida * c.producto.precio), 0);

  // Tabs de tienda (solo admin puede cambiar de tienda)
  const tabTiendas = esAdmin() ? TIENDAS.map(t => `
    <button class="tab-btn ${t.id === tiendaId ? 'active' : ''}"
            onclick="App.tiendaActiva=${t.id}; App.render()">
      🏪 ${t.nombre}
    </button>`).join('') : '';

  const tabRiesgos = ['TODOS','QUIEBRE','CRÍTICO','ALTO','MEDIO','BAJO'].map(n => `
    <button class="tab-btn ${App.filtroRiesgo === n ? 'active' : ''}"
            onclick="App.filtroRiesgo='${n}'; App.render()">
      ${n}
    </button>`).join('');

  const leadControl = `
    <div class="lead-control">
      <label>Lead time:</label>
      <input type="number" min="1" max="30" value="${App.leadTime}"
             onchange="App.leadTime = parseInt(this.value) || 3; App.render()" />
      <span>días</span>
    </div>`;

  const filas = datos.map(c => {
    const r   = c.resultado;
    const ped = r.cantidadSugerida;
    const val = (ped * c.producto.precio).toLocaleString('es-CO');
    return `
    <tr class="${r.nivelRiesgo === 'QUIEBRE' ? 'row-quiebre' : r.nivelRiesgo === 'CRÍTICO' ? 'row-critico' : ''}">
      <td class="fw">${c.producto.nombre}</td>
      <td>${badgeRiesgo(r.nivelRiesgo)}</td>
      <td style="font-weight:700">${c.stockActual}</td>
      <td class="muted">${r.diasCobertura}d</td>
      <td>
        <span class="val-teal">${r.capacidadExhibicion}</span>
        <span class="text-muted text-small" style="margin-left:3px">(${c.gondola.caras}×${c.gondola.niveles}×${c.gondola.profundidad})</span>
      </td>
      <td>
        ${ped > 0
          ? `<span class="pedido-cantidad">${ped}</span>`
          : `<span class="val-green" style="font-size:13px">0 ✓</span>`}
      </td>
      <td style="font-weight:600;color:#1e293b">$${val}</td>
    </tr>`;
  }).join('');

  const sinPedido = datos.every(c => c.resultado.cantidadSugerida === 0);

  return `
    <h1 class="view-title">Pedido Sugerido</h1>
    <p class="view-subtitle">
      🏪 ${tienda?.nombre ?? '—'} &nbsp;·&nbsp;
      Algoritmo basado en capacidad de exhibición en góndola
    </p>

    <div class="tab-row">
      ${tabTiendas}
      ${tabTiendas ? '<span style="color:#cbd5e1;margin:0 4px">|</span>' : ''}
      ${leadControl}
    </div>

    <div class="tab-row" style="margin-top:0">${tabRiesgos}</div>

    ${!sinPedido ? `
    <div class="pedido-resumen-bar">
      <div class="prb-item">
        <span class="prb-num">${datos.filter(c => c.resultado.cantidadSugerida > 0).length}</span>
        <span class="prb-label">Productos a reponer</span>
      </div>
      <div class="prb-item">
        <span class="prb-num">${totalPed}</span>
        <span class="prb-label">Unidades totales</span>
      </div>
      <div class="prb-item" style="color:#2563eb">
        <span class="prb-num">$${totalVal.toLocaleString('es-CO')}</span>
        <span class="prb-label">Valor estimado del pedido</span>
      </div>
      <button class="btn-generar" onclick="generarResumenPedido()">📄 Generar Pedido</button>
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:#166534;font-weight:600">
      ✅ Stock óptimo — No se requieren pedidos en este momento
    </div>`}

    <div class="card">
      <div class="card-header">
        <span class="ch-title">🔄 ${tienda?.nombre ?? ''} · ${datos.length} productos</span>
        <span class="ch-meta">Lead time: ${App.leadTime} día${App.leadTime !== 1 ? 's' : ''} · Stock Seguridad = Venta Prom × 1.5</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Riesgo</th>
              <th>Stock</th>
              <th>Cobertura</th>
              <th>Cap. Exhibición</th>
              <th>Cantidad Sugerida</th>
              <th>Valor Est.</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            ${datos.length > 0 ? `
            <tr class="total-row">
              <td colspan="5">TOTAL PEDIDO</td>
              <td><span class="pedido-cantidad">${totalPed}</span></td>
              <td style="font-weight:700">$${totalVal.toLocaleString('es-CO')}</td>
            </tr>` : ''}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal resumen de pedido -->
    <div id="modal-pedido" class="modal-overlay hidden" onclick="if(event.target.id==='modal-pedido')cerrarModalPedido()">
      <div class="modal-box" style="max-width:540px">
        <div class="modal-header">
          <h3>📄 Resumen del Pedido</h3>
          <button class="modal-close" onclick="cerrarModalPedido()">✕</button>
        </div>
        <div id="resumen-pedido-content" style="padding:18px;max-height:60vh;overflow-y:auto"></div>
        <div class="form-actions">
          <button class="btn-secondary" onclick="cerrarModalPedido()">Cerrar</button>
          <button class="btn-primary" onclick="window.print()">🖨️ Imprimir</button>
        </div>
      </div>
    </div>`;
}

function generarResumenPedido() {
  const tiendaId = App.tiendaActiva;
  const tienda   = TIENDAS.find(t => t.id === tiendaId);
  const datos    = calcularTodos(App.leadTime)
    .filter(c => c.tiendaId === tiendaId && c.resultado.cantidadSugerida > 0)
    .sort((a, b) => {
      const orden = { QUIEBRE: 0, CRÍTICO: 1, ALTO: 2, MEDIO: 3, BAJO: 4 };
      return orden[a.resultado.nivelRiesgo] - orden[b.resultado.nivelRiesgo];
    });

  const totalVal = datos.reduce((s, c) => s + (c.resultado.cantidadSugerida * c.producto.precio), 0);
  const hoy      = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  const filas = datos.map(c => `
    <tr>
      <td style="font-weight:600">${c.producto.nombre}</td>
      <td style="text-align:center">${badgeRiesgo(c.resultado.nivelRiesgo)}</td>
      <td style="text-align:center;font-weight:700;color:#2563eb">${c.resultado.cantidadSugerida}</td>
      <td style="text-align:right;font-weight:600">$${(c.resultado.cantidadSugerida * c.producto.precio).toLocaleString('es-CO')}</td>
    </tr>`).join('');

  document.getElementById('resumen-pedido-content').innerHTML = `
    <div style="margin-bottom:16px">
      <p style="font-size:13px;font-weight:700;color:#1e293b">🏪 ${tienda?.nombre ?? ''}</p>
      <p style="font-size:11px;color:#64748b">Fecha: ${hoy} · Lead time: ${App.leadTime} días</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
          <th style="padding:8px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase">Producto</th>
          <th style="padding:8px;text-align:center;color:#64748b;font-size:10px;text-transform:uppercase">Riesgo</th>
          <th style="padding:8px;text-align:center;color:#64748b;font-size:10px;text-transform:uppercase">Cant.</th>
          <th style="padding:8px;text-align:right;color:#64748b;font-size:10px;text-transform:uppercase">Valor</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr style="border-top:2px solid #e2e8f0;background:#eff6ff">
          <td colspan="2" style="padding:8px;font-weight:700">TOTAL</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#2563eb">
            ${datos.reduce((s, c) => s + c.resultado.cantidadSugerida, 0)} uds
          </td>
          <td style="padding:8px;text-align:right;font-weight:700">$${totalVal.toLocaleString('es-CO')}</td>
        </tr>
      </tfoot>
    </table>`;

  document.getElementById('modal-pedido').classList.remove('hidden');
}

function cerrarModalPedido() {
  document.getElementById('modal-pedido').classList.add('hidden');
}
