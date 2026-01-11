/**
 * PROMPT COMPOSITION MODULE
 * 
 * This module composes all prompt components into a complete system prompt.
 * It combines system rules, developer guidelines, tier-based depth, voice,
 * templates, and optional retrieved context.
 * 
 * Usage:
 *   const { buildPrompt } = require('./src/prompts');
 *   const fullPrompt = buildPrompt({
 *     isMember: true,
 *     retrievedContext: '...' // optional
 *   });
 */

const systemPrompt = require('./system');
const developerPrompt = require('./developer');
const voicePrompt = require('./voice');
const { getTierPrompt } = require('./tier');
const { 
  MEMBERSHIP_PROMPT, 
  SOFT_LIMIT_PROMPT, 
  RESPONSE_TEMPLATES,
  KNOWLEDGE_CONTEXT_USAGE 
} = require('./templates');

/**
 * Builds a complete system prompt by composing all components
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.isMember=false] - Whether the user is a member (affects response depth)
 * @param {string} [options.retrievedContext] - Optional retrieved knowledge context to include
 * @returns {string} Complete system prompt ready for use
 * 
 * @example
 * // For a free user
 * const prompt = buildPrompt({ isMember: false });
 * 
 * @example
 * // For a member with retrieved context
 * const prompt = buildPrompt({ 
 *   isMember: true, 
 *   retrievedContext: 'Relevant knowledge excerpt...' 
 * });
 */
function buildPrompt({ isMember = false, retrievedContext = null } = {}) {
  // Get the appropriate tier prompt based on membership status
  const tierPrompt = getTierPrompt(isMember);
  
  // Start building the prompt by combining core components
  let prompt = `${systemPrompt}

${developerPrompt}

${tierPrompt}

${voicePrompt}

${MEMBERSHIP_PROMPT}

${SOFT_LIMIT_PROMPT}

${RESPONSE_TEMPLATES}

${KNOWLEDGE_CONTEXT_USAGE}`;

  // Append retrieved context if provided
  // This allows RAG (Retrieval Augmented Generation) to inject relevant knowledge
  if (retrievedContext) {
    prompt += `\n\n---\nRETRIEVED KNOWLEDGE CONTEXT:\n${retrievedContext}\n---\n`;
  }

  return prompt;
}

module.exports = {
  buildPrompt
};

