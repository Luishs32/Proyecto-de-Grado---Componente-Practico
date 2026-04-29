/**
 * views/dashboard.js — Vista: Panel de Control
 * Proyecto de Grado · UNAD · 2026
 */

'use strict';

function renderDashboard() {
  const todos     = calcularTodos(App.leadTime);
  const quiebres  = todos.filter(c => c.resultado.nivelRiesgo === 'QUIEBRE');
  const criticos  = todos.filter(c => c.resultado.nivelRiesgo === 'CRÍTICO');
  const altos     = todos.filter(c => c.resultado.nivelRiesgo === 'ALTO');
  const totalPed  = todos.reduce((s, c) => s + c.resultado.cantidadSugerida, 0);
  const totalStk  = INVENTARIO.reduce((s, i) => s + i.stockActual, 0);
  const hoy       = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  // Alertas a mostrar (máx 8, ordenadas por prioridad)
  const orden = { QUIEBRE: 0, CRÍTICO: 1, ALTO: 2 };
  const alertas = todos
    .filter(c => ['QUIEBRE', 'CRÍTICO', 'ALTO'].includes(c.resultado.nivelRiesgo))
    .sort((a, b) => orden[a.resultado.nivelRiesgo] - orden[b.resultado.nivelRiesgo])
    .slice(0, 8);

  // ── KPIs ──────────────────────────────────────────
  const kpiHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#dbeafe">🏪</div>
        <div>
          <div class="kpi-value">${TIENDAS.length}</div>
          <div class="kpi-label">Tiendas activas</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#ede9fe">📦</div>
        <div>
          <div class="kpi-value">${PRODUCTOS.length}</div>
          <div class="kpi-label">Productos registrados</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#ccfbf1">🗃️</div>
        <div>
          <div class="kpi-value">${totalStk.toLocaleString()}</div>
          <div class="kpi-label">Unidades en stock</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#fef3c7">🔄</div>
        <div>
          <div class="kpi-value">${totalPed}</div>
          <div class="kpi-label">Unidades a reponer</div>
        </div>
      </div>
    </div>`;

  // ── Resumen de alertas ─────────────────────────────
  const alertSummary = `
    <div class="alert-summary-grid">
      <div class="alert-box" style="background:#fef2f2;border-color:#fca5a5">
        <div class="alert-num" style="color:#b91c1c">${quiebres.length}</div>
        <div class="alert-label" style="color:#dc2626">⛔ Quiebres de Stock</div>
      </div>
      <div class="alert-box" style="background:#fff7ed;border-color:#fdba74">
        <div class="alert-num" style="color:#c2410c">${criticos.length}</div>
        <div class="alert-label" style="color:#ea580c">🔴 Riesgo Crítico</div>
      </div>
      <div class="alert-box" style="background:#fefce8;border-color:#fde047">
        <div class="alert-num" style="color:#92400e">${altos.length}</div>
        <div class="alert-label" style="color:#b45309">🟡 Riesgo Alto</div>
      </div>
    </div>`;

  // ── Lista de alertas ───────────────────────────────
  const alertRows = alertas.length === 0
    ? '<p style="text-align:center;padding:20px;font-size:12px;color:#94a3b8">✅ Sin alertas activas</p>'
    : alertas.map(a => `
      <div class="alert-list-row">
        ${badgeRiesgo(a.resultado.nivelRiesgo)}
        <div class="alr-info">
          <div class="alr-name">${a.producto.nombre}</div>
          <div class="alr-store">${a.tienda.nombre}</div>
        </div>
        <div>
          <div class="alr-stock">Stock: ${a.stockActual}</div>
          <div class="alr-units">Reponer: ${a.resultado.cantidadSugerida} uds</div>
        </div>
      </div>`).join('');

  const alertCard = `
    <div class="card">
      <div class="card-header">
        <span class="ch-title">⚠️ Alertas prioritarias</span>
        <span class="ch-meta">${alertas.length} productos requieren atención · ${hoy}</span>
      </div>
      ${alertRows}
    </div>`;

  return `
    <h1 class="view-title">Panel de Control</h1>
    <p class="view-subtitle">Resumen general del sistema de reposición inteligente</p>
    ${kpiHTML}
    ${alertSummary}
    ${alertCard}`;
}
