/**
 * Membership Service
 * 
 * Handles membership status checks for users.
 */

const { getSupabaseAdmin } = require('./supabase');

/**
 * Get user membership status
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<Object|null>} Membership object or null
 * 
 * TODO: Implement Supabase query to check memberships table
 * Expected table structure:
 *   - user_id (uuid, foreign key to auth.users)
 *   - status (text: 'active', 'trialing', 'canceled', etc.)
 *   - created_at (timestamp)
 *   - updated_at (timestamp)
 */
async function getMembership(userId) {
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin || !userId) {
    return null;
  }

  try {
    // Query memberships table for active or trialing memberships
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (error) {
      // Check if it's a "not found" error (which is fine - user is not a member)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching membership:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Membership fetch error:', error.message);
    return null;
  }
}

/**
 * Check if user is a member (active or trialing)
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<boolean>} True if user is a member
 */
async function isMember(userId) {
  const membership = await getMembership(userId);
  return membership?.status === 'active' || membership?.status === 'trialing';
}

module.exports = {
  getMembership,
  isMember
};

