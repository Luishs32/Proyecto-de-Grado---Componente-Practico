'use strict';

/**
 * views/reposicion.js — Algoritmo de Reposición (RF4, RF6)
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * RF4: Generar sugerencia de pedido.
 * RF6: Calcular reposición considerando capacidad de exhibición.
 */

function renderReposicion() {
  const tiendaId = App.tiendaActiva;
  const tienda   = TIENDAS.find(t => t.id === tiendaId);
  const todos    = calcularTodos(App.leadTime).filter(c => c.tiendaId === tiendaId);

  const datos    = App.filtroRiesgo === 'TODOS'
    ? todos
    : todos.filter(c => c.resultado.nivelRiesgo === App.filtroRiesgo);

  const totalPed = datos.reduce((s, c) => s + c.resultado.cantidadSugerida, 0);
  const totalVal = datos.reduce((s, c) => s + (c.resultado.cantidadSugerida * c.producto.precio), 0);

  const tabTiendas = TIENDAS.map(t => `
    <button class="tab-btn ${t.id === tiendaId ? 'active' : ''}"
            onclick="App.tiendaActiva=${t.id}; App.render()">
      🏪 ${t.nombre}
    </button>`).join('');

  const tabRiesgos = ['TODOS', 'QUIEBRE', 'CRÍTICO', 'ALTO', 'MEDIO', 'BAJO'].map(n => `
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

  const formulaHTML = `
    <div class="formula-box">
      <p class="formula-title">📐 Fórmulas del algoritmo de reposición</p>
      <div class="formula-grid">
        <div class="formula-item"><strong>Cap. Exhibición</strong><br>Caras × Niveles × Profundidad</div>
        <div class="formula-item"><strong>Stock Objetivo</strong><br>Cap. Exhibición + Stock Seguridad</div>
        <div class="formula-item"><strong>Pedido Sugerido</strong><br>MAX(0, Stock Objetivo − Stock Actual)</div>
      </div>
    </div>`;

  const filas = datos.map(c => {
    const r   = c.resultado;
    const ped = r.cantidadSugerida;
    const val = (ped * c.producto.precio).toLocaleString();
    const pedHtml = ped > 0 ? `<span class="val-blue">${ped}</span>` : `<span class="val-green">0 ✓</span>`;

    return `
    <tr>
      <td class="fw" style="white-space:nowrap">${c.producto.nombre}</td>
      <td>${badgeRiesgo(r.nivelRiesgo)}</td>
      <td style="font-weight:700">${c.stockActual}</td>
      <td class="muted">${r.diasCobertura}d</td>
      <td>
        <span class="val-teal">${r.capacidadExhibicion}</span>
        <span class="text-muted text-small" style="margin-left:4px">(${c.gondola.caras}×${c.gondola.niveles}×${c.gondola.profundidad})</span>
      </td>
      <td class="muted">${r.stockObjetivo}</td>
      <td>${pedHtml}</td>
      <td style="font-weight:600">$${val}</td>
    </tr>`;
  }).join('');

  return `
    <h1 class="view-title">Algoritmo de Reposición</h1>
    <p class="view-subtitle">RF4/RF6 – Pedidos sugeridos basados en capacidad física de exhibición</p>

    <div class="tab-row">${tabTiendas}${leadControl}</div>
    ${formulaHTML}
    <div class="tab-row">${tabRiesgos}</div>

    <div class="card">
      <div class="card-header">
        <span class="ch-title">🔄 ${tienda?.nombre ?? ''} · ${datos.length} productos</span>
        <span class="ch-meta" style="font-weight:700;color:#2563eb">
          Total pedido: ${totalPed} uds · $${totalVal.toLocaleString()}
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th><th>Riesgo</th><th>Stock</th><th>Días Cob.</th>
              <th>Cap. Exhib.</th><th>Stock Obj.</th><th>Pedido Sug.</th><th>Valor Est.</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>`;
}
