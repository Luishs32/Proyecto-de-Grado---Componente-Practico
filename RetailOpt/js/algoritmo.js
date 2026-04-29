/**
 * algoritmo.js — Algoritmo de Reposición de Inventarios
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * LÓGICA CENTRAL DEL PROYECTO:
 * Calcula la cantidad sugerida de reposición para cada producto
 * considerando la capacidad física de exhibición en góndola.
 *
 * Fórmulas:
 *   Capacidad de Exhibición = caras × niveles × profundidad
 *   Venta Promedio Diaria   = promedio(ventasDiarias[7])
 *   Stock de Seguridad      = ceil(ventaPromDiaria × 1.5)
 *   Punto de Reorden        = ceil(ventaPromDiaria × leadTimeDias) + stockSeguridad
 *   Stock Objetivo          = capacidadExhibicion + stockSeguridad
 *   Pedido Sugerido         = MAX(0, stockObjetivo − stockActual)
 *   Días de Cobertura       = stockActual / ventaPromDiaria
 */

'use strict';

/**
 * Calcula la reposición sugerida para un registro de inventario.
 *
 * @param {Object} inv      - Registro de inventario { stockActual, ventasDiarias[] }
 * @param {Object} gondola  - Config. de góndola      { caras, niveles, profundidad }
 * @param {number} leadTime - Días de entrega del proveedor (default: 3)
 * @returns {Object} Resultado del cálculo con todos los indicadores
 */
function calcularReposicion(inv, gondola, leadTime = 3) {
  // ── 1. Venta promedio diaria ───────────────────────
  const sumaVentas      = inv.ventasDiarias.reduce((acc, v) => acc + v, 0);
  const ventaPromDiaria = sumaVentas / inv.ventasDiarias.length;

  // ── 2. Capacidad física de la góndola ─────────────
  const capacidadExhibicion = gondola.caras * gondola.niveles * gondola.profundidad;

  // ── 3. Stock de seguridad (buffer ante variabilidad) ──
  const stockSeguridad = Math.ceil(ventaPromDiaria * 1.5);

  // ── 4. Punto de reorden ───────────────────────────
  const puntoReorden = Math.ceil(ventaPromDiaria * leadTime) + stockSeguridad;

  // ── 5. Stock objetivo (góndola llena + seguridad) ──
  const stockObjetivo = capacidadExhibicion + stockSeguridad;

  // ── 6. Cantidad sugerida de pedido ────────────────
  const cantidadSugerida = Math.max(0, stockObjetivo - inv.stockActual);

  // ── 7. Días de cobertura del stock actual ─────────
  const diasCobertura = inv.stockActual > 0
    ? (inv.stockActual / ventaPromDiaria).toFixed(1)
    : '0.0';

  // ── 8. Clasificación de riesgo ────────────────────
  let nivelRiesgo;
  if (inv.stockActual === 0) {
    nivelRiesgo = 'QUIEBRE';
  } else if (inv.stockActual < ventaPromDiaria) {
    nivelRiesgo = 'CRÍTICO';
  } else if (inv.stockActual < puntoReorden) {
    nivelRiesgo = 'ALTO';
  } else if (inv.stockActual < stockObjetivo * 0.5) {
    nivelRiesgo = 'MEDIO';
  } else {
    nivelRiesgo = 'BAJO';
  }

  return {
    ventaPromDiaria:    parseFloat(ventaPromDiaria.toFixed(1)),
    capacidadExhibicion,
    stockSeguridad,
    puntoReorden,
    stockObjetivo,
    cantidadSugerida,
    diasCobertura,
    nivelRiesgo,
  };
}

/**
 * Ejecuta el algoritmo para todos los registros de inventario.
 * Enriquece cada registro con su producto, tienda y resultado del cálculo.
 *
 * @param {number} leadTime - Días de entrega (ajustable desde la UI)
 * @returns {Array} Lista completa de cálculos enriquecidos
 */
function calcularTodos(leadTime = 3) {
  return INVENTARIO.map(inv => {
    const gondola  = GONDOLA.find(g => g.tiendaId === inv.tiendaId && g.productoId === inv.productoId);
    const producto = PRODUCTOS.find(p => p.id === inv.productoId);
    const tienda   = TIENDAS.find(t => t.id === inv.tiendaId);

    if (!gondola || !producto || !tienda) return null;

    const resultado = calcularReposicion(inv, gondola, leadTime);

    return {
      ...inv,
      producto,
      tienda,
      gondola,
      resultado,
    };
  }).filter(Boolean);
}

/**
 * Genera el HTML de un badge de riesgo.
 * @param {string} nivel - Nivel de riesgo
 * @returns {string} HTML del badge
 */
function badgeRiesgo(nivel) {
  const clases = {
    QUIEBRE: 'badge-quiebre',
    CRÍTICO: 'badge-critico',
    ALTO:    'badge-alto',
    MEDIO:   'badge-medio',
    BAJO:    'badge-bajo',
  };
  return `<span class="badge ${clases[nivel] || 'badge-bajo'}">${nivel}</span>`;
}

/**
 * Genera el HTML de un mini gráfico de barras para las ventas diarias.
 * @param {number[]} ventas - Array con 7 valores de ventas
 * @returns {string} HTML del mini chart
 */
function miniBarChart(ventas) {
  const max = Math.max(...ventas);
  const bars = ventas.map((v, i) =>
    `<div class="mini-bar-col" style="height:${Math.round((v / max) * 100)}%" title="Día ${i + 1}: ${v} uds"></div>`
  ).join('');
  return `<div class="mini-bar">${bars}</div>`;
}
