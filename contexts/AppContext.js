import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsManager } from '../utils/SettingsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(true);
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
      setIsDarkMode(prefs.isDarkMode !== undefined ? prefs.isDarkMode : true);
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
