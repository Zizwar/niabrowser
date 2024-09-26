import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, BackHandler, Share, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebViewContainer from './components/WebViewContainer';
import ToolBar from './components/ToolBar';
import TabBar from './components/TabBar';
import BottomNavigation from './components/BottomNavigation';
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

import { AppProvider, useAppContext } from './state/context';
import { useWebViewRefs, useHistory, useTabs, useScripts, useSettings } from './hooks';
import { shareUrl, clearData, shouldRunOnUrl, injectJavaScript, createGreasemonkeyEnvironment } from './utils';

const createNewTab = (url = 'about:blank', title = 'New Tab') => ({
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

const AppContent = () => {
  const { 
    isBottomSheetVisible, 
    setBottomSheetVisible, 
    isHistoryModalVisible, 
    setHistoryModalVisible,
    isAboutModalVisible,
    setAboutModalVisible,
    isScriptManagerVisible,
    setScriptManagerVisible
  } = useAppContext();

  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const webViewRefs = useWebViewRefs();
  const { history, addToHistory, clearHistory } = useHistory();
  const { tabs, setTabs, activeTabIndex, setActiveTabIndex, isTabsLoading, addNewTab, closeTab, updateTabInfo } = useTabs(webViewRefs);
  const { scripts, setScripts, saveScript } = useScripts();
  const { isDarkMode, isDesktopMode, toggleDarkMode, toggleDesktopMode } = useSettings();

  useEffect(() => {
    checkOnboardingStatus();
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

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setHasCheckedOnboarding(true);
    }
  };

  const handleMessage = useCallback((event) => {
    const data = JSON.parse(event.nativeEvent.data);
    const activeTab = tabs[activeTabIndex];
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
      // ... other cases as needed
    }
  }, [activeTabIndex, tabs, updateTabInfo]);

  const handleNavigationStateChange = useCallback((navState, tabIndex) => {
    updateTabInfo(tabIndex, {
      url: navState.url,
      title: navState.title || navState.url,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward
    });
    addToHistory(navState.url);
  }, [updateTabInfo, addToHistory]);

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

  const runAutoScripts = useCallback((currentUrl, event) => {
    scripts.forEach(script => {
      if (script.isEnabled && shouldRunOnUrl(script.urls, currentUrl)) {
        if ((script.runAt === 'document-start' && event === 'start') ||
            (script.runAt === 'document-idle' && event === 'load')) {
          const wrappedScript = createGreasemonkeyEnvironment(script.code, script.metadata);
          injectJavaScript(webViewRefs.current[activeTabIndex], wrappedScript);
        }
      }
    });
  }, [scripts, activeTabIndex, webViewRefs]);

  const toggleDevTools = () => {
    updateTabInfo(activeTabIndex, { isDevToolsVisible: !tabs[activeTabIndex].isDevToolsVisible });
  };

  const openCrudModal = (initialData = null) => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: true, crudInitialData: initialData });
  };

  const closeCrudModal = () => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: false, crudInitialData: null });
  };

  const updateStorageData = useCallback(() => {
    const activeWebViewRef = webViewRefs.current[activeTabIndex];
    if (activeWebViewRef && activeWebViewRef.getStorageData) {
      activeWebViewRef.getStorageData();
    }
  }, [activeTabIndex, webViewRefs]);

  if (!hasCheckedOnboarding) {
    return null;
  }

   if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={() => {
      setHasSeenOnboarding(true);
      AsyncStorage.setItem('hasSeenOnboarding', 'true');
    }} />;
  }

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
        isLoading={isTabsLoading}
      />
      <ToolBar 
        url={tabs[activeTabIndex]?.url || ''}
        setUrl={(newUrl) => updateTabUrl(activeTabIndex, newUrl)}
        isDarkMode={isDarkMode}
        textColor={isDarkMode ? '#FFFFFF' : '#000000'}
        addToHistory={addToHistory}
        onMenuPress={() => setBottomSheetVisible(true)}
        goBack={() => webViewRefs.current[activeTabIndex]?.goBack()}
        goForward={() => webViewRefs.current[activeTabIndex]?.goForward()}
        reload={() => webViewRefs.current[activeTabIndex]?.reload()}
        canGoBack={tabs[activeTabIndex]?.canGoBack || false}
        canGoForward={tabs[activeTabIndex]?.canGoForward || false}
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
              onLoadStart={(event) => runAutoScripts(event.nativeEvent.url, 'start')}
              onLoad={(event) => runAutoScripts(event.nativeEvent.url, 'load')}
              addNewTab={addNewTab}
            />
          </View>
        ))}
      </View>
      <BottomNavigation
        isDarkMode={isDarkMode}
        onHomePress={() => updateTabUrl(activeTabIndex, 'https://www.google.com')}
        onBackPress={() => webViewRefs.current[activeTabIndex]?.goBack()}
        onForwardPress={() => webViewRefs.current[activeTabIndex]?.goForward()}
        onRefreshPress={() => webViewRefs.current[activeTabIndex]?.reload()}
        onSettingsPress={() => setBottomSheetVisible(true)}
        onDevToolsPress={toggleDevTools}
        onCRUDPress={() => openCrudModal()}
        onScriptManagerPress={() => setScriptManagerVisible(true)}
        canGoBack={tabs[activeTabIndex]?.canGoBack || false}
        canGoForward={tabs[activeTabIndex]?.canGoForward || false}
        onGetSourcePress={getSourceHtml}
      />
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleDesktopMode={toggleDesktopMode}
        isDesktopMode={isDesktopMode}
        shareUrl={() => shareUrl(tabs[activeTabIndex]?.url)}
        clearData={clearData}
        openHistory={() => setHistoryModalVisible(true)}
        openAboutModal={() => setAboutModalVisible(true)}
        currentUrl={tabs[activeTabIndex]?.url || ''}
      />
      {tabs[activeTabIndex] && (
        <>
          <DevTools
            visible={tabs[activeTabIndex].isDevToolsVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isDevToolsVisible: false })}
            networkLogs={tabs[activeTabIndex].networkLogs}
            consoleOutput={tabs[activeTabIndex].consoleOutput}
            storage={tabs[activeTabIndex].storage}
            performanceMetrics={tabs[activeTabIndex].performanceMetrics}
            isDarkMode={isDarkMode}
            onNetworkLogPress={handleNetworkLogPress}
            onNetworkLogLongPress={handleNetworkLogLongPress}
            injectJavaScript={(code) => injectJavaScript(webViewRefs.current[activeTabIndex], code)}
            onOpenScriptManager={() => setScriptManagerVisible(true)}
            updateStorageData={updateStorageData}
          />
          <NetworkLogModal
            visible={tabs[activeTabIndex].isNetworkLogModalVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isNetworkLogModalVisible: false })}
            log={tabs[activeTabIndex].selectedNetworkLog}
            isDarkMode={isDarkMode}
            openInCrud={openCrudModal}
          />
          <SourceCodeModal
            visible={tabs[activeTabIndex].isSourceCodeModalVisible}
            onClose={() => updateTabInfo(activeTabIndex, { isSourceCodeModalVisible: false })}
            sourceCode={tabs[activeTabIndex].sourceCode}
            isDarkMode={isDarkMode}
          />
          <CrudModal
            visible={tabs[activeTabIndex].isCrudModalVisible}
            onClose={closeCrudModal}
            isDarkMode={isDarkMode}
            webViewRef={webViewRefs.current[activeTabIndex]}
            initialData={tabs[activeTabIndex].crudInitialData}
          />
        </>
      )}
      <HistoryModal
        visible={isHistoryModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        history={history}
        onSelectUrl={(selectedUrl) => {
          updateTabUrl(activeTabIndex, selectedUrl);
          setHistoryModalVisible(false);
        }}
        clearHistory={clearHistory}
        isDarkMode={isDarkMode}
      />
      <AboutModal
        visible={isAboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        isDarkMode={isDarkMode}
      />
      <ScriptManager visible={isScriptManagerVisible} onClose={() => setScriptManagerVisible(false)} scripts={scripts} setScripts={setScripts} injectScript={(code) => injectJavaScript(webViewRefs.current[activeTabIndex], code)} currentUrl={tabs[activeTabIndex]?.url || ''} isDarkMode={isDarkMode} />
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, }, 
 });
  const App = () =>
 { 
 return (
  <AppProvider>
   <AppContent />
    </AppProvider> );
     };
      export default App;