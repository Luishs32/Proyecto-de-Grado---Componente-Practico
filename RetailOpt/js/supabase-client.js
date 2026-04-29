'use strict';

// ── Credenciales de Supabase ──────────────────────────
// Reemplaza estos valores con los de tu proyecto en supabase.com
const SUPABASE_URL      = 'https://gvawohohhqhuyqbrbafv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FzCsIt6M2oUze7zViAPQSg_Zq8EjVh5';

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
