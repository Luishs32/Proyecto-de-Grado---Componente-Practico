'use strict';

/**
 * views/tiendas.js — Gestión de Tiendas
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 */

function renderTiendas() {
  const filas = TIENDAS.map(t => `
    <tr>
      <td class="text-muted text-small" style="font-family:monospace">#${t.id}</td>
      <td class="fw">${t.nombre}</td>
      <td>${t.ciudad || '—'}</td>
      <td><span class="badge ${t.estado === 'Activa' ? 'badge-bajo' : 'badge-medio'}">${t.estado || 'Activa'}</span></td>
      <td>
        <button class="btn-icon" onclick="editarTienda(${t.id})" title="Editar">✏️</button>
        <button class="btn-icon btn-danger" onclick="eliminarTienda(${t.id})" title="Eliminar">🗑️</button>
      </td>
    </tr>`).join('');

  return `
    <h1 class="view-title">Gestión de Tiendas</h1>
    <p class="view-subtitle">${TIENDAS.length} tienda${TIENDAS.length !== 1 ? 's' : ''} registrada${TIENDAS.length !== 1 ? 's' : ''} en el sistema</p>

    <div class="card">
      <div class="card-header">
        <span class="ch-title">🏪 Tiendas</span>
        <button class="btn-primary" onclick="abrirModalTienda()">+ Nueva Tienda</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Ciudad</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin tiendas registradas</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div id="modal-tienda" class="modal-overlay hidden" onclick="cerrarModalTiendaFuera(event)">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-tienda-titulo">Nueva Tienda</h3>
          <button class="modal-close" onclick="cerrarModalTienda()">✕</button>
        </div>
        <form id="form-tienda" onsubmit="guardarTienda(event)">
          <input type="hidden" id="tienda-id" />
          <div class="form-group">
            <label>Nombre *</label>
            <input type="text" id="tienda-nombre" required placeholder="Ej: Tienda Norte" />
          </div>
          <div class="form-group">
            <label>Ciudad</label>
            <input type="text" id="tienda-ciudad" placeholder="Ej: Pereira" />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select id="tienda-estado">
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="cerrarModalTienda()">Cancelar</button>
            <button type="submit" class="btn-primary" id="btn-guardar-tienda">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
}

function abrirModalTienda(tienda = null) {
  document.getElementById('modal-tienda-titulo').textContent = tienda ? 'Editar Tienda' : 'Nueva Tienda';
  document.getElementById('tienda-id').value     = tienda?.id      ?? '';
  document.getElementById('tienda-nombre').value = tienda?.nombre  ?? '';
  document.getElementById('tienda-ciudad').value = tienda?.ciudad  ?? '';
  document.getElementById('tienda-estado').value = tienda?.estado  ?? 'Activa';
  document.getElementById('modal-tienda').classList.remove('hidden');
  document.getElementById('tienda-nombre').focus();
}

function cerrarModalTienda() {
  document.getElementById('modal-tienda').classList.add('hidden');
}

function cerrarModalTiendaFuera(e) {
  if (e.target.id === 'modal-tienda') cerrarModalTienda();
}

function editarTienda(id) {
  const tienda = TIENDAS.find(t => t.id === id);
  if (tienda) abrirModalTienda(tienda);
}

async function guardarTienda(e) {
  e.preventDefault();
  const btn  = document.getElementById('btn-guardar-tienda');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const id    = document.getElementById('tienda-id').value;
  const datos = {
    nombre: document.getElementById('tienda-nombre').value.trim(),
    ciudad: document.getElementById('tienda-ciudad').value.trim() || 'Pereira',
    estado: document.getElementById('tienda-estado').value,
  };

  try {
    if (SUPABASE_CONFIGURED && db) {
      if (id) {
        const { error } = await db.from('tiendas').update(datos).eq('id', parseInt(id));
        if (error) throw error;
        const idx = TIENDAS.findIndex(t => t.id === parseInt(id));
        if (idx !== -1) Object.assign(TIENDAS[idx], datos);
      } else {
        const { data, error } = await db.from('tiendas').insert(datos).select().single();
        if (error) throw error;
        TIENDAS.push({ id: data.id, ...datos });
      }
    } else {
      if (id) {
        const idx = TIENDAS.findIndex(t => t.id === parseInt(id));
        if (idx !== -1) Object.assign(TIENDAS[idx], datos);
      } else {
        TIENDAS.push({ id: Math.max(0, ...TIENDAS.map(t => t.id)) + 1, ...datos });
      }
    }
    cerrarModalTienda();
    App.render();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}

async function eliminarTienda(id) {
  const tienda = TIENDAS.find(t => t.id === id);
  if (!tienda) return;
  if (!confirm(`¿Eliminar "${tienda.nombre}"? Se eliminarán también sus góndolas e inventario asociados.`)) return;

  try {
    if (SUPABASE_CONFIGURED && db) {
      const { error } = await db.from('tiendas').delete().eq('id', id);
      if (error) throw error;
    }
    TIENDAS.splice(TIENDAS.findIndex(t => t.id === id), 1);
    for (let i = GONDOLA.length    - 1; i >= 0; i--) if (GONDOLA[i].tiendaId    === id) GONDOLA.splice(i, 1);
    for (let i = INVENTARIO.length - 1; i >= 0; i--) if (INVENTARIO[i].tiendaId === id) INVENTARIO.splice(i, 1);
    if (App.tiendaActiva === id && TIENDAS.length > 0) App.tiendaActiva = TIENDAS[0].id;
    App.render();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
}
