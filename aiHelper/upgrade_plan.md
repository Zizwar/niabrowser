# 🚀 خطة ترقية NIABrowser: نحو أول متصفح موبايل ذكي حقيقي

## 📋 الرؤية
تحويل NIABrowser من متصفح مطور تقليدي إلى **أول متصفح موبايل ذكي** يدمج الذكاء الاصطناعي في كل جانب من تجربة التصفح.

---

## 🎯 المشاكل الحالية التي يجب حلها

### 1. ❌ مشكلة تكرار مفتاح API
**الوضع الحالي:** المفتاح مخزن في عدة أماكن:
- `components/ScriptManager.js` → يقرأ من `SecureStore` بمفتاح `'openrouter_api_key'`
- `components/AICookieInspector.js` → يقرأ من `SecureStore` بمفتاح `'openRouterApiKey'`
- `components/AICodeDebugger.js` → يقرأ من `SecureStore` بمفتاح `'openRouterApiKey'`
- `components/AICommandInterface.js` → يقرأ من `SecureStore` بمفتاح `'openRouterApiKey'`

**المشكلة:** أسماء مفاتيح مختلفة + عدم وجود مركزية

---

## ✅ الحل: بنية موحدة للإعدادات

### المرحلة 1: إنشاء مدير إعدادات مركزي

#### الملف الجديد: `utils/SettingsManager.js`
```javascript
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
  }
};
```

---

## 🎨 المرحلة 2: واجهة إعدادات موحدة

### الملف الجديد: `components/UnifiedSettings.js`
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { SettingsManager } from '../utils/SettingsManager';

