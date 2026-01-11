/**
 * OpenAI Service - GPT-5.2 Responses API
 * 
 * This service uses the OpenAI Responses API (responses.create) which is designed
 * for newer models like GPT-5.2. This API structure provides:
 * 
 * 1. Future-proofing: The Responses API is the standard for newer OpenAI models,
 *    making it easy to upgrade to GPT-6, GPT-7, etc. without code changes.
 * 
 * 2. Consistent interface: Uses `input` array and `output_text` response format,
 *    which is more standardized than the legacy chat.completions API.
 * 
 * 3. Model flexibility: The model name is read from OPENAI_MODEL environment variable,
 *    allowing easy switching between models (gpt-5.2, gpt-6, etc.) without code changes.
 * 
 * 4. Tiered responses: Automatically adjusts max_output_tokens based on membership status,
 *    giving members longer, more detailed responses.
 */

const OpenAI = require('openai');

// OpenAI client instance (singleton pattern)
// Initialized once at application startup for efficiency
let openai = null;

/**
 * Initialize OpenAI client
 * 
 * Reads configuration from environment variables:
 * - OPENAI_API_KEY: Primary API key (or AI_INTEGRATIONS_OPENAI_API_KEY as fallback)
 * - OPENAI_BASE_URL: Optional custom base URL for OpenAI-compatible APIs
 * - OPENAI_MODEL: Model to use (defaults to gpt-5.2)
 * 
 * This initialization pattern allows easy switching between:
 * - Official OpenAI API
 * - Custom OpenAI-compatible endpoints
 * - Different model versions
 * 
 * @returns {Object|null} OpenAI client or null if API key missing
 */
function initializeOpenAI() {
  // Support both OPENAI_API_KEY and legacy AI_INTEGRATIONS_OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (!apiKey) {
    console.warn('⚠️  OpenAI API key not found. Chat features will be disabled.');
    return null;
  }

  openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL // Optional: allows custom endpoints (e.g., for GPT-5.2, GPT-6, etc.)
  });

  const model = process.env.OPENAI_MODEL || 'gpt-5.2';
  console.log(`✓ OpenAI client initialized (model: ${model})`);
  return openai;
}

/**
 * Get the OpenAI client
 * @returns {Object|null} OpenAI client or null
 */
function getOpenAIClient() {
  return openai;
}

/**
 * Run chat completion using OpenAI Responses API
 * 
 * This function uses the Responses API (responses.create) which is the standard
 * for GPT-5.2 and future models. Key benefits:
 * 
 * - Uses `input` array format (instead of legacy `messages`)
 * - Returns `output_text` directly (instead of nested choices structure)
 * - Supports `max_output_tokens` parameter (standardized naming)
 * - Model is configurable via OPENAI_MODEL environment variable
 * 
 * To upgrade to a new model (e.g., GPT-6), simply change OPENAI_MODEL in .env.
 * No code changes required because this API structure is consistent across models.
 * 
 * @param {Object} params - Chat parameters
 * @param {string} params.systemPrompt - System prompt defining AI behavior
 * @param {Array} params.messages - Array of message objects with role and content
 * @param {boolean} params.isMember - Whether user is a member (affects response length)
 * @returns {Promise<string>} AI response message text
 * 
 * @example
 * const response = await runChat({
 *   systemPrompt: "You are a helpful assistant",
 *   messages: [{ role: "user", content: "Hello" }],
 *   isMember: true
 * });
 */
async function runChat({ systemPrompt, messages, isMember = false }) {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY environment variable.');
  }

  // Read model from environment variable (supports gpt-5.2, gpt-6, or any future model)
  // This design allows model upgrades without code changes - just update .env
  const model = process.env.OPENAI_MODEL || 'gpt-5.2';
  
  // Tiered response length: Members get more detailed, longer responses
  // This provides value differentiation between free and paid tiers
  const maxOutputTokens = isMember ? 2500 : 1200;
  const temperature = 0.4; // Lower temperature = more consistent, focused responses

  // Use Responses API (standard for GPT-5.2+)
  // This API structure is designed for newer models and future-proofs the codebase
  const response = await openai.responses.create({
    model: model,
    input: [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ],
    max_output_tokens: maxOutputTokens, // Responses API uses max_output_tokens (not max_tokens)
    temperature: temperature
  });

  // Responses API returns output_text directly (simpler than legacy choices[0].message.content)
  const outputText = response.output_text;
  
  if (!outputText) {
    throw new Error('No response from OpenAI - empty output_text received');
  }

  return outputText;
}

/**
 * Create a chat completion (legacy wrapper for backward compatibility)
 * 
 * This function maintains backward compatibility with code that might use
 * the old function signature. Internally, it calls runChat() which uses
 * the modern Responses API.
 * 
 * New code should use runChat() directly for better clarity.
 * 
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} systemPrompt - System prompt to use
 * @param {Object} options - Additional options (isMember, maxTokens, temperature)
 * @returns {Promise<string>} AI response message
 * @deprecated Use runChat() instead for new code
 */
async function createChatCompletion(messages, systemPrompt, options = {}) {
  return runChat({
    systemPrompt,
    messages,
    isMember: options.isMember || false
  });
}

// Initialize on module load
initializeOpenAI();

module.exports = {
  openai,
  getOpenAIClient,
  initializeOpenAI,
  runChat,
  createChatCompletion
};

