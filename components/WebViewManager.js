import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebViewContainer from './WebViewContainer';

const WebViewManager = ({ 
  tabs, 
  activeTabIndex, 
  webViewRefs, 
  handleMessage, 
  isDarkMode, 
  isDesktopMode, 
  handleNavigationStateChange,
  runAutoScripts,
  addNewTab
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <View key={tab.id} style={[
          styles.webViewWrapper,
          { display: index === activeTabIndex ? 'flex' : 'none' }
        ]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

export default WebViewManager;