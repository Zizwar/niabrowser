import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, BackHandler, Share, Alert, Modal, Text, TextInput, TouchableOpacity, Platform, StatusBar as RNStatusBar, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';
import * as ScreenCapture from 'expo-screen-capture';
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
import UserAgentSelector from './components/UserAgentSelector';

import HistoryFavoritesModal from './components/HistoryFavoritesModal';
import AICommandInterface from './components/AICommandInterface';
import SettingsScreen from './components/SettingsScreen';
import { Icon } from 'react-native-elements';

import { useWebViewRefs, useHistory, useTabs, useScripts, useSettings, useFavorites } from './hooks';
import { AppProvider, useAppContext } from './state/context';

import { shareUrl, clearData, shouldRunOnUrl, injectJavaScript, createGreasemonkeyEnvironment } from './utils';

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
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [safeModeToast, setSafeModeToast] = useState(null);
  const safeModeToastAnim = useRef(new Animated.Value(0)).current;
  const [pageCacheData, setPageCacheData] = useState(null);
  const [currentUserAgent, setCurrentUserAgent] = useState(null);
  const [isUserAgentSelectorVisible, setUserAgentSelectorVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customHomePage, setCustomHomePage] = useState('https://www.google.com');
  const [showHomePageModal, setShowHomePageModal] = useState(false);
  const [isAICommandVisible, setIsAICommandVisible] = useState(false);
  const [aiInitialContext, setAiInitialContext] = useState(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  const webViewRefs = useWebViewRefs();
  const { history, addToHistory, clearHistory, setHistory } = useHistory();
  const { tabs, setTabs, activeTabIndex, setActiveTabIndex, isTabsLoading, addNewTab, closeTab, updateTabInfo } = useTabs(webViewRefs);
  const { scripts, setScripts, saveScript, toggleAllScripts } = useScripts();
  const { isDarkMode, isDesktopMode, toggleDarkMode, toggleDesktopMode } = useSettings();

const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const toggleSafeMode = useCallback(async (value) => {
    if (value) {
      // Entering Safe Mode - save enabled scripts
      const enabledScripts = scripts.filter(s => s.isEnabled).map(s => s.name);
      await AsyncStorage.setItem('enabledScriptsBeforeSafeMode', JSON.stringify(enabledScripts));
      toggleAllScripts(false); // Disable all scripts
    } else {
      // Exiting Safe Mode - restore previously enabled scripts
      try {
        const savedScripts = await AsyncStorage.getItem('enabledScriptsBeforeSafeMode');
        if (savedScripts) {
          const scriptNames = JSON.parse(savedScripts);
          // Re-enable the previously enabled scripts
          const updatedScripts = scripts.map(script => ({
            ...script,
            isEnabled: scriptNames.includes(script.name)
          }));
          setScripts(updatedScripts);
          await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
        }
      } catch (error) {
        console.error('Error restoring scripts:', error);
      }
    }
    setIsSafeMode(value);
    // Show toast notification
    setSafeModeToast(value ? 'Safe Mode ON — Scripts disabled' : 'Safe Mode OFF — Scripts restored');
    safeModeToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(safeModeToastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(safeModeToastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSafeModeToast(null));
  }, [scripts, setScripts, toggleAllScripts, safeModeToastAnim]);

  const toggleEruda = useCallback(() => { 
  const activeWebViewRef = webViewRefs.current[activeTabIndex];
   if (activeWebViewRef && activeWebViewRef.toggleEruda) {
          activeWebViewRef.toggleEruda();
           }
    }, [activeTabIndex, webViewRefs]);

  useEffect(() => {
    checkOnboardingStatus();
    loadCustomHomePage();
  }, []);

  useEffect(() => {
    const handleDeepLink = (url) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        Alert.alert(
          'Open Link',
          `Would you like to open this link in NIABrowser?\n\n${url}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open', onPress: () => addNewTab(url) }
          ]
        );
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    
    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [addNewTab]);

  const loadCustomHomePage = async () => {
    try {
      const saved = await AsyncStorage.getItem('customHomePage');
      if (saved) setCustomHomePage(saved);
    } catch (error) {
      console.error('Error loading custom home page:', error);
    }
  };

  useEffect(() => {
    const backAction = () => {
      // Check if any modal is open first - modals handle their own back
      if (isAICommandVisible || isSettingsVisible || isBottomSheetVisible ||
          isHistoryModalVisible || isAboutModalVisible || isScriptManagerVisible ||
          showHomePageModal) {
        return false; // Let modal handle it
      }

      const activeTab = tabs[activeTabIndex];
      if (activeTab && activeTab.canGoBack) {
        webViewRefs.current[activeTabIndex].goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [activeTabIndex, tabs, webViewRefs, isAICommandVisible, isSettingsVisible,
      isBottomSheetVisible, isHistoryModalVisible, isAboutModalVisible,
      isScriptManagerVisible, showHomePageModal]);

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
    try {
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
      case 'openInNewTab':
        let urlToOpen = 'https://www.google.com'; // fallback
        
        if (data.url) {
          if (typeof data.url === 'string' && data.url.trim() !== '') {
            urlToOpen = data.url.trim();
          } else if (data.url.href && typeof data.url.href === 'string') {
            urlToOpen = data.url.href;
          } else if (data.url.toString && data.url.toString() !== '[object Object]') {
            urlToOpen = data.url.toString();
          }
        }
        
        // Validate URL format
        if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
          if (urlToOpen.includes('.') && !urlToOpen.includes(' ')) {
            urlToOpen = `https://${urlToOpen}`;
          } else {
            urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(urlToOpen)}`;
          }
        }
        
        addNewTab(urlToOpen);
        break;
        /*
        case 'cookieUpdate':
  updateTabInfo(activeTabIndex, {
    cookies: data.cookie
  });
  break;
  */
      case 'pageCache':
        setPageCacheData(data.content);
        break;
    }
    } catch (error) {
      console.error('Error handling message:', error);
      console.error('Event data:', event.nativeEvent.data);
    }
  }, [activeTabIndex, tabs, updateTabInfo]);

  const handleNavigationStateChange = useCallback((navState, tabIndex) => {
    const title = navState.title || navState.url;
    const truncatedTitle = title.length > 23 ? title.substring(0, 20) + '...' : title;
    updateTabInfo(tabIndex, {
      url: navState.url,
      title: truncatedTitle,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward
    });
    addToHistory(navState.url, title);
  }, [updateTabInfo, addToHistory]);

  const updateTabUrl = useCallback((index, newUrl) => {
    updateTabInfo(index, { url: newUrl });
    
    const webViewRef = webViewRefs.current[index];
    if (webViewRef && webViewRef.loadUrl) {
      webViewRef.loadUrl(newUrl);
    }
  }, [updateTabInfo, webViewRefs]);

  const goHome = useCallback(() => {
    updateTabUrl(activeTabIndex, customHomePage);
  }, [activeTabIndex, updateTabUrl, customHomePage]);

  const saveHomePage = async () => {
    try {
      await AsyncStorage.setItem('customHomePage', customHomePage);
      setShowHomePageModal(false);
    } catch (error) {
      console.error('Error saving home page:', error);
    }
  };

const goHomeOld = useCallback(async () => {
    try {
      // Try to get the last visited URL from history
      const savedHistory = await AsyncStorage.getItem('browserHistory');
      let homeUrl = 'https://www.google.com'; // fallback
      
      if (savedHistory) {
        const historyArray = JSON.parse(savedHistory);
        if (historyArray.length > 0) {
          homeUrl = historyArray[0]; // Use the most recent URL
        }
      }
      
      updateTabUrl(activeTabIndex, homeUrl);
    } catch (error) {
      console.error('Error getting home URL:', error);
      updateTabUrl(activeTabIndex, 'https://www.google.com');
    }
  }, [activeTabIndex, updateTabUrl]);

  const getSourceHtml = useCallback(() => {
    const webViewRef = webViewRefs.current[activeTabIndex];
    if (webViewRef && webViewRef.injectJavaScript) {
      webViewRef.injectJavaScript(`
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'sourceHtml',
          html: document.documentElement.outerHTML
        }));
      `);
    }
  }, [activeTabIndex, webViewRefs]);

  const handleNetworkLogPress = useCallback((log) => {
    updateTabInfo(activeTabIndex, { selectedNetworkLog: log, isNetworkLogModalVisible: true });
  }, [activeTabIndex, updateTabInfo]);

  const handleNetworkLogLongPress = useCallback((log) => {
    openCrudModal({
      url: log.url,
      method: log.method,
      requestHeaders: log.requestHeaders,
      requestBody: log.requestBody
    });
  }, [openCrudModal]);

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

  const toggleDevTools = useCallback(() => {
    updateTabInfo(activeTabIndex, { isDevToolsVisible: !tabs[activeTabIndex].isDevToolsVisible });
  }, [activeTabIndex, tabs, updateTabInfo]);

  const openCrudModal = useCallback((initialData = null) => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: true, crudInitialData: initialData });
  }, [activeTabIndex, updateTabInfo]);

  const closeCrudModal = useCallback(() => {
    updateTabInfo(activeTabIndex, { isCrudModalVisible: false, crudInitialData: null });
  }, [activeTabIndex, updateTabInfo]);

  const updateStorageData = useCallback(() => {
    const activeWebViewRef = webViewRefs.current[activeTabIndex];
    if (activeWebViewRef && activeWebViewRef.getStorageData) {
      activeWebViewRef.getStorageData();
    }
  }, [activeTabIndex, webViewRefs]);

  const takeScreenshot = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permission to save screenshots');
        return;
      }
      
      const uri = await ScreenCapture.captureAsync();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Screenshot saved', 'Screenshot has been saved to your gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to take screenshot');
      console.error('Screenshot error:', error);
    }
  }, []);

  // Handle desktop mode toggle with page reload
  const handleDesktopModeToggle = useCallback(() => {
    toggleDesktopMode();
    // Reload the current page after a short delay to apply new user agent
    setTimeout(() => {
      const webViewRef = webViewRefs.current[activeTabIndex];
      if (webViewRef && webViewRef.reload) {
        webViewRef.reload();
      }
    }, 100);
  }, [toggleDesktopMode, activeTabIndex, webViewRefs]);

  // Get safe area insets for status bar - must be before any conditional returns
  const insets = useSafeAreaInsets();
  const statusBarPadding = Platform.OS === 'android' ? Math.max(insets.top, RNStatusBar.currentHeight || 24) : insets.top;

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF', paddingTop: statusBarPadding }]}>
      {isFullscreen ? (
        <StatusBar hidden={true} />
      ) : (
        <CustomStatusBar isDarkMode={isDarkMode} />
      )}
      {!isFullscreen && (
        <>
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
            onFavoritesPress={() => setHistoryModalVisible(true)}
            isFavorite={favorites.includes(tabs[activeTabIndex]?.url)}
            onToggleFavorite={() => {
              const currentUrl = tabs[activeTabIndex]?.url;
              if (favorites.includes(currentUrl)) {
                removeFromFavorites(currentUrl);
              } else {
                addToFavorites(currentUrl);
              }
            }}
            onMenuPress={() => setBottomSheetVisible(true)}
            goBack={() => webViewRefs.current[activeTabIndex]?.goBack()}
            goForward={() => webViewRefs.current[activeTabIndex]?.goForward()}
            reload={() => webViewRefs.current[activeTabIndex]?.reload()}
            canGoBack={tabs[activeTabIndex]?.canGoBack || false}
            canGoForward={tabs[activeTabIndex]?.canGoForward || false}
          />
        </>
      )}
      <View style={{ flex: 1 }}>
        {tabs.map((tab, index) => (
          <View key={tab.id} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: tabs[activeTabIndex]?.isDevToolsVisible ? '45%' : 0,
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
              isSafeMode={isSafeMode}
              userAgent={currentUserAgent}
            />
          </View>
        ))}
      </View>
      <BottomNavigation
        isDarkMode={isDarkMode}
        isSafeMode={isSafeMode}
        onHomePress={goHome}
        onHomeLongPress={() => setShowHomePageModal(true)}
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
        onToggleErudaPress={toggleEruda}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        onAIPress={() => setIsAICommandVisible(true)}
      />
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleDesktopMode={handleDesktopModeToggle}
        isDesktopMode={isDesktopMode}
        shareUrl={() => shareUrl(tabs[activeTabIndex]?.url)}
        clearData={clearData}
        openHistory={() => setHistoryModalVisible(true)}
        openAboutModal={() => setAboutModalVisible(true)}
        openUserAgentSelector={() => setUserAgentSelectorVisible(true)}
        currentUrl={tabs[activeTabIndex]?.url || ''}
        isSafeMode={isSafeMode}
        toggleSafeMode={toggleSafeMode}
        webViewRef={webViewRefs.current[activeTabIndex]}
        currentUserAgent={currentUserAgent}
        onSelectUserAgent={setCurrentUserAgent}
        onOpenSettings={() => {
          setBottomSheetVisible(false);
          setSettingsVisible(true);
        }}
        onRefreshPress={() => webViewRefs.current[activeTabIndex]?.reload()}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        onGetSourcePress={getSourceHtml}
        onToggleErudaPress={toggleEruda}
      />
      {tabs[activeTabIndex] && (
        <>
          <DevTools
            isSafeMode={isSafeMode}
            toggleSafeMode={toggleSafeMode}
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
            activeTabIndex={activeTabIndex}
            updateTabInfo={updateTabInfo}
            webViewRef={webViewRefs.current[activeTabIndex]}
            onOpenAIWithContext={(contextType) => {
              const contextMap = {
                network: { network: true, networkFull: true },
                cookies: { cookies: true, localStorage: true },
                console: { console: true },
              };
              setAiInitialContext(contextMap[contextType] || {});
              setIsAICommandVisible(true);
            }}
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
    <HistoryFavoritesModal
  visible={isHistoryModalVisible}
  onClose={() => setHistoryModalVisible(false)}
  history={history}
  favorites={favorites}
  onSelectUrl={(selectedUrl) => {
    updateTabUrl(activeTabIndex, selectedUrl);
    setHistoryModalVisible(false);
  }}
  clearHistory={clearHistory}
  addToFavorites={addToFavorites}
  removeFromFavorites={removeFromFavorites}
  onHistoryUpdate={setHistory}
  isDarkMode={isDarkMode}
/>
      <AboutModal
        visible={isAboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        isDarkMode={isDarkMode}
      />
      <ScriptManager 
        visible={isScriptManagerVisible} 
        onClose={() => setScriptManagerVisible(false)} 
        scripts={scripts} 
        setScripts={setScripts} 
        injectScript={(code) => injectJavaScript(webViewRefs.current[activeTabIndex], code)} 
        currentUrl={tabs[activeTabIndex]?.url || ''}
        isDarkMode={isDarkMode}
      />
      <UserAgentSelector
        visible={isUserAgentSelectorVisible}
        onClose={() => setUserAgentSelectorVisible(false)}
        onSelectUserAgent={setCurrentUserAgent}
        currentUserAgent={currentUserAgent}
        isDarkMode={isDarkMode}
      />
      <SettingsScreen
        visible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
        isDarkMode={isDarkMode}
        onThemeChange={(newDarkMode) => {
          if (newDarkMode !== isDarkMode) {
            toggleDarkMode();
          }
        }}
      />

      {showHomePageModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.homeModalOverlay}>
            <View style={[styles.homeModal, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
              <Text style={[styles.homeModalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Set Home Page
              </Text>
              <TextInput
                style={[styles.homeInput, { 
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#444' : '#CCC',
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F8F8'
                }]}
                value={customHomePage}
                onChangeText={setCustomHomePage}
                placeholder="Enter home page URL"
                placeholderTextColor={isDarkMode ? '#888' : '#666'}
              />
              <View style={styles.homeModalButtons}>
                <TouchableOpacity 
                  style={[styles.homeModalButton, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]}
                  onPress={() => setShowHomePageModal(false)}
                >
                  <Text style={[styles.homeModalButtonText, { color: isDarkMode ? '#FFF' : '#000' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.homeModalButton, { backgroundColor: '#28A745' }]}
                  onPress={saveHomePage}
                >
                  <Text style={[styles.homeModalButtonText, { color: '#FFFFFF' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Safe Mode Toast */}
      {safeModeToast && (
        <Animated.View style={[styles.safeModeToast, {
          backgroundColor: isSafeMode ? '#FF9500' : '#34C759',
          opacity: safeModeToastAnim,
          transform: [{ translateY: safeModeToastAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
        }]}>
          <Text style={styles.safeModeToastIcon}>{isSafeMode ? '🛡️' : '✅'}</Text>
          <Text style={styles.safeModeToastText}>{safeModeToast}</Text>
        </Animated.View>
      )}

      {/* AI Command Interface */}
      <Modal
        visible={isAICommandVisible}
        animationType="slide"
        onRequestClose={() => setIsAICommandVisible(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <AICommandInterface
          visible={isAICommandVisible}
          onClose={() => { setIsAICommandVisible(false); setAiInitialContext(null); }}
          isDarkMode={isDarkMode}
          currentUrl={tabs[activeTabIndex]?.url || ''}
          consoleLogs={tabs[activeTabIndex]?.consoleOutput || []}
          networkLogs={tabs[activeTabIndex]?.networkLogs || []}
          storageData={tabs[activeTabIndex]?.storage || {}}
          performanceData={tabs[activeTabIndex]?.performanceMetrics || null}
          webViewRef={webViewRefs.current[activeTabIndex]}
          pageCacheData={pageCacheData}
          initialContext={aiInitialContext}
        />
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeModal: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
  },
  homeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  homeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  homeModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeModalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  homeModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  safeModeToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 10,
  },
  safeModeToastIcon: {
    fontSize: 18,
  },
  safeModeToastText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});

const App = () => {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;