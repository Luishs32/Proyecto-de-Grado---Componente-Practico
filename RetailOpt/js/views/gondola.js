'use strict';

/**
 * views/gondola.js — Configuración de Góndola (RF2)
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * RF2: Registrar número de caras, niveles y profundidad por producto.
 * La capacidad de exhibición física determina el stock objetivo
 * en el algoritmo de reposición.
 */

function renderGondola() {
  // Usuarios de tienda solo ven y editan su propia tienda
  const session  = getSession();
  if (!esAdmin() && session?.tiendaId !== null) {
    App.tiendaActiva = session.tiendaId;
  }

  const tiendaId = App.tiendaActiva;
  const tienda   = TIENDAS.find(t => t.id === tiendaId);
  const gondolas = GONDOLA.filter(g => g.tiendaId === tiendaId);

  // Tabs de tienda solo visibles para el administrador general
  const tabs = esAdmin() ? TIENDAS.map(t => `
    <button class="tab-btn ${t.id === tiendaId ? 'active' : ''}"
            onclick="App.tiendaActiva=${t.id}; App.render()">
      🏪 ${t.nombre}
    </button>`).join('') : '';

  const filas = gondolas.map(g => {
    const producto = PRODUCTOS.find(p => p.id === g.productoId);
    const cap      = g.caras * g.niveles * g.profundidad;
    return `
    <tr>
      <td class="fw">${producto?.nombre ?? '—'}</td>
      <td style="text-align:center;font-weight:700">${g.caras}</td>
      <td style="text-align:center;font-weight:700">${g.niveles}</td>
      <td style="text-align:center;font-weight:700">${g.profundidad}</td>
      <td>
        <span class="val-teal">${cap} unid.</span>
        <span class="text-muted text-small" style="margin-left:5px">(${g.caras}×${g.niveles}×${g.profundidad})</span>
      </td>
      <td>
        <button class="btn-icon" onclick="editarGondola(${g.tiendaId},${g.productoId})" title="Editar">✏️</button>
        <button class="btn-icon btn-danger" onclick="eliminarGondola(${g.tiendaId},${g.productoId})" title="Eliminar">🗑️</button>
      </td>
    </tr>`;
  }).join('');

  const idsConGondola    = gondolas.map(g => g.productoId);
  const prodDisponibles  = PRODUCTOS.filter(p => !idsConGondola.includes(p.id));
  const opcionesProducto = prodDisponibles.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  return `
    <h1 class="view-title">Configuración de Góndola</h1>
    <p class="view-subtitle">RF2 – Caras, niveles y profundidad por producto y tienda</p>

    <div class="tab-row">${tabs}</div>

    <div class="card">
      <div class="card-header">
        <span class="ch-title">🗄️ ${tienda?.nombre ?? ''}</span>
        ${prodDisponibles.length > 0
          ? `<button class="btn-primary" onclick="abrirModalGondolaNuevo()">+ Nueva Config.</button>`
          : `<span class="ch-meta" style="color:#16a34a;font-weight:600">✅ Todos los productos están configurados</span>`}
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center">Caras</th>
              <th style="text-align:center">Niveles</th>
              <th style="text-align:center">Profundidad</th>
              <th>Cap. Exhibición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Sin configuraciones para esta tienda</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div id="modal-gondola" class="modal-overlay hidden" onclick="cerrarModalGondolaFuera(event)">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-gondola-titulo">Editar Configuración</h3>
          <button class="modal-close" onclick="cerrarModalGondola()">✕</button>
        </div>
        <form id="form-gondola" onsubmit="guardarGondola(event)">
          <input type="hidden" id="gondola-tienda-id" />
          <input type="hidden" id="gondola-producto-id" />
          <input type="hidden" id="gondola-es-nuevo" value="0" />
          <div class="form-group" id="gondola-select-wrap" style="display:none">
            <label>Producto *</label>
            <select id="gondola-producto-select">${opcionesProducto}</select>
          </div>
          <div class="form-group" id="gondola-nombre-wrap">
            <label>Producto</label>
            <input type="text" id="gondola-producto-nombre" readonly class="input-readonly" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Caras *</label>
              <input type="number" id="gondola-caras" required min="1" max="20" />
            </div>
            <div class="form-group">
              <label>Niveles *</label>
              <input type="number" id="gondola-niveles" required min="1" max="10" />
            </div>
            <div class="form-group">
              <label>Profundidad *</label>
              <input type="number" id="gondola-profundidad" required min="1" max="20" />
            </div>
          </div>
          <small class="form-hint">Capacidad = Caras × Niveles × Profundidad</small>
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="cerrarModalGondola()">Cancelar</button>
            <button type="submit" class="btn-primary" id="btn-guardar-gondola">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
}

function abrirModalGondolaNuevo() {
  document.getElementById('modal-gondola-titulo').textContent  = 'Nueva Configuración';
  document.getElementById('gondola-tienda-id').value           = App.tiendaActiva;
  document.getElementById('gondola-producto-id').value         = '';
  document.getElementById('gondola-es-nuevo').value            = '1';
  document.getElementById('gondola-select-wrap').style.display = '';
  document.getElementById('gondola-nombre-wrap').style.display = 'none';
  document.getElementById('gondola-caras').value       = 1;
  document.getElementById('gondola-niveles').value     = 1;
  document.getElementById('gondola-profundidad').value = 1;
  document.getElementById('modal-gondola').classList.remove('hidden');
  document.getElementById('gondola-caras').focus();
}

function editarGondola(tiendaId, productoId) {
  const g    = GONDOLA.find(x => x.tiendaId === tiendaId && x.productoId === productoId);
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!g) return;

  document.getElementById('modal-gondola-titulo').textContent  = 'Editar Configuración';
  document.getElementById('gondola-tienda-id').value           = tiendaId;
  document.getElementById('gondola-producto-id').value         = productoId;
  document.getElementById('gondola-es-nuevo').value            = '0';
  document.getElementById('gondola-select-wrap').style.display = 'none';
  document.getElementById('gondola-nombre-wrap').style.display = '';
  document.getElementById('gondola-producto-nombre').value     = prod?.nombre ?? '';
  document.getElementById('gondola-caras').value               = g.caras;
  document.getElementById('gondola-niveles').value             = g.niveles;
  document.getElementById('gondola-profundidad').value         = g.profundidad;
  document.getElementById('modal-gondola').classList.remove('hidden');
  document.getElementById('gondola-caras').focus();
}

function cerrarModalGondola() {
  document.getElementById('modal-gondola').classList.add('hidden');
}

function cerrarModalGondolaFuera(e) {
  if (e.target.id === 'modal-gondola') cerrarModalGondola();
}

async function guardarGondola(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar-gondola');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const tiendaId   = parseInt(document.getElementById('gondola-tienda-id').value);
  const esNuevo    = document.getElementById('gondola-es-nuevo').value === '1';
  const productoId = esNuevo
    ? parseInt(document.getElementById('gondola-producto-select').value)
    : parseInt(document.getElementById('gondola-producto-id').value);

  const datos = {
    caras:       parseInt(document.getElementById('gondola-caras').value),
    niveles:     parseInt(document.getElementById('gondola-niveles').value),
    profundidad: parseInt(document.getElementById('gondola-profundidad').value),
  };

  try {
    if (SUPABASE_CONFIGURED && db) {
      if (esNuevo) {
        const { error } = await db.from('gondola').insert({ tienda_id: tiendaId, producto_id: productoId, ...datos });
        if (error) throw error;
        GONDOLA.push({ tiendaId, productoId, ...datos });
      } else {
        const { error } = await db.from('gondola').update(datos)
          .eq('tienda_id', tiendaId).eq('producto_id', productoId);
        if (error) throw error;
        const idx = GONDOLA.findIndex(g => g.tiendaId === tiendaId && g.productoId === productoId);
        if (idx !== -1) Object.assign(GONDOLA[idx], datos);
      }
    } else {
      if (esNuevo) {
        GONDOLA.push({ tiendaId, productoId, ...datos });
      } else {
        const idx = GONDOLA.findIndex(g => g.tiendaId === tiendaId && g.productoId === productoId);
        if (idx !== -1) Object.assign(GONDOLA[idx], datos);
      }
    }
    cerrarModalGondola();
    App.render();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}

async function eliminarGondola(tiendaId, productoId) {
  const prod = PRODUCTOS.find(p => p.id === productoId);
  if (!confirm(`¿Eliminar la configuración de góndola para "${prod?.nombre ?? 'este producto'}"?`)) return;

  try {
    if (SUPABASE_CONFIGURED && db) {
      const { error } = await db.from('gondola').delete()
        .eq('tienda_id', tiendaId).eq('producto_id', productoId);
      if (error) throw error;
    }
    const idx = GONDOLA.findIndex(g => g.tiendaId === tiendaId && g.productoId === productoId);
    if (idx !== -1) GONDOLA.splice(idx, 1);
    App.render();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
}
