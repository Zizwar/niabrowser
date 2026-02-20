import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROVIDERS as CONFIG_PROVIDERS } from '../config/providers';
import { PROVIDER_MODELS } from '../config/models';

const KEYS = {
  PROVIDERS: 'ai_providers',
  ACTIVE_PROVIDER: 'active_provider_id',
  PROVIDER_API_KEYS: 'provider_api_keys_',
};

// Build default providers by merging provider definitions with their model lists
const DEFAULT_PROVIDERS = CONFIG_PROVIDERS.map(provider => ({
  ...provider,
  models: PROVIDER_MODELS[provider.id] || [],
}));

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

      const provider = customProviders.find(p => p.id === providerId);
      if (provider?.isBuiltIn) {
        throw new Error('Cannot remove built-in provider');
      }

      const filtered = customProviders.filter(p => p.id !== providerId);
      await AsyncStorage.setItem(KEYS.PROVIDERS, JSON.stringify(filtered));
      await this.deleteProviderApiKey(providerId);

      return true;
    } catch (error) {
      console.error('Error removing provider:', error);
      return false;
    }
  },

  async getActiveProviderId() {
    try {
      const activeId = await AsyncStorage.getItem(KEYS.ACTIVE_PROVIDER);
      return activeId || 'openrouter';
    } catch (error) {
      return 'openrouter';
    }
  },

  async setActiveProviderId(providerId) {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_PROVIDER, providerId);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getActiveProvider() {
    const providerId = await this.getActiveProviderId();
    return await this.getProvider(providerId);
  },

  async getProviderApiKey(providerId) {
    try {
      return await SecureStore.getItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
    } catch (error) {
      return null;
    }
  },

  async setProviderApiKey(providerId, apiKey) {
    try {
      if (apiKey) {
        await SecureStore.setItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`, apiKey);
      } else {
        await SecureStore.deleteItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteProviderApiKey(providerId) {
    try {
      await SecureStore.deleteItemAsync(`${KEYS.PROVIDER_API_KEYS}${providerId}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    return apiKey.trim().length >= 5;
  },

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
            providerColor: provider.color,
          });
        });
      }
    });

    return models;
  },

  /**
   * Find the provider that owns a specific model by model ID
   */
  async getProviderForModel(modelId) {
    const providers = await this.getProviders();
    for (const provider of providers) {
      if (provider.models?.some(m => m.id === modelId)) {
        return provider;
      }
    }
    return await this.getActiveProvider();
  },

  async getProviderModels(providerId) {
    const provider = await this.getProvider(providerId);
    return provider?.models || [];
  },

  async addModel(providerId, model) {
    try {
      if (!model.id || !model.name) {
        throw new Error('Model must have id and name');
      }

      const customProvidersJson = await AsyncStorage.getItem(KEYS.PROVIDERS);
      let customProviders = customProvidersJson ? JSON.parse(customProvidersJson) : [];

      const builtInProvider = DEFAULT_PROVIDERS.find(p => p.id === providerId);
      let providerIndex = customProviders.findIndex(p => p.id === providerId);

      if (providerIndex === -1 && builtInProvider) {
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

  calculateCost(model, inputTokens, outputTokens) {
    if (!model) return 0;
    const inputCost = (model.inputCost || 0) * inputTokens / 1000;
    const outputCost = (model.outputCost || 0) * outputTokens / 1000;
    return inputCost + outputCost;
  },

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

    if (!provider) throw new Error('Provider not found');
    if (!apiKey) throw new Error('API key not configured. Please add it in Settings.');

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
    if (data.error) throw new Error(data.error.message || 'API request failed');
    return data;
  },

  async resetToDefaults() {
    try {
      await AsyncStorage.removeItem(KEYS.PROVIDERS);
      await AsyncStorage.setItem(KEYS.ACTIVE_PROVIDER, 'openrouter');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default AIProviderManager;
