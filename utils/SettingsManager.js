import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: 'unified_openrouter_api_key',
  SELECTED_MODEL: 'unified_selected_model',
  THEME: 'app_theme',
  USER_PREFERENCES: 'user_preferences'
};

export const SettingsManager = {
  // API Key Management
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
        throw new Error('API Key غير موجود');
      }
      // Basic validation
      if (!key.startsWith('sk-') && !key.startsWith('pk-')) {
        throw new Error('API Key غير صالح');
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Model Selection
  async getSelectedModel() {
    try {
      const model = await AsyncStorage.getItem(KEYS.SELECTED_MODEL);
      return model || 'anthropic/claude-3.5-sonnet';
    } catch (error) {
      console.error('Error getting selected model:', error);
      return 'anthropic/claude-3.5-sonnet';
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

  // User Preferences
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

  // Theme Management
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
  }
};
