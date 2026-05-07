'use strict';

// Credenciales de Supabase
const SUPABASE_URL      = 'https://gvawohohhqhuyqbrbafv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FzCsIt6M2oUze7zViAPQSg_Zq8EjVh5';

const SUPABASE_CONFIGURED = !SUPABASE_URL.includes('TU_PROYECTO');

let db = null;

if (SUPABASE_CONFIGURED) {
  try {
    const { createClient } = window.supabase;
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('[RetailOpt] Supabase init error:', err);
  }
}
