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

  const addToHistory = async (newUrl, title = null) => {
    const historyItem = { url: newUrl, title: title || newUrl, timestamp: Date.now() };
    const updatedHistory = [historyItem, ...history.filter(item => (typeof item === 'string' ? item : item.url) !== newUrl)].slice(0, 100);
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

  return { history, addToHistory, clearHistory, setHistory };
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
      const savedActiveIndex = await AsyncStorage.getItem('activeTabIndex');
      
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs.map(tab => ({
          ...createNewTab(tab.url, tab.title),
          ...tab
        })));
        
        if (savedActiveIndex) {
          setActiveTabIndex(parseInt(savedActiveIndex));
        }
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
    } finally {
      setIsTabsLoading(false);
    }
  };

  const saveTabs = async (tabsToSave, activeIndex) => {
    try {
      const tabsData = tabsToSave.map((tab, index) => ({
        url: tab.url,
        title: tab.title,
        id: tab.id,
        isActive: index === (activeIndex !== undefined ? activeIndex : activeTabIndex)
      }));
      await AsyncStorage.setItem('savedTabs', JSON.stringify(tabsData));
      await AsyncStorage.setItem('activeTabIndex', (activeIndex !== undefined ? activeIndex : activeTabIndex).toString());
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  };

  const addNewTab = useCallback((url = null) => {
    setTabs(prevTabs => {
      // Ensure URL is a string or use default
      const urlString = url ? (typeof url === 'string' ? url : url.toString()) : null;
      const newTabs = [...prevTabs, createNewTab(urlString)];
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
const toggleAllScripts = async (enable) => {
    const updatedScripts = scripts.map(script => ({ ...script, isEnabled: enable }));
    setScripts(updatedScripts);
    try {
      await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
    } catch (error) {
      console.error('Error saving scripts:', error);
    }
  };
  
  return { scripts, setScripts, saveScript ,toggleAllScripts};
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
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = (url) => {
    const updatedFavorites = [...favorites, url];
    saveFavorites(updatedFavorites);
  };

  const removeFromFavorites = (url) => {
    const updatedFavorites = favorites.filter(fav => fav !== url);
    saveFavorites(updatedFavorites);
  };

  return { favorites, addToFavorites, removeFromFavorites };
};