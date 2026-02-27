import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, Alert, BackHandler, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

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
  currentUrl,
  isSafeMode,
  toggleSafeMode,
  openUserAgentSelector,
  webViewRef,
  currentUserAgent,
  onSelectUserAgent,
  onOpenSettings,
  onRefreshPress,
  onFullscreenToggle,
  isFullscreen,
  onGetSourcePress,
  onToggleErudaPress,
  onPrivateTab,
}) => {
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showUserAgentModal, setShowUserAgentModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  let insets = { bottom: 0 };
  try { insets = useSafeAreaInsets(); } catch {}
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#F5F5F5';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showDataModal) {
        setShowDataModal(false);
        return true;
      }
      if (showUserAgentModal) {
        setShowUserAgentModal(false);
        return true;
      }
      if (showClearDataModal) {
        setShowClearDataModal(false);
        return true;
      }
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, showDataModal, showUserAgentModal, showClearDataModal, onClose]);

  const clearBrowserData = async () => {
    if (webViewRef && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();
        true;
      `);
    }

    try {
      await AsyncStorage.removeItem('browserHistory');
      await AsyncStorage.removeItem('favorites');
    } catch (error) {
      console.error('Error clearing browser data:', error);
    }

    setShowClearDataModal(false);
    Alert.alert('Success', 'Browser data cleared successfully');
  };

  const clearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all app data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Data Cleared", "All app data has been cleared.");
              setShowClearDataModal(false);
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
            }
          }
        }
      ]
    );
  };

  const exportData = async (dataType) => {
    try {
      let dataToExport = {};

      switch (dataType) {
        case 'favorites':
          const favorites = await AsyncStorage.getItem('favorites');
          dataToExport = { favorites: favorites ? JSON.parse(favorites) : [] };
          break;
        case 'history':
          const history = await AsyncStorage.getItem('browserHistory');
          dataToExport = { history: history ? JSON.parse(history) : [] };
          break;
        case 'scripts':
          const scripts = await AsyncStorage.getItem('userScripts');
          dataToExport = { scripts: scripts ? JSON.parse(scripts) : [] };
          break;
        case 'all':
          const allKeys = await AsyncStorage.getAllKeys();
          const allData = await AsyncStorage.multiGet(allKeys);
          dataToExport = allData.reduce((acc, [key, value]) => {
            try {
              acc[key] = value ? JSON.parse(value) : null;
            } catch {
              acc[key] = value;
            }
            return acc;
          }, {});
          break;
      }

      const fileName = `niabrowser_${dataType}_${new Date().getTime()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToExport, null, 2));
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const importData = async (mergeOption) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importedData = JSON.parse(fileContent);

        if (mergeOption === 'replace') {
          await AsyncStorage.clear();
        }

        for (const [key, value] of Object.entries(importedData)) {
          if (mergeOption === 'merge' && (key === 'favorites' || key === 'browserHistory')) {
            const existing = await AsyncStorage.getItem(key);
            const existingData = existing ? JSON.parse(existing) : [];
            const merged = [...new Set([...existingData, ...(Array.isArray(value) ? value : [])])];
            await AsyncStorage.setItem(key, JSON.stringify(merged));
          } else {
            await AsyncStorage.setItem(key, JSON.stringify(value));
          }
        }

        Alert.alert('Import Successful', 'Data has been imported successfully');
        setShowDataModal(false);
      }
    } catch (error) {
      Alert.alert('Import Failed', error.message);
    }
  };

  const handleUserAgentSelect = (userAgent) => {
    if (onSelectUserAgent) {
      onSelectUserAgent(userAgent);
    }
    setShowUserAgentModal(false);
  };

  const userAgents = [
    { label: 'Default (Auto)', value: null, icon: 'refresh' },
    { label: 'Chrome Desktop', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', icon: 'computer' },
    { label: 'Chrome Mobile', value: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', icon: 'phone-android' },
    { label: 'Safari Desktop', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36', icon: 'laptop-mac' },
    { label: 'Safari iOS', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36', icon: 'phone-iphone' },
    { label: 'Edge Desktop', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0', icon: 'language' },
  ];

  const settingsData = [
    { icon: 'refresh', title: 'Reload Page', onPress: () => { onRefreshPress?.(); onClose(); } },
    { icon: isFullscreen ? 'fullscreen-exit' : 'fullscreen', title: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', onPress: () => { onFullscreenToggle?.(); onClose(); } },
    { icon: 'code', title: 'View Source', onPress: () => { onGetSourcePress?.(); onClose(); } },
    { icon: 'bug-report', title: 'Eruda Console', onPress: () => { onToggleErudaPress?.(); onClose(); } },
    { icon: 'computer', title: 'Desktop Mode', onPress: toggleDesktopMode, value: isDesktopMode },
    { icon: 'security', title: 'Safe Mode', onPress: toggleSafeMode, value: isSafeMode },
    { icon: 'visibility-off', title: 'Private Tab', onPress: () => { onPrivateTab?.(); onClose(); } },
    { icon: 'person', title: 'User Agent', onPress: () => setShowUserAgentModal(true) },
    { icon: 'history', title: 'History & Favorites', onPress: openHistory },
    { icon: 'share', title: 'Share Page', onPress: () => shareUrl(currentUrl) },
    { icon: 'folder', title: 'Data Management', onPress: () => setShowDataModal(true) },
    { icon: 'settings', title: 'Settings', onPress: onOpenSettings },
    { icon: 'info', title: 'About', onPress: openAboutModal },
  ];

  const renderSettingItem = (item, index) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.settingItem,
        { borderBottomColor: borderColor },
        index === settingsData.length - 1 && { borderBottomWidth: 0 }
      ]}
      onPress={item.onPress}
      disabled={item.value !== undefined}
    >
      <MaterialIcons name={item.icon} size={22} color="#007AFF" />
      <Text style={[styles.settingText, { color: textColor }]}>{item.title}</Text>
      {item.value !== undefined ? (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.value ? "#007AFF" : "#f4f3f4"}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={20} color={secondaryTextColor} />
      )}
    </TouchableOpacity>
  );

  const renderModalOption = (icon, text, onPress, isDestructive = false, isSelected = false) => (
    <TouchableOpacity
      key={text}
      style={[styles.modalOption, { borderBottomColor: borderColor }]}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={20} color={isDestructive ? '#F44336' : '#007AFF'} />
      <Text style={[styles.modalOptionText, { color: isDestructive ? '#F44336' : textColor }]}>
        {text}
      </Text>
      {isSelected && <MaterialIcons name="check" size={20} color="#4CAF50" />}
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlayBackground} activeOpacity={1} onPress={onClose} />

      <View style={[styles.container, { backgroundColor, paddingBottom: bottomInset }]}>
        {/* Header with title and close button */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Menu</Text>

          {/* Dark Mode Toggle in header */}
          <View style={styles.headerRight}>
            <View style={styles.darkModeToggle}>
              <MaterialIcons
                name={isDarkMode ? 'dark-mode' : 'light-mode'}
                size={20}
                color={isDarkMode ? '#FFC107' : '#FF9800'}
              />
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkMode ? "#007AFF" : "#f4f3f4"}
                style={styles.darkModeSwitch}
              />
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {settingsData.map((item, index) => renderSettingItem(item, index))}
        </ScrollView>
      </View>

      {/* Clear Data Modal */}
      {showClearDataModal && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowClearDataModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Clear Data</Text>
                <TouchableOpacity onPress={() => setShowClearDataModal(false)}>
                  <MaterialIcons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              {renderModalOption('language', 'Clear Browser Data', clearBrowserData)}
              {renderModalOption('delete-forever', 'Clear All Data', clearAllData, true)}

              <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={() => setShowClearDataModal(false)}>
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* User Agent Modal */}
      {showUserAgentModal && (
        <Modal transparent visible={true} animationType="fade" onRequestClose={() => setShowUserAgentModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Select User Agent</Text>
                <TouchableOpacity onPress={() => setShowUserAgentModal(false)}>
                  <MaterialIcons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {userAgents.map((ua, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.modalOption, { borderBottomColor: borderColor }]}
                    onPress={() => handleUserAgentSelect(ua.value)}
                  >
                    <MaterialIcons name={ua.icon} size={20} color="#007AFF" />
                    <Text style={[styles.modalOptionText, { color: textColor }]}>{ua.label}</Text>
                    {currentUserAgent === ua.value && (
                      <MaterialIcons name="check" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={() => setShowUserAgentModal(false)}>
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Data Management Modal */}
      {showDataModal && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowDataModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Data Management</Text>
                <TouchableOpacity onPress={() => setShowDataModal(false)}>
                  <MaterialIcons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {renderModalOption('upload', 'Export All Data', () => exportData('all'))}
                {renderModalOption('star', 'Export Favorites', () => exportData('favorites'))}
                {renderModalOption('history', 'Export History', () => exportData('history'))}
                {renderModalOption('code', 'Export Scripts', () => exportData('scripts'))}
                {renderModalOption('download', 'Import & Merge', () => importData('merge'))}
                {renderModalOption('sync', 'Import & Replace', () => importData('replace'))}
                {renderModalOption('delete', 'Clear Data', () => { setShowDataModal(false); setShowClearDataModal(true); }, true)}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={() => setShowDataModal(false)}>
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  darkModeSwitch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 15,
    flex: 1,
  },
  cancelButton: {
    margin: 16,
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BottomSheet;
