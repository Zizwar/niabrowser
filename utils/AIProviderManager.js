import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROVIDERS: 'ai_providers',
  ACTIVE_PROVIDER: 'active_provider_id',
  PROVIDER_API_KEYS: 'provider_api_keys_',
};

// Default providers configuration
const DEFAULT_PROVIDERS = [
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
    models: [
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
        id: 'google/gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        cost: 'Medium',
        inputCost: 0.00125,
        outputCost: 0.005,
        maxTokens: 8192,
        description: 'Google\'s most capable model',
      },
      {
        id: 'google/gemini-flash-1.5',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        cost: 'Low',
        inputCost: 0.000075,
        outputCost: 0.0003,
        maxTokens: 8192,
        description: 'Fast and efficient',
      },
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
        id: 'meta/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B',
        provider: 'Meta',
        cost: 'Medium',
        inputCost: 0.00052,
        outputCost: 0.00075,
        maxTokens: 4096,
        description: 'Open-source large model',
      },
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
      // xAI Grok Models
      {
        id: 'x-ai/grok-4.1-fast',
        name: 'Grok 4.1 Fast',
        provider: 'xAI',
        cost: 'Medium',
        inputCost: 0.003,
        outputCost: 0.015,
        maxTokens: 8192,
        description: 'Fast Grok model for quick tasks',
      },
      {
        id: 'x-ai/grok-3-mini',
        name: 'Grok 3 Mini',
        provider: 'xAI',
        cost: 'Low',
        inputCost: 0.0006,
        outputCost: 0.003,
        maxTokens: 4096,
        description: 'Smaller Grok model for simple tasks',
      },
      {
        id: 'x-ai/grok-code-fast-1',
        name: 'Grok Code Fast',
        provider: 'xAI',
        cost: 'Medium',
        inputCost: 0.002,
        outputCost: 0.01,
        maxTokens: 8192,
        description: 'Grok optimized for code generation',
      },
    ],
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
    models: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        cost: 'Free*',
        inputCost: 0,
        outputCost: 0,
        maxTokens: 8192,
        description: 'Fast and capable Gemini 2.0 model',
      },
      {
        id: 'gemini-2.0-flash-lite',
        name: 'Gemini 2.0 Flash Lite',
        provider: 'Google',
        cost: 'Free*',
        inputCost: 0,
        outputCost: 0,
        maxTokens: 8192,
        description: 'Lightweight Gemini 2.0 for quick tasks',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        cost: 'Free*',
        inputCost: 0,
        outputCost: 0,
        maxTokens: 8192,
        description: 'Google\'s most capable model',
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        cost: 'Free*',
        inputCost: 0,
        outputCost: 0,
        maxTokens: 8192,
        description: 'Fast and efficient',
      },
    ],
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
    models: [
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
    ],
  },
];

/**
 * AIProviderManager - Manages AI providers and models
 */
