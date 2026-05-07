'use strict';

/**
 * data.js — Datos de referencia del sistema RetailOpt
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * Contiene los datos iniciales en memoria utilizados como fallback
 * cuando la conexión con Supabase no está disponible.
 */

const TIENDAS = [
  { id: 1, nombre: 'Tienda Centro',  ciudad: 'Pereira', estado: 'Activa' },
  { id: 2, nombre: 'Tienda Pinares', ciudad: 'Pereira', estado: 'Activa' },
  { id: 3, nombre: 'Tienda Cuba',    ciudad: 'Pereira', estado: 'Activa' },
];

const PRODUCTOS = [
  { id: 1, nombre: 'Leche Entera 1L',       categoria: 'Lácteos',     proveedor: 'Alquería',  precio: 3200  },
  { id: 2, nombre: 'Arroz Diana 500g',       categoria: 'Granos',      proveedor: 'Diana',     precio: 2100  },
  { id: 3, nombre: 'Aceite Girasol 1L',      categoria: 'Aceites',     proveedor: 'La Espiga', precio: 12500 },
  { id: 4, nombre: 'Pan Tajado 500g',        categoria: 'Panadería',   proveedor: 'Bimbo',     precio: 4800  },
  { id: 5, nombre: 'Detergente Ariel 1kg',   categoria: 'Aseo',        proveedor: 'P&G',       precio: 15900 },
  { id: 6, nombre: 'Café Juan Valdez 250g',  categoria: 'Bebidas',     proveedor: 'FNC',       precio: 18500 },
  { id: 7, nombre: 'Azúcar x1kg',            categoria: 'Básicos',     proveedor: 'Manuelita', precio: 3500  },
  { id: 8, nombre: 'Salsa de Tomate 400g',   categoria: 'Condimentos', proveedor: 'Fruco',     precio: 6200  },
];

// Capacidad de Exhibición = caras × niveles × profundidad
const GONDOLA = [
  { tiendaId: 1, productoId: 1, caras: 4, niveles: 3, profundidad: 2 },
  { tiendaId: 1, productoId: 2, caras: 6, niveles: 2, profundidad: 3 },
  { tiendaId: 1, productoId: 3, caras: 3, niveles: 2, profundidad: 2 },
  { tiendaId: 1, productoId: 4, caras: 5, niveles: 1, profundidad: 1 },
  { tiendaId: 1, productoId: 5, caras: 4, niveles: 2, profundidad: 2 },
  { tiendaId: 1, productoId: 6, caras: 3, niveles: 3, profundidad: 2 },
  { tiendaId: 1, productoId: 7, caras: 5, niveles: 2, profundidad: 4 },
  { tiendaId: 1, productoId: 8, caras: 4, niveles: 2, profundidad: 3 },
  { tiendaId: 2, productoId: 1, caras: 3, niveles: 2, profundidad: 2 },
  { tiendaId: 2, productoId: 2, caras: 5, niveles: 2, profundidad: 2 },
  { tiendaId: 2, productoId: 3, caras: 2, niveles: 2, profundidad: 2 },
  { tiendaId: 2, productoId: 4, caras: 4, niveles: 1, profundidad: 1 },
  { tiendaId: 2, productoId: 5, caras: 3, niveles: 2, profundidad: 2 },
  { tiendaId: 2, productoId: 6, caras: 2, niveles: 3, profundidad: 2 },
  { tiendaId: 2, productoId: 7, caras: 4, niveles: 2, profundidad: 3 },
  { tiendaId: 2, productoId: 8, caras: 3, niveles: 2, profundidad: 2 },
  { tiendaId: 3, productoId: 1, caras: 5, niveles: 3, profundidad: 3 },
  { tiendaId: 3, productoId: 2, caras: 7, niveles: 2, profundidad: 4 },
  { tiendaId: 3, productoId: 3, caras: 4, niveles: 2, profundidad: 2 },
  { tiendaId: 3, productoId: 4, caras: 6, niveles: 1, profundidad: 2 },
  { tiendaId: 3, productoId: 5, caras: 5, niveles: 2, profundidad: 3 },
  { tiendaId: 3, productoId: 6, caras: 4, niveles: 3, profundidad: 2 },
  { tiendaId: 3, productoId: 7, caras: 6, niveles: 2, profundidad: 5 },
  { tiendaId: 3, productoId: 8, caras: 5, niveles: 2, profundidad: 3 },
];

