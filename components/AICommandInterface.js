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
import { MaterialIcons } from '@expo/vector-icons';
import ModelSelector from './ui/ModelSelector';
import { SettingsManager } from '../utils/SettingsManager';
import { AIProviderManager } from '../utils/AIProviderManager';

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
  const [showModelSelector, setShowModelSelector] = useState(false);
  const scrollViewRef = useRef(null);

  const backgroundColor = isDarkMode ? '#1C1C1E' : '#F5F5F5';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';
  const inputBackground = isDarkMode ? '#3C3C3E' : '#F0F0F0';

  useEffect(() => {
    loadSelectedModel();
  }, []);

  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Welcome to AI DevTools!\n\nI can help you with:\n\n- Inspect Console and errors\n- Analyze Network requests\n- Inspect Cookies and storage\n- Debug code issues\n- Analyze performance\n- Write and execute JavaScript\n\nTry commands like:\n"Check for errors"\n"Analyze network requests"\n"Show cookies"\n"Write code to change background color"'
      }]);
    }
  }, [visible]);

  const loadSelectedModel = async () => {
    const model = await SettingsManager.getSelectedModel();
    setSelectedModel(model);
  };

  const quickCommands = [
    { id: 1, text: 'Check Errors', icon: 'bug-report', color: '#F44336' },
    { id: 2, text: 'Analyze Network', icon: 'language', color: '#2196F3' },
    { id: 3, text: 'Show Cookies', icon: 'cookie', color: '#FF9800' },
    { id: 4, text: 'Check Performance', icon: 'speed', color: '#4CAF50' },
  ];

  const executeAICommand = async () => {
    if (!command.trim()) return;

    const userMessage = { role: 'user', content: command };
    setMessages(prev => [...prev, userMessage]);
    setCommand('');
    setIsLoading(true);

    try {
      const apiKey = await SettingsManager.getApiKey();
      if (!apiKey) {
        throw new Error('API Key not found. Please add it in Settings.');
      }

      const context = buildContext();
      const activeProvider = await AIProviderManager.getActiveProvider();

      const response = await fetch(`${activeProvider?.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
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
              content: `You are an intelligent DevTools assistant for a mobile browser. Your tasks:
1. Analyze data (Console, Network, Cookies, Performance)
2. Write JavaScript code for page execution
3. Debug errors and solve problems
4. Provide suggestions and improvements

Current context:
- URL: ${currentUrl || 'None'}
- Console Logs: ${consoleLogs?.length || 0} entries
- Network Requests: ${networkLogs?.length || 0} requests
- Cookies: ${storageData?.cookies?.length || 0}
- Performance: ${performanceData ? 'Available' : 'Not available'}

${context}

When writing JavaScript code, write it cleanly without markdown backticks.
Use comments to explain the code.`
            },
            ...messages.filter(m => m.role !== 'system'),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      const aiResponse = data.choices[0].message.content;

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
        content: `Error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildContext = () => {
    let context = '\n\n--- Context Data ---\n';

    if (consoleLogs && consoleLogs.length > 0) {
      context += '\nRecent Console Logs:\n';
      consoleLogs.slice(-10).forEach((log, i) => {
        context += `${i + 1}. [${log.type}] ${log.message}\n`;
      });
    }

    if (networkLogs && networkLogs.length > 0) {
      context += '\nRecent Network Requests:\n';
      networkLogs.slice(-10).forEach((log, i) => {
        context += `${i + 1}. ${log.method || 'GET'} ${log.url} - ${log.status || 'pending'}\n`;
      });
    }

    if (storageData?.cookies) {
      context += `\nCookies Count: ${storageData.cookies.length}\n`;
    }

    if (performanceData) {
      context += '\nPerformance Metrics:\n';
      Object.entries(performanceData).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`;
      });
    }

    return context;
  };

  const executeCode = async (code) => {
    if (!webViewRef?.current) {
      alert('WebView not available');
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
              message: 'Code executed successfully'
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
        content: 'Code executed successfully',
        isSuccess: true
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Execution failed: ${error.message}`,
        isError: true
      }]);
    }
  };

  const handleModelSelect = async (modelId) => {
    setSelectedModel(modelId);
    await SettingsManager.setSelectedModel(modelId);
    setShowModelSelector(false);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';

    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          { backgroundColor: isUser ? '#007AFF' : cardBackground },
          isUser && styles.userMessage,
          isSystem && styles.systemMessage,
          msg.isError && styles.errorMessage,
          msg.isSuccess && styles.successMessage,
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.messageHeader}>
            <MaterialIcons name="psychology" size={16} color="#007AFF" />
            <Text style={[styles.messageRole, { color: '#007AFF' }]}>AI Assistant</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          { color: isUser || msg.isError || msg.isSuccess ? '#FFFFFF' : textColor },
        ]}>
          {msg.content}
        </Text>

        {msg.hasExecutableCode && msg.code && (
          <TouchableOpacity
            style={styles.executeButton}
            onPress={() => executeCode(msg.code)}
          >
            <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
            <Text style={styles.executeButtonText}>Execute Code</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="psychology" size={24} color="#007AFF" />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            AI DevTools
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Model Selector Toggle */}
      <TouchableOpacity
        style={[styles.modelToggle, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}
        onPress={() => setShowModelSelector(!showModelSelector)}
      >
        <View style={styles.modelToggleContent}>
          <MaterialIcons name="smart-toy" size={18} color={secondaryTextColor} />
          <Text style={[styles.modelToggleText, { color: textColor }]} numberOfLines={1}>
            {selectedModel.split('/').pop()}
          </Text>
        </View>
        <MaterialIcons
          name={showModelSelector ? 'expand-less' : 'expand-more'}
          size={20}
          color={secondaryTextColor}
        />
      </TouchableOpacity>

      {/* Model Selector Dropdown */}
      {showModelSelector && (
        <View style={[styles.modelSelectorContainer, { backgroundColor }]}>
          <ModelSelector
            selectedModelId={selectedModel}
            onModelSelect={handleModelSelect}
            isDarkMode={isDarkMode}
          />
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}

        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: cardBackground }]}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
              Thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Commands */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.quickCommands, { backgroundColor: cardBackground, borderTopColor: borderColor }]}
        contentContainerStyle={styles.quickCommandsContent}
      >
        {quickCommands.map(cmd => (
          <TouchableOpacity
            key={cmd.id}
            style={[styles.quickCommandButton, { backgroundColor: inputBackground }]}
            onPress={() => setCommand(cmd.text)}
          >
            <MaterialIcons name={cmd.icon} size={16} color={cmd.color} />
            <Text style={[styles.quickCommandText, { color: textColor }]}>
              {cmd.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: cardBackground, borderTopColor: borderColor }]}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
          value={command}
          onChangeText={setCommand}
          placeholder="Type your command... e.g., Check for errors, analyze network..."
          placeholderTextColor={secondaryTextColor}
          multiline
          maxHeight={100}
          onSubmitEditing={executeAICommand}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: command.trim() ? '#007AFF' : inputBackground },
          ]}
          onPress={executeAICommand}
          disabled={!command.trim() || isLoading}
        >
          <MaterialIcons
            name="send"
            size={22}
            color={command.trim() ? '#FFFFFF' : secondaryTextColor}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modelToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modelToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modelSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '90%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
  },
  errorMessage: {
    backgroundColor: '#F44336',
  },
  successMessage: {
    backgroundColor: '#4CAF50',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 14,
  },
  quickCommands: {
    borderTopWidth: 1,
    maxHeight: 56,
  },
  quickCommandsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  quickCommandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  quickCommandText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AICommandInterface;
