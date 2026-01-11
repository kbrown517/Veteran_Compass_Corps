/**
 * Chat API Route
 * 
 * Handles AI chat requests with authentication, usage limits, and membership tiers.
 * 
 * POST /api/chat
 * 
 * Headers:
 *   Authorization: Bearer <supabase_token>
 * 
 * Request Body:
 *   {
 *     messages: Array<{role: string, content: string}>,
 *     retrievedContext?: string  // Optional: RAG context
 *   }
 * 
 * Response:
 *   {
 *     message: string,
 *     usage: {
 *       count: number,
 *       limit: number,
 *       remaining: number,
 *       isMember: boolean
 *     }
 *   }
 */

const { buildPrompt } = require('../prompts');
const { verifySupabaseToken } = require('../services/auth');
const { isMember } = require('../services/membership');
const { getAiUsage, incrementAiUsage } = require('../services/usage');
const { runChat } = require('../services/openai');

// Usage limits
const FREE_LIMIT = 5;
const MEMBER_LIMIT = 200;

/**
 * Handle chat request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleChat(req, res) {
  try {
    // Validate request body
    const { messages, retrievedContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'messages array is required and must not be empty'
      });
    }

    // Verify authentication
    const userId = await verifySupabaseToken(req.header('Authorization'));
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to use the AI Claims Assistant. Create a free account to get 5 free messages per month.',
        requiresAuth: true,
      });
    }

    // Get membership status
    const userIsMember = await isMember(userId);

    // Check usage limits
    const usage = await getAiUsage(userId);
    const usageCount = usage.count || 0;
    const limit = userIsMember ? MEMBER_LIMIT : FREE_LIMIT;

    if (usageCount >= limit) {
      return res.status(429).json({
        error: 'Usage limit reached',
        message: userIsMember 
          ? 'You have reached your monthly AI usage limit. Your limit resets at the start of next month.'
          : 'You have used all 5 free AI messages this month. Upgrade to VCC Membership for unlimited access.',
        usageCount,
        limit,
        isMember: userIsMember,
        upgradeRequired: !userIsMember,
      });
    }

    // Increment usage (before API call to prevent abuse)
    const incrementSuccess = await incrementAiUsage(userId);
    if (!incrementSuccess) {
      console.warn(`Failed to increment usage for user ${userId}`);
    }

    const newUsageCount = usageCount + 1;

    // Build system prompt based on membership tier
    // The prompt system automatically adjusts depth based on isMember flag
    const systemPrompt = buildPrompt({
      isMember: userIsMember,
      retrievedContext: retrievedContext || null
    });

    // Call OpenAI using Responses API (GPT-5.2 compatible)
    // runChat() handles the Responses API format internally and automatically
    // applies tiered max_output_tokens (2500 for members, 1200 for free users)
    const responseMessage = await runChat({
      systemPrompt,
      messages,
      isMember: userIsMember
    });

    // Return successful response
    res.json({ 
      message: responseMessage,
      usage: {
        count: newUsageCount,
        limit,
        remaining: Math.max(0, limit - newUsageCount),
        isMember: userIsMember,
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle OpenAI-specific errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'OpenAI API rate limit reached. Please try again in a moment.'
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API authentication failed. Please contact support.'
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred. Please try again.'
    });
  }
}

module.exports = {
  handleChat
};

