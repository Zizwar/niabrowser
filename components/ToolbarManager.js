import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToolBar from './ToolBar';
import BottomNavigation from './BottomNavigation';

const ToolbarManager = ({ 
  activeTab,
  updateTabUrl,
  isDarkMode,
  addToHistory,
  setBottomSheetVisible,
  webViewRef,
  toggleDevTools,
  openCrudModal,
  setScriptManagerVisible,
  getSourceHtml,
  toggleEruda
}) => {
  return (
    <View style={styles.container}>
      <ToolBar 
        url={activeTab?.url || ''}
        setUrl={(newUrl) => updateTabUrl(newUrl)}
        isDarkMode={isDarkMode}
        textColor={isDarkMode ? '#FFFFFF' : '#000000'}
        addToHistory={addToHistory}
        onMenuPress={() => setBottomSheetVisible(true)}
        goBack={() => webViewRef?.goBack()}
        goForward={() => webViewRef?.goForward()}
        reload={() => webViewRef?.reload()}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
      />
      <BottomNavigation
        isDarkMode={isDarkMode}
        onHomePress={() => updateTabUrl('https://www.google.com')}
        onBackPress={() => webViewRef?.goBack()}
        onForwardPress={() => webViewRef?.goForward()}
        onRefreshPress={() => webViewRef?.reload()}
        onSettingsPress={() => setBottomSheetVisible(true)}
        onDevToolsPress={toggleDevTools}
        onCRUDPress={() => openCrudModal()}
        onScriptManagerPress={() => setScriptManagerVisible(true)}
        onErudaToggle={() => webViewRef?.toggleEruda()}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        onGetSourcePress={getSourceHtml}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1
  }
});

export default ToolbarManager;