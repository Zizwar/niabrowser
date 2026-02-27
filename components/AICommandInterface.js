import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  BackHandler,
  StatusBar,
  Alert,
  Switch,
  Keyboard,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import ModelSelector from './ui/ModelSelector';
import { SettingsManager } from '../utils/SettingsManager';
import { AIProviderManager } from '../utils/AIProviderManager';
import { getCustomPrompt, PROMPT_KEYS } from '../config/prompts';

const CONVERSATIONS_KEY = 'ai_conversations';
const AI_SETTINGS_KEY = 'ai_chat_settings';

// Rough token estimation: ~4 chars per token
const estimateTokens = (text) => {
  if (!text) return 0;
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  return Math.ceil(str.length / 4);
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

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
  onExecuteCommand,
  pageCacheData,
  initialContext,
  tabs = [],
  activeTabIndex = 0,
  onSwitchTab,
  webViewRefs,
}) => {
  // Messages & State
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4.1-mini');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollViewRef = useRef(null);

  // Context attachments - what to send to AI
  const [attachments, setAttachments] = useState({
    cookies: false,
    cookiesPreview: false,
    localStorage: false,
    localStoragePreview: false,
    network: false,
    networkFull: false,
    console: false,
    performance: false,
    pageHTML: false,
    pageText: false,
    apiRequests: false,
  });

  // API collections for AI context
  const [apiCollections, setApiCollections] = useState([]);

  // Cache & Settings
  const [enableCache, setEnableCache] = useState(false);
  const [pageCache, setPageCache] = useState(null);
  const [pageCacheUrl, setPageCacheUrl] = useState(null);
  const [pageCacheMode, setPageCacheMode] = useState(null); // 'html' or 'text'

  // Conversation history
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Token tracking
  const [contextTokens, setContextTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  // Per-site attachment storage: { [tabId]: attachments }
  const tabAttachmentsRef = useRef({});

  // Keyboard handling - lift only the input bar on Android
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(keyboardHeight, { toValue: e.endCoordinates.height, duration: 200, useNativeDriver: false }).start();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardHeight, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Colors
  const backgroundColor = isDarkMode ? '#121212' : '#F5F5F5';
  const cardBackground = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const borderColor = isDarkMode ? '#2C2C2E' : '#E5E5E5';
  const inputBackground = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const chipBg = isDarkMode ? '#2C2C2E' : '#E8E8ED';
  const chipActiveBg = '#007AFF';

  let insets = { top: 0, bottom: 0 };
  try { insets = useSafeAreaInsets(); } catch {}

  // Android back button
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showHistory) { setShowHistory(false); return true; }
      if (showContextPanel) { setShowContextPanel(false); return true; }
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, onClose, showHistory, showContextPanel]);

  // Load settings & model
  useEffect(() => {
    loadSettings();
  }, []);

  // Privacy warning on first open
  const [hasShownPrivacyWarning, setHasShownPrivacyWarning] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem('ai_privacy_warning_shown').then(val => {
      if (!val) setHasShownPrivacyWarning(false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (visible && !hasShownPrivacyWarning) {
      Alert.alert(
        'Privacy Notice',
        'NIA AI can access browser data you choose to share (cookies, storage, network logs, page content). This data is sent to your configured AI provider.\n\nYou control what data is attached via the clip icon. No data is shared without your explicit action.\n\nBe careful with sensitive information.',
        [{ text: 'I Understand', onPress: () => {
          setHasShownPrivacyWarning(true);
          AsyncStorage.setItem('ai_privacy_warning_shown', 'true').catch(() => {});
        }}],
        { cancelable: false }
      );
    }
  }, [visible, hasShownPrivacyWarning]);

  // Welcome message
  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'NIA AI DevTools\n\nI have access to your browser\'s developer tools. Use the attachment panel (clip icon) to control what context I receive:\n\nAvailable tools:\n- Cookies & Storage data\n- Network requests (summaries or full bodies)\n- Console logs & errors\n- Performance metrics\n- Page content (HTML or text)\n\nI\'ll tell you what I need. You control what you share.',
      }]);
    }
  }, [visible]);

  // Load API collections when visible
  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem('apiCollections').then(saved => {
        if (saved) setApiCollections(JSON.parse(saved));
      }).catch(() => {});
    }
  }, [visible]);

  // Handle initialContext from DevTools AI buttons
  useEffect(() => {
    if (initialContext && visible) {
      const updated = { ...attachments, ...initialContext };
      setAttachments(updated);
      saveSettings(updated);
    }
  }, [initialContext, visible]);

  // Update page cache from WebView message
  useEffect(() => {
    if (pageCacheData) setPageCache(pageCacheData);
  }, [pageCacheData]);

  // Recalculate context tokens when attachments change
  useEffect(() => {
    const tokens = estimateContextTokens();
    setContextTokens(tokens);
  }, [attachments, consoleLogs, networkLogs, storageData, performanceData, pageCache, messages]);

  const loadSettings = async () => {
    try {
      const model = await SettingsManager.getSelectedModel();
      if (model) setSelectedModel(model);
      const settings = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.enableCache !== undefined) setEnableCache(parsed.enableCache);
        if (parsed.attachments) setAttachments(prev => ({ ...prev, ...parsed.attachments }));
        if (parsed.totalTokens) setTotalTokens(parsed.totalTokens);
      }
      await loadConversations();
    } catch (e) {
      console.error('Error loading AI settings:', e);
    }
  };

  const saveSettings = async (newAttachments, newCache) => {
    try {
      const attch = newAttachments || attachments;
      await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify({
        enableCache: newCache !== undefined ? newCache : enableCache,
        attachments: attch,
      }));
      // Keep per-tab attachment state in sync
      const currentTabId = tabs[activeTabIndex]?.id;
      if (currentTabId) {
        tabAttachmentsRef.current[currentTabId] = { ...attch };
      }
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  };

  // Conversation management
  const loadConversations = async () => {
    try {
      const saved = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      if (saved) setConversations(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  };

  const saveConversation = async (msgs, id) => {
    try {
      const convId = id || currentConversationId || Date.now().toString();
      if (!currentConversationId) setCurrentConversationId(convId);
      const title = msgs.find(m => m.role === 'user')?.content?.substring(0, 50) || 'New Chat';
      const updated = [
        { id: convId, title, messages: msgs, url: currentUrl, updatedAt: new Date().toISOString() },
        ...conversations.filter(c => c.id !== convId),
      ].slice(0, 30);
      setConversations(updated);
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save conversation:', e);
    }
  };

  const loadConversation = (conv) => {
    setMessages(conv.messages);
    setCurrentConversationId(conv.id);
    setShowHistory(false);
  };

  const deleteConversation = async (convId) => {
    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
    if (currentConversationId === convId) newChat();
  };

  const newChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  // Toggle attachment
  const toggleAttachment = (key) => {
    const updated = { ...attachments, [key]: !attachments[key] };
    setAttachments(updated);
    saveSettings(updated);
  };

  // Cache page content
  const cachePage = async (mode) => {
    const ref = webViewRef?.current || webViewRef;
    if (!ref || !ref.injectJavaScript) {
      Alert.alert('Error', 'WebView not available');
      return;
    }
    try {
      const js = mode === 'html'
        ? 'window.ReactNativeWebView.postMessage(JSON.stringify({type:"pageCache",mode:"html",content:document.documentElement.outerHTML.substring(0,50000)}));true;'
        : 'window.ReactNativeWebView.postMessage(JSON.stringify({type:"pageCache",mode:"text",content:document.body.innerText.substring(0,30000)}));true;';
      ref.injectJavaScript(js);
      setPageCacheUrl(currentUrl);
      setPageCacheMode(mode);
      Alert.alert('Cached', `Page ${mode === 'html' ? 'HTML' : 'text'} cached for AI context`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // Estimate context tokens based on active attachments
  const estimateContextTokens = () => {
    let total = 0;
    total += estimateTokens(buildSystemPrompt());

    if (attachments.cookies && storageData?.cookies) {
      total += estimateTokens(storageData.cookies);
    }
    if (attachments.cookiesPreview && storageData?.cookies) {
      total += estimateTokens(
        storageData.cookies.split(';').map(c => {
          const parts = c.trim().split('=');
          return parts[0] + '=' + (parts[1] || '').substring(0, 5) + '...';
        }).join('; ')
      );
    }
    if (attachments.localStorage && storageData?.localStorage) {
      total += estimateTokens(storageData.localStorage);
    }
    if (attachments.localStoragePreview && storageData?.localStorage) {
      try {
        const parsed = typeof storageData.localStorage === 'string'
          ? JSON.parse(storageData.localStorage) : storageData.localStorage;
        const preview = Object.entries(parsed || {}).map(([k, v]) => `${k}: ${String(v).substring(0, 20)}...`);
        total += estimateTokens(preview.join('\n'));
      } catch { total += 10; }
    }
    if (attachments.network && networkLogs) {
      total += estimateTokens(
        networkLogs.slice(-15).map(l => `${l.method||'GET'} ${l.url} ${l.status||'?'} ${l.duration||0}ms`).join('\n')
      );
    }
    if (attachments.networkFull && networkLogs) {
      total += networkLogs.slice(-5).reduce((sum, l) => {
        return sum + estimateTokens(l.url) + estimateTokens(l.requestHeaders)
          + estimateTokens(l.requestBody) + estimateTokens(l.responseBody);
      }, 0);
    }
    if (attachments.console && consoleLogs) {
      total += estimateTokens(consoleLogs.slice(-20).map(l => `[${l.type}] ${l.message}`).join('\n'));
    }
    if (attachments.performance && performanceData) {
      total += estimateTokens(JSON.stringify(performanceData));
    }
    if ((attachments.pageHTML || attachments.pageText) && pageCache) {
      total += estimateTokens(pageCache);
    }
    if (attachments.apiRequests && apiCollections.length > 0) {
      apiCollections.forEach(col => {
        col.items?.forEach(item => {
          total += estimateTokens(`${item.method} ${item.url}`) + estimateTokens(item.headers) + estimateTokens(item.body);
        });
      });
    }

    messages.forEach(m => { total += estimateTokens(m.content); });

    return total;
  };

  const buildSystemPrompt = () => {
    const cookieCount = storageData?.cookies ? storageData.cookies.split(';').filter(Boolean).length : 0;
    let lsCount = 0;
    try {
      const d = storageData?.localStorage;
      const p = typeof d === 'string' ? JSON.parse(d || '{}') : (d || {});
      lsCount = Object.keys(p).length;
    } catch (e) {
      console.error('Failed to parse localStorage for system prompt:', e);
    }

    return `You are NIA AI, an intelligent DevTools assistant built into a mobile browser.

Current page: ${currentUrl || 'No page open'}

Your capabilities:
1. Analyze browser data: cookies, localStorage, network requests, console logs, performance
2. Write JavaScript code to execute on the current page
3. Debug errors and suggest fixes
4. Analyze security, performance, and optimization

AVAILABLE CONTEXT (the user controls what data is attached):
- Cookies: ${attachments.cookies ? 'FULL DATA ATTACHED' : attachments.cookiesPreview ? 'PREVIEW ATTACHED (first 5 chars)' : 'NOT ATTACHED - ask user to enable if needed'}
- LocalStorage: ${attachments.localStorage ? 'FULL DATA ATTACHED' : attachments.localStoragePreview ? 'PREVIEW ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Network: ${attachments.networkFull ? 'FULL DETAILS ATTACHED (with bodies)' : attachments.network ? 'SUMMARIES ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Console: ${attachments.console ? 'LOGS ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Performance: ${attachments.performance ? 'METRICS ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Page content: ${attachments.pageHTML ? 'HTML CACHED & ATTACHED' : attachments.pageText ? 'TEXT CACHED & ATTACHED' : 'NOT CACHED - user can cache via clip icon panel'}
- API Requests: ${attachments.apiRequests ? `ATTACHED (${apiCollections.reduce((n, c) => n + (c.items?.length || 0), 0)} requests)` : 'NOT ATTACHED'}

PAGE STATE SUMMARY:
- Console entries: ${consoleLogs?.length || 0}
- Network requests: ${networkLogs?.length || 0}
- Cookies: ${cookieCount}
- LocalStorage keys: ${lsCount}

IMPORTANT RULES:
- If you need data the user hasn't attached, politely ask them to enable it via the clip icon (attachment panel)
- When returning data, properly serialize objects - never show [object Object]
- Wrap executable JavaScript in \`\`\`javascript code blocks
- Be concise and practical`;
  };

  const buildContextData = () => {
    let context = '';

    if (attachments.cookies && storageData?.cookies) {
      context += '\n\n--- COOKIES (FULL) ---\n' + storageData.cookies;
    }
    if (attachments.cookiesPreview && storageData?.cookies) {
      const preview = storageData.cookies.split(';').map(c => {
        const parts = c.trim().split('=');
        return parts[0] + '=' + (parts[1] || '').substring(0, 5) + '...';
      }).join('; ');
      context += '\n\n--- COOKIES (PREVIEW) ---\n' + preview;
    }

    if (attachments.localStorage && storageData?.localStorage) {
      const data = typeof storageData.localStorage === 'string'
        ? storageData.localStorage
        : JSON.stringify(storageData.localStorage, null, 2);
      context += '\n\n--- LOCAL STORAGE (FULL) ---\n' + data;
    }
    if (attachments.localStoragePreview && storageData?.localStorage) {
      try {
        const parsed = typeof storageData.localStorage === 'string'
          ? JSON.parse(storageData.localStorage) : storageData.localStorage;
        const preview = Object.entries(parsed || {}).map(([k, v]) => {
          const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
          return `${k}: ${val.substring(0, 30)}${val.length > 30 ? '...' : ''}`;
        });
        context += '\n\n--- LOCAL STORAGE (PREVIEW) ---\n' + preview.join('\n');
      } catch (e) {
        console.error('Failed to parse localStorage for preview:', e);
      }
    }

    if (attachments.network && networkLogs) {
      context += '\n\n--- NETWORK REQUESTS ---\n';
      networkLogs.slice(-15).forEach((l, i) => {
        context += `${i + 1}. ${l.method || 'GET'} ${l.url} -> ${l.status || '?'} (${l.duration || 0}ms)\n`;
      });
    }
    if (attachments.networkFull && networkLogs) {
      context += '\n\n--- NETWORK REQUESTS (FULL DETAILS) ---\n';
      networkLogs.slice(-5).forEach((l, i) => {
        context += `\n--- Request ${i + 1} ---\n`;
        context += `${l.method || 'GET'} ${l.url} -> ${l.status || '?'}\n`;
        if (l.requestHeaders) {
          context += `Request Headers: ${typeof l.requestHeaders === 'object' ? JSON.stringify(l.requestHeaders, null, 2) : l.requestHeaders}\n`;
        }
        if (l.requestBody) {
          context += `Request Body: ${typeof l.requestBody === 'object' ? JSON.stringify(l.requestBody, null, 2) : l.requestBody}\n`;
        }
        if (l.responseBody) {
          const body = typeof l.responseBody === 'object' ? JSON.stringify(l.responseBody) : String(l.responseBody);
          context += `Response Body: ${body.substring(0, 2000)}${body.length > 2000 ? '...(truncated)' : ''}\n`;
        }
      });
    }

    if (attachments.console && consoleLogs) {
      context += '\n\n--- CONSOLE LOGS ---\n';
      consoleLogs.slice(-20).forEach((l, i) => {
        context += `${i + 1}. [${l.type}] ${l.message}\n`;
      });
    }

    if (attachments.performance && performanceData) {
      context += '\n\n--- PERFORMANCE METRICS ---\n';
      if (typeof performanceData === 'object') {
        Object.entries(performanceData).forEach(([k, v]) => {
          context += `${k}: ${v}\n`;
        });
      } else {
        context += String(performanceData);
      }
    }

    if ((attachments.pageHTML || attachments.pageText) && pageCache) {
      const label = attachments.pageHTML ? 'HTML' : 'TEXT';
      context += `\n\n--- PAGE CONTENT (${label}) ---\n${pageCache}`;
    }

    if (attachments.apiRequests && apiCollections.length > 0) {
      context += '\n\n--- API CLIENT REQUESTS ---\n';
      apiCollections.forEach(col => {
        context += `\nCollection: ${col.name}\n`;
        col.items?.forEach((item, i) => {
          context += `  ${i + 1}. ${item.method || 'GET'} ${item.url}\n`;
          if (item.headers) {
            try { context += `     Headers: ${item.headers}\n`; } catch {}
          }
          if (item.body) {
            context += `     Body: ${item.body.substring(0, 500)}${item.body.length > 500 ? '...' : ''}\n`;
          }
        });
      });
    }

    return context;
  };

  // Main send function
  const executeAICommand = async () => {
    if (!command.trim()) return;

    const userMessage = { role: 'user', content: command };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCommand('');
    setIsLoading(true);

    try {
      // Find the provider that owns the selected model (not just the "active" provider)
      const modelProvider = await AIProviderManager.getProviderForModel(selectedModel);
      const providerId = modelProvider?.id || 'openrouter';
      const apiKey = await AIProviderManager.getProviderApiKey(providerId) || await SettingsManager.getApiKey();
      if (!apiKey) throw new Error(`API Key not found for ${modelProvider?.name || 'provider'}. Add it in Settings.`);

      const customChatPrompt = await getCustomPrompt(PROMPT_KEYS.CHAT_SYSTEM);
      const systemPrompt = customChatPrompt || buildSystemPrompt();
      const contextData = buildContextData();
      const fullSystem = systemPrompt + (contextData ? '\n\n' + contextData : '');

      const chatMessages = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${modelProvider?.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(modelProvider?.extraHeaders || {}),
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: fullSystem },
              ...chatMessages,
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'API Error');

      const aiContent = data.choices[0].message.content;
      const usage = data.usage || {};

      const promptTokens = usage.prompt_tokens || estimateTokens(fullSystem + chatMessages.map(m => m.content).join(''));
      const completionTokens = usage.completion_tokens || estimateTokens(aiContent);
      setTotalTokens(prev => {
        const newTotal = prev + promptTokens + completionTokens;
        AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify({
          enableCache, attachments, totalTokens: newTotal,
        })).catch(() => {});
        return newTotal;
      });

      const codeMatch = aiContent.match(/```javascript\n([\s\S]*?)\n```/) ||
                        aiContent.match(/```js\n([\s\S]*?)\n```/);

      const assistantMessage = {
        role: 'assistant',
        content: aiContent,
        tokens: { prompt: promptTokens, completion: completionTokens },
        ...(codeMatch && { code: codeMatch[1], hasExecutableCode: true }),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveConversation(updatedMessages);

    } catch (error) {
      const errMsg = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async (code) => {
    const ref = webViewRef?.current || webViewRef;
    if (!ref || !ref.injectJavaScript) {
      Alert.alert('Error', 'WebView not available');
      return;
    }
    try {
      ref.injectJavaScript(`
        (function() {
          try {
            ${code}
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'aiCommandExecuted', success: true, message: 'Code executed'
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'aiCommandExecuted', success: false, error: error.message
            }));
          }
        })();
      `);
      setMessages(prev => [...prev, { role: 'system', content: 'Code executed successfully', isSuccess: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: `Execution failed: ${error.message}`, isError: true }]);
    }
  };

  const handleModelSelect = async (modelId) => {
    setSelectedModel(modelId);
    await SettingsManager.setSelectedModel(modelId);
    setShowModelSelector(false);
  };

  const copyMessage = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const quickCommands = [
    { text: 'Check Errors', icon: 'bug-report', color: '#F44336', attach: { console: true } },
    { text: 'Analyze Network', icon: 'language', color: '#2196F3', attach: { network: true } },
    { text: 'Show Cookies', icon: 'cookie', color: '#FF9800', attach: { cookies: true } },
    { text: 'Check Performance', icon: 'speed', color: '#4CAF50', attach: { performance: true } },
    { text: 'Analyze Page', icon: 'web', color: '#9C27B0', attach: { pageText: true } },
    { text: 'Security Audit', icon: 'security', color: '#E91E63', attach: { cookies: true, network: true } },
  ];

  const handleQuickCommand = (cmd) => {
    if (cmd.attach) {
      const updated = { ...attachments, ...cmd.attach };
      setAttachments(updated);
      saveSettings(updated);
    }
    setCommand(cmd.text);
  };

  // Context attachment panel
  const renderContextPanel = () => {
    const AttachChip = ({ label, icon, stateKey, color, size }) => {
      const active = attachments[stateKey];
      return (
        <TouchableOpacity
          style={[styles.attachChip, { backgroundColor: active ? (color || chipActiveBg) : chipBg }]}
          onPress={() => toggleAttachment(stateKey)}
        >
          <MaterialIcons name={icon} size={14} color={active ? '#FFF' : secondaryTextColor} />
          <Text style={[styles.attachChipText, { color: active ? '#FFF' : textColor }]}>{label}</Text>
          {size ? <Text style={[styles.attachChipSize, { color: active ? 'rgba(255,255,255,0.7)' : secondaryTextColor }]}>{size}</Text> : null}
        </TouchableOpacity>
      );
    };

    const cookieCount = storageData?.cookies ? storageData.cookies.split(';').filter(Boolean).length : 0;
    let lsCount = 0;
    let lsSize = '0 B';
    try {
      const d = storageData?.localStorage;
      const p = typeof d === 'string' ? JSON.parse(d || '{}') : (d || {});
      lsCount = Object.keys(p).length;
      const raw = typeof d === 'string' ? d : JSON.stringify(d);
      lsSize = formatBytes(raw?.length || 0);
    } catch (e) {
      console.error('Failed to parse localStorage for context panel:', e);
    }

    return (
      <ScrollView style={[styles.contextPanel, { backgroundColor: cardBackground, borderColor }]} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.contextPanelHeader}>
          <Text style={[styles.contextPanelTitle, { color: textColor }]}>Context Attachments</Text>
          <View style={styles.tokenBadge}>
            <MaterialIcons name="data-usage" size={12} color="#FF9500" />
            <Text style={styles.tokenBadgeText}>~{contextTokens.toLocaleString()} tokens</Text>
          </View>
        </View>

        <Text style={[styles.contextSectionLabel, { color: secondaryTextColor }]}>STORAGE</Text>
        <View style={styles.attachRow}>
          <AttachChip label={`Cookies (${cookieCount})`} icon="cookie" stateKey="cookies" color="#FF9800" />
          <AttachChip label="Cookies preview" icon="preview" stateKey="cookiesPreview" color="#FFB74D" />
        </View>
        <View style={styles.attachRow}>
          <AttachChip label={`Storage (${lsCount})`} icon="storage" stateKey="localStorage" color="#2196F3" size={lsSize} />
          <AttachChip label="Storage preview" icon="preview" stateKey="localStoragePreview" color="#64B5F6" />
        </View>

        <Text style={[styles.contextSectionLabel, { color: secondaryTextColor }]}>NETWORK & CONSOLE</Text>
        <View style={styles.attachRow}>
          <AttachChip label={`Network (${networkLogs?.length || 0})`} icon="language" stateKey="network" color="#4CAF50" />
          <AttachChip label="Full bodies" icon="data-object" stateKey="networkFull" color="#388E3C" />
        </View>
        <View style={styles.attachRow}>
          <AttachChip label={`Console (${consoleLogs?.length || 0})`} icon="terminal" stateKey="console" color="#F44336" />
          <AttachChip label="Performance" icon="speed" stateKey="performance" color="#9C27B0" />
        </View>

        <Text style={[styles.contextSectionLabel, { color: secondaryTextColor }]}>API CLIENT</Text>
        <View style={styles.attachRow}>
          <AttachChip
            label={`API Requests (${apiCollections.reduce((n, c) => n + (c.items?.length || 0), 0)})`}
            icon="http"
            stateKey="apiRequests"
            color="#009688"
          />
        </View>

        <Text style={[styles.contextSectionLabel, { color: secondaryTextColor }]}>PAGE CONTENT</Text>
        <View style={styles.attachRow}>
          <TouchableOpacity
            style={[styles.attachChip, { backgroundColor: attachments.pageHTML ? '#E91E63' : chipBg }]}
            onPress={() => {
              if (!pageCache || pageCacheUrl !== currentUrl || pageCacheMode !== 'html') cachePage('html');
              const upd = { ...attachments, pageHTML: !attachments.pageHTML, pageText: false };
              setAttachments(upd);
              saveSettings(upd);
            }}
          >
            <MaterialIcons name="code" size={14} color={attachments.pageHTML ? '#FFF' : secondaryTextColor} />
            <Text style={[styles.attachChipText, { color: attachments.pageHTML ? '#FFF' : textColor }]}>HTML</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.attachChip, { backgroundColor: attachments.pageText ? '#E91E63' : chipBg }]}
            onPress={() => {
              if (!pageCache || pageCacheUrl !== currentUrl || pageCacheMode !== 'text') cachePage('text');
              const upd = { ...attachments, pageText: !attachments.pageText, pageHTML: false };
              setAttachments(upd);
              saveSettings(upd);
            }}
          >
            <MaterialIcons name="article" size={14} color={attachments.pageText ? '#FFF' : secondaryTextColor} />
            <Text style={[styles.attachChipText, { color: attachments.pageText ? '#FFF' : textColor }]}>Text</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.cacheRow, { borderTopColor: borderColor }]}>
          <MaterialIcons name="cached" size={16} color={secondaryTextColor} />
          <Text style={[styles.cacheLabel, { color: textColor }]}>Auto-cache pages</Text>
          <Switch
            value={enableCache}
            onValueChange={(v) => { setEnableCache(v); saveSettings(undefined, v); }}
            trackColor={{ false: '#767577', true: '#007AFF' }}
          />
        </View>
        {pageCache && (
          <Text style={[styles.cacheInfo, { color: secondaryTextColor }]}>
            Cached: {pageCacheUrl?.substring(0, 40)}... ({formatBytes(pageCache.length)})
          </Text>
        )}

        <TouchableOpacity
          style={[styles.closeContextBtn, { backgroundColor: chipActiveBg }]}
          onPress={() => setShowContextPanel(false)}
        >
          <Text style={styles.closeContextBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Conversation history panel
  const renderHistory = () => (
    <View style={[styles.historyPanel, { backgroundColor }]}>
      <View style={[styles.historyHeader, { borderBottomColor: borderColor }]}>
        <Text style={[styles.historyTitle, { color: textColor }]}>Conversations</Text>
        <TouchableOpacity onPress={() => setShowHistory(false)}>
          <MaterialIcons name="close" size={22} color={textColor} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.newChatBtn, { backgroundColor: chipActiveBg }]} onPress={newChat}>
        <MaterialIcons name="add" size={18} color="#FFF" />
        <Text style={styles.newChatBtnText}>New Chat</Text>
      </TouchableOpacity>
      <ScrollView style={styles.historyList}>
        {conversations.length === 0 ? (
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>No conversations yet</Text>
        ) : (
          conversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              style={[
                styles.historyItem,
                { backgroundColor: conv.id === currentConversationId ? chipActiveBg + '20' : cardBackground, borderColor },
              ]}
              onPress={() => loadConversation(conv)}
            >
              <View style={styles.historyItemContent}>
                <Text style={[styles.historyItemTitle, { color: textColor }]} numberOfLines={1}>{conv.title}</Text>
                <Text style={[styles.historyItemMeta, { color: secondaryTextColor }]}>
                  {conv.messages.length} msgs - {new Date(conv.updatedAt).toLocaleDateString()}
                </Text>
                {conv.url && (
                  <Text style={[styles.historyItemUrl, { color: secondaryTextColor }]} numberOfLines={1}>{conv.url}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => deleteConversation(conv.id)} style={styles.historyDelete}>
                <MaterialIcons name="delete-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  // Parse message content into text and code blocks
  const parseMessageContent = (content) => {
    const parts = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || 'code', content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  // Render formatted content with code blocks
  const renderFormattedContent = (content, isLight) => {
    const parts = parseMessageContent(content);
    const baseTextColor = isLight ? '#FFFFFF' : textColor;

    return parts.map((part, i) => {
      if (part.type === 'code') {
        return (
          <View key={i} style={styles.codeBlock}>
            <View style={styles.codeBlockHeader}>
              <Text style={styles.codeBlockLang}>{part.language}</Text>
              <TouchableOpacity onPress={() => copyMessage(part.content)} style={styles.codeBlockCopy}>
                <MaterialIcons name="content-copy" size={13} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.codeBlockText} selectable>{part.content}</Text>
            </ScrollView>
          </View>
        );
      }
      // Render inline code with `backticks`
      const inlineCodeRegex = /`([^`]+)`/g;
      const textParts = [];
      let textLastIndex = 0;
      let inlineMatch;
      while ((inlineMatch = inlineCodeRegex.exec(part.content)) !== null) {
        if (inlineMatch.index > textLastIndex) {
          textParts.push({ type: 'text', content: part.content.slice(textLastIndex, inlineMatch.index) });
        }
        textParts.push({ type: 'inline', content: inlineMatch[1] });
        textLastIndex = inlineMatch.index + inlineMatch[0].length;
      }
      if (textLastIndex < part.content.length) {
        textParts.push({ type: 'text', content: part.content.slice(textLastIndex) });
      }

      if (textParts.some(p => p.type === 'inline')) {
        return (
          <Text key={i} style={[styles.messageText, { color: baseTextColor }]} selectable>
            {textParts.map((tp, j) =>
              tp.type === 'inline' ? (
                <Text key={j} style={[styles.inlineCode, !isLight && { backgroundColor: isDarkMode ? '#3C3C3E' : '#E8E8ED' }]}>{tp.content}</Text>
              ) : (
                <Text key={j}>{tp.content}</Text>
              )
            )}
          </Text>
        );
      }

      return (
        <Text key={i} style={[styles.messageText, { color: baseTextColor }]} selectable>
          {part.content}
        </Text>
      );
    });
  };

  // Render a single message
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
            <Text style={[styles.messageRole, { color: '#007AFF' }]}>NIA AI</Text>
            {msg.tokens && (
              <Text style={[styles.tokenInfo, { color: secondaryTextColor }]}>
                {msg.tokens.prompt + msg.tokens.completion} tok
              </Text>
            )}
            <TouchableOpacity onPress={() => copyMessage(msg.content)} style={styles.copyMsgBtn}>
              <MaterialIcons name="content-copy" size={14} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
        )}
        {renderFormattedContent(msg.content, isUser || msg.isError || msg.isSuccess)}

        {msg.hasExecutableCode && msg.code && (
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.executeButton} onPress={() => executeCode(msg.code)}>
              <MaterialIcons name="play-arrow" size={16} color="#FFFFFF" />
              <Text style={styles.executeButtonText}>Run</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.executeButton, { backgroundColor: '#607D8B' }]}
              onPress={() => copyMessage(msg.code)}
            >
              <MaterialIcons name="content-copy" size={16} color="#FFFFFF" />
              <Text style={styles.executeButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (!visible) return null;

  const statusBarHeight = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 24) : insets.top;
  const activeAttachCount = Object.values(attachments).filter(Boolean).length;

  const ContainerView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps = Platform.OS === 'ios'
    ? { behavior: 'padding', keyboardVerticalOffset: 0 }
    : {};

  return (
    <ContainerView
      style={[styles.container, { backgroundColor, paddingTop: statusBarHeight }]}
      {...containerProps}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="psychology" size={24} color="#007AFF" />
          <Text style={[styles.headerTitle, { color: textColor }]}>NIA AI</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerBtn}>
            <MaterialIcons name="history" size={22} color={secondaryTextColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={newChat} style={styles.headerBtn}>
            <MaterialIcons name="add-circle-outline" size={22} color={secondaryTextColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <MaterialIcons name="close" size={22} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Target URL selector */}
      {tabs.length > 0 && (
        <TouchableOpacity
          style={[styles.targetUrlBar, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}
          onPress={() => setShowTargetSelector(!showTargetSelector)}
        >
          <MaterialIcons name="language" size={16} color="#4CAF50" />
          <Text style={[styles.targetUrlText, { color: textColor }]} numberOfLines={1}>
            {currentUrl || 'No page open'}
          </Text>
          {tabs.length > 1 && (
            <MaterialIcons name={showTargetSelector ? 'expand-less' : 'expand-more'} size={16} color={secondaryTextColor} />
          )}
        </TouchableOpacity>
      )}
      {showTargetSelector && tabs.length > 1 && (
        <View style={[styles.targetSelectorList, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.targetSelectorItem,
                { borderBottomColor: borderColor },
                index === activeTabIndex && { backgroundColor: '#007AFF15' },
              ]}
              onPress={() => {
                // Save current tab's attachments
                const currentTabId = tabs[activeTabIndex]?.id;
                if (currentTabId) {
                  tabAttachmentsRef.current[currentTabId] = { ...attachments };
                }
                // Restore target tab's attachments (or defaults)
                const targetTabId = tabs[index]?.id;
                if (targetTabId && tabAttachmentsRef.current[targetTabId]) {
                  const restored = tabAttachmentsRef.current[targetTabId];
                  setAttachments(restored);
                  saveSettings(restored);
                }
                if (onSwitchTab) onSwitchTab(index);
                setShowTargetSelector(false);
              }}
            >
              <View style={[styles.targetDot, index === activeTabIndex && { backgroundColor: '#007AFF' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.targetTabTitle, { color: textColor }]} numberOfLines={1}>
                  {tab.title || 'New Tab'}
                </Text>
                <Text style={[styles.targetTabUrl, { color: secondaryTextColor }]} numberOfLines={1}>
                  {tab.url || 'about:blank'}
                </Text>
              </View>
              {index === activeTabIndex && (
                <MaterialIcons name="check" size={18} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Model + Token info bar */}
      <View style={[styles.infoBar, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.modelBtn} onPress={() => setShowModelSelector(!showModelSelector)}>
          <MaterialIcons name="smart-toy" size={16} color={secondaryTextColor} />
          <Text style={[styles.modelBtnText, { color: textColor }]} numberOfLines={1}>
            {selectedModel.split('/').pop()}
          </Text>
          <MaterialIcons name={showModelSelector ? 'expand-less' : 'expand-more'} size={16} color={secondaryTextColor} />
        </TouchableOpacity>
        <View style={styles.tokenBar}>
          <MaterialIcons name="data-usage" size={14} color="#FF9500" />
          <Text style={[styles.tokenBarText, { color: secondaryTextColor }]}>
            ctx:~{contextTokens.toLocaleString()} | total:~{totalTokens.toLocaleString()}
          </Text>
        </View>
      </View>

      {showModelSelector && (
        <View style={[styles.modelSelectorContainer, { backgroundColor }]}>
          <ModelSelector selectedModelId={selectedModel} onModelSelect={handleModelSelect} isDarkMode={isDarkMode} />
        </View>
      )}

      {/* History overlay */}
      {showHistory && renderHistory()}

      {/* Context panel overlay */}
      {showContextPanel && renderContextPanel()}

      {/* Messages + Input */}
      {!showHistory && !showContextPanel && (
        <>
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
                <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick commands */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.quickCommands, { borderTopColor: borderColor }]}
            contentContainerStyle={styles.quickCommandsContent}
          >
            {quickCommands.map((cmd, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickCommandButton, { backgroundColor: chipBg }]}
                onPress={() => handleQuickCommand(cmd)}
              >
                <MaterialIcons name={cmd.icon} size={14} color={cmd.color} />
                <Text style={[styles.quickCommandText, { color: textColor }]}>{cmd.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input area */}
          <View style={[styles.inputContainer, { backgroundColor: cardBackground, borderTopColor: borderColor }]}>
            <TouchableOpacity
              style={[styles.attachBtn, activeAttachCount > 0 && styles.attachBtnActive]}
              onPress={() => setShowContextPanel(!showContextPanel)}
            >
              <MaterialIcons name="attach-file" size={20} color={activeAttachCount > 0 ? '#007AFF' : secondaryTextColor} />
              {activeAttachCount > 0 && (
                <View style={styles.attachBadge}>
                  <Text style={styles.attachBadgeText}>{activeAttachCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
              value={command}
              onChangeText={setCommand}
              placeholder="Ask AI about this page..."
              placeholderTextColor={secondaryTextColor}
              multiline
              numberOfLines={1}
              maxHeight={80}
              blurOnSubmit={false}
              onSubmitEditing={executeAICommand}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: command.trim() ? '#007AFF' : inputBackground }]}
              onPress={executeAICommand}
              disabled={!command.trim() || isLoading}
            >
              <MaterialIcons name="send" size={20} color={command.trim() ? '#FFFFFF' : secondaryTextColor} />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'android' && <Animated.View style={{ height: keyboardHeight }} />}
        </>
      )}
    </ContainerView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 4 },
  targetUrlBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1,
  },
  targetUrlText: { fontSize: 12, flex: 1 },
  targetSelectorList: { borderBottomWidth: 1, maxHeight: 200 },
  targetSelectorItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  targetDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8E8E93' },
  targetTabTitle: { fontSize: 13, fontWeight: '500' },
  targetTabUrl: { fontSize: 11, marginTop: 1 },
  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1,
  },
  modelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  modelBtnText: { fontSize: 13, fontWeight: '500', maxWidth: 140 },
  tokenBar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tokenBarText: { fontSize: 11, fontFamily: 'monospace' },
  modelSelectorContainer: { paddingHorizontal: 16, paddingVertical: 8, zIndex: 1000 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 20 },
  messageContainer: { marginBottom: 12, padding: 12, borderRadius: 14, maxWidth: '90%' },
  userMessage: { alignSelf: 'flex-end' },
  systemMessage: { alignSelf: 'center', backgroundColor: '#E5E5E5' },
  errorMessage: { backgroundColor: '#F44336' },
  successMessage: { backgroundColor: '#4CAF50' },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  messageRole: { fontSize: 12, fontWeight: '600', flex: 1 },
  tokenInfo: { fontSize: 10, fontFamily: 'monospace' },
  copyMsgBtn: { padding: 2 },
  messageText: { fontSize: 14, lineHeight: 21 },
  codeBlock: {
    backgroundColor: '#1E1E2E', borderRadius: 10, marginVertical: 6, overflow: 'hidden',
  },
  codeBlockHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2A2A3A',
  },
  codeBlockLang: { fontSize: 11, color: '#A0A0A0', fontWeight: '600', textTransform: 'uppercase' },
  codeBlockCopy: { padding: 2 },
  codeBlockText: {
    fontFamily: 'monospace', fontSize: 13, lineHeight: 20, color: '#E0E0E0',
    padding: 12,
  },
  inlineCode: {
    fontFamily: 'monospace', fontSize: 13, backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: 4, paddingHorizontal: 4,
  },
  codeActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  executeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, gap: 4,
  },
  executeButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  loadingContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, alignSelf: 'flex-start',
  },
  loadingText: { fontSize: 14 },
  quickCommands: { maxHeight: 50 },
  quickCommandsContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  quickCommandButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4,
  },
  quickCommandText: { fontSize: 12, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, borderTopWidth: 1, gap: 6,
  },
  attachBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  attachBtnActive: { backgroundColor: 'rgba(0,122,255,0.1)' },
  attachBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#007AFF', borderRadius: 8,
    width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  attachBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  input: {
    flex: 1, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, fontSize: 14, minHeight: 36, maxHeight: 100,
  },
  sendButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  contextPanel: { flex: 1, padding: 16, borderTopWidth: 1 },
  contextPanelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  contextPanelTitle: { fontSize: 16, fontWeight: '700' },
  tokenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,149,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  tokenBadgeText: { color: '#FF9500', fontSize: 12, fontWeight: '600' },
  contextSectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 12, marginBottom: 6 },
  attachRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  attachChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16,
  },
  attachChipText: { fontSize: 12, fontWeight: '500' },
  attachChipSize: { fontSize: 10 },
  cacheRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, paddingTop: 14, borderTopWidth: 1,
  },
  cacheLabel: { flex: 1, fontSize: 14 },
  cacheInfo: { fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  closeContextBtn: {
    marginTop: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  closeContextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  historyPanel: { flex: 1 },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  historyTitle: { fontSize: 16, fontWeight: '700' },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 16, marginBottom: 8, paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  newChatBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  historyList: { flex: 1, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 14 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8,
  },
  historyItemContent: { flex: 1 },
  historyItemTitle: { fontSize: 14, fontWeight: '600' },
  historyItemMeta: { fontSize: 11, marginTop: 2 },
  historyItemUrl: { fontSize: 10, marginTop: 2 },
  historyDelete: { padding: 4 },
});

export default AICommandInterface;
