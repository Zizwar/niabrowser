import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { createNewTab } from '../utils';

export const useWebViewRefs = () => {
  const webViewRefs = useRef([]);
  return webViewRefs;
};

export const useHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('browserHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const addToHistory = async (newUrl) => {
    const updatedHistory = [newUrl, ...history.filter(item => item !== newUrl)].slice(0, 100);
    setHistory(updatedHistory);
    try {
      await AsyncStorage.setItem('browserHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem('browserHistory');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return { history, addToHistory, clearHistory };
};

export const useTabs = (webViewRefs) => {
  const [tabs, setTabs] = useState([createNewTab()]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTabsLoading, setIsTabsLoading] = useState(true);

  useEffect(() => {
    loadTabs();
  }, []);

  useEffect(() => {
    const backAction = () => {
      const activeTab = tabs[activeTabIndex];
      if (activeTab && activeTab.canGoBack) {
        webViewRefs.current[activeTabIndex].goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [activeTabIndex, tabs, webViewRefs]);

  const loadTabs = async () => {
    setIsTabsLoading(true);
    try {
      const savedTabs = await AsyncStorage.getItem('savedTabs');
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs.map(tab => ({
          ...createNewTab(tab.url, tab.title),
          ...tab
        })));
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
    } finally {
      setIsTabsLoading(false);
    }
  };

  const saveTabs = async (tabsToSave) => {
    try {
      const tabsData = tabsToSave.map(tab => ({
        url: tab.url,
        title: tab.title,
        id: tab.id
      }));
      await AsyncStorage.setItem('savedTabs', JSON.stringify(tabsData));
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  };

  const addNewTab = useCallback(() => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs, createNewTab()];
      saveTabs(newTabs);
      setTimeout(() => setActiveTabIndex(newTabs.length - 1), 0);
      return newTabs;
    });
  }, []);

  const closeTab = useCallback((index) => {
    setTabs(prevTabs => {
      if (prevTabs.length <= 1) {
        const newTabs = [createNewTab()];
        saveTabs(newTabs);
        return newTabs;
      }
      const newTabs = prevTabs.filter((_, i) => i !== index);
      saveTabs(newTabs);
      setTimeout(() => {
        setActiveTabIndex(prevIndex => {
          if (index < prevIndex) return prevIndex - 1;
          if (index === prevIndex) return Math.min(prevIndex, newTabs.length - 1);
          return prevIndex;
        });
      }, 0);
      return newTabs;
    });
  }, []);

  const updateTabInfo = useCallback((index, info) => {
  setTabs(prevTabs => {
    const newTabs = [...prevTabs];
    newTabs[index] = { ...newTabs[index], ...info };
    return newTabs;
  });
}, []);

  return { 
    tabs, 
    setTabs, 
    activeTabIndex, 
    setActiveTabIndex, 
    isTabsLoading, 
    addNewTab, 
    closeTab, 
    updateTabInfo 
  };
};

export const useScripts = () => {
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const savedScripts = await AsyncStorage.getItem('userScripts');
      if (savedScripts) {
        setScripts(JSON.parse(savedScripts));
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const saveScript = async (script) => {
    const updatedScripts = [...scripts, script];
    setScripts(updatedScripts);
    try {
      await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
    } catch (error) {
      console.error('Error saving script:', error);
    }
  };

  return { scripts, setScripts, saveScript };
};

export const useSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('darkMode');
      setIsDarkMode(darkMode === 'true');
      const desktopMode = await AsyncStorage.getItem('desktopMode');
      setIsDesktopMode(desktopMode === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', newMode.toString());
  };

  const toggleDesktopMode = async () => {
    const newMode = !isDesktopMode;
    setIsDesktopMode(newMode);
    await AsyncStorage.setItem('desktopMode', newMode.toString());
  };

  return { isDarkMode, isDesktopMode, toggleDarkMode, toggleDesktopMode };
};