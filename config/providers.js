/**
 * AI Provider Definitions
 *
 * Each provider represents an AI API service that the app can connect to.
 * Models are defined separately in models.js.
 *
 * Provider fields:
 *   id          - Unique identifier used internally
 *   name        - Display name shown in the UI
 *   icon        - MaterialIcons icon name
 *   color       - Brand color for UI theming
 *   description - Short description shown in settings
 *   baseUrl     - API base URL (must support OpenAI-compatible /chat/completions)
 *   docsUrl     - Link to the provider's documentation
 *   keyPlaceholder - Placeholder text for API key input
 *   keyHelp     - Help text explaining how to get an API key
 *   freeQuota   - Whether the provider offers a free usage tier
 *   extraHeaders - Additional HTTP headers sent with every request
 *   isBuiltIn   - Whether this is a built-in (non-removable) provider
 */

export const DEFAULT_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: 'cloud',
    color: '#6366F1',
    description: 'Access 100+ AI models through a single API. Supports all major providers.',
    baseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
    keyPlaceholder: 'sk-or-...',
    keyHelp: 'Get your API key from openrouter.ai/keys',
    extraHeaders: {
      'HTTP-Referer': 'https://niabrowser.app',
      'X-Title': 'NIA Browser AI',
    },
    freeQuota: false,
    isDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: 'auto-awesome',
    color: '#4285F4',
    description: 'Direct access to Google Gemini models. Includes free daily quota!',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    docsUrl: 'https://ai.google.dev',
    keyPlaceholder: 'AIza...',
    keyHelp: 'Free API key from ai.google.dev/aistudio. Generous free daily quota included!',
    freeQuota: true,
    extraHeaders: {},
    isBuiltIn: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'smart-toy',
    color: '#10A37F',
    description: 'Direct access to OpenAI GPT models.',
    baseUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs',
    keyPlaceholder: 'sk-...',
    keyHelp: 'Get your API key from platform.openai.com/api-keys',
    extraHeaders: {},
    isBuiltIn: true,
  },
];

export default DEFAULT_PROVIDERS;
