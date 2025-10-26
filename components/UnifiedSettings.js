import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Linking,
  Switch
} from 'react-native';
import { Icon } from 'react-native-elements';
import { SettingsManager } from '../utils/SettingsManager';
import { SecurityManager } from '../utils/SecurityManager';

const UnifiedSettings = ({ visible, onClose, isDarkMode }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const key = await SettingsManager.getApiKey();
      const model = await SettingsManager.getSelectedModel();
      setApiKey(key || '');
      setSelectedModel(model);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);

      // Validate API key if provided
      if (apiKey && !SecurityManager.validateApiKey(apiKey)) {
        Alert.alert('خطأ', 'مفتاح API غير صالح. يجب أن يبدأ بـ sk- أو pk-');
        setIsLoading(false);
        return;
      }

      // Save API key
      if (apiKey) {
        await SettingsManager.setApiKey(apiKey);
      }

      // Save selected model
      await SettingsManager.setSelectedModel(selectedModel);

      Alert.alert('✅ نجح', 'تم حفظ الإعدادات بنجاح');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('❌ خطأ', 'فشل حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const models = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      cost: 'Medium',
      description: 'الأفضل للمهام المعقدة'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      cost: 'High',
      description: 'قوي ومتقدم'
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      cost: 'Low',
      description: 'سريع واقتصادي'
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      cost: 'Medium',
      description: 'متوازن وفعال'
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      cost: 'Low',
      description: 'مفتوح المصدر'
    }
  ];

  const colors = {
    background: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? '#AAAAAA' : '#666666',
    inputBg: isDarkMode ? '#2A2A2A' : '#F5F5F5',
    border: isDarkMode ? '#444444' : '#DDDDDD',
    cardBg: isDarkMode ? '#2A2A2A' : '#F9F9F9',
    primary: '#4CAF50',
    danger: '#F44336'
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            ⚙️ الإعدادات الموحدة
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" color={colors.text} size={28} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* API Key Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🔑 OpenRouter API Key
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
              المفتاح المستخدم لجميع ميزات الذكاء الاصطناعي
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="أدخل مفتاح API"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!isKeyVisible}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setIsKeyVisible(!isKeyVisible)}>
                <Icon
                  name={isKeyVisible ? 'visibility-off' : 'visibility'}
                  color={colors.secondaryText}
                  size={24}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://openrouter.ai/keys')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>احصل على مفتاح مجاني →</Text>
            </TouchableOpacity>
          </View>

          {/* Model Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🤖 اختيار النموذج
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
              اختر النموذج الأنسب لاحتياجاتك
            </Text>

            {models.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  selectedModel === model.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedModel(model.id)}
              >
                <View style={styles.modelInfo}>
                  <Text style={[styles.modelName, { color: colors.text }]}>
                    {model.name}
                  </Text>
                  <Text style={[styles.modelDescription, { color: colors.secondaryText }]}>
                    {model.description}
                  </Text>
                  <Text style={[styles.modelCost, { color: colors.secondaryText }]}>
                    التكلفة: {model.cost}
                  </Text>
                </View>
                {selectedModel === model.id && (
                  <Icon name="check-circle" color={colors.primary} size={28} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={saveSettings}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
            </Text>
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              💡 نصائح
            </Text>
            <Text style={[styles.helpText, { color: colors.secondaryText }]}>
              • احفظ مفتاح API الخاص بك بشكل آمن
            </Text>
            <Text style={[styles.helpText, { color: colors.secondaryText }]}>
              • يمكنك تغيير النموذج في أي وقت
            </Text>
            <Text style={[styles.helpText, { color: colors.secondaryText }]}>
              • النماذج الأرخص أسرع لكن أقل دقة
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 20
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10
  },
  linkButton: {
    marginTop: 10
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600'
  },
  modelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1
  },
  modelInfo: {
    flex: 1
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  modelDescription: {
    fontSize: 14,
    marginBottom: 4
  },
  modelCost: {
    fontSize: 12
  },
  saveButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  helpSection: {
    marginBottom: 30
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  helpText: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20
  }
});

export default UnifiedSettings;
