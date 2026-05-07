'use strict';

/**
 * app.js — Controlador principal de la aplicación
 * Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
 */

const App = {
  vistaActual:  'pedido',
  tiendaActiva: 1,
  leadTime:     3,
  filtroRiesgo: 'TODOS',
  sidebarOpen:  true,

  // Módulos principales (visibles para todos los usuarios)
  vistasPrincipal: [
    { key: 'pedido',     icon: '📋', label: 'Pedido'            },
    { key: 'gondola',    icon: '🗄️', label: 'Config. Góndola'   },
    { key: 'dashboard',  icon: '📊', label: 'Dashboard'         },
    { key: 'reportes',   icon: '📊', label: 'Reportes'          },
  ],

  // Módulos de administración (visibles solo con usuario admin)
  vistasAdmin: [
    { key: 'inventario', icon: '🏷️', label: 'Inventario'        },
    { key: 'productos',  icon: '📦', label: 'Productos'          },
    { key: 'tiendas',    icon: '🏪', label: 'Tiendas'           },
  ],

  renderMap: {
    pedido:     renderPedido,
    gondola:    renderGondola,
    dashboard:  renderDashboard,
    reportes:   renderReportes,
    inventario: renderInventario,
    productos:  renderProductos,
    tiendas:    renderTiendas,
  },

  goto(key) {
    this.vistaActual = key;
    this.closeMobileSidebar();
    this.render();
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isOpen  = sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', !isOpen);
    overlay.classList.toggle('visible', !isOpen);
  },

  closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
  },

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar  = document.getElementById('sidebar');
    const logoText = document.getElementById('logo-text');
    const footer   = document.getElementById('sidebar-footer');
    if (this.sidebarOpen) {
      sidebar.classList.remove('collapsed');
      logoText.style.display = '';
      footer.style.display   = '';
    } else {
      sidebar.classList.add('collapsed');
      logoText.style.display = 'none';
      footer.style.display   = 'none';
    }
    this.renderNav();
  },

  contarAlertas() {
    if (!INVENTARIO.length) return 0;
    return calcularTodos(this.leadTime)
      .filter(c => ['QUIEBRE', 'CRÍTICO'].includes(c.resultado.nivelRiesgo))
      .length;
  },

  renderNav() {
    const session  = getSession();
    const alertas  = this.contarAlertas();
    const navEl    = document.getElementById('sidebar-nav');
    if (!navEl) return;

    const buildItem = v => {
      const badge = (v.key === 'pedido' && alertas > 0)
        ? `<span class="nav-badge">${alertas}</span>` : '';
      const label = this.sidebarOpen ? `<span>${v.label}</span>${badge}` : '';
      return `
        <button class="nav-item ${this.vistaActual === v.key ? 'active' : ''}"
                onclick="App.goto('${v.key}')" title="${v.label}">
          <span class="nav-icon">${v.icon}</span>${label}
        </button>`;
    };

    // Sección admin (solo visible para admin o si sidebarOpen)
    const adminSection = esAdmin() ? `
      ${this.sidebarOpen ? '<p class="nav-section-title">Administración</p>' : '<hr class="nav-divider">'}
      ${this.vistasAdmin.map(buildItem).join('')}` : '';

    // Botón cerrar sesión
    const logoutLabel = this.sidebarOpen ? '<span>Cerrar Sesión</span>' : '';
    const logoutBtn = `
      <button class="nav-item nav-logout" onclick="App.logout()" title="Cerrar sesión">
        <span class="nav-icon">🚪</span>${logoutLabel}
      </button>`;

    navEl.innerHTML = this.vistasPrincipal.map(buildItem).join('') + adminSection + logoutBtn;

    // Info del usuario en el logo
    const logoText = document.getElementById('logo-text');
    if (logoText && session) {
      logoText.innerHTML = `
        <p>RetailOpt</p>
        <span class="sidebar-user">${session.nombre}</span>`;
    }
  },

  renderTopbar() {
    const todas  = [...this.vistasPrincipal, ...this.vistasAdmin];
    const vista  = todas.find(v => v.key === this.vistaActual);
    const alertas = this.contarAlertas();
    const titleEl = document.getElementById('topbar-title');
    const pillEl  = document.getElementById('alert-pill');
    const avatarEl = document.getElementById('user-avatar');
    const session  = getSession();

    if (titleEl) titleEl.textContent = `${vista?.icon ?? ''} ${vista?.label ?? ''}`;
    if (avatarEl && session) {
      avatarEl.textContent = session.usuario.slice(0, 2).toUpperCase();
      avatarEl.title = session.nombre;
    }

    if (pillEl) {
      if (alertas > 0) {
        pillEl.textContent = `⚠️ ${alertas} alerta${alertas > 1 ? 's' : ''}`;
        pillEl.classList.remove('hidden');
        pillEl.onclick = () => this.goto('pedido');
      } else {
        pillEl.classList.add('hidden');
      }
    }
  },

  render() {
    this.renderNav();
    this.renderTopbar();
    const contentEl = document.getElementById('content');
    const renderFn  = this.renderMap[this.vistaActual];
    if (contentEl && renderFn) contentEl.innerHTML = renderFn();
  },

  // Muestra el layout completo (sidebar + topbar)
  arrancar() {
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('login-container')?.remove();
    this.render();
  },

  // Muestra pantalla de login (oculta el layout principal)
  mostrarLogin(error = '') {
    document.getElementById('app').classList.add('hidden');
    let container = document.getElementById('login-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'login-container';
      document.body.appendChild(container);
    }
    container.innerHTML = renderLogin(error);
    document.getElementById('login-usuario')?.focus();
  },

  logout() {
    clearSession();
    this.filtroRiesgo = 'TODOS';
    this.vistaActual  = 'pedido';
    this.mostrarLogin();
  },

  async cargarDatos() {
    if (!SUPABASE_CONFIGURED || !db) return;

    try {
      const [resT, resP, resG, resI] = await Promise.all([
        db.from('tiendas').select('*').order('id'),
        db.from('productos').select('*').order('id'),
        db.from('gondola').select('*'),
        db.from('inventario').select('*'),
      ]);

      if (resT.error) throw resT.error;
      if (resP.error) throw resP.error;
      if (resG.error) throw resG.error;
      if (resI.error) throw resI.error;

      TIENDAS.length = 0;
      resT.data.forEach(r => TIENDAS.push({ id: r.id, nombre: r.nombre, ciudad: r.ciudad, estado: r.estado }));

      PRODUCTOS.length = 0;
      resP.data.forEach(r => PRODUCTOS.push({
        id: r.id, nombre: r.nombre, categoria: r.categoria,
        proveedor: r.proveedor, precio: parseFloat(r.precio),
      }));

      GONDOLA.length = 0;
      resG.data.forEach(r => GONDOLA.push({
        tiendaId: r.tienda_id, productoId: r.producto_id,
        caras: r.caras, niveles: r.niveles, profundidad: r.profundidad,
      }));

      INVENTARIO.length = 0;
      resI.data.forEach(r => INVENTARIO.push({
        tiendaId: r.tienda_id, productoId: r.producto_id,
        stockActual: r.stock_actual,
        ventasDiarias: r.ventas_diarias || [0, 0, 0, 0, 0, 0, 0],
      }));
    } catch (err) {
      console.error('[RetailOpt] Error al cargar datos:', err.message);
    }
  },
};

document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) toggleBtn.addEventListener('click', () => App.toggleSidebar());

  // Cargar datos de Supabase si está configurado
  if (SUPABASE_CONFIGURED) {
    const contentEl = document.getElementById('content');
    if (contentEl) contentEl.innerHTML = `
      <div class="loading-state"><div class="spinner"></div><p>Cargando datos…</p></div>`;
    await App.cargarDatos();
  }

  const session = getSession();
  if (session) {
    if (session.tiendaId !== null) App.tiendaActiva = session.tiendaId;
    App.arrancar();
  } else {
    App.mostrarLogin();
  }
});
