'use strict';

/**
 * auth.js — Módulo de autenticación
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 *
 * Credenciales de acceso por tienda (prototipo TRL 5):
 *   centro   / centro123   → Tienda Centro
 *   pinares  / pinares123  → Tienda Pinares
 *   cuba     / cuba123     → Tienda Cuba
 *   admin    / admin2026   → Acceso general (todas las tiendas)
 */

const USUARIOS_APP = [
  { usuario: 'centro',  clave: 'centro123',  nombre: 'Tienda Centro',  tiendaId: 1 },
  { usuario: 'pinares', clave: 'pinares123', nombre: 'Tienda Pinares', tiendaId: 2 },
  { usuario: 'cuba',    clave: 'cuba123',    nombre: 'Tienda Cuba',    tiendaId: 3 },
  { usuario: 'admin',   clave: 'admin2026',  nombre: 'Administrador',  tiendaId: null },
];

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('retailopt_session')); } catch { return null; }
}

function setSession(user) {
  sessionStorage.setItem('retailopt_session', JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem('retailopt_session');
}

function loginUser(usuario, clave) {
  return USUARIOS_APP.find(u => u.usuario === usuario.trim() && u.clave === clave) ?? null;
}

function esAdmin() {
  return getSession()?.tiendaId === null;
}
