import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const AICommandInterface = ({
  visible,
  onClose,
  isDarkMode,
  currentUrl,
  consoleLogs,
  networkLogs,
  storageData,
  performanceData,
  webViewRef,
  onExecuteCommand
}) => {
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const scrollViewRef = useRef(null);

  const models = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', icon: '🧠' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', icon: '🤖' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', icon: '✨' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', icon: '🔍' },
  ];

  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '🚀 مرحباً! أنا مساعدك الذكي في DevTools.\n\nيمكنني مساعدتك في:\n• فحص Console والأخطاء\n• تحليل طلبات Network\n• فحص Cookies والتخزين\n• تصحيح الأكواد\n• تحليل الأداء\n• كتابة وتنفيذ أكواد JavaScript\n\nجرب أمر مثل:\n"افحص الأخطاء في الكونسول"\n"حلل طلبات الشبكة"\n"اعرض الكوكيز"\n"اكتب كود لتغيير لون الخلفية"'
      }]);
    }
  }, [visible]);

  const executeAICommand = async () => {
    if (!command.trim()) return;

    const userMessage = { role: 'user', content: command };
    setMessages(prev => [...prev, userMessage]);
    setCommand('');
    setIsLoading(true);

    try {
      const apiKey = await SecureStore.getItemAsync('openRouterApiKey');
      if (!apiKey) {
        throw new Error('API Key غير موجود. يرجى إضافته من الإعدادات.');
      }

      // جمع البيانات الحالية للسياق
      const context = buildContext();

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser DevTools AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت مساعد ذكي في DevTools لمتصفح موبايل. مهمتك:
1. تحليل البيانات (Console, Network, Cookies, Performance)
2. كتابة أكواد JavaScript للتنفيذ في الصفحة
3. تصحيح الأخطاء وحل المشاكل
4. تقديم اقتراحات وتحسينات

السياق الحالي:
- URL: ${currentUrl || 'لا يوجد'}
- Console Logs: ${consoleLogs?.length || 0} سجل
- Network Requests: ${networkLogs?.length || 0} طلب
- Cookies: ${storageData?.cookies?.length || 0}
- Performance: ${performanceData ? 'متوفر' : 'غير متوفر'}

${context}

عند كتابة كود JavaScript، اكتبه بصيغة نظيفة بدون markdown backticks.
استخدم تعليقات عربية في الكود للشرح.`
            },
            ...messages,
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'حدث خطأ في API');
      }

      const aiResponse = data.choices[0].message.content;

      // فحص إذا كان الرد يحتوي على كود قابل للتنفيذ
      const codeMatch = aiResponse.match(/```javascript\n([\s\S]*?)\n```/) ||
                        aiResponse.match(/```js\n([\s\S]*?)\n```/);

      let assistantMessage = {
        role: 'assistant',
        content: aiResponse,
      };

      if (codeMatch) {
        assistantMessage.code = codeMatch[1];
        assistantMessage.hasExecutableCode = true;
      }

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ خطأ: ${error.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildContext = () => {
    let context = '\n\n--- بيانات السياق ---\n';

    // Console Logs
    if (consoleLogs && consoleLogs.length > 0) {
      context += '\n📋 آخر سجلات Console:\n';
      consoleLogs.slice(-10).forEach((log, i) => {
        context += `${i + 1}. [${log.type}] ${log.message}\n`;
      });
    }

    // Network Logs
    if (networkLogs && networkLogs.length > 0) {
      context += '\n🌐 آخر طلبات Network:\n';
      networkLogs.slice(-10).forEach((log, i) => {
        context += `${i + 1}. ${log.method || 'GET'} ${log.url} - ${log.status || 'pending'}\n`;
      });
    }

    // Storage/Cookies
    if (storageData?.cookies) {
      context += `\n🍪 عدد Cookies: ${storageData.cookies.length}\n`;
    }

    // Performance
    if (performanceData) {
      context += '\n⚡ Performance Metrics:\n';
      Object.entries(performanceData).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`;
      });
    }

    return context;
  };

  const executeCode = async (code) => {
    if (!webViewRef?.current) {
      alert('WebView غير متاح');
      return;
    }

    try {
      await webViewRef.current.injectJavaScript(`
        (function() {
          try {
            ${code}
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'aiCommandExecuted',
              success: true,
              message: 'تم تنفيذ الكود بنجاح'
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'aiCommandExecuted',
              success: false,
              error: error.message
            }));
          }
        })();
      `);

      setMessages(prev => [...prev, {
        role: 'system',
        content: '✅ تم تنفيذ الكود في الصفحة',
        isSuccess: true
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ فشل تنفيذ الكود: ${error.message}`,
        isError: true
      }]);
    }
  };

  const quickCommands = [
    { id: 1, text: 'افحص الأخطاء', icon: '🐛' },
    { id: 2, text: 'حلل الشبكة', icon: '🌐' },
    { id: 3, text: 'اعرض الكوكيز', icon: '🍪' },
    { id: 4, text: 'حلل الأداء', icon: '⚡' },
  ];

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';

    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser && styles.userMessage,
          isSystem && styles.systemMessage,
          msg.isError && styles.errorMessage,
          msg.isSuccess && styles.successMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          isDarkMode && styles.messageTextDark,
          isUser && styles.userMessageText,
        ]}>
          {msg.content}
        </Text>

        {msg.hasExecutableCode && msg.code && (
          <TouchableOpacity
            style={styles.executeButton}
            onPress={() => executeCode(msg.code)}
          >
            <Icon name="play-arrow" type="material" size={18} color="#fff" />
            <Text style={styles.executeButtonText}>تنفيذ الكود</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <Icon name="psychology" type="material" size={24} color="#007AFF" />
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            AI DevTools
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" type="material" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      {/* Model Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modelSelector}
      >
        {models.map(model => (
          <TouchableOpacity
            key={model.id}
            style={[
              styles.modelChip,
              selectedModel === model.id && styles.modelChipSelected,
              isDarkMode && styles.modelChipDark,
            ]}
            onPress={() => setSelectedModel(model.id)}
          >
            <Text style={styles.modelIcon}>{model.icon}</Text>
            <Text style={[
              styles.modelName,
              selectedModel === model.id && styles.modelNameSelected,
              isDarkMode && styles.modelNameDark,
            ]}>
              {model.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
              جاري التفكير...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Commands */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.quickCommands, isDarkMode && styles.quickCommandsDark]}
      >
        {quickCommands.map(cmd => (
          <TouchableOpacity
            key={cmd.id}
            style={[styles.quickCommandButton, isDarkMode && styles.quickCommandButtonDark]}
            onPress={() => setCommand(cmd.text)}
          >
            <Text style={styles.quickCommandIcon}>{cmd.icon}</Text>
            <Text style={[styles.quickCommandText, isDarkMode && styles.quickCommandTextDark]}>
              {cmd.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          value={command}
          onChangeText={setCommand}
          placeholder="اكتب أمرك هنا... مثل: افحص الأخطاء، حلل الشبكة، اكتب كود..."
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          multiline
          maxHeight={100}
          onSubmitEditing={executeAICommand}
        />
        <TouchableOpacity
          style={[styles.sendButton, !command.trim() && styles.sendButtonDisabled]}
          onPress={executeAICommand}
          disabled={!command.trim() || isLoading}
        >
          <Icon
            name="send"
            type="material"
            size={22}
            color={command.trim() ? '#007AFF' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerDark: {
    backgroundColor: '#2C2C2E',
    borderBottomColor: '#3C3C3E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  modelSelector: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 10,
    gap: 5,
  },
  modelChipDark: {
    backgroundColor: '#3C3C3E',
  },
  modelChipSelected: {
    backgroundColor: '#007AFF',
  },
  modelIcon: {
    fontSize: 16,
  },
  modelName: {
    fontSize: 13,
    color: '#333',
  },
  modelNameDark: {
    color: '#E5E5E5',
  },
  modelNameSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
  },
  errorMessage: {
    backgroundColor: '#FF3B30',
  },
  successMessage: {
    backgroundColor: '#34C759',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
  },
  messageTextDark: {
    color: '#E5E5E5',
  },
  userMessageText: {
    color: '#fff',
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 5,
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  loadingTextDark: {
    color: '#999',
  },
  quickCommands: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  quickCommandsDark: {
    backgroundColor: '#2C2C2E',
    borderTopColor: '#3C3C3E',
  },
  quickCommandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
    gap: 5,
  },
  quickCommandButtonDark: {
    backgroundColor: '#3C3C3E',
  },
  quickCommandIcon: {
    fontSize: 14,
  },
  quickCommandText: {
    fontSize: 13,
    color: '#333',
  },
  quickCommandTextDark: {
    color: '#E5E5E5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 10,
  },
  inputContainerDark: {
    backgroundColor: '#2C2C2E',
    borderTopColor: '#3C3C3E',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    minHeight: 40,
  },
  inputDark: {
    backgroundColor: '#3C3C3E',
    color: '#fff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default AICommandInterface;
