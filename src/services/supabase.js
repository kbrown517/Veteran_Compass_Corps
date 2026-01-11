/**
 * Supabase Client Service
 * 
 * Creates and exports the Supabase admin client for server-side operations.
 * Uses service role key for admin operations (server-side only).
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase admin client instance
let supabaseAdmin = null;

/**
 * Initialize Supabase admin client
 * Should be called once at application startup
 * @returns {Object|null} Supabase admin client or null if credentials missing
 */
function initializeSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️  Supabase credentials not found. Auth features will be disabled.');
    return null;
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✓ Supabase admin client initialized');
  return supabaseAdmin;
}

/**
 * Get the Supabase admin client
 * @returns {Object|null} Supabase admin client or null
 */
function getSupabaseAdmin() {
  return supabaseAdmin;
}

// Initialize on module load
initializeSupabase();

module.exports = {
  supabaseAdmin,
  getSupabaseAdmin,
  initializeSupabase
};

