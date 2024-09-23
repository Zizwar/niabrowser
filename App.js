import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Share, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebViewContainer from './components/WebViewContainer';
import ToolBar from './components/ToolBar';
import TabBar from './components/TabBar';
import BottomSheet from './components/BottomSheet';
import DevTools from './components/DevTools';
import NetworkLogModal from './components/NetworkLogModal';
import CustomStatusBar from './components/CustomStatusBar';
import SourceCodeModal from './components/SourceCodeModal';
import HistoryModal from './components/HistoryModal';
import CrudModal from './components/CrudModal';
import OnboardingScreen from './components/OnboardingScreen';
import AboutModal from './components/AboutModal';
import ScriptManager from './components/ScriptManager';
import { createGreasemonkeyEnvironment, parseMetadata } from './utils/GreasemonkeyCompatibility';

import BottomNavigation from './components/BottomNavigation';

const createNewTab = (url = 'https://www.google.com', title = 'New Tab') => ({
  id: Date.now(),
  url,
  title,
  networkLogs: [],
  consoleOutput: [],
  storage: { cookies: '', localStorage: '' },
  performanceMetrics: null,
  isDevToolsVisible: false,
  isCrudModalVisible: false,
  crudInitialData: null,
  isSourceCodeModalVisible: false,
  sourceCode: '',
  selectedNetworkLog: null,
  isNetworkLogModalVisible: false,
  canGoBack: false,
  canGoForward: false,
});

