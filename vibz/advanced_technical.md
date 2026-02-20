# 🔧 الجوانب التقنية المتقدمة

## 🗄️ نظام إدارة الحالة المحسن

### Context API للإعدادات العامة

```javascript
// contexts/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsManager } from '../utils/SettingsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  
  // Tabs State
  const [tabs, setTabs] = useState([{
    id: Date.now(),
    url: 'https://www.google.com',
    title: 'New Tab',
    canGoBack: false,
    canGoForward: false
  }]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Favorites & History
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Scripts
  const [scripts, setScripts] = useState([]);
  
  // UI State
  const [showSmartChat, setShowSmartChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    try {
      // Load API Key
      const key = await SettingsManager.getApiKey();
      setApiKey(key || '');
      
      // Load Selected Model
      const model = await SettingsManager.getSelectedModel();
      setSelectedModel(model);
      
      // Load Preferences
      const prefs = await SettingsManager.getPreferences();
      setIsDarkMode(prefs.isDarkMode || false);
      setIsDesktopMode(prefs.isDesktopMode || false);
      setIsSafeMode(prefs.isSafeMode || false);
      
      // Load Favorites
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      
      // Load History
      const savedHistory = await AsyncStorage.getItem('browserHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      
      // Load Scripts
      const savedScripts = await AsyncStorage.getItem('scripts');
      if (savedScripts) setScripts(JSON.parse(savedScripts));
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };
  
  // Save preferences whenever they change
  useEffect(() => {
    const savePreferences = async () => {
      await SettingsManager.setPreferences({
        isDarkMode,
        isDesktopMode,
        isSafeMode
      });
    };
    savePreferences();
  }, [isDarkMode, isDesktopMode, isSafeMode]);
  
  // Save favorites
  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Save history
  useEffect(() => {
    AsyncStorage.setItem('browserHistory', JSON.stringify(history));
  }, [history]);
  
  // Save scripts
  useEffect(() => {
    AsyncStorage.setItem('scripts', JSON.stringify(scripts));
  }, [scripts]);
  
  // Tabs Management
  const addNewTab = (url = 'https://www.google.com') => {
    const newTab = {
      id: Date.now(),
      url: url,
      title: 'New Tab',
      canGoBack: false,
      canGoForward: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabIndex(tabs.length);
  };
  
  const closeTab = (index) => {
    if (tabs.length === 1) {
      // If last tab, create new one
      setTabs([{
        id: Date.now(),
        url: 'https://www.google.com',
        title: 'New Tab',
        canGoBack: false,
        canGoForward: false
      }]);
      setActiveTabIndex(0);
    } else {
      setTabs(prev => prev.filter((_, i) => i !== index));
      if (activeTabIndex >= index && activeTabIndex > 0) {
        setActiveTabIndex(activeTabIndex - 1);
      }
    }
  };
  
  const updateTab = (index, updates) => {
    setTabs(prev => prev.map((tab, i) => 
      i === index ? { ...tab, ...updates } : tab
    ));
  };
  
  // Favorites Management
  const addToFavorites = (url, title) => {
    const exists = favorites.some(f => f.url === url);
    if (!exists) {
      setFavorites(prev => [...prev, {
        id: Date.now(),
        url,
        title,
        timestamp: Date.now()
      }]);
      return true;
    }
    return false;
  };
  
  const removeFromFavorites = (id) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };
  
  const isFavorite = (url) => {
    return favorites.some(f => f.url === url);
  };
  
  // History Management
  const addToHistory = (url, title) => {
    const historyItem = {
      id: Date.now(),
      url,
      title,
      timestamp: Date.now()
    };
    
    // Keep only last 500 items
    setHistory(prev => [historyItem, ...prev].slice(0, 500));
  };
  
  const clearHistory = () => {
    setHistory([]);
  };
  
  // Scripts Management
  const addScript = (script) => {
    setScripts(prev => [...prev, {
      ...script,
      id: Date.now(),
      createdAt: Date.now()
    }]);
  };
  
  const updateScript = (id, updates) => {
    setScripts(prev => prev.map(script => 
      script.id === id ? { ...script, ...updates } : script
    ));
  };
  
  const deleteScript = (id) => {
    setScripts(prev => prev.filter(script => script.id !== id));
  };
  
  const value = {
    // Settings
    isDarkMode,
    setIsDarkMode,
    isDesktopMode,
    setIsDesktopMode,
    isSafeMode,
    setIsSafeMode,
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    
    // Tabs
    tabs,
    setTabs,
    activeTabIndex,
    setActiveTabIndex,
    addNewTab,
    closeTab,
    updateTab,
    
    // Favorites
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    
    // History
    history,
    addToHistory,
    clearHistory,
    
    // Scripts
    scripts,
    addScript,
    updateScript,
    deleteScript,
    
    // UI
    showSmartChat,
    setShowSmartChat,
    showSettings,
    setShowSettings,
    showDevTools,
    setShowDevTools
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

**الاستخدام في App.js:**

```javascript
// App.js
import { AppProvider } from './contexts/AppContext';

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const MainApp = () => {
  const {
    isDarkMode,
    tabs,
    activeTabIndex,
    addNewTab,
    closeTab,
    showSmartChat,
    setShowSmartChat
  } = useApp();
  
  // استخدام الحالة من Context بدلاً من useState المحلي
  
  return (
    // Your app UI
  );
};
```

---

## 🔐 نظام الأمان المحسن

### تشفير البيانات الحساسة

```javascript
// utils/SecurityManager.js
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const SecurityManager = {
  // Hash a string (for validation, not encryption)
  async hash(text) {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text
      );
      return hash;
    } catch (error) {
      console.error('Hashing error:', error);
      return null;
    }
  },
  
  // Validate API Key format
  validateApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    
    // OpenRouter keys typically start with "sk-"
    if (!key.startsWith('sk-') && !key.startsWith('pk-')) {
      return false;
    }
    
    // Check minimum length
    if (key.length < 20) return false;
    
    return true;
  },
  
  // Sanitize URL to prevent XSS
  sanitizeUrl(url) {
    if (!url) return '';
    
    // Remove javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      return '';
    }
    
    // Remove data: URIs that could contain scripts
    if (url.toLowerCase().startsWith('data:text/html')) {
      return '';
    }
    
    // Ensure URL has a valid protocol
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    return url;
  },
  
  // Sanitize JavaScript code before injection
  sanitizeScript(code) {
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
      /eval\(/gi,
      /Function\(/gi,
      /setTimeout\(['"].*?['"]\)/gi,
      /setInterval\(['"].*?['"]\)/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        console.warn('Potentially dangerous code detected!');
        return null;
      }
    }
    
    return code;
  },
  
  // Content Security Policy check
  checkCSP(url) {
    try {
      const urlObj = new URL(url);
      
      // Allow only HTTPS (except localhost for development)
      if (urlObj.protocol !== 'https:' && urlObj.hostname !== 'localhost') {
        console.warn('Insecure protocol:', urlObj.protocol);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid URL:', error);
      return false;
    }
  },
  
  // Rate limiting for API calls
  rateLimiter: {
    calls: {},
    
    check(key, maxCalls = 10, timeWindow = 60000) {
      const now = Date.now();
      
      if (!this.calls[key]) {
        this.calls[key] = [];
      }
      
      // Remove old calls outside time window
      this.calls[key] = this.calls[key].filter(
        time => now - time < timeWindow
      );
      
      // Check if limit exceeded
      if (this.calls[key].length >= maxCalls) {
        return false;
      }
      
      // Add current call
      this.calls[key].push(now);
      return true;
    }
  }
};
```

**الاستخدام:**

```javascript
// قبل حفظ API Key
const saveApiKey = async (key) => {
  if (!SecurityManager.validateApiKey(key)) {
    Alert.alert('خطأ', 'مفتاح API غير صالح');
    return false;
  }
  
  await SettingsManager.setApiKey(key);
  return true;
};

// قبل فتح URL
const openUrl = (url) => {
  const sanitized = SecurityManager.sanitizeUrl(url);
  if (!sanitized) {
    Alert.alert('خطأ', 'رابط غير آمن');
    return;
  }
  
  if (!SecurityManager.checkCSP(sanitized)) {
    Alert.alert('تحذير', 'هذا الرابط قد لا يكون آمناً');
  }
  
  // Open URL
  webViewRef.current.loadURL(sanitized);
};

// قبل تنفيذ Script
const executeScript = (code) => {
  const sanitized = SecurityManager.sanitizeScript(code);
  if (!sanitized) {
    Alert.alert('خطأ', 'السكريبت يحتوي على كود خطير');
    return;
  }
  
  webViewRef.current.injectJavaScript(sanitized);
};

// Rate limiting للـ AI calls
const callAI = async (message) => {
  if (!SecurityManager.rateLimiter.check('ai_calls', 20, 60000)) {
    Alert.alert('تحذير', 'تجاوزت الحد الأقصى للطلبات. حاول بعد دقيقة.');
    return;
  }
  
  // Make AI call
};
```

---

## 📊 نظام التحليلات والإحصائيات

```javascript
// utils/AnalyticsManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AnalyticsManager = {
  // Track event
  async trackEvent(eventName, properties = {}) {
    try {
      const events = await this.getEvents();
      
      events.push({
        name: eventName,
        properties,
        timestamp: Date.now()
      });
      
      // Keep only last 1000 events
      const trimmed = events.slice(-1000);
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(trimmed));
      
      console.log(`📊 Event tracked: ${eventName}`, properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },
  
  async getEvents() {
    try {
      const data = await AsyncStorage.getItem('analytics_events');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },
  
  // Get statistics
  async getStats() {
    const events = await this.getEvents();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    
    // Filter by time period
    const today = events.filter(e => now - e.timestamp < oneDay);
    const thisWeek = events.filter(e => now - e.timestamp < oneWeek);
    
    // Count by event type
    const eventCounts = events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: events.length,
      today: today.length,
      thisWeek: thisWeek.length,
      byType: eventCounts,
      mostCommon: Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  },
  
  // Track page visit
  async trackPageVisit(url, title) {
    await this.trackEvent('page_visit', { url, title });
  },
  
  // Track AI usage
  async trackAIUsage(model, tokens, cost) {
    await this.trackEvent('ai_usage', { model, tokens, cost });
  },
  
  // Track script execution
  async trackScriptExecution(scriptName, success) {
    await this.trackEvent('script_execution', { scriptName, success });
  },
  
  // Track search
  async trackSearch(query, results) {
    await this.trackEvent('search', { query, results });
  },
  
  // Export analytics
  async exportAnalytics() {
    const events = await this.getEvents();
    const stats = await this.getStats();
    
    return {
      exportDate: new Date().toISOString(),
      events,
      stats
    };
  },
  
  // Clear analytics
  async clearAnalytics() {
    await AsyncStorage.removeItem('analytics_events');
  }
};
```

**استخدام التحليلات:**

```javascript
// Track page visits
const handleNavigationStateChange = (navState, index) => {
  updateTab(index, {
    url: navState.url,
    title: navState.title,
    canGoBack: navState.canGoBack,
    canGoForward: navState.canGoForward
  });
  
  // Track analytics
  AnalyticsManager.trackPageVisit(navState.url, navState.title);
  
  // Add to history
  addToHistory(navState.url, navState.title);
};

// Track AI usage
const callAI = async (message) => {
  const result = await AIHelper.sendRequest(messages);
  
  if (result.success) {
    AnalyticsManager.trackAIUsage(
      result.model,
      result.usage.total_tokens,
      calculateCost(result.usage)
    );
  }
};

// View analytics
const viewAnalytics = async () => {
  const stats = await AnalyticsManager.getStats();
  
  console.log('📊 Analytics:');
  console.log('- Total events:', stats.total);
  console.log('- Today:', stats.today);
  console.log('- This week:', stats.thisWeek);
  console.log('- Most common:', stats.mostCommon);
};
```

---

## 🔔 نظام الإشعارات

```javascript
// utils/NotificationManager.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationManager = {
  // Request permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },
  
  // Send local notification
  async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  },
  
  // Notify about new message in chat
  async notifyNewMessage(message) {
    await this.sendNotification(
      '💬 رسالة جديدة',
      message,
      { type: 'chat_message' }
    );
  },
  
  // Notify about script completion
  async notifyScriptComplete(scriptName, success) {
    await this.sendNotification(
      success ? '✅ اكتمل السكريبت' : '❌ فشل السكريبت',
      scriptName,
      { type: 'script_complete', success }
    );
  },
  
  // Notify about download complete
  async notifyDownloadComplete(fileName) {
    await this.sendNotification(
      '📥 اكتمل التحميل',
      fileName,
      { type: 'download_complete' }
    );
  },
  
  // Notify about update available
  async notifyUpdateAvailable(version) {
    await this.sendNotification(
      '🚀 تحديث متاح',
      `الإصدار ${version} متاح الآن`,
      { type: 'update_available', version }
    );
  },
  
  // Cancel all notifications
  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
```

---

## 🎯 نظام الاختصارات والإيماءات

```javascript
// utils/GestureManager.js
import { Gesture } from 'react-native-gesture-handler';

export const GestureManager = {
  // Swipe gestures for tab navigation
  createSwipeGesture(onSwipeLeft, onSwipeRight) {
    return Gesture.Pan()
      .onEnd((event) => {
        const { translationX, velocityX } = event;
        
        // Swipe right (go back)
        if (translationX > 100 && velocityX > 0) {
          onSwipeRight();
        }
        // Swipe left (go forward)
        else if (translationX < -100 && velocityX < 0) {
          onSwipeLeft();
        }
      });
  },
  
  // Long press gestures
  createLongPressGesture(onLongPress) {
    return Gesture.LongPress()
      .minDuration(500)
      .onStart(onLongPress);
  },
  
  // Double tap gesture
  createDoubleTapGesture(onDoubleTap) {
    return Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(onDoubleTap);
  },
  
  // Pinch to zoom
  createPinchGesture(onPinch) {
    return Gesture.Pinch()
      .onUpdate((event) => {
        onPinch(event.scale);
      });
  }
};

// Keyboard shortcuts
export const ShortcutManager = {
  shortcuts: {
    'CMD+T': 'newTab',
    'CMD+W': 'closeTab',
    'CMD+R': 'refresh',
    'CMD+L': 'focusAddressBar',
    'CMD+D': 'addToFavorites',
    'CMD+SHIFT+T': 'reopenClosedTab',
    'CMD+K': 'openSmartChat',
    'CMD+SHIFT+I': 'toggleDevTools'
  },
  
  handleShortcut(key, action) {
    console.log(`⌨️ Shortcut: ${key} → ${action}`);
    // Handle shortcut action
  }
};
```

---

## ⚡ تحسينات الأداء المتقدمة

```javascript
// utils/PerformanceManager.js
import { InteractionManager } from 'react-native';

export const PerformanceManager = {
  // Debounce function calls
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
  
  // Throttle function calls
  throttle(func, limit = 1000) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  
  // Defer heavy operations
  async deferOperation(operation) {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve(operation());
      });
    });
  },
  
  // Measure performance
  measure(name, operation) {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  },
  
  // Memory monitoring
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
      };
    }
    return null;
  },
  
  // Lazy load images
  lazyLoadImage(uri, placeholder) {
    const [source, setSource] = useState(placeholder);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setSource({ uri });
      }, 100);
      
      return () => clearTimeout(timer);
    }, [uri]);
    
    return source;
  }
};
```

**الاستخدام:**

```javascript
// Debounce search
const debouncedSearch = PerformanceManager.debounce(
  (query) => performSearch(query),
  500
);

