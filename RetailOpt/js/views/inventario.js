'use strict';

/**
 * views/inventario.js — Inventario Actual (RF3, RF5)
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * RF3: Consultar inventario disponible.
 * RF5: Integrar datos históricos de ventas.
 */

function renderInventario() {
  const tiendaId = App.tiendaActiva;
  const tienda   = TIENDAS.find(t => t.id === tiendaId);
  const items    = INVENTARIO.filter(i => i.tiendaId === tiendaId);

  const tabs = TIENDAS.map(t => `
    <button class="tab-btn ${t.id === tiendaId ? 'active' : ''}"
            onclick="App.tiendaActiva=${t.id}; App.render()">
      🏪 ${t.nombre}
    </button>`).join('');

  const filas = items.map(inv => {
    const producto = PRODUCTOS.find(p => p.id === inv.productoId);
    const promedio = (inv.ventasDiarias.reduce((a, b) => a + b, 0) / inv.ventasDiarias.length).toFixed(1);
    const stockHtml = inv.stockActual === 0
      ? `<span class="val-quiebre">${inv.stockActual}</span>`
      : inv.stockActual < 5
        ? `<span class="val-critico">${inv.stockActual}</span>`
        : `<span class="val-normal">${inv.stockActual}</span>`;

    return `
    <tr>
      <td class="fw">${producto?.nombre ?? '—'}</td>
      <td>${stockHtml}</td>
      <td style="font-weight:500;color:#475569">${promedio}</td>
      <td>${miniBarChart(inv.ventasDiarias)}</td>
      <td>
        <button class="btn-icon" onclick="editarInventario(${inv.tiendaId},${inv.productoId})" title="Editar">✏️</button>
      </td>
    </tr>`;
  }).join('');

  return `
    <h1 class="view-title">Inventario Actual</h1>
    <p class="view-subtitle">RF3/RF5 – Stock disponible e historial de ventas de los últimos 7 días</p>

    <div class="tab-row">${tabs}</div>

    <div class="card">
      <div class="card-header">
        <span class="ch-title">🏷️ ${tienda?.nombre ?? ''}</span>
        <span class="ch-meta">Mini-gráficas: barras = últimos 7 días (Lun–Dom)</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th><th>Stock Actual</th><th>Venta Prom / Día</th>
              <th>Historial 7 días</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin inventario para esta tienda</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div id="modal-inventario" class="modal-overlay hidden" onclick="cerrarModalInventarioFuera(event)">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Actualizar Inventario</h3>
          <button class="modal-close" onclick="cerrarModalInventario()">✕</button>
        </div>
        <form id="form-inventario" onsubmit="guardarInventario(event)">
          <input type="hidden" id="inv-tienda-id" />
          <input type="hidden" id="inv-producto-id" />
          <div class="form-group">
            <label>Producto</label>
            <input type="text" id="inv-producto-nombre" readonly class="input-readonly" />
          </div>
          <div class="form-group">
            <label>Stock actual (unidades) *</label>
            <input type="number" id="inv-stock" required min="0" step="1" />
          </div>
          <div class="form-group">
            <label>Ventas últimos 7 días — Lun, Mar, Mié, Jue, Vie, Sáb, Dom</label>
            <input type="text" id="inv-ventas" placeholder="Ej: 18,20,15,22,19,17,21" />
            <small class="form-hint">7 valores separados por coma</small>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="cerrarModalInventario()">Cancelar</button>
            <button type="submit" class="btn-primary" id="btn-guardar-inv">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
}

function editarInventario(tiendaId, productoId) {
  const inv  = INVENTARIO.find(i => i.tiendaId === tiendaId && i.productoId === productoId);
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!inv) return;

  document.getElementById('inv-tienda-id').value       = tiendaId;
  document.getElementById('inv-producto-id').value     = productoId;
  document.getElementById('inv-producto-nombre').value = prod?.nombre ?? '';
  document.getElementById('inv-stock').value           = inv.stockActual;
  document.getElementById('inv-ventas').value          = inv.ventasDiarias.join(',');
  document.getElementById('modal-inventario').classList.remove('hidden');
  document.getElementById('inv-stock').focus();
}

function cerrarModalInventario() {
  document.getElementById('modal-inventario').classList.add('hidden');
}

function cerrarModalInventarioFuera(e) {
  if (e.target.id === 'modal-inventario') cerrarModalInventario();
}

async function guardarInventario(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar-inv');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const tiendaId      = parseInt(document.getElementById('inv-tienda-id').value);
  const productoId    = parseInt(document.getElementById('inv-producto-id').value);
  const stockActual   = parseInt(document.getElementById('inv-stock').value);
  const ventasDiarias = document.getElementById('inv-ventas').value
    .split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));

  if (ventasDiarias.length !== 7) {
    alert('Ingresa exactamente 7 valores de ventas separados por coma.');
    btn.disabled = false;
    btn.textContent = 'Guardar';
    return;
  }

  try {
    if (SUPABASE_CONFIGURED && db) {
      const { error } = await db.from('inventario')
        .update({ stock_actual: stockActual, ventas_diarias: ventasDiarias, updated_at: new Date().toISOString() })
        .eq('tienda_id', tiendaId).eq('producto_id', productoId);
      if (error) throw error;
    }
    const idx = INVENTARIO.findIndex(i => i.tiendaId === tiendaId && i.productoId === productoId);
    if (idx !== -1) {
      INVENTARIO[idx].stockActual   = stockActual;
      INVENTARIO[idx].ventasDiarias = ventasDiarias;
    }
    cerrarModalInventario();
    App.render();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}
