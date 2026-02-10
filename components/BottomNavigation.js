// components/BottomNavigation.js
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  isFullscreen,
  onAIPress, // New prop for AI button
}) => {
  const iconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const disabledColor = isDarkMode ? '#555555' : '#CCCCCC';
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const borderColor = isDarkMode ? '#333333' : '#E0E0E0';

  const NavButton = ({ name, onPress, onLongPress, color, disabled, badge }) => (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.button, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <MaterialIcons name={name} size={24} color={disabled ? disabledColor : (color || iconColor)} />
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <NavButton name="home" onPress={onHomePress} onLongPress={onHomeLongPress} />
        <NavButton
          name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
          onPress={onFullscreenToggle}
        />
        <NavButton name="refresh" onPress={onRefreshPress} />
        <NavButton name="bug-report" onPress={onToggleErudaPress} />
        <NavButton name="developer-mode" onPress={onDevToolsPress} />
        <NavButton name="build" onPress={onCRUDPress} />
        <NavButton name="extension" onPress={onScriptManagerPress} />
        <NavButton name="code" onPress={onGetSourcePress} />
      </ScrollView>

      {/* AI Button - Highlighted */}
      <TouchableOpacity
        onPress={onAIPress}
        style={[styles.aiButton, isDarkMode && styles.aiButtonDark]}
      >
        <MaterialIcons name="psychology" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        onPress={onSettingsPress}
        style={[styles.settingsButton, { borderLeftColor: borderColor }]}
      >
        <MaterialIcons name="more-vert" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 52,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  button: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F44336',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  aiButtonDark: {
    backgroundColor: '#0A84FF',
    shadowColor: '#0A84FF',
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
  },
});

export default BottomNavigation;
