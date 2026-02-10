import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
  onOpenSettings
}) => {
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showUserAgentModal, setShowUserAgentModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#F5F5F5';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

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
          if (mergeOption === 'merge' && key === 'favorites') {
            const existing = await AsyncStorage.getItem(key);
            const existingData = existing ? JSON.parse(existing) : [];
            const merged = [...new Set([...existingData, ...value])];
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
    { icon: 'brightness-6', title: 'Dark Mode', onPress: toggleDarkMode, value: isDarkMode },
    { icon: 'computer', title: 'Desktop Mode', onPress: toggleDesktopMode, value: isDesktopMode },
    { icon: 'security', title: 'Safe Mode', onPress: toggleSafeMode, value: isSafeMode },
    { icon: 'person', title: 'User Agent', onPress: () => setShowUserAgentModal(true) },
    { icon: 'history', title: 'History', onPress: openHistory },
    { icon: 'share', title: 'Share', onPress: () => shareUrl(currentUrl) },
    { icon: 'folder', title: 'Data Management', onPress: () => setShowDataModal(true) },
    { icon: 'settings', title: 'Settings', onPress: onOpenSettings },
    { icon: 'info', title: 'About', onPress: openAboutModal },
  ];

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      onPress={item.onPress}
    >
      <MaterialIcons name={item.icon} size={22} color="#007AFF" />
      <Text style={[styles.settingText, { color: textColor }]}>{item.title}</Text>
      {item.value !== undefined && (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.value ? "#007AFF" : "#f4f3f4"}
        />
      )}
      {item.value === undefined && (
        <MaterialIcons name="chevron-right" size={20} color={secondaryTextColor} />
      )}
    </TouchableOpacity>
  ), [textColor, borderColor, secondaryTextColor]);

  const renderModalOption = (icon, text, onPress, isDestructive = false, isSelected = false) => (
    <TouchableOpacity style={[styles.modalOption, { borderBottomColor: borderColor }]} onPress={onPress}>
      <MaterialIcons name={icon} size={20} color={isDestructive ? '#F44336' : '#007AFF'} />
      <Text style={[styles.modalOptionText, { color: isDestructive ? '#F44336' : textColor }]}>
        {text}
      </Text>
      {isSelected && <MaterialIcons name="check" size={20} color="#4CAF50" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor, display: visible ? 'flex' : 'none' }]}>
      <FlatList
        data={settingsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={24} color={textColor} />
      </TouchableOpacity>

      {/* Clear Data Modal */}
      {showClearDataModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Clear Data</Text>

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
        <Modal transparent visible={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select User Agent</Text>

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

              <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={() => setShowUserAgentModal(false)}>
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Data Management Modal */}
      {showDataModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Data Management</Text>

              {renderModalOption('upload', 'Export All Data', () => exportData('all'))}
              {renderModalOption('star', 'Export Favorites', () => exportData('favorites'))}
              {renderModalOption('history', 'Export History', () => exportData('history'))}
              {renderModalOption('code', 'Export Scripts', () => exportData('scripts'))}
              {renderModalOption('download', 'Import & Merge', () => importData('merge'))}
              {renderModalOption('sync', 'Import & Replace', () => importData('replace'))}
              {renderModalOption('delete', 'Clear Data', () => { setShowDataModal(false); setShowClearDataModal(true); }, true)}

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
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
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
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
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
    marginTop: 12,
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