const App = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isScriptManagerVisible, setIsScriptManagerVisible] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [isTabsLoading, setIsTabsLoading] = useState(true);

  
  const [tabs, setTabs] = useState([
  createNewTab('https://www.google.com', 'Google')
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const webViewRefs = useRef([]);

  useEffect(() => {
    checkOnboardingStatus();
    loadHistory();
    loadSettings();
    loadScripts();
    loadTabs();
  }, []);
  
const loadTabs = async () => { 
setIsTabsLoading(true); 
try { 
const savedTabs = await AsyncStorage.getItem('savedTabs'); 
if (savedTabs) { 
const parsedTabs = JSON.parse(savedTabs);
 setTabs(parsedTabs.map(tab => ({ ...createNewTab(tab.url, tab.title), ...tab })));
  } 
  
  } catch (error) { 
  console.error('Error loading tabs:', error);
   } finally { 
   setIsTabsLoading(false);
 } 
 
 };
  
  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

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

  const handleMessage = useCallback((event) => {
    const data = JSON.parse(event.nativeEvent.data);
    const activeTab = getActiveTab();
    if (!activeTab) return;

    switch (data.type) {
      case 'networkLog':
        updateTabInfo(activeTabIndex, { 
          networkLogs: [data, ...activeTab.networkLogs.slice(0, 99)] 
        });
        break;
      case 'consoleLog':
        updateTabInfo(activeTabIndex, { 
          consoleOutput: [data.message, ...activeTab.consoleOutput.slice(0, 99)] 
        });
        break;
      case 'storage':
        updateTabInfo(activeTabIndex, { storage: data });
        break;
      case 'sourceHtml':
        updateTabInfo(activeTabIndex, { sourceCode: data.html, isSourceCodeModalVisible: true });
        break;
      case 'performanceMetrics':
        updateTabInfo(activeTabIndex, { performanceMetrics: data.metrics });
        break;
      case 'crudResponse':
        // Handle CRUD response if needed
        break;
      case 'GM_setValue':
        handleGreasemonkeySetValue(data.key, data.value);
        break;
      case 'GM_getValue':
        handleGreasemonkeyGetValue(data.key, data.defaultValue);
        break;
      case 'GM_xmlhttpRequest':
        handleGreasemonkeyXmlHttpRequest(data.details);
        break;
    }
  }, [activeTabIndex, tabs]);

  const getActiveTab = () => tabs[activeTabIndex] || null;

  const updateTabInfo = (index, info) => {
    setTabs(prevTabs => {
      if (index < 0 || index >= prevTabs.length) return prevTabs;
      const newTabs = [...prevTabs];
      newTabs[index] = { ...newTabs[index], ...info };
      saveTabs(newTabs);
      return newTabs;
    });
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
  const handleNavigationStateChange = (navState, tabIndex) => {
    updateTabInfo(tabIndex, {
      url: navState.url,
      title: navState.title || navState.url,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward
    });
    addToHistory(navState.url);
    setTimeout(() => runAutoScripts(navState.url), 500);
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
    reloadActiveTab();
  };

  const reloadActiveTab = () => {
    const webViewRef = webViewRefs.current[activeTabIndex];
    if (webViewRef && webViewRef.reload) {
      webViewRef.reload();
    }
  };

  const goBack = () => {
    const webViewRef = webViewRefs.current[activeTabIndex];
    if (webViewRef && tabs[activeTabIndex].canGoBack) {
      webViewRef.goBack();
    }
  };

  const goForward = () => {
    const webViewRef = webViewRefs.current[activeTabIndex];
    if (webViewRef && tabs[activeTabIndex].canGoForward) {
      webViewRef.goForward();
    }
  };

const addNewTab = () => {
  setTabs(prevTabs => {
    const newTabs = Array.isArray(prevTabs) ? [...prevTabs, createNewTab()] : [createNewTab()];
    saveTabs(newTabs); 
    setTimeout(() => setActiveTabIndex(newTabs.length - 1), 7);
    return newTabs;
  });
};

  


const closeTab = (index) => {
  setTabs(prevTabs => {
    if (!Array.isArray(prevTabs) || prevTabs.length <= 1) {
          saveTabs(newTabs);
      return [createNewTab()];
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
};

  const updateTabUrl = (index, newUrl) => {
    updateTabInfo(index, { url: newUrl });
    const webViewRef = webViewRefs.current[index];
    if (webViewRef && webViewRef.loadUrl) {
      webViewRef.loadUrl(newUrl);
    }
  };

  const getSourceHtml = () => {
    const webViewRef = webViewRefs.current[activeTabIndex];
    if (webViewRef && webViewRef.injectJavaScript) {
      webViewRef.injectJavaScript(`
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'sourceHtml',
          html: document.documentElement.outerHTML
        }));
      `);
    }
  };

  const shareUrl = async () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      try {
        await Share.share({ message: activeTab.url });
      } catch (error) {
        console.error('Error sharing URL:', error);
      }
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.clear();
      setHistory([]);
      setScripts([]);
      Alert.alert("Data Cleared", "All app data has been cleared successfully.");
    } catch (error) {
      console.error('Error clearing data:', error);
      Alert.alert("Error", "Failed to clear data. Please try again.");
    }
  };

  const handleNetworkLogPress = (log) => {
    updateTabInfo(activeTabIndex, { selectedNetworkLog: log, isNetworkLogModalVisible: true });
  };

  const handleNetworkLogLongPress = (log) => {
    openCrudModal({
      url: log.url,
      method: log.method,
      requestHeaders: log.requestHeaders,
      requestBody: log.requestBody
    });
  };

  const runAutoScripts = useCallback((currentUrl) => {
    scripts.forEach(script => {
      if (script.isEnabled && shouldRunOnUrl(script.urls, currentUrl)) {
        const metadata = parseMetadata(script.code);
        const wrappedScript = createGreasemonkeyEnvironment(script.code, metadata);
        injectJavaScript(activeTabIndex, wrappedScript);
      }
    });
  }, [scripts, activeTabIndex]);

  const shouldRunOnUrl = (scriptUrls, currentUrl) => {
    if (!scriptUrls) return true;
    const urlPatterns = scriptUrls.split(',').map(u => u.trim());
    return urlPatterns.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(currentUrl);
    });
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

  const toggleDevTools = () => {
    updateTabInfo(activeTabIndex, { isDevToolsVisible: !getActiveTab().isDevToolsVisible });
  };

  const openCrudModal = (initialData = null) => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: true, crudInitialData: initialData });
  };

  const closeCrudModal = () => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: false, crudInitialData: null });
  };

  const handleGreasemonkeySetValue = async (key, value) => {
    try {
      await AsyncStorage.setItem(`GM_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving Greasemonkey value:', error);
    }
  };

  const handleGreasemonkeyGetValue = async (key, defaultValue) => {
    try {
      const value = await AsyncStorage.getItem(`GM_${key}`);
      const result = value !== null ? JSON.parse(value) : defaultValue;
      injectJavaScript(activeTabIndex, `
        if (window.GM_getValueCallback) {
          window.GM_getValueCallback(${JSON.stringify(result)});
        }
      `);
    } catch (error) {
      console.error('Error getting Greasemonkey value:', error);
      injectJavaScript(activeTabIndex, `
        if (window.GM_getValueCallback) {
          window.GM_getValueCallback(${JSON.stringify(defaultValue)});
        }
      `);
    }
  };

  const handleGreasemonkeyXmlHttpRequest = (details) => {
    // Implement XMLHttpRequest functionality here
    console.log('GM_xmlhttpRequest called with:', details);
    // You might want to use fetch API or a third-party library to make the actual request
  };

  const injectJavaScript = (tabIndex, code) => {
    const webViewRef = webViewRefs.current[tabIndex];
    if (webViewRef && webViewRef.injectJavaScript) {
      webViewRef.injectJavaScript(`
        (function() {
          try {
            ${code}
          } catch (error) {
            console.error('Error executing script:', error);
          }
        })();
        true;
      `);
    }
  };

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />;
  }

  const activeTab = getActiveTab();
const openSettingsModal = () => {
    setIsSettingsModalVisible(true);
  };
return (
  <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
    <CustomStatusBar isDarkMode={isDarkMode} />
    <TabBar
      tabs={tabs}
      activeTabIndex={activeTabIndex}
      onTabPress={setActiveTabIndex}
      onCloseTab={closeTab}
      onAddTab={addNewTab}
      isDarkMode={isDarkMode}
    />
    {Array.isArray(tabs) && tabs.length > 0 && (
      <>
        <ToolBar 
          url={getActiveTab()?.url || ''}
          setUrl={(newUrl) => updateTabUrl(activeTabIndex, newUrl)}
          isDarkMode={isDarkMode}
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          addToHistory={addToHistory}
          onMenuPress={() => setIsBottomSheetVisible(true)}
          goBack={goBack}
          goForward={goForward}
          reload={reloadActiveTab}
          canGoBack={getActiveTab()?.canGoBack || false}
          canGoForward={getActiveTab()?.canGoForward || false}
        />
        <View style={{ flex: 1 }}>
          {tabs.map((tab, index) => (
            <View key={tab.id} style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: index === activeTabIndex ? 'flex' : 'none' 
            }}>
              <WebViewContainer
                ref={el => (webViewRefs.current[index] = el)}
                url={tab.url}
                onMessage={handleMessage}
                isDarkMode={isDarkMode}
                isDesktopMode={isDesktopMode}
                onNavigationStateChange={(navState) => handleNavigationStateChange(navState, index)}
                runAutoScripts={runAutoScripts}
              />
            </View>
          ))}
        </View>
      </>
    )}
    
     <BottomNavigation
        isDarkMode={isDarkMode}
        onHomePress={() => updateTabUrl(activeTabIndex, 'https://www.google.com')}
        onBackPress={goBack}
        onForwardPress={goForward}
        onRefreshPress={reloadActiveTab}
        onSettingsPress={() => setIsBottomSheetVisible(true)}
        onDevToolsPress={toggleDevTools}
        onCRUDPress={() => openCrudModal()}
        onScriptManagerPress={() => setIsScriptManagerVisible(true)}
        canGoBack={getActiveTab()?.canGoBack || false}
        canGoForward={getActiveTab()?.canGoForward || false}
      />
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleDesktopMode={toggleDesktopMode}
        isDesktopMode={isDesktopMode}
        shareUrl={shareUrl}
        clearData={clearData}
        openHistory={() => setIsHistoryModalVisible(true)}
        openAboutModal={() => setIsAboutModalVisible(true)}
        currentUrl={getActiveTab()?.url || ''}
      />
      
            {activeTab && (
        <>
          <DevTools
            visible={activeTab.isDevToolsVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isDevToolsVisible: false })}
            networkLogs={activeTab.networkLogs}
            consoleOutput={activeTab.consoleOutput}
            storage={activeTab.storage}
            performanceMetrics={activeTab.performanceMetrics}
            isDarkMode={isDarkMode}
            onNetworkLogPress={handleNetworkLogPress}
            onNetworkLogLongPress={handleNetworkLogLongPress}
            injectJavaScript={(code) => injectJavaScript(activeTabIndex, code)}
            onOpenScriptManager={() => setIsScriptManagerVisible(true)}
          />
          <NetworkLogModal
            visible={activeTab.isNetworkLogModalVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isNetworkLogModalVisible: false })}
            log={activeTab.selectedNetworkLog}
            isDarkMode={isDarkMode}
            openInCrud={openCrudModal}
          />
          <SourceCodeModal
            visible={activeTab.isSourceCodeModalVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isSourceCodeModalVisible: false })}
            sourceCode={activeTab.sourceCode}
            isDarkMode={isDarkMode}
          />
          <CrudModal
            visible={activeTab.isCrudModalVisible}
            onClose={closeCrudModal}
            isDarkMode={isDarkMode}
            webViewRef={webViewRefs.current[activeTabIndex]}
            initialData={activeTab.crudInitialData}
          />
        </>
      )}
      <HistoryModal
        visible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
        history={history}
        onSelectUrl={(selectedUrl) => {
          updateTabUrl(activeTabIndex, selectedUrl);
          setIsHistoryModalVisible(false);
        }}
        clearHistory={clearHistory}
        isDarkMode={isDarkMode}
      />
      <AboutModal
        visible={isAboutModalVisible}
        onClose={() => setIsAboutModalVisible(false)}
        isDarkMode={isDarkMode}
      />
      <ScriptManager
        visible={isScriptManagerVisible}
        onClose={() => setIsScriptManagerVisible(false)}
        scripts={scripts}
        saveScript={saveScript}
        injectScript={(code) => injectJavaScript(activeTabIndex, code)}
        currentUrl={activeTab?.url || ''}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;