export const AIProviderManager = {
  /**
   * Get all providers (default + custom)
   */
  async getProviders() {
    try {
      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      const customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      // Merge default providers with custom ones
      const allProviders = [...DEFAULT_PROVIDERS];

      // Add custom providers
      customProviders.forEach(custom => {
        const existingIndex = allProviders.findIndex(p => p.id === custom.id);
        if (existingIndex === -1) {
          allProviders.push(custom);
        }
      });

      return allProviders;
    } catch (error) {
      console.error('Error getting providers:', error);
      return DEFAULT_PROVIDERS;
    }
  },

  /**
   * Get a specific provider by ID
   */
  async getProvider(providerId) {
    const providers = await this.getProviders();
    return providers.find(p => p.id === providerId) || null;
  },

  /**
   * Add a custom provider
   */
  async addProvider(provider) {
    try {
      if (!provider.id || !provider.name || !provider.baseUrl) {
        throw new Error('Provider must have id, name, and baseUrl');
      }

      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      const customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      // Check for duplicate ID
      const existingIndex = customProviders.findIndex(p => p.id === provider.id);
      if (existingIndex !== -1) {
        customProviders[existingIndex] = { ...provider, isBuiltIn: false };
      } else {
        customProviders.push({ ...provider, isBuiltIn: false, models: provider.models || [] });
      }

      await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(customProviders));
      return true;
    } catch (error) {
      console.error('Error adding provider:', error);
      return false;
    }
  },

  /**
   * Update a custom provider
   */
  async updateProvider(providerId, updates) {
    try {
      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      const customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      const index = customProviders.findIndex(p => p.id === providerId);
      if (index !== -1) {
        customProviders[index] = { ...customProviders[index], ...updates };
        await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(customProviders));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating provider:', error);
      return false;
    }
  },

  /**
   * Remove a custom provider
   */
  async removeProvider(providerId) {
    try {
      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      const customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      // Can't remove built-in providers
      const provider = customProviders.find(p => p.id === providerId);
      if (provider?.isBuiltIn) {
        throw new Error('Cannot remove built-in provider');
      }

      const filtered = customProviders.filter(p => p.id !== providerId);
      await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(filtered));

      // Also remove the API key
      await this.deleteProviderApiKey(providerId);

      return true;
    } catch (error) {
      console.error('Error removing provider:', error);
      return false;
    }
  },

  /**
   * Get the active provider ID
   */
  async getActiveProviderId() {
    try {
      const activeId = await AsyncStorage.getItem(KEYS.ACTIVE_PROVIDER);
      return activeId || 'openrouter';
    } catch (error) {
      console.error('Error getting active provider:', error);
      return 'openrouter';
    }
  },

  /**
   * Set the active provider ID
   */
  async setActiveProviderId(providerId) {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_PROVIDER, providerId);
      return true;
    } catch (error) {
      console.error('Error setting active provider:', error);
      return false;
    }
  },

  /**
   * Get the active provider with full details
   */
  async getActiveProvider() {
    const providerId = await this.getActiveProviderId();
    return await this.getProvider(providerId);
  },

  /**
   * Get API key for a provider (stored securely)
   */
  async getProviderApiKey(providerId) {
    try {
      return await SecureStore.getItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
    } catch (error) {
      console.error('Error getting provider API key:', error);
      return null;
    }
  },

  /**
   * Set API key for a provider
   */
  async setProviderApiKey(providerId, apiKey) {
    try {
      if (apiKey) {
        await SecureStore.setItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`, apiKey);
      } else {
        await SecureStore.deleteItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
      }
      return true;
    } catch (error) {
      console.error('Error setting provider API key:', error);
      return false;
    }
  },

  /**
   * Delete API key for a provider
   */
  async deleteProviderApiKey(providerId) {
    try {
      await SecureStore.deleteItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
      return true;
    } catch (error) {
      console.error('Error deleting provider API key:', error);
      return false;
    }
  },

  /**
   * Validate API key format
   */
  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    // Accept any non-empty key with at least 5 characters
    return apiKey.trim().length >= 5;
  },

  /**
   * Test connection to a provider
   */
  async testConnection(providerId) {
    try {
      const provider = await this.getProvider(providerId);
      const apiKey = await this.getProviderApiKey(providerId);

      if (!provider || !apiKey) {
        return { success: false, error: 'Provider or API key not found' };
      }

      const response = await fetch(`${provider.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(provider.extraHeaders || {}),
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error?.message || 'Connection failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all models from all providers
   */
  async getAllModels() {
    const providers = await this.getProviders();
    const models = [];

    providers.forEach(provider => {
      if (provider.models) {
        provider.models.forEach(model => {
          models.push({
            ...model,
            providerId: provider.id,
            providerName: provider.name,
          });
        });
      }
    });

    return models;
  },

  /**
   * Get models for a specific provider
   */
  async getProviderModels(providerId) {
    const provider = await this.getProvider(providerId);
    return provider?.models || [];
  },

  /**
   * Add a custom model to a provider
   */
  async addModel(providerId, model) {
    try {
      if (!model.id || !model.name) {
        throw new Error('Model must have id and name');
      }

      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      let customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      // Check if this is a built-in provider that needs to be cloned to custom
      const builtInProvider = DEFAULT_PROVIDERS.find(p => p.id === providerId);
      let providerIndex = customProviders.findIndex(p => p.id === providerId);

      if (providerIndex === -1 && builtInProvider) {
        // Clone the built-in provider to custom storage
        customProviders.push({ ...builtInProvider, isBuiltIn: true });
        providerIndex = customProviders.length - 1;
      }

      if (providerIndex !== -1) {
        const models = customProviders[providerIndex].models || [];
        const existingIndex = models.findIndex(m => m.id === model.id);

        if (existingIndex !== -1) {
          models[existingIndex] = { ...models[existingIndex], ...model, isCustom: true };
        } else {
          models.push({ ...model, isCustom: true });
        }

        customProviders[providerIndex].models = models;
        await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(customProviders));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error adding model:', error);
      return false;
    }
  },

  /**
   * Remove a model from a provider
   */
  async removeModel(providerId, modelId) {
    try {
      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      const customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      const providerIndex = customProviders.findIndex(p => p.id === providerId);
      if (providerIndex !== -1) {
        const models = customProviders[providerIndex].models || [];
        customProviders[providerIndex].models = models.filter(m => m.id !== modelId);
        await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(customProviders));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing model:', error);
      return false;
    }
  },

  /**
   * Calculate cost for a request
   */
  calculateCost(model, inputTokens, outputTokens) {
    if (!model) return 0;
    const inputCost = (model.inputCost || 0) * inputTokens / 1000;
    const outputCost = (model.outputCost || 0) * outputTokens / 1000;
    return inputCost + outputCost;
  },

  /**
   * Make an AI API request
   */
  async makeRequest(messages, options = {}) {
    const {
      providerId,
      modelId,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
    } = options;

    const useProviderId = providerId || await this.getActiveProviderId();
    const provider = await this.getProvider(useProviderId);
    const apiKey = await this.getProviderApiKey(useProviderId);

    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!apiKey) {
      throw new Error('API key not configured. Please add it in Settings.');
    }

    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider.extraHeaders || {}),
      },
      body: JSON.stringify({
        model: modelId || (provider.models?.[0]?.id),
        messages: allMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'API request failed');
    }

    return data;
  },

  /**
   * Reset to default providers
   */
  async resetToDefaults() {
    try {
      await AsyncStorage.removeItem(KEYS.PROVIDERS);
      await AsyncStorage.setItem(KEYS.ACTIVE_PROVIDER, 'openrouter');
      return true;
    } catch (error) {
      console.error('Error resetting providers:', error);
      return false;
    }
  },
};

export default AIProviderManager;