const INVENTARIO = [
  { tiendaId: 1, productoId: 1, stockActual: 8,  ventasDiarias: [18, 20, 15, 22, 19, 17, 21] },
  { tiendaId: 1, productoId: 2, stockActual: 25, ventasDiarias: [12, 14, 11, 15, 13, 12, 14] },
  { tiendaId: 1, productoId: 3, stockActual: 3,  ventasDiarias: [6,  8,  7,  9,  6,  7,  8]  },
  { tiendaId: 1, productoId: 4, stockActual: 2,  ventasDiarias: [8,  10, 9,  11, 8,  9,  10] },
  { tiendaId: 1, productoId: 5, stockActual: 12, ventasDiarias: [4,  5,  3,  6,  4,  5,  4]  },
  { tiendaId: 1, productoId: 6, stockActual: 15, ventasDiarias: [5,  6,  4,  7,  5,  6,  5]  },
  { tiendaId: 1, productoId: 7, stockActual: 45, ventasDiarias: [20, 22, 18, 25, 21, 19, 23] },
  { tiendaId: 1, productoId: 8, stockActual: 10, ventasDiarias: [7,  9,  8,  10, 7,  8,  9]  },
  { tiendaId: 2, productoId: 1, stockActual: 5,  ventasDiarias: [14, 16, 13, 17, 15, 14, 16] },
  { tiendaId: 2, productoId: 2, stockActual: 18, ventasDiarias: [10, 11, 9,  12, 10, 11, 10] },
  { tiendaId: 2, productoId: 3, stockActual: 2,  ventasDiarias: [4,  5,  4,  6,  4,  5,  4]  },
  { tiendaId: 2, productoId: 4, stockActual: 0,  ventasDiarias: [6,  7,  6,  8,  6,  7,  7]  },
  { tiendaId: 2, productoId: 5, stockActual: 8,  ventasDiarias: [3,  4,  3,  4,  3,  4,  3]  },
  { tiendaId: 2, productoId: 6, stockActual: 11, ventasDiarias: [3,  4,  3,  5,  3,  4,  3]  },
  { tiendaId: 2, productoId: 7, stockActual: 30, ventasDiarias: [15, 17, 14, 18, 16, 15, 17] },
  { tiendaId: 2, productoId: 8, stockActual: 6,  ventasDiarias: [5,  6,  5,  7,  5,  6,  6]  },
  { tiendaId: 3, productoId: 1, stockActual: 12, ventasDiarias: [22, 24, 20, 26, 23, 21, 25] },
  { tiendaId: 3, productoId: 2, stockActual: 40, ventasDiarias: [18, 20, 16, 22, 19, 18, 20] },
  { tiendaId: 3, productoId: 3, stockActual: 7,  ventasDiarias: [8,  10, 9,  11, 8,  9,  10] },
  { tiendaId: 3, productoId: 4, stockActual: 4,  ventasDiarias: [12, 14, 11, 15, 12, 13, 14] },
  { tiendaId: 3, productoId: 5, stockActual: 20, ventasDiarias: [6,  7,  6,  8,  6,  7,  7]  },
  { tiendaId: 3, productoId: 6, stockActual: 18, ventasDiarias: [7,  8,  6,  9,  7,  8,  7]  },
  { tiendaId: 3, productoId: 7, stockActual: 65, ventasDiarias: [30, 32, 28, 35, 31, 29, 33] },
  { tiendaId: 3, productoId: 8, stockActual: 15, ventasDiarias: [9,  11, 10, 12, 9,  10, 11] },
];
