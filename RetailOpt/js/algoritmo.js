'use strict';

/**
 * algoritmo.js — Módulo de cálculo de reposición de inventarios
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * Fórmulas aplicadas:
 *   Capacidad de Exhibición = caras × niveles × profundidad
 *   Venta Promedio Diaria   = promedio(ventasDiarias[7])
 *   Stock de Seguridad      = ceil(ventaPromDiaria × 1.5)
 *   Punto de Reorden        = ceil(ventaPromDiaria × leadTime) + stockSeguridad
 *   Stock Objetivo          = capacidadExhibicion + stockSeguridad
 *   Pedido Sugerido         = MAX(0, stockObjetivo − stockActual)
 *   Días de Cobertura       = stockActual / ventaPromDiaria
 */

function calcularReposicion(inv, gondola, leadTime = 3) {
  const sumaVentas      = inv.ventasDiarias.reduce((acc, v) => acc + v, 0);
  const ventaPromDiaria = sumaVentas / inv.ventasDiarias.length;

  const capacidadExhibicion = gondola.caras * gondola.niveles * gondola.profundidad;
  const stockSeguridad      = Math.ceil(ventaPromDiaria * 1.5);
  const puntoReorden        = Math.ceil(ventaPromDiaria * leadTime) + stockSeguridad;
  const stockObjetivo       = capacidadExhibicion + stockSeguridad;
  const cantidadSugerida    = Math.max(0, stockObjetivo - inv.stockActual);
  const diasCobertura       = inv.stockActual > 0
    ? (inv.stockActual / ventaPromDiaria).toFixed(1)
    : '0.0';

  let nivelRiesgo;
  if      (inv.stockActual === 0)                     nivelRiesgo = 'QUIEBRE';
  else if (inv.stockActual < ventaPromDiaria)          nivelRiesgo = 'CRÍTICO';
  else if (inv.stockActual < puntoReorden)             nivelRiesgo = 'ALTO';
  else if (inv.stockActual < stockObjetivo * 0.5)      nivelRiesgo = 'MEDIO';
  else                                                 nivelRiesgo = 'BAJO';

  return {
    ventaPromDiaria: parseFloat(ventaPromDiaria.toFixed(1)),
    capacidadExhibicion,
    stockSeguridad,
    puntoReorden,
    stockObjetivo,
    cantidadSugerida,
    diasCobertura,
    nivelRiesgo,
  };
}

function calcularTodos(leadTime = 3) {
  return INVENTARIO.map(inv => {
    const gondola  = GONDOLA.find(g => g.tiendaId === inv.tiendaId && g.productoId === inv.productoId);
    const producto = PRODUCTOS.find(p => p.id === inv.productoId);
    const tienda   = TIENDAS.find(t => t.id === inv.tiendaId);

    if (!gondola || !producto || !tienda) return null;

    return { ...inv, producto, tienda, gondola, resultado: calcularReposicion(inv, gondola, leadTime) };
  }).filter(Boolean);
}

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

function miniBarChart(ventas) {
  const max  = Math.max(...ventas);
  const bars = ventas.map((v, i) =>
    `<div class="mini-bar-col" style="height:${Math.round((v / max) * 100)}%" title="Día ${i + 1}: ${v} uds"></div>`
  ).join('');
  return `<div class="mini-bar">${bars}</div>`;
}