const UnifiedSettings = ({ visible, onClose, isDarkMode }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [visible]);

  const loadSettings = async () => {
    const key = await SettingsManager.getApiKey();
    const model = await SettingsManager.getSelectedModel();
    setApiKey(key || '');
    setSelectedModel(model);
  };

  const saveSettings = async () => {
    const success = await SettingsManager.setApiKey(apiKey);
    await SettingsManager.setSelectedModel(selectedModel);
    
    if (success) {
      Alert.alert('✅ نجح', 'تم حفظ الإعدادات بنجاح');
    } else {
      Alert.alert('❌ خطأ', 'فشل حفظ الإعدادات');
    }
  };

  const models = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: 'Medium' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', cost: 'High' },
    { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', cost: 'Low' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', cost: 'Medium' },
    { id: 'deepseek/deepseek-r1-distill-0528:free', name: 'DeepSeek R1 (Free)', cost: 'Free' }
  ];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>⚙️ الإعدادات الموحدة</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" color={isDarkMode ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* API Key Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
              🔑 OpenRouter API Key
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { 
                  color: isDarkMode ? '#FFF' : '#000',
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5'
                }]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="أدخل مفتاح API"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                secureTextEntry={!isKeyVisible}
              />
              <TouchableOpacity onPress={() => setIsKeyVisible(!isKeyVisible)}>
                <Icon name={isKeyVisible ? 'visibility-off' : 'visibility'} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/keys')}>
              <Text style={styles.link}>احصل على مفتاح مجاني →</Text>
            </TouchableOpacity>
          </View>

          {/* Model Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
              🤖 اختيار النموذج
            </Text>
            {models.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  selectedModel === model.id && styles.selectedModel,
                  { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }
                ]}
                onPress={() => setSelectedModel(model.id)}
              >
                <View>
                  <Text style={[styles.modelName, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    {model.name}
                  </Text>
                  <Text style={[styles.modelCost, { color: isDarkMode ? '#AAA' : '#666' }]}>
                    التكلفة: {model.cost}
                  </Text>
                </View>
                {selectedModel === model.id && <Icon name="check-circle" color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>💾 حفظ الإعدادات</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 15
  },
  input: { 
    flex: 1, 
    height: 50,
    fontSize: 16
  },
  link: { 
    color: '#4CAF50', 
    marginTop: 10,
    fontSize: 14
  },
  modelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  selectedModel: {
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  modelName: { fontSize: 16, fontWeight: '600' },
  modelCost: { fontSize: 14, marginTop: 5 },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default UnifiedSettings;
```

---

## 🔥 المرحلة 3: الميزات الذكية الثورية

### 1. **AI Chat Assistant** - مساعد الدردشة الذكي

#### الملف الجديد: `components/SmartChatAssistant.js`

**الميزات:**
- 💬 دردشة مع الذكاء الاصطناعي حول الصفحة الحالية
- 🍪 جلب الكوكيز بأمر صوتي: "أعطني كوكيز هذا الموقع"
- 🗂️ فتح تبويب جديد: "افتح google.com في تبويب جديد"
- 📊 تحليل الكود: "حلل الكود في هذه الصفحة"
- ⭐ إدارة المفضلة: "أضف هذه الصفحة للمفضلة"
- 🔍 البحث الذكي: "ابحث عن أخطاء JavaScript"

```javascript
import React, { useState, useRef, useEffect } from 'react';
import { SettingsManager } from '../utils/SettingsManager';

const SmartChatAssistant = ({ visible, onClose, isDarkMode, currentUrl, webViewRef, tabs, setTabs, favorites, setFavorites }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCommand = async (userInput) => {
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = await SettingsManager.getApiKey();
      const model = await SettingsManager.getSelectedModel();

      // تحديد نوع الأمر
      const commandType = detectCommandType(userInput);

      let context = {};
      
      // جمع البيانات حسب نوع الأمر
      if (commandType.includes('cookies')) {
        context.cookies = await getCookies();
      }
      if (commandType.includes('tabs')) {
        context.tabs = tabs;
      }
      if (commandType.includes('favorites')) {
        context.favorites = favorites;
      }
      if (commandType.includes('code')) {
        context.sourceCode = await getPageSource();
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `أنت مساعد ذكي لمتصفح موبايل. يمكنك:
1. جلب وعرض الكوكيز
2. فتح صفحات جديدة في تبويبات
3. تحليل كود الصفحات
4. إدارة المفضلة
5. البحث وحل المشاكل

السياق الحالي:
- URL: ${currentUrl}
- البيانات: ${JSON.stringify(context)}

قم بتنفيذ الأمر وأعطي إجابة مختصرة ومفيدة.`
            },
            { role: 'user', content: userInput }
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // تنفيذ الأوامر
      await executeCommands(commandType, context);

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ خطأ: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectCommandType = (input) => {
    const types = [];
    if (input.includes('كوكي') || input.includes('cookie')) types.push('cookies');
    if (input.includes('تبويب') || input.includes('tab') || input.includes('افتح')) types.push('tabs');
    if (input.includes('مفضل') || input.includes('favorite')) types.push('favorites');
    if (input.includes('كود') || input.includes('code') || input.includes('تحليل')) types.push('code');
    return types;
  };

  const getCookies = async () => {
    return new Promise((resolve) => {
      webViewRef.current?.injectJavaScript(`
        (function() {
          const cookies = document.cookie.split(';').map(c => c.trim());
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'cookiesResult',
            cookies: cookies
          }));
        })();
      `);
      // Handle the response
      resolve([]);
    });
  };

  const getPageSource = async () => {
    return new Promise((resolve) => {
      webViewRef.current?.injectJavaScript(`
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'sourceCode',
          code: document.documentElement.outerHTML
        }));
      `);
      resolve('');
    });
  };

  const executeCommands = async (commandTypes, context) => {
    // Logic to execute commands like opening new tabs, adding to favorites, etc.
  };

  return (
    // UI Implementation
  );
};

export default SmartChatAssistant;
```

### 2. **Smart Tab Manager** - إدارة ذكية للتبويبات

```javascript
// components/SmartTabManager.js
- تجميع التبويبات تلقائياً حسب المواضيع
- اقتراح إغلاق التبويبات غير المستخدمة
- حفظ جلسات التصفح
- استعادة التبويبات المغلقة بالخطأ
```

### 3. **AI-Powered Search** - بحث ذكي

```javascript
// components/SmartSearch.js
- بحث في المفضلة والتاريخ بالذكاء الاصطناعي
- اقتراحات ذكية أثناء الكتابة
- فهم اللغة الطبيعية ("أين كانت تلك المقالة عن React؟")
```

---

## 📁 هيكل الملفات الجديد

```
NIABrowser/
├── utils/
│   ├── SettingsManager.js          ✨ جديد - مدير الإعدادات المركزي
│   └── AIHelper.js                 ✨ جديد - مساعد AI موحد
├── components/
│   ├── UnifiedSettings.js          ✨ جديد - واجهة إعدادات موحدة
│   ├── SmartChatAssistant.js       ✨ جديد - مساعد الدردشة الذكي
│   ├── SmartTabManager.js          ✨ جديد - إدارة التبويبات الذكية
│   ├── SmartSearch.js              ✨ جديد - بحث ذكي
│   ├── WebViewContainer.js         🔄 تحديث - دعم أوامر AI
│   ├── ScriptManager.js            🔄 تحديث - استخدام SettingsManager
│   ├── AICookieInspector.js        🔄 تحديث - استخدام SettingsManager
│   ├── AICodeDebugger.js           🔄 تحديث - استخدام SettingsManager
│   └── AICommandInterface.js       🔄 تحديث - استخدام SettingsManager
└── App.js                          🔄 تحديث - دمج الميزات الجديدة
```

---

## 🎨 تحسينات التصميم

### 1. **Bottom Navigation الجديد**
```
┌─────────────────────────────────────┐
│  🏠    ←    →    🔄    💬    ⚙️    │
│ Home Back Forward Refresh Chat Settings │
└─────────────────────────────────────┘
```

### 2. **Chat Interface**
```
┌─────────────────────────────────────┐
│         🤖 مساعدك الذكي            │
├─────────────────────────────────────┤
│  💬 اطلب أي شيء:                    │
│  • "أعطني كوكيز هذا الموقع"        │
│  • "افتح youtube في تبويب جديد"    │
│  • "حلل كود هذه الصفحة"            │
│  • "أضف للمفضلة"                   │
└─────────────────────────────────────┘
```

---

## 🚀 خطوات التنفيذ بالترتيب

### الأسبوع 1: البنية التحتية
1. ✅ إنشاء `utils/SettingsManager.js`
2. ✅ إنشاء `utils/AIHelper.js`
3. ✅ تحديث جميع الملفات لاستخدام SettingsManager
4. ✅ اختبار توحيد المفتاح

### الأسبوع 2: الميزات الذكية الأساسية
1. ✅ إنشاء `UnifiedSettings.js`
2. ✅ إنشاء `SmartChatAssistant.js`
3. ✅ تطوير نظام الأوامر الصوتية
4. ✅ اختبار الدردشة مع AI

### الأسبوع 3: الميزات المتقدمة
1. ✅ إنشاء `SmartTabManager.js`
2. ✅ إنشاء `SmartSearch.js`
3. ✅ تحسين واجهة المستخدم
4. ✅ اختبار شامل

### الأسبوع 4: التحسين والإطلاق
1. ✅ تحسين الأداء
2. ✅ إضافة رسوم متحركة
3. ✅ تحسين تجربة المستخدم
4. ✅ الإطلاق التجريبي

---

## 📊 مؤشرات النجاح

- ✅ مفتاح API موحد في مكان واحد
- ✅ سرعة استجابة < 2 ثانية
- ✅ دقة الأوامر > 95%
- ✅ رضا المستخدمين > 4.5/5

---

## 🎯 الميزات المستقبلية (Phase 2)

1. **AI Autocomplete** - إكمال تلقائي ذكي للعناوين
2. **Smart Bookmarks** - تنظيم تلقائي للمفضلة
3. **Privacy Guard** - حماية ذكية للخصوصية
4. **Performance Booster** - تسريع تلقائي للصفحات
5. **Offline AI** - ذكاء اصطناعي محلي بدون إنترنت

---

## 💡 ملاحظات مهمة

- **الأمان أولاً**: جميع المفاتيح في `SecureStore`
- **الأداء**: تحميل lazy للميزات الثقيلة
- **التوافقية**: يعمل على Android & iOS
- **المرونة**: سهولة إضافة موديلات جديدة

---

**🔥 هذه خطة طموحة لكنها قابلة للتنفيذ. دعنا نبدأ بالمرحلة الأولى!**