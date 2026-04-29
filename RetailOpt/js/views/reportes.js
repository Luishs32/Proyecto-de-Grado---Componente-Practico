/**
 * views/reportes.js — Vista: Reportes del Sistema
 * Proyecto de Grado · UNAD · 2026
 *
 * RF7: Generar reportes de quiebres de stock.
 * Consolidado por tienda, alertas activas e indicadores de impacto.
 */

'use strict';

function renderReportes() {
  const todos    = calcularTodos(App.leadTime);
  const quiebres = todos.filter(c => c.resultado.nivelRiesgo === 'QUIEBRE');
  const totalVal = todos.reduce((s, c) => s + (c.resultado.cantidadSugerida * c.producto.precio), 0);
  const segPct   = Math.round(
    (todos.filter(c => ['BAJO', 'MEDIO'].includes(c.resultado.nivelRiesgo)).length / todos.length) * 100
  );

  // ── Resumen por tienda ─────────────────────────────
  const porTienda = TIENDAS.map(t => {
    const tc = todos.filter(c => c.tiendaId === t.id);
    return {
      tienda:  t,
      quiebres: tc.filter(c => c.resultado.nivelRiesgo === 'QUIEBRE').length,
      totalPed: tc.reduce((s, c) => s + c.resultado.cantidadSugerida, 0),
      valorPed: tc.reduce((s, c) => s + (c.resultado.cantidadSugerida * c.producto.precio), 0),
      stockTotal: tc.reduce((s, c) => s + c.stockActual, 0),
    };
  });

  const filasResumen = porTienda.map(r => `
    <tr>
      <td class="fw">🏪 ${r.tienda.nombre}</td>
      <td style="font-weight:700">${r.stockTotal}</td>
      <td>
        ${r.quiebres > 0
          ? `<span style="background:#fef2f2;color:#991b1b;font-weight:700;padding:2px 8px;border-radius:12px;font-size:11px">${r.quiebres}</span>`
          : `<span style="color:#16a34a;font-weight:700">0 ✓</span>`}
      </td>
      <td style="font-weight:700;color:#2563eb">${r.totalPed} unid.</td>
      <td style="font-weight:600">$${r.valorPed.toLocaleString()}</td>
    </tr>`).join('');

  const totalStk = todos.reduce((s, c) => s + c.stockActual, 0);
  const totalPed = todos.reduce((s, c) => s + c.resultado.cantidadSugerida, 0);

  const resumenCard = `
    <div class="card">
      <div class="card-header">
        <span class="ch-title">📊 Resumen consolidado por tienda</span>
        <span class="ch-meta">RF7 – Reporte de quiebres de stock</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tienda</th>
              <th>Stock Total</th>
              <th>Quiebres</th>
              <th>A Reponer</th>
              <th>Valor del Pedido</th>
            </tr>
          </thead>
          <tbody>
            ${filasResumen}
            <tr class="total-row">
              <td>TOTAL GENERAL</td>
              <td>${totalStk}</td>
              <td style="color:#dc2626">${quiebres.length}</td>
              <td style="color:#2563eb">${totalPed} unid.</td>
              <td>$${totalVal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;

  // ── Quiebres activos ──────────────────────────────
  const quiebresCard = quiebres.length > 0 ? `
    <div class="card" style="border-color:#fca5a5">
      <div class="card-header" style="background:#fef2f2;border-color:#fca5a5">
        <span class="ch-title" style="color:#b91c1c">⛔ Quiebres de Stock Activos (${quiebres.length})</span>
        <span class="ch-meta" style="color:#dc2626">Requieren pedido urgente</span>
      </div>
      <div class="quiebre-list">
        ${quiebres.map(c => `
        <div class="quiebre-row">
          <div class="qr-info">
            <div class="qr-name">${c.producto.nombre}</div>
            <div class="qr-store">${c.tienda.nombre}</div>
          </div>
          <div class="qr-action">
            <div class="qr-stock">Stock: 0 unidades</div>
            <div class="qr-units">Reponer urgente: ${c.resultado.cantidadSugerida} uds</div>
          </div>
        </div>`).join('')}
      </div>
    </div>` : '';

  // ── Tarjeta de impacto ────────────────────────────
  const impactCard = `
    <div class="impact-card">
      <p class="ic-label">Indicadores de impacto del modelo de optimización</p>
      <div class="impact-grid">
        <div>
          <div class="ig-num">${segPct}%</div>
          <div class="ig-desc">Productos en rango seguro</div>
        </div>
        <div>
          <div class="ig-num">$${totalVal.toLocaleString()}</div>
          <div class="ig-desc">Valor total del pedido sugerido</div>
        </div>
        <div>
          <div class="ig-num">${todos.filter(c => c.resultado.cantidadSugerida === 0).length}</div>
          <div class="ig-desc">Productos con stock óptimo</div>
        </div>
      </div>
    </div>`;

  return `
    <h1 class="view-title">Reportes del Sistema</h1>
    <p class="view-subtitle">Análisis de quiebres de stock, pedidos sugeridos e indicadores de impacto</p>
    ${resumenCard}
    ${quiebresCard}
    ${impactCard}`;
}
