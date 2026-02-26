import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: 'unified_openrouter_api_key',
  SELECTED_MODEL: 'unified_selected_model',
  SELECTED_PROVIDER: 'unified_selected_provider',
  THEME: 'app_theme',
  USER_PREFERENCES: 'user_preferences',
  HOME_PAGE: 'custom_home_page',
  USER_AGENT: 'custom_user_agent',
  BROWSER_SETTINGS: 'browser_settings',
};

export const SettingsManager = {
  // ==========================================
  // API Key Management
  // ==========================================
  async getApiKey() {
    try {
      return await SecureStore.getItemAsync(KEYS.API_KEY);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  },

  async setApiKey(key) {
    try {
      if (key) {
        await SecureStore.setItemAsync(KEYS.API_KEY, key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  },

  async deleteApiKey() {
    try {
      await SecureStore.deleteItemAsync(KEYS.API_KEY);
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  },

  async validateApiKey() {
    try {
      const key = await this.getApiKey();
      if (!key) {
        throw new Error('API Key not found');
      }
      // Basic validation
      if (!key.startsWith('sk-') && !key.startsWith('pk-')) {
        throw new Error('Invalid API Key format');
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  // ==========================================
  // Model Selection
  // ==========================================
  async getSelectedModel() {
    try {
      const model = await AsyncStorage.getItem(KEYS.SELECTED_MODEL);
      return model || 'openai/gpt-4.1-mini';
    } catch (error) {
      console.error('Error getting selected model:', error);
      return 'openai/gpt-4.1-mini';
    }
  },

  async setSelectedModel(model) {
    try {
      await AsyncStorage.setItem(KEYS.SELECTED_MODEL, model);
      return true;
    } catch (error) {
      console.error('Error setting selected model:', error);
      return false;
    }
  },

  // ==========================================
  // Provider Selection
  // ==========================================
  async getSelectedProvider() {
    try {
      const provider = await AsyncStorage.getItem(KEYS.SELECTED_PROVIDER);
      return provider || 'openrouter';
    } catch (error) {
      console.error('Error getting selected provider:', error);
      return 'openrouter';
    }
  },

  async setSelectedProvider(providerId) {
    try {
      await AsyncStorage.setItem(KEYS.SELECTED_PROVIDER, providerId);
      return true;
    } catch (error) {
      console.error('Error setting selected provider:', error);
      return false;
    }
  },

  // ==========================================
  // User Preferences
  // ==========================================
  async getPreferences() {
    try {
      const prefs = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return prefs ? JSON.parse(prefs) : {};
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  },

  async setPreferences(preferences) {
    try {
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error setting preferences:', error);
      return false;
    }
  },

  async updatePreference(key, value) {
    try {
      const prefs = await this.getPreferences();
      prefs[key] = value;
      await this.setPreferences(prefs);
      return true;
    } catch (error) {
      console.error('Error updating preference:', error);
      return false;
    }
  },

  // ==========================================
  // Theme Management
  // ==========================================
  async getTheme() {
    try {
      const theme = await AsyncStorage.getItem(KEYS.THEME);
      return theme || 'dark';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'dark';
    }
  },

  async setTheme(theme) {
    try {
      await AsyncStorage.setItem(KEYS.THEME, theme);
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false;
    }
  },

  // ==========================================
  // Browser Settings
  // ==========================================
  async getBrowserSettings() {
    try {
      const settings = await AsyncStorage.getItem(KEYS.BROWSER_SETTINGS);
      return settings ? JSON.parse(settings) : {
        homePage: 'https://www.google.com',
        userAgent: null,
        desktopMode: false,
        safeMode: false,
        adBlockEnabled: false,
        javascriptEnabled: true,
      };
    } catch (error) {
      console.error('Error getting browser settings:', error);
      return {
        homePage: 'https://www.google.com',
        userAgent: null,
        desktopMode: false,
        safeMode: false,
        adBlockEnabled: false,
        javascriptEnabled: true,
      };
    }
  },

  async setBrowserSettings(settings) {
    try {
      await AsyncStorage.setItem(KEYS.BROWSER_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error setting browser settings:', error);
      return false;
    }
  },

  async updateBrowserSetting(key, value) {
    try {
      const settings = await this.getBrowserSettings();
      settings[key] = value;
      await this.setBrowserSettings(settings);
      return true;
    } catch (error) {
      console.error('Error updating browser setting:', error);
      return false;
    }
  },

  // ==========================================
  // Home Page
  // ==========================================
  async getHomePage() {
    try {
      const homePage = await AsyncStorage.getItem(KEYS.HOME_PAGE);
      return homePage || 'https://www.google.com';
    } catch (error) {
      console.error('Error getting home page:', error);
      return 'https://www.google.com';
    }
  },

  async setHomePage(url) {
    try {
      await AsyncStorage.setItem(KEYS.HOME_PAGE, url);
      return true;
    } catch (error) {
      console.error('Error setting home page:', error);
      return false;
    }
  },

  // ==========================================
  // User Agent
  // ==========================================
  async getUserAgent() {
    try {
      return await AsyncStorage.getItem(KEYS.USER_AGENT);
    } catch (error) {
      console.error('Error getting user agent:', error);
      return null;
    }
  },

  async setUserAgent(userAgent) {
    try {
      if (userAgent) {
        await AsyncStorage.setItem(KEYS.USER_AGENT, userAgent);
      } else {
        await AsyncStorage.removeItem(KEYS.USER_AGENT);
      }
      return true;
    } catch (error) {
      console.error('Error setting user agent:', error);
      return false;
    }
  },

  // ==========================================
  // Data Export/Import
  // ==========================================
  async exportAllSettings() {
    try {
      const [
        apiKey,
        selectedModel,
        selectedProvider,
        theme,
        preferences,
        browserSettings,
        homePage,
        userAgent,
      ] = await Promise.all([
        this.getApiKey(),
        this.getSelectedModel(),
        this.getSelectedProvider(),
        this.getTheme(),
        this.getPreferences(),
        this.getBrowserSettings(),
        this.getHomePage(),
        this.getUserAgent(),
      ]);

      return {
        selectedModel,
        selectedProvider,
        theme,
        preferences,
        browserSettings,
        homePage,
        userAgent,
        // Note: API key is not exported for security
      };
    } catch (error) {
      console.error('Error exporting settings:', error);
      return null;
    }
  },

  async importSettings(settings) {
    try {
      if (settings.selectedModel) await this.setSelectedModel(settings.selectedModel);
      if (settings.selectedProvider) await this.setSelectedProvider(settings.selectedProvider);
      if (settings.theme) await this.setTheme(settings.theme);
      if (settings.preferences) await this.setPreferences(settings.preferences);
      if (settings.browserSettings) await this.setBrowserSettings(settings.browserSettings);
      if (settings.homePage) await this.setHomePage(settings.homePage);
      if (settings.userAgent !== undefined) await this.setUserAgent(settings.userAgent);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  },

  // ==========================================
  // Reset Settings
  // ==========================================
  async resetAllSettings() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEYS.SELECTED_MODEL),
        AsyncStorage.removeItem(KEYS.SELECTED_PROVIDER),
        AsyncStorage.removeItem(KEYS.THEME),
        AsyncStorage.removeItem(KEYS.USER_PREFERENCES),
        AsyncStorage.removeItem(KEYS.BROWSER_SETTINGS),
        AsyncStorage.removeItem(KEYS.HOME_PAGE),
        AsyncStorage.removeItem(KEYS.USER_AGENT),
      ]);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  },

  async resetApiKey() {
    try {
      await SecureStore.deleteItemAsync(KEYS.API_KEY);
      return true;
    } catch (error) {
      console.error('Error resetting API key:', error);
      return false;
    }
  },
};
