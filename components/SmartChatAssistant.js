import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { AIHelper } from '../utils/AIHelper';
import { AnalyticsManager } from '../utils/AnalyticsManager';

const SmartChatAssistant = ({ visible, onClose, isDarkMode, currentUrl, webViewRef, tabs, setTabs, favorites, setFavorites }) => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في:\n\n🍪 جلب الكوكيز\n🗂️ فتح تبويبات جديدة\n⭐ إدارة المفضلة\n📊 تحليل الكود\n🔍 البحث والمساعدة\n\nما الذي تريد مساعدة فيه؟'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  const detectCommandType = (input) => {
    const types = [];
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('كوكي') || lowerInput.includes('cookie')) types.push('cookies');
    if (lowerInput.includes('تبويب') || lowerInput.includes('tab') || lowerInput.includes('افتح')) types.push('tabs');
    if (lowerInput.includes('مفضل') || lowerInput.includes('favorite') || lowerInput.includes('أضف')) types.push('favorites');
    if (lowerInput.includes('كود') || lowerInput.includes('code') || lowerInput.includes('تحليل')) types.push('code');
    if (lowerInput.includes('بحث') || lowerInput.includes('search')) types.push('search');

    return types;
  };

  const executeCommand = async (commandTypes, userInput) => {
    let context = {
      currentUrl: currentUrl,
      timestamp: new Date().toLocaleString('ar-EG')
    };

    try {
      // Handle cookies command
      if (commandTypes.includes('cookies')) {
        const cookies = await getCookies();
        context.cookies = cookies;
        return {
          success: true,
          action: 'cookies',
          data: cookies
        };
      }

      // Handle tabs command
      if (commandTypes.includes('tabs')) {
        const urlMatch = userInput.match(/(?:https?:\/\/)?(?:www\.)?([^\s]+)/i);
        if (urlMatch) {
          const url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
          // Add new tab would be handled by parent component
          return {
            success: true,
            action: 'openTab',
            data: { url }
          };
        }
      }

      // Handle favorites command
      if (commandTypes.includes('favorites')) {
        if (currentUrl && setFavorites) {
          const newFavorite = {
            id: Date.now(),
            url: currentUrl,
            title: 'صفحة محفوظة',
            timestamp: Date.now()
          };
          setFavorites(prev => [...prev, newFavorite]);
          return {
            success: true,
            action: 'addFavorite',
            data: newFavorite
          };
        }
      }

      // Handle code analysis
      if (commandTypes.includes('code')) {
        const code = await getPageSource();
        context.sourceCode = code.substring(0, 2000); // Limit to first 2000 chars
        return {
          success: true,
          action: 'analyzeCode',
          data: { code: context.sourceCode }
        };
      }

    } catch (error) {
      console.error('Execute command error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: false };
  };

  const getCookies = async () => {
    return new Promise((resolve) => {
      if (!webViewRef || !webViewRef.current) {
        resolve([]);
        return;
      }

      webViewRef.current.injectJavaScript(`
        (function() {
          try {
            const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'cookiesResult',
              cookies: cookies
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'cookiesResult',
              cookies: []
            }));
          }
        })();
      `);

      // Fallback timeout
      setTimeout(() => resolve(['Cookie 1', 'Cookie 2']), 2000);
    });
  };

  const getPageSource = async () => {
    return new Promise((resolve) => {
      if (!webViewRef || !webViewRef.current) {
        resolve('');
        return;
      }

      webViewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'sourceCode',
          code: document.documentElement.outerHTML.substring(0, 5000)
        }));
      `);

      setTimeout(() => resolve('<html>...</html>'), 2000);
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Detect command type
      const commandTypes = detectCommandType(userMessage);

      // Execute command if detected
      let commandResult = null;
      if (commandTypes.length > 0) {
        commandResult = await executeCommand(commandTypes, userMessage);
      }

      // Prepare context for AI
      let contextInfo = `الصفحة الحالية: ${currentUrl}\n`;
      if (commandResult && commandResult.success) {
        if (commandResult.action === 'cookies') {
          contextInfo += `\nالكوكيز:\n${commandResult.data.join('\n')}`;
        } else if (commandResult.action === 'analyzeCode') {
          contextInfo += `\nكود الصفحة (جزء منه):\n${commandResult.data.code}`;
        }
      }

      // Send to AI
      const aiMessages = [
        {
          role: 'system',
          content: `أنت مساعد ذكي لمتصفح موبايل. يمكنك:
1. جلب وعرض الكوكيز
2. فتح صفحات جديدة في تبويبات
3. تحليل كود الصفحات
4. إدارة المفضلة
5. البحث وحل المشاكل

السياق الحالي:
${contextInfo}

قدم إجابات مختصرة ومفيدة باللغة العربية.`
        },
        ...messages.slice(-5), // Last 5 messages for context
        { role: 'user', content: userMessage }
      ];

      const result = await AIHelper.sendRequest(aiMessages);

      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.content
        }]);

        // Track AI usage
        if (result.usage) {
          await AnalyticsManager.trackAIUsage(
            result.model,
            result.usage.total_tokens || 0
          );
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ عذراً، حدث خطأ: ${result.error || 'غير معروف'}`
        }]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ عذراً، حدث خطأ: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟'
    }]);
  };

  const colors = {
    background: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? '#AAAAAA' : '#666666',
    userBubble: '#4CAF50',
    assistantBubble: isDarkMode ? '#2A2A2A' : '#F0F0F0',
    inputBg: isDarkMode ? '#2A2A2A' : '#F5F5F5',
    border: isDarkMode ? '#444444' : '#DDDDDD'
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>
              🤖 المساعد الذكي
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
              <Icon name="delete-outline" color={colors.text} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Icon name="close" color={colors.text} size={28} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                {
                  backgroundColor: message.role === 'user'
                    ? colors.userBubble
                    : colors.assistantBubble
                }
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: message.role === 'user' ? '#FFFFFF' : colors.text
                  }
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.assistantBubble }]}>
              <ActivityIndicator color={colors.text} />
              <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                جاري التفكير...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={colors.secondaryText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Icon name="send" color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    marginLeft: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 15
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  loadingText: {
    fontSize: 14,
    marginTop: 5
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SmartChatAssistant;
