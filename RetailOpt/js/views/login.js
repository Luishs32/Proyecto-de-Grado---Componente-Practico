'use strict';

/**
 * views/login.js — Pantalla de inicio de sesión
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 */

function renderLogin(error = '') {
  return `
    <div class="login-page">
      <div class="login-card">

        <div class="login-logo">
          <div class="login-logo-icon">🛒</div>
          <h1>RetailOpt</h1>
          <p>Sistema de Optimización de Reposición</p>
        </div>

        <form id="form-login" onsubmit="procesarLogin(event)" autocomplete="off">
          ${error ? `<div class="login-error">⚠️ ${error}</div>` : ''}

          <div class="form-group">
            <label>Usuario</label>
            <input type="text" id="login-usuario" required placeholder="Ej: centro"
                   autocomplete="username" />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="login-clave" required placeholder="••••••••"
                   autocomplete="current-password" />
          </div>

          <button type="submit" class="btn-login">Ingresar →</button>
        </form>

        <div class="login-credenciales">
          <p class="login-hint-title">Credenciales de acceso</p>
          <div class="login-hint-grid">
            <div class="login-hint-row">
              <span class="login-tienda">🏪 Tienda Centro</span>
              <code>centro</code> / <code>centro123</code>
            </div>
            <div class="login-hint-row">
              <span class="login-tienda">🏪 Tienda Pinares</span>
              <code>pinares</code> / <code>pinares123</code>
            </div>
            <div class="login-hint-row">
              <span class="login-tienda">🏪 Tienda Cuba</span>
              <code>cuba</code> / <code>cuba123</code>
            </div>
          </div>
        </div>

        <p class="login-footer">UNAD · Ingeniería de Sistemas · 2026</p>
      </div>
    </div>`;
}

function procesarLogin(e) {
  e.preventDefault();
  const usuario = document.getElementById('login-usuario').value;
  const clave   = document.getElementById('login-clave').value;
  const user    = loginUser(usuario, clave);

  if (!user) {
    const content = document.getElementById('content');
    if (content) content.innerHTML = renderLogin('Usuario o contraseña incorrectos.');
    document.getElementById('login-usuario').focus();
    return;
  }

  setSession(user);
  // Ajustar tienda activa al store del usuario
  if (user.tiendaId !== null) App.tiendaActiva = user.tiendaId;
  App.vistaActual = 'pedido';
  App.arrancar();
}
