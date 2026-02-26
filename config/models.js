/**
 * AI Model Definitions
 *
 * Models are grouped by provider ID. Each model must match
 * one of the provider IDs defined in providers.js.
 *
 * Model fields:
 *   id          - Model identifier sent to the API (e.g., "gpt-4o", "gemini-2.5-flash")
 *   name        - Human-readable display name
 *   provider    - Provider brand name (for display)
 *   cost        - Cost tier: "Free", "Free*", "Low", "Medium", "High"
 *   inputCost   - Cost per 1K input tokens in USD
 *   outputCost  - Cost per 1K output tokens in USD
 *   maxTokens   - Maximum output tokens
 *   description - Short description of the model's capabilities
 *
 * To add a new model: add an entry to the appropriate provider array below.
 * To add models for a new provider: first add the provider in providers.js,
 * then add a new key here using the same provider ID.
 */

// Models available through OpenRouter (uses prefixed model IDs)
export const OPENROUTER_MODELS = [
  // Anthropic Claude
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    cost: 'Medium',
    inputCost: 0.003,
    outputCost: 0.015,
    maxTokens: 8192,
    description: 'Most capable Claude model for complex tasks',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    cost: 'Low',
    inputCost: 0.00025,
    outputCost: 0.00125,
    maxTokens: 4096,
    description: 'Fast and affordable for simple tasks',
  },
  // OpenAI via OpenRouter
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    cost: 'High',
    inputCost: 0.005,
    outputCost: 0.015,
    maxTokens: 4096,
    description: 'Most capable GPT model',
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 4096,
    description: 'Fast and affordable GPT model',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 4096,
    description: 'Fast and affordable GPT-4o',
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00025,
    outputCost: 0.002,
    maxTokens: 8192,
    description: 'Reasoning model with efficient output',
  },
  {
    id: 'openai/gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00025,
    outputCost: 0.002,
    maxTokens: 8192,
    description: 'Code-optimized reasoning model',
  },
  // Arcee AI
  {
    id: 'arcee-ai/coder-large',
    name: 'Arcee Coder Large',
    provider: 'Arcee',
    cost: 'Medium',
    inputCost: 0.002,
    outputCost: 0.006,
    maxTokens: 8192,
    description: 'Large coding model (Together provider)',
  },
  // Google Gemini via OpenRouter
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    cost: 'Low',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 8192,
    description: 'Best price-performance Gemini model',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    cost: 'Medium',
    inputCost: 0.00125,
    outputCost: 0.005,
    maxTokens: 8192,
    description: 'Advanced reasoning model',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    cost: 'Medium',
    inputCost: 0.00125,
    outputCost: 0.005,
    maxTokens: 8192,
    description: 'Multimodal and code generation',
  },
  // DeepSeek
  {
    id: 'deepseek/deepseek-r1-distill-0528:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    cost: 'Free',
    inputCost: 0,
    outputCost: 0,
    maxTokens: 4096,
    description: 'Free reasoning model',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    cost: 'Low',
    inputCost: 0.00055,
    outputCost: 0.00219,
    maxTokens: 8192,
    description: 'Advanced reasoning model',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 Chat',
    provider: 'DeepSeek',
    cost: 'Low',
    inputCost: 0.00027,
    outputCost: 0.0011,
    maxTokens: 8192,
    description: 'General-purpose DeepSeek V3',
  },
  // Meta Llama
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    cost: 'Medium',
    inputCost: 0.00052,
    outputCost: 0.00075,
    maxTokens: 4096,
    description: 'Open-source large model',
  },
  // Mistral
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    cost: 'Low',
    inputCost: 0.00024,
    outputCost: 0.00024,
    maxTokens: 4096,
    description: 'Fast MoE model',
  },
  // Qwen
  {
    id: 'qwen/qwen2-72b-instruct',
    name: 'Qwen 2 72B',
    provider: 'Qwen',
    cost: 'Medium',
    inputCost: 0.0009,
    outputCost: 0.0009,
    maxTokens: 4096,
    description: 'Alibaba\'s large model',
  },
  // xAI Grok
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    provider: 'xAI',
    cost: 'Medium',
    inputCost: 0.003,
    outputCost: 0.015,
    maxTokens: 8192,
    description: 'Multimodal with toggleable reasoning',
  },
  {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'xAI',
    cost: 'Medium',
    inputCost: 0.003,
    outputCost: 0.015,
    maxTokens: 8192,
    description: 'Best agentic/tool-calling model',
  },
  {
    id: 'x-ai/grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    cost: 'Low',
    inputCost: 0.0006,
    outputCost: 0.003,
    maxTokens: 4096,
    description: 'Lightweight thinking model',
  },
  {
    id: 'x-ai/grok-code-fast-1',
    name: 'Grok Code Fast',
    provider: 'xAI',
    cost: 'Medium',
    inputCost: 0.002,
    outputCost: 0.01,
    maxTokens: 8192,
    description: 'Optimized for code generation',
  },
];

// Models for direct Google Gemini API
export const GOOGLE_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    cost: 'Free*',
    inputCost: 0,
    outputCost: 0,
    maxTokens: 8192,
    description: 'Best price-performance, stable',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    cost: 'Free*',
    inputCost: 0,
    outputCost: 0,
    maxTokens: 8192,
    description: 'Advanced reasoning and coding',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    cost: 'Free*',
    inputCost: 0,
    outputCost: 0,
    maxTokens: 8192,
    description: 'Fast and capable multimodal',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'Google',
    cost: 'Free*',
    inputCost: 0,
    outputCost: 0,
    maxTokens: 8192,
    description: 'Lightweight for quick tasks',
  },
];

// Models for direct OpenAI API
export const OPENAI_MODELS = [
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 4096,
    description: 'Fast and affordable GPT model',
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.0001,
    outputCost: 0.0004,
    maxTokens: 4096,
    description: 'Ultra-fast GPT for simple tasks',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    cost: 'Medium',
    inputCost: 0.005,
    outputCost: 0.015,
    maxTokens: 4096,
    description: 'Most capable GPT model',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00015,
    outputCost: 0.0006,
    maxTokens: 4096,
    description: 'Fast and affordable GPT-4o',
  },
  {
    id: 'o4-mini',
    name: 'o4 Mini',
    provider: 'OpenAI',
    cost: 'Medium',
    inputCost: 0.001,
    outputCost: 0.004,
    maxTokens: 8192,
    description: 'OpenAI reasoning model',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00025,
    outputCost: 0.002,
    maxTokens: 8192,
    description: 'Reasoning model with efficient output',
  },
  {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    provider: 'OpenAI',
    cost: 'Low',
    inputCost: 0.00025,
    outputCost: 0.002,
    maxTokens: 8192,
    description: 'Code-optimized reasoning model',
  },
];

/**
 * Map of provider ID to its model list.
 * Used by AIProviderManager to build the DEFAULT_PROVIDERS with models.
 */
export const PROVIDER_MODELS = {
  openrouter: OPENROUTER_MODELS,
  google: GOOGLE_MODELS,
  openai: OPENAI_MODELS,
};

export default PROVIDER_MODELS;
