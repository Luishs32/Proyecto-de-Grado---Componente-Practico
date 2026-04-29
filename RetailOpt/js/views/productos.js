'use strict';

// ─────────────────────────────────────────────
// VISTA: Gestión de Productos (CRUD)
// RF1 – Registro de productos por tienda
// ─────────────────────────────────────────────

function renderProductos() {
  const filas = PRODUCTOS.map(p => `
    <tr>
      <td class="text-muted text-small" style="font-family:monospace">#${p.id}</td>
      <td class="fw">${p.nombre}</td>
      <td><span class="badge badge-cat">${p.categoria}</span></td>
      <td class="muted">${p.proveedor}</td>
      <td class="fw">$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td>
        <button class="btn-icon" onclick="editarProducto(${p.id})" title="Editar">✏️</button>
        <button class="btn-icon btn-danger" onclick="eliminarProducto(${p.id})" title="Eliminar">🗑️</button>
      </td>
    </tr>`).join('');

  const notificacion = !SUPABASE_CONFIGURED
    ? `<div class="info-banner">⚠️ Modo demo — los cambios se guardan en memoria. Configura Supabase para persistencia real.</div>`
    : '';

  return `
    <h1 class="view-title">Gestión de Productos</h1>
    <p class="view-subtitle">${PRODUCTOS.length} productos registrados en el sistema</p>

    ${notificacion}

    <div class="card">
      <div class="card-header">
        <span class="ch-title">📦 Catálogo de productos</span>
        <button class="btn-primary" onclick="abrirModalProducto()">+ Nuevo Producto</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Producto</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Precio Unitario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">No hay productos registrados</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <!-- ══ MODAL PRODUCTO ══ -->
    <div id="modal-producto" class="modal-overlay hidden" onclick="cerrarModalProductoFuera(event)">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-prod-titulo">Nuevo Producto</h3>
          <button class="modal-close" onclick="cerrarModalProducto()">✕</button>
        </div>
        <form id="form-producto" onsubmit="guardarProducto(event)">
          <input type="hidden" id="prod-id" />
          <div class="form-group">
            <label>Nombre del producto *</label>
            <input type="text" id="prod-nombre" required placeholder="Ej: Leche Entera 1L" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoría *</label>
              <input type="text" id="prod-categoria" required placeholder="Ej: Lácteos" />
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <input type="text" id="prod-proveedor" placeholder="Ej: Alquería" />
            </div>
          </div>
          <div class="form-group">
            <label>Precio unitario (COP) *</label>
            <input type="number" id="prod-precio" required min="0" step="100" placeholder="Ej: 3200" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="cerrarModalProducto()">Cancelar</button>
            <button type="submit" class="btn-primary" id="btn-guardar-prod">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
}

// ── Abrir modal ─────────────────────────────────────────
function abrirModalProducto(prod = null) {
  document.getElementById('modal-prod-titulo').textContent  = prod ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('prod-id').value         = prod ? prod.id        : '';
  document.getElementById('prod-nombre').value     = prod ? prod.nombre    : '';
  document.getElementById('prod-categoria').value  = prod ? prod.categoria : '';
  document.getElementById('prod-proveedor').value  = prod ? prod.proveedor : '';
  document.getElementById('prod-precio').value     = prod ? prod.precio    : '';
  document.getElementById('modal-producto').classList.remove('hidden');
  document.getElementById('prod-nombre').focus();
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.add('hidden');
}

function cerrarModalProductoFuera(e) {
  if (e.target.id === 'modal-producto') cerrarModalProducto();
}

// ── Editar ──────────────────────────────────────────────
function editarProducto(id) {
  const prod = PRODUCTOS.find(p => p.id === id);
  if (prod) abrirModalProducto(prod);
}

// ── Guardar (crear o actualizar) ────────────────────────
async function guardarProducto(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar-prod');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const id    = document.getElementById('prod-id').value;
  const datos = {
    nombre:    document.getElementById('prod-nombre').value.trim(),
    categoria: document.getElementById('prod-categoria').value.trim(),
    proveedor: document.getElementById('prod-proveedor').value.trim(),
    precio:    parseFloat(document.getElementById('prod-precio').value),
  };

  try {
    if (SUPABASE_CONFIGURED && db) {
      if (id) {
        const { error } = await db.from('productos').update(datos).eq('id', parseInt(id));
        if (error) throw error;
        const idx = PRODUCTOS.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) Object.assign(PRODUCTOS[idx], datos);
      } else {
        const { data, error } = await db.from('productos').insert(datos).select().single();
        if (error) throw error;
        PRODUCTOS.push({ id: data.id, ...datos });
      }
    } else {
      if (id) {
        const idx = PRODUCTOS.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) Object.assign(PRODUCTOS[idx], datos);
      } else {
        const newId = Math.max(0, ...PRODUCTOS.map(p => p.id)) + 1;
        PRODUCTOS.push({ id: newId, ...datos });
      }
    }
    cerrarModalProducto();
    App.render();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}

// ── Eliminar ────────────────────────────────────────────
async function eliminarProducto(id) {
  const prod = PRODUCTOS.find(p => p.id === id);
  if (!prod) return;
  if (!confirm(`¿Eliminar "${prod.nombre}"? También se eliminarán su góndola e inventario asociados.`)) return;

  try {
    if (SUPABASE_CONFIGURED && db) {
      const { error } = await db.from('productos').delete().eq('id', id);
      if (error) throw error;
    }
    PRODUCTOS.splice(PRODUCTOS.findIndex(p => p.id === id), 1);
    for (let i = GONDOLA.length   - 1; i >= 0; i--) if (GONDOLA[i].productoId   === id) GONDOLA.splice(i, 1);
    for (let i = INVENTARIO.length - 1; i >= 0; i--) if (INVENTARIO[i].productoId === id) INVENTARIO.splice(i, 1);
    App.render();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
}
