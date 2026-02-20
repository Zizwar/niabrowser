/**
 * NIABrowser Configuration
 *
 * This folder contains all configurable values separated from the app code.
 * Edit these files to customize AI models, providers, prompts, and app settings
 * without modifying component logic.
 *
 * Files:
 *   providers.js - AI provider definitions (OpenRouter, Google, OpenAI, custom)
 *   models.js    - AI model lists grouped by provider
 *   prompts.js   - System prompts for AI chat and script generation
 */

export { DEFAULT_PROVIDERS } from './providers';
export { PROVIDER_MODELS, OPENROUTER_MODELS, GOOGLE_MODELS, OPENAI_MODELS } from './models';
export { buildChatSystemPrompt, SCRIPT_GENERATOR_PROMPT, SCRIPT_EDITOR_PROMPT, SCRIPT_TASK_EXAMPLES, PROMPT_KEYS, getCustomPrompt, saveCustomPrompt, resetCustomPrompt } from './prompts';
