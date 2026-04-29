'use strict';

/**
 * views/inventario.js — Inventario Actual (RF3, RF5)
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * RF3: Consultar inventario disponible.
 * RF5: Integrar datos históricos de ventas.
 */

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

    <!-- Modal actualizar inventario -->
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
            <label>Ventas por día — últimos 7 días</label>
            <div class="ventas-semana">
              ${DIAS_SEMANA.map(d => `
              <div class="venta-dia">
                <span>${d}</span>
                <input type="number" id="venta-${d.toLowerCase().replace('é','e')}"
                       min="0" step="1" value="0"
                       oninput="actualizarPromedioVentas()" />
              </div>`).join('')}
            </div>
            <div class="venta-promedio" id="venta-promedio-display">
              Promedio diario: <strong>0.0 uds/día</strong>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="cerrarModalInventario()">Cancelar</button>
            <button type="submit" class="btn-primary" id="btn-guardar-inv">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
}

// IDs de los inputs de ventas (coinciden con los id= del HTML)
const IDS_VENTA = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

function actualizarPromedioVentas() {
  const valores = IDS_VENTA.map(id => parseInt(document.getElementById(`venta-${id}`)?.value) || 0);
  const promedio = (valores.reduce((a, b) => a + b, 0) / 7).toFixed(1);
  const el = document.getElementById('venta-promedio-display');
  if (el) el.innerHTML = `Promedio diario: <strong>${promedio} uds/día</strong>`;
}

function editarInventario(tiendaId, productoId) {
  const inv  = INVENTARIO.find(i => i.tiendaId === tiendaId && i.productoId === productoId);
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!inv) return;

  document.getElementById('inv-tienda-id').value       = tiendaId;
  document.getElementById('inv-producto-id').value     = productoId;
  document.getElementById('inv-producto-nombre').value = prod?.nombre ?? '';
  document.getElementById('inv-stock').value           = inv.stockActual;

  // Rellenar cada input de día con su valor
  IDS_VENTA.forEach((id, i) => {
    const el = document.getElementById(`venta-${id}`);
    if (el) el.value = inv.ventasDiarias[i] ?? 0;
  });

  actualizarPromedioVentas();
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
  const ventasDiarias = IDS_VENTA.map(id => parseInt(document.getElementById(`venta-${id}`)?.value) || 0);

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