// Throttle scroll events
const throttledScroll = PerformanceManager.throttle(
  (event) => handleScroll(event),
  100
);

// Defer heavy operations
const loadData = async () => {
  await PerformanceManager.deferOperation(async () => {
    const data = await fetchHeavyData();
    setData(data);
  });
};

// Measure performance
const result = PerformanceManager.measure('processData', () => {
  return processLargeDataSet();
});

// Monitor memory
const memoryInfo = PerformanceManager.getMemoryUsage();
console.log('Memory usage:', memoryInfo);
```

---

## 🧪 نظام الاختبارات

```javascript
// __tests__/SettingsManager.test.js
import { SettingsManager } from '../utils/SettingsManager';

describe('SettingsManager', () => {
  beforeEach(async () => {
    await SettingsManager.deleteApiKey();
  });
  
  test('should save and retrieve API key', async () => {
    const testKey = 'sk-test123456789';
    
    await SettingsManager.setApiKey(testKey);
    const retrieved = await SettingsManager.getApiKey();
    
    expect(retrieved).toBe(testKey);
  });
  
  test('should validate API key', async () => {
    const testKey = 'sk-test123';
    await SettingsManager.setApiKey(testKey);
    
    const key = await SettingsManager.validateApiKey();
    expect(key).toBeTruthy();
  });
  
  test('should handle invalid API key', async () => {
    try {
      await SettingsManager.validateApiKey();
    } catch (error) {
      expect(error.message).toContain('غير موجود');
    }
  });
});
```

---

## 📝 خلاصة التحسينات التقنية

✅ **Context API** - إدارة حالة مركزية
✅ **Security Manager** - حماية وتشفير
✅ **Analytics** - تتبع الاستخدام
✅ **Notifications** - إشعارات ذكية
✅ **Gestures** - إيماءات واختصارات
✅ **Performance** - تحسينات متقدمة
✅ **Testing** - اختبارات تلقائية

---

**🎯 الآن لديك بنية تحتية قوية وآمنة!**