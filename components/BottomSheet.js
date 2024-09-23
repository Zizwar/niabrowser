// components/BottomSheet.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const BottomSheet = ({ 
  visible, 
  onClose, 
  isDarkMode, 
  toggleDarkMode,
  toggleDesktopMode,
  isDesktopMode,
  shareUrl,
  clearData,
  openHistory,
  openAboutModal,
  currentUrl
}) => {
  if (!visible) return null;

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const SettingItem = ({ icon, title, onPress, value }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Icon name={icon} type="material" color="#007AFF" size={24} />
      <Text style={[styles.settingText, { color: textColor }]}>{title}</Text>
      {value !== undefined && (
        <Text style={[styles.settingValue, { color: textColor }]}>{value ? 'On' : 'Off'}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView>
        <SettingItem icon="brightness-6" title="Dark Mode" onPress={toggleDarkMode} value={isDarkMode} />
        <SettingItem icon="desktop-windows" title="Desktop Mode" onPress={toggleDesktopMode} value={isDesktopMode} />
        <SettingItem icon="history" title="History" onPress={openHistory} />
        <SettingItem icon="share" title="Share" onPress={() => shareUrl(currentUrl)} />
        <SettingItem icon="delete" title="Clear Data" onPress={clearData} />
        <SettingItem icon="info" title="About" onPress={openAboutModal} />
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" type="material" color={textColor} size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default BottomSheet;