// components/BottomNavigation.js
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const BottomNavigation = ({ 
  isDarkMode, 
  onHomePress, 
  onHomeLongPress,
  onBackPress, 
  onForwardPress, 
  onRefreshPress, 
  onSettingsPress,
  onDevToolsPress,
  onCRUDPress,
  onScriptManagerPress,
  canGoBack,
  canGoForward,
  onGetSourcePress,
  onToggleErudaPress,
  onFullscreenToggle,
  isFullscreen
}) => {
  const [showAllButtons, setShowAllButtons] = useState(true);
  const iconColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F1F3F4' }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          <TouchableOpacity 
            onPress={onHomePress} 
            onLongPress={onHomeLongPress}
            style={styles.button}
          >
            <Icon name="home" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onFullscreenToggle} style={styles.button}>
            <Icon 
              name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
              type="material" 
              color={iconColor} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefreshPress} style={styles.button}>
            <Icon name="refresh" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleErudaPress} style={styles.button}>
            <Icon name="bug-report" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDevToolsPress} style={styles.button}>
            <Icon name="developer-mode" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCRUDPress} style={styles.button}>
            <Icon name="build" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onScriptManagerPress} style={styles.button}>
            <Icon name="extension" type="material" color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onGetSourcePress} style={styles.button}>
            <Icon name="code" type="material" color={iconColor} />
          </TouchableOpacity>
        </ScrollView>
      <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
        <Icon name="settings" type="material" color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  scrollView: {
    flex: 1,
  },
  button: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#CCCCCC',
  },
});

export default BottomNavigation;