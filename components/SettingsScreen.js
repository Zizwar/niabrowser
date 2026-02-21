import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import * as Clipboard from 'expo-clipboard';
import BaseModal from './ui/BaseModal';
import ModelSelector from './ui/ModelSelector';
import { AppIcon } from './ui/AppIcons';
import { SettingsManager } from '../utils/SettingsManager';
import { AIProviderManager } from '../utils/AIProviderManager';
import {
  buildChatSystemPrompt,
  SCRIPT_GENERATOR_PROMPT,
  SCRIPT_EDITOR_PROMPT,
  SCRIPT_TASK_EXAMPLES,
  PROMPT_KEYS,
  getCustomPrompt,
  saveCustomPrompt,
  resetCustomPrompt,
} from '../config/prompts';

/**
 * SettingsScreen - Comprehensive settings interface
 *
 * Props:
 * - visible: boolean
 * - onClose: function
 * - isDarkMode: boolean
 * - onThemeChange: function(isDark)
 */
const SettingsScreen = ({
  visible,
  onClose,
  isDarkMode,
  onThemeChange,
}) => {
  // State
  const [activeSection, setActiveSection] = useState('ai');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Settings
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [providers, setProviders] = useState([]);
  const [activeProviderId, setActiveProviderId] = useState('openrouter');
  const [testingConnection, setTestingConnection] = useState(false);

  // Model Management
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ id: '', name: '', provider: '', description: '' });
  const [allModels, setAllModels] = useState([]);

  // Browser Settings
  const [homePage, setHomePage] = useState('https://www.google.com');
  const [userAgent, setUserAgent] = useState('');

  // Appearance
  const [themeMode, setThemeMode] = useState('dark');

  // Developer - Prompt editing
  const [editingPrompt, setEditingPrompt] = useState(null); // key being edited
  const [editPromptText, setEditPromptText] = useState('');
  const [customPrompts, setCustomPrompts] = useState({});

  // Custom Provider creation
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '', baseUrl: '', docsUrl: '', description: '', color: '#6366F1',
  });

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#F5F5F5';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';
  const inputBackground = isDarkMode ? '#3C3C3E' : '#F0F0F0';

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [
        savedApiKey,
        savedModel,
        savedHomePage,
        savedUserAgent,
        savedTheme,
        loadedProviders,
        savedActiveProvider,
      ] = await Promise.all([
        SettingsManager.getApiKey(),
        SettingsManager.getSelectedModel(),
        SettingsManager.getHomePage(),
        SettingsManager.getUserAgent(),
        SettingsManager.getTheme(),
        AIProviderManager.getProviders(),
        AIProviderManager.getActiveProviderId(),
      ]);

      setApiKey(savedApiKey || '');
      setSelectedModelId(savedModel);
      setHomePage(savedHomePage);
      setUserAgent(savedUserAgent || '');
      setThemeMode(savedTheme);
      setProviders(loadedProviders);
      setActiveProviderId(savedActiveProvider);

      // Load all models
      const models = await AIProviderManager.getAllModels();
      setAllModels(models);

      // Load custom prompt overrides
      const [customChat, customGen, customEdit] = await Promise.all([
        getCustomPrompt(PROMPT_KEYS.CHAT_SYSTEM),
        getCustomPrompt(PROMPT_KEYS.SCRIPT_GENERATOR),
        getCustomPrompt(PROMPT_KEYS.SCRIPT_EDITOR),
      ]);
      setCustomPrompts({
        [PROMPT_KEYS.CHAT_SYSTEM]: customChat,
        [PROMPT_KEYS.SCRIPT_GENERATOR]: customGen,
        [PROMPT_KEYS.SCRIPT_EDITOR]: customEdit,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    setSaving(true);
    try {
      await SettingsManager.setApiKey(apiKey);
      await AIProviderManager.setProviderApiKey(activeProviderId, apiKey);
      Alert.alert('Success', 'API Key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API Key');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      Alert.alert('Error', 'Please enter an API Key first');
      return;
    }

    setTestingConnection(true);
    try {
      await AIProviderManager.setProviderApiKey(activeProviderId, apiKey);
      const result = await AIProviderManager.testConnection(activeProviderId);

      if (result.success) {
        Alert.alert('Success', 'Connection successful! API Key is valid.');
      } else {
        Alert.alert('Connection Failed', result.error || 'Could not connect to the API');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleModelSelect = async (modelId) => {
    setSelectedModelId(modelId);
    await SettingsManager.setSelectedModel(modelId);
  };

  const handleHomePageSave = async () => {
    try {
      await SettingsManager.setHomePage(homePage);
      Alert.alert('Success', 'Home page saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save home page');
    }
  };

  const handleThemeChange = async (isDark) => {
    const newTheme = isDark ? 'dark' : 'light';
    setThemeMode(newTheme);
    await SettingsManager.setTheme(newTheme);
    onThemeChange?.(isDark);
  };

  const exportData = async (type) => {
    try {
      let dataToExport = {};

      switch (type) {
        case 'all':
          const allKeys = await AsyncStorage.getAllKeys();
          const allData = await AsyncStorage.multiGet(allKeys);
          dataToExport = allData.reduce((acc, [key, value]) => {
            try {
              acc[key] = value ? JSON.parse(value) : null;
            } catch {
              acc[key] = value;
            }
            return acc;
          }, {});
          break;
        case 'favorites':
          const favorites = await AsyncStorage.getItem('favorites');
          dataToExport = { favorites: favorites ? JSON.parse(favorites) : [] };
          break;
        case 'scripts':
          const scripts = await AsyncStorage.getItem('userScripts');
          dataToExport = { scripts: scripts ? JSON.parse(scripts) : [] };
          break;
        case 'settings':
          dataToExport = await SettingsManager.exportAllSettings();
          break;
      }

      const fileName = `niabrowser_${type}_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToExport, null, 2));
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importedData = JSON.parse(fileContent);

        Alert.alert(
          'Import Data',
          'How would you like to import?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Merge',
              onPress: async () => {
                for (const [key, value] of Object.entries(importedData)) {
                  const existing = await AsyncStorage.getItem(key);
                  if (existing && Array.isArray(value)) {
                    const merged = [...new Set([...JSON.parse(existing), ...value])];
                    await AsyncStorage.setItem(key, JSON.stringify(merged));
                  } else {
                    await AsyncStorage.setItem(key, JSON.stringify(value));
                  }
                }
                Alert.alert('Success', 'Data merged successfully');
                loadSettings();
              },
            },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: async () => {
                for (const [key, value] of Object.entries(importedData)) {
                  await AsyncStorage.setItem(key, JSON.stringify(value));
                }
                Alert.alert('Success', 'Data imported successfully');
                loadSettings();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Import Failed', error.message);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all app data including history, favorites, scripts, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await SettingsManager.resetApiKey();
              Alert.alert('Success', 'All data cleared');
              loadSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSectionButton = (id, icon, label) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === id && styles.sectionButtonActive,
        activeSection === id && { backgroundColor: '#007AFF' },
      ]}
      onPress={() => setActiveSection(id)}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={activeSection === id ? '#FFFFFF' : secondaryTextColor}
      />
      <Text
        style={[
          styles.sectionButtonText,
          { color: activeSection === id ? '#FFFFFF' : textColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const activeProvider = providers.find(p => p.id === activeProviderId) || providers[0];

  const handleProviderSwitch = async (providerId) => {
    setActiveProviderId(providerId);
    await AIProviderManager.setActiveProviderId(providerId);
    const key = await AIProviderManager.getProviderApiKey(providerId);
    setApiKey(key || '');
    const allMods = await AIProviderManager.getAllModels();
    setAllModels(allMods);
    const providerModels = allMods.filter(m => m.providerId === providerId);
    const validModel = providerModels.find(m => m.id === selectedModelId);
    if (!validModel && providerModels.length > 0) {
      setSelectedModelId(providerModels[0].id);
      await SettingsManager.setSelectedModel(providerModels[0].id);
    }
  };

  const renderAISettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>AI Provider Settings</Text>

      {/* Provider Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {providers.map(provider => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerTab,
              { backgroundColor: activeProviderId === provider.id ? (provider.color || '#007AFF') : cardBackground, borderColor },
            ]}
            onPress={() => handleProviderSwitch(provider.id)}
            onLongPress={() => {
              if (!provider.isBuiltIn) {
                Alert.alert('Delete Provider', `Remove "${provider.name}" and all its models?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDeleteProvider(provider.id) },
                ]);
              }
            }}
          >
            <MaterialIcons
              name={provider.icon || 'cloud'}
              size={18}
              color={activeProviderId === provider.id ? '#FFF' : secondaryTextColor}
            />
            <Text style={[
              styles.providerTabText,
              { color: activeProviderId === provider.id ? '#FFF' : textColor },
            ]} numberOfLines={1}>
              {provider.name}
            </Text>
            {provider.freeQuota && (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            )}
            {!provider.isBuiltIn && (
              <View style={[styles.freeBadge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.freeBadgeText}>CUSTOM</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.providerTab, { backgroundColor: cardBackground, borderColor, borderStyle: 'dashed' }]}
          onPress={() => setShowAddProvider(true)}
        >
          <MaterialIcons name="add" size={18} color="#007AFF" />
          <Text style={[styles.providerTabText, { color: '#007AFF' }]}>Add</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Provider Info */}
      {activeProvider && (
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name={activeProvider.icon || 'cloud'} size={20} color={activeProvider.color || '#007AFF'} />
            <Text style={[styles.cardTitle, { color: textColor }]}>{activeProvider.name}</Text>
            {activeProvider.freeQuota && (
              <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                <Text style={{ color: '#2E7D32', fontSize: 11, fontWeight: '700' }}>Free Quota</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
            {activeProvider.description}
          </Text>
          {activeProvider.keyHelp && (
            <Text style={[styles.cardDescription, { color: '#007AFF', fontWeight: '500', marginTop: 4, marginBottom: 4 }]}>
              {activeProvider.keyHelp}
            </Text>
          )}
          {activeProvider.docsUrl && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL(activeProvider.docsUrl)}
            >
              <Text style={styles.linkText}>{activeProvider.name} Documentation</Text>
              <MaterialIcons name="open-in-new" size={16} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* API Key */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="vpn-key" size={20} color="#FF9800" />
          <Text style={[styles.cardTitle, { color: textColor }]}>API Key</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder={activeProvider?.keyPlaceholder || 'Enter API Key'}
            placeholderTextColor={secondaryTextColor}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => setShowApiKey(!showApiKey)}
          >
            <MaterialIcons
              name={showApiKey ? 'visibility-off' : 'visibility'}
              size={20}
              color={secondaryTextColor}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={saveApiKey}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor }]}
            onPress={testConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <MaterialIcons name="wifi" size={18} color="#007AFF" />
                <Text style={[styles.buttonTextSecondary, { color: '#007AFF' }]}>Test</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Model Selection */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="psychology" size={20} color="#9C27B0" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Default Model</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          Select the default AI model for {activeProvider?.name || 'this provider'}
        </Text>
        <ModelSelector
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          isDarkMode={isDarkMode}
          showCost={true}
          showProvider={true}
          providerId={activeProviderId}
        />
      </View>

      {/* Model Management */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="tune" size={20} color="#FF9800" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Model Management</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          Add custom models or remove existing ones.
        </Text>

        {/* Add Model Button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor, marginBottom: 10 }]}
          onPress={() => setShowAddModel(true)}
        >
          <MaterialIcons name="add" size={18} color="#007AFF" />
          <Text style={[styles.buttonTextSecondary, { color: '#007AFF' }]}>Add Custom Model</Text>
        </TouchableOpacity>

        {/* Model List (show custom models only) */}
        {allModels.filter(m => m.isCustom && m.providerId === activeProviderId).length > 0 && (
          <View style={styles.modelList}>
            <Text style={[styles.modelListTitle, { color: secondaryTextColor }]}>Custom Models:</Text>
            {allModels.filter(m => m.isCustom && m.providerId === activeProviderId).map((model, index) => (
              <View key={model.id || index} style={[styles.modelItem, { backgroundColor: inputBackground }]}>
                <View style={styles.modelItemInfo}>
                  <Text style={[styles.modelItemName, { color: textColor }]}>{model.name}</Text>
                  <Text style={[styles.modelItemId, { color: secondaryTextColor }]}>{model.id}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteModel(model.id)}
                  style={styles.modelDeleteButton}
                >
                  <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Custom Provider Modal */}
      {showAddProvider && (
        <View style={[styles.addModelOverlay]}>
          <View style={[styles.addModelCard, { backgroundColor: cardBackground }]}>
            <View style={styles.addModelHeader}>
              <Text style={[styles.addModelTitle, { color: textColor }]}>Add Custom Provider</Text>
              <TouchableOpacity onPress={() => setShowAddProvider(false)}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Provider Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newProvider.name}
              onChangeText={(text) => setNewProvider({...newProvider, name: text})}
              placeholder="e.g., Groq, Together AI"
              placeholderTextColor={secondaryTextColor}
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Base URL * (OpenAI-compatible)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newProvider.baseUrl}
              onChangeText={(text) => setNewProvider({...newProvider, baseUrl: text})}
              placeholder="https://api.example.com/v1"
              placeholderTextColor={secondaryTextColor}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Documentation URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newProvider.docsUrl}
              onChangeText={(text) => setNewProvider({...newProvider, docsUrl: text})}
              placeholder="https://docs.example.com"
              placeholderTextColor={secondaryTextColor}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newProvider.description}
              onChangeText={(text) => setNewProvider({...newProvider, description: text})}
              placeholder="Short description..."
              placeholderTextColor={secondaryTextColor}
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Brand Color</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {['#6366F1', '#4285F4', '#10A37F', '#F97316', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#64748B'].map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewProvider({...newProvider, color: c})}
                  style={{
                    width: 32, height: 32, borderRadius: 16, backgroundColor: c,
                    borderWidth: newProvider.color === c ? 3 : 0,
                    borderColor: '#FFF',
                    shadowColor: newProvider.color === c ? c : 'transparent',
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: newProvider.color === c ? 4 : 0,
                  }}
                />
              ))}
            </View>

            <View style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#F0F0F0', padding: 10, borderRadius: 8, marginTop: 12 }}>
              <Text style={{ color: secondaryTextColor, fontSize: 12, lineHeight: 16 }}>
                Must be OpenAI-compatible API (supports /chat/completions endpoint). HTTPS only — your API key is sent to this URL. After creating, add models and set the API key.
              </Text>
            </View>

            <View style={styles.addModelButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor, flex: 1 }]}
                onPress={() => setShowAddProvider(false)}
              >
                <Text style={[styles.buttonTextSecondary, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { flex: 1 }]}
                onPress={handleAddProvider}
              >
                <MaterialIcons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Model Modal */}
      {showAddModel && (
        <View style={[styles.addModelOverlay]}>
          <View style={[styles.addModelCard, { backgroundColor: cardBackground }]}>
            <View style={styles.addModelHeader}>
              <Text style={[styles.addModelTitle, { color: textColor }]}>Add Custom Model</Text>
              <TouchableOpacity onPress={() => setShowAddModel(false)}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Model ID *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newModel.id}
              onChangeText={(text) => setNewModel({...newModel, id: text})}
              placeholder="e.g., gpt-5-turbo"
              placeholderTextColor={secondaryTextColor}
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Display Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newModel.name}
              onChangeText={(text) => setNewModel({...newModel, name: text})}
              placeholder="e.g., GPT-5 Turbo"
              placeholderTextColor={secondaryTextColor}
            />

            <Text style={[styles.inputLabel, { color: secondaryTextColor }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={newModel.description}
              onChangeText={(text) => setNewModel({...newModel, description: text})}
              placeholder="Short description..."
              placeholderTextColor={secondaryTextColor}
            />

            <View style={styles.addModelButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor, flex: 1 }]}
                onPress={() => setShowAddModel(false)}
              >
                <Text style={[styles.buttonTextSecondary, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { flex: 1 }]}
                onPress={handleAddModel}
              >
                <MaterialIcons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const handleAddModel = async () => {
    if (!newModel.id || !newModel.name) {
      Alert.alert('Error', 'Model ID and Name are required');
      return;
    }

    const success = await AIProviderManager.addModel(activeProviderId, {
      id: newModel.id,
      name: newModel.name,
      provider: newModel.provider || 'Custom',
      description: newModel.description || '',
      cost: 'Custom',
      inputCost: 0,
      outputCost: 0,
      maxTokens: 4096,
    });

    if (success) {
      Alert.alert('Success', 'Model added successfully');
      setShowAddModel(false);
      setNewModel({ id: '', name: '', provider: '', description: '' });
      loadSettings();
    } else {
      Alert.alert('Error', 'Failed to add model');
    }
  };

  const handleDeleteModel = async (modelId) => {
    Alert.alert(
      'Delete Model',
      'Are you sure you want to delete this custom model?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await AIProviderManager.removeModel(activeProviderId, modelId);
            if (success) {
              loadSettings();
            } else {
              Alert.alert('Error', 'Failed to delete model');
            }
          }
        }
      ]
    );
  };

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.baseUrl) {
      Alert.alert('Error', 'Provider name and base URL are required');
      return;
    }
    if (!newProvider.baseUrl.startsWith('https://')) {
      Alert.alert('Security Warning', 'Only HTTPS URLs are allowed for custom providers. Your API key will be sent to this URL.');
      return;
    }
    const id = newProvider.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!id) {
      Alert.alert('Invalid Name', 'Provider name must contain alphanumeric characters.');
      return;
    }
    const existingProvider = providers.find(p => p.id === id);
    if (existingProvider) {
      Alert.alert('Duplicate', `A provider with ID "${id}" already exists.`);
      return;
    }
    const success = await AIProviderManager.addProvider({
      id,
      name: newProvider.name,
      icon: 'cloud',
      color: newProvider.color || '#6366F1',
      description: newProvider.description || `Custom provider: ${newProvider.name}`,
      baseUrl: newProvider.baseUrl.replace(/\/+$/, ''),
      docsUrl: newProvider.docsUrl || '',
      keyPlaceholder: 'Enter API Key...',
      keyHelp: `API key for ${newProvider.name}`,
      extraHeaders: {},
      isBuiltIn: false,
      models: [],
    });

    if (success) {
      Alert.alert('Success', `Provider "${newProvider.name}" created. Switch to it to add API key and models.`);
      setShowAddProvider(false);
      setNewProvider({ name: '', baseUrl: '', docsUrl: '', description: '', color: '#6366F1' });
      loadSettings();
    } else {
      Alert.alert('Error', 'Failed to create provider');
    }
  };

  const handleDeleteProvider = async (providerId) => {
    const success = await AIProviderManager.removeProvider(providerId);
    if (success) {
      if (activeProviderId === providerId) {
        await handleProviderSwitch('openrouter');
      }
      loadSettings();
    } else {
      Alert.alert('Error', 'Failed to delete provider');
    }
  };

  // Developer section - prompt helpers
  const getPromptInfo = () => [
    {
      key: PROMPT_KEYS.CHAT_SYSTEM,
      title: 'Chat System Prompt',
      icon: 'psychology',
      color: '#007AFF',
      description: 'Main AI assistant prompt with dynamic context injection',
      defaultText: buildChatSystemPrompt({
        currentUrl: 'https://example.com',
        attachments: { cookies: true, console: true, network: true },
        consoleCount: 10, networkCount: 5, cookieCount: 3, lsCount: 2,
      }),
    },
    {
      key: PROMPT_KEYS.SCRIPT_GENERATOR,
      title: 'Script Generator Prompt',
      icon: 'auto-awesome',
      color: '#9C27B0',
      description: 'AI prompt for generating JavaScript scripts',
      defaultText: SCRIPT_GENERATOR_PROMPT,
    },
    {
      key: PROMPT_KEYS.SCRIPT_EDITOR,
      title: 'Script Editor Prompt',
      icon: 'edit',
      color: '#FF9800',
      description: 'AI prompt for editing existing scripts',
      defaultText: SCRIPT_EDITOR_PROMPT,
    },
  ];

  const handleCopyPrompt = async (key, defaultText) => {
    const text = customPrompts[key] || defaultText;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Prompt copied to clipboard');
  };

  const handleEditPrompt = (key, defaultText) => {
    setEditingPrompt(key);
    setEditPromptText(customPrompts[key] || defaultText);
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt) return;
    await saveCustomPrompt(editingPrompt, editPromptText);
    setCustomPrompts({ ...customPrompts, [editingPrompt]: editPromptText });
    setEditingPrompt(null);
    Alert.alert('Saved', 'Custom prompt saved. It will be used in future AI interactions.');
  };

  const handleResetPrompt = (key) => {
    Alert.alert('Reset Prompt', 'Revert to the default prompt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: async () => {
          await resetCustomPrompt(key);
          setCustomPrompts({ ...customPrompts, [key]: null });
          Alert.alert('Reset', 'Prompt reverted to default');
        },
      },
    ]);
  };

  const renderDeveloperSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Developer Config</Text>

      {/* Prompts Section */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="description" size={20} color="#007AFF" />
          <Text style={[styles.cardTitle, { color: textColor }]}>System Prompts</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          View, copy, or customize all AI prompts used by the app.
        </Text>
      </View>

      {getPromptInfo().map((prompt) => (
        <View key={prompt.key} style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name={prompt.icon} size={20} color={prompt.color} />
            <Text style={[styles.cardTitle, { color: textColor, flex: 1 }]}>{prompt.title}</Text>
            {customPrompts[prompt.key] && (
              <View style={[styles.freeBadge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.freeBadgeText}>CUSTOM</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
            {prompt.description}
          </Text>

          {editingPrompt === prompt.key ? (
            <View>
              <TextInput
                style={[styles.input, {
                  backgroundColor: inputBackground,
                  color: textColor,
                  height: 200,
                  textAlignVertical: 'top',
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  fontSize: 12,
                  lineHeight: 18,
                }]}
                value={editPromptText}
                onChangeText={setEditPromptText}
                multiline
                autoCorrect={false}
                autoCapitalize="none"
              />
              <View style={[styles.buttonRow, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, { borderColor }]}
                  onPress={() => setEditingPrompt(null)}
                >
                  <Text style={[styles.buttonTextSecondary, { color: textColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleSavePrompt}
                >
                  <MaterialIcons name="save" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={{
                backgroundColor: inputBackground,
                borderRadius: 8,
                padding: 10,
                maxHeight: 100,
              }}>
                <Text style={{
                  color: secondaryTextColor,
                  fontSize: 11,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  lineHeight: 16,
                }} numberOfLines={5}>
                  {(customPrompts[prompt.key] || prompt.defaultText).substring(0, 300)}...
                </Text>
              </View>
              <View style={[styles.buttonRow, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, { borderColor }]}
                  onPress={() => handleCopyPrompt(prompt.key, prompt.defaultText)}
                >
                  <MaterialIcons name="content-copy" size={16} color="#007AFF" />
                  <Text style={[styles.buttonTextSecondary, { color: '#007AFF' }]}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, { borderColor }]}
                  onPress={() => handleEditPrompt(prompt.key, prompt.defaultText)}
                >
                  <MaterialIcons name="edit" size={16} color="#FF9800" />
                  <Text style={[styles.buttonTextSecondary, { color: '#FF9800' }]}>Modify</Text>
                </TouchableOpacity>
                {customPrompts[prompt.key] && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, { borderColor }]}
                    onPress={() => handleResetPrompt(prompt.key)}
                  >
                    <MaterialIcons name="restore" size={16} color="#F44336" />
                    <Text style={[styles.buttonTextSecondary, { color: '#F44336' }]}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      ))}

      {/* Task Examples */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="lightbulb" size={20} color="#FFC107" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Script Task Examples</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          Quick-select examples shown in the AI Script Generator.
        </Text>
        {SCRIPT_TASK_EXAMPLES.map((example, i) => (
          <View key={i} style={{ flexDirection: 'row', paddingVertical: 4 }}>
            <Text style={{ color: secondaryTextColor, fontSize: 12, marginRight: 6 }}>{i + 1}.</Text>
            <Text style={{ color: textColor, fontSize: 12, flex: 1 }}>{example}</Text>
          </View>
        ))}
      </View>

      {/* Config Info */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="folder" size={20} color="#4CAF50" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Config Files</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          Defaults are defined in the config/ folder. Custom overrides from this screen are stored in app storage and take priority.
        </Text>
        {[
          { file: 'config/providers.js', desc: 'AI provider definitions' },
          { file: 'config/models.js', desc: 'Model lists by provider' },
          { file: 'config/prompts.js', desc: 'System prompts' },
        ].map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
            <MaterialIcons name="insert-drive-file" size={14} color={secondaryTextColor} />
            <Text style={{ color: textColor, fontSize: 12, marginLeft: 6, fontWeight: '600' }}>{f.file}</Text>
            <Text style={{ color: secondaryTextColor, fontSize: 11, marginLeft: 6 }}>- {f.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>

      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="dark-mode" size={20} color="#5C6BC0" />
            <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={handleThemeChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={themeMode === 'dark' ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  const renderBrowserSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Browser Settings</Text>

      {/* Home Page */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="home" size={20} color="#4CAF50" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Home Page</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          value={homePage}
          onChangeText={setHomePage}
          placeholder="https://www.google.com"
          placeholderTextColor={secondaryTextColor}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { marginTop: 10 }]}
          onPress={handleHomePageSave}
        >
          <MaterialIcons name="save" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Save Home Page</Text>
        </TouchableOpacity>
      </View>

      {/* User Agent - Info Only */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="person" size={20} color="#FF5722" />
          <Text style={[styles.cardTitle, { color: textColor }]}>User Agent</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          User Agent can be changed from the browser menu (Settings icon in bottom sheet).
        </Text>
      </View>
    </View>
  );

  const renderDataSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Data Management</Text>

      {/* Export */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="upload" size={20} color="#2196F3" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Export Data</Text>
        </View>
        <View style={styles.dataButtonsGrid}>
          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: inputBackground }]}
            onPress={() => exportData('all')}
          >
            <MaterialIcons name="folder" size={24} color="#FFC107" />
            <Text style={[styles.dataButtonText, { color: textColor }]}>All Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: inputBackground }]}
            onPress={() => exportData('favorites')}
          >
            <MaterialIcons name="star" size={24} color="#FF9800" />
            <Text style={[styles.dataButtonText, { color: textColor }]}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: inputBackground }]}
            onPress={() => exportData('scripts')}
          >
            <MaterialIcons name="code" size={24} color="#9C27B0" />
            <Text style={[styles.dataButtonText, { color: textColor }]}>Scripts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: inputBackground }]}
            onPress={() => exportData('settings')}
          >
            <MaterialIcons name="settings" size={24} color="#607D8B" />
            <Text style={[styles.dataButtonText, { color: textColor }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Import */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="download" size={20} color="#4CAF50" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Import Data</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor }]}
          onPress={importData}
        >
          <MaterialIcons name="file-upload" size={18} color="#007AFF" />
          <Text style={[styles.buttonTextSecondary, { color: '#007AFF' }]}>
            Import from File
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clear Data */}
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="delete" size={20} color="#F44336" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Clear Data</Text>
        </View>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>
          This will permanently delete all app data including history, favorites, scripts, and settings.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllData}
        >
          <MaterialIcons name="delete-forever" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
            Loading settings...
          </Text>
        </View>
      );
    }

    switch (activeSection) {
      case 'ai':
        return renderAISettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'browser':
        return renderBrowserSettings();
      case 'data':
        return renderDataSettings();
      case 'developer':
        return renderDeveloperSettings();
      default:
        return renderAISettings();
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Settings"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabsContainer, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}
          contentContainerStyle={styles.tabsContent}
        >
          {renderSectionButton('ai', 'psychology', 'AI')}
          {renderSectionButton('appearance', 'palette', 'Appearance')}
          {renderSectionButton('browser', 'language', 'Browser')}
          {renderSectionButton('data', 'storage', 'Data')}
          {renderSectionButton('developer', 'code', 'Developer')}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.contentScroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    maxHeight: 56,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sectionButtonActive: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  dataButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dataButton: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 6,
  },
  dataButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  // Model Management Styles
  modelList: {
    marginTop: 10,
  },
  modelListTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modelItemInfo: {
    flex: 1,
  },
  modelItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  modelItemId: {
    fontSize: 12,
    marginTop: 2,
  },
  modelDeleteButton: {
    padding: 4,
  },
  addModelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  addModelCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  addModelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addModelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 10,
  },
  addModelButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  providerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  providerTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default SettingsScreen;
