'use strict';

// ── Credenciales de Supabase ──────────────────────────
// Reemplaza estos valores con los de tu proyecto en supabase.com
const SUPABASE_URL      = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

// Detecta si las credenciales ya fueron configuradas
const SUPABASE_CONFIGURED = !SUPABASE_URL.includes('TU_PROYECTO');

let db = null;

if (SUPABASE_CONFIGURED) {
  try {
    const { createClient } = window.supabase;
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[RetailOpt] Conectado a Supabase ✓');
  } catch (err) {
    console.error('[RetailOpt] Error al conectar con Supabase:', err);
  }
} else {
  console.warn('[RetailOpt] Supabase no configurado — usando datos en memoria.');
}
