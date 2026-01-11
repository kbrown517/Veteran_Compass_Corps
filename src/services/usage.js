/**
 * AI Usage Tracking Service
 * 
 * Handles tracking and limiting AI usage per user per month.
 * Uses a monthly key (YYYY-MM format) to track usage.
 */

const { getSupabaseAdmin } = require('./supabase');

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month string (e.g., "2024-01")
 */
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get AI usage count for current month
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<Object>} Usage object with count and month
 * 
 * Expected table structure:
 *   - user_id (uuid, foreign key to auth.users)
 *   - month (text, format: YYYY-MM)
 *   - count (integer)
 *   - created_at (timestamp)
 *   - updated_at (timestamp)
 *   - Primary key: (user_id, month)
 */
async function getAiUsage(userId) {
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin || !userId) {
    return { count: 0, month: getCurrentMonth() };
  }

  const currentMonth = getCurrentMonth();

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_usage')
      .select('count, month')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (error) {
      // If record doesn't exist, return zero count
      if (error.code === 'PGRST116') {
        return { count: 0, month: currentMonth };
      }
      console.error('Error fetching AI usage:', error.message);
      return { count: 0, month: currentMonth };
    }

    return { count: data.count || 0, month: data.month || currentMonth };
  } catch (error) {
    console.error('AI usage fetch error:', error.message);
    return { count: 0, month: currentMonth };
  }
}

/**
 * Increment AI usage count for current month
 * Creates record if it doesn't exist, updates if it does
 * @param {string} userId - User ID from Supabase
 * @returns {Promise<boolean>} Success status
 */
async function incrementAiUsage(userId) {
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin || !userId) {
    return false;
  }

  const currentMonth = getCurrentMonth();

  try {
    // Try to get existing record
    const { data: existing } = await supabaseAdmin
      .from('ai_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from('ai_usage')
        .update({ count: existing.count + 1 })
        .eq('user_id', userId)
        .eq('month', currentMonth);

      if (error) {
        console.error('Error incrementing AI usage:', error.message);
        return false;
      }
    } else {
      // Create new record
      const { error } = await supabaseAdmin
        .from('ai_usage')
        .insert({
          user_id: userId,
          month: currentMonth,
          count: 1
        });

      if (error) {
        console.error('Error creating AI usage record:', error.message);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('AI usage increment error:', error.message);
    return false;
  }
}

module.exports = {
  getAiUsage,
  incrementAiUsage,
  getCurrentMonth
};

