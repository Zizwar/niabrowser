// components/BottomNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const BottomNavigation = ({ 
  isDarkMode, 
  onHomePress, 
  onBackPress, 
  onForwardPress, 
  onRefreshPress, 
  onSettingsPress,
  onDevToolsPress,
  onCRUDPress,
  onScriptManagerPress,
  canGoBack,
  canGoForward,
  onGetSourcePress
}) => {
  const iconColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F1F3F4' }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <TouchableOpacity onPress={onHomePress} style={styles.button}>
          <Icon name="home" type="material" color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackPress} style={styles.button} disabled={!canGoBack}>
          <Icon name="arrow-back" type="material" color={canGoBack ? iconColor : '#888888'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onForwardPress} style={styles.button} disabled={!canGoForward}>
          <Icon name="arrow-forward" type="material" color={canGoForward ? iconColor : '#888888'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefreshPress} style={styles.button}>
          <Icon name="refresh" type="material" color={iconColor} />
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