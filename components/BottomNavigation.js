// components/BottomNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BottomNavigation = ({
  isDarkMode,
  isSafeMode,
  onHomePress,
  onHomeLongPress,
  onRefreshPress,
  onSettingsPress,
  onDevToolsPress,
  onCRUDPress,
  onScriptManagerPress,
  onGetSourcePress,
  onToggleErudaPress,
  onFullscreenToggle,
  isFullscreen,
  onAIPress,
}) => {
  const bg = isDarkMode ? '#1A1A1A' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2C2C2E' : '#E5E5E5';
  const iconColor = isDarkMode ? '#AAAAAA' : '#8E8E93';
  const labelColor = isDarkMode ? '#888888' : '#8E8E93';

  const NavItem = ({ icon, label, onPress, onLongPress, color, isAI }) => (
    <TouchableOpacity
      style={[styles.navItem, isAI && styles.aiNavItem]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
    >
      {isAI ? (
        <View style={[styles.aiIconWrap, isDarkMode && styles.aiIconWrapDark]}>
          <MaterialIcons name={icon} size={22} color="#FFFFFF" />
        </View>
      ) : (
        <MaterialIcons name={icon} size={22} color={color || iconColor} />
      )}
      <Text style={[styles.navLabel, { color: isAI ? '#007AFF' : labelColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg, borderTopColor: borderColor }]}>
      <NavItem icon="home" label="Home" onPress={onHomePress} onLongPress={onHomeLongPress} />
      {isSafeMode ? (
        <>
          <NavItem icon="refresh" label="Reload" onPress={onRefreshPress} />
          <View style={[styles.safeBadge, { backgroundColor: isDarkMode ? '#3C2800' : '#FFF3E0' }]}>
            <MaterialIcons name="shield" size={18} color="#FF9500" />
            <Text style={{ color: '#FF9500', fontSize: 10, fontWeight: '600' }}>Safe Mode</Text>
          </View>
          <NavItem icon="more-horiz" label="More" onPress={onSettingsPress} />
        </>
      ) : (
        <>
          <NavItem icon="psychology" label="AI" onPress={onAIPress} isAI />
          <NavItem icon="build" label="API" onPress={onCRUDPress} />
          <NavItem icon="developer-mode" label="DevTools" onPress={onDevToolsPress} />
          <NavItem icon="extension" label="Scripts" onPress={onScriptManagerPress} />
          <NavItem icon="more-horiz" label="More" onPress={onSettingsPress} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  aiNavItem: {
    position: 'relative',
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  aiIconWrapDark: {
    backgroundColor: '#0A84FF',
    shadowColor: '#0A84FF',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  safeBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
});

export default BottomNavigation;
