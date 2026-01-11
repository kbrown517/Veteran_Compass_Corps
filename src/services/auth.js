/**
 * Authentication Service
 * 
 * Handles Supabase token verification and user authentication.
 */

const { getSupabaseAdmin } = require('./supabase');

/**
 * Verify Supabase authentication token and get user ID
 * @param {string} authHeader - Authorization header (Bearer token)
 * @returns {Promise<string|null>} User ID if valid, null otherwise
 */
async function verifySupabaseToken(authHeader) {
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!authHeader || !supabaseAdmin) {
    return null;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

/**
 * Get user data by ID
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserById(userId) {
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
}

module.exports = {
  verifySupabaseToken,
  getUserById
};

