import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Modal } from 'react-native';
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
  currentUrl,
  isSafeMode,
  toggleSafeMode,
  openUserAgentSelector
}) => {
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const clearBrowserData = () => {
    // Clear cookies and history logic here
    setShowClearDataModal(false);
    // Call the original clearData function or specific browser data clearing
    if (clearData) clearData();
  };

  const clearFavorites = () => {
    // Clear favorites logic here
    setShowClearDataModal(false);
    // Implementation for clearing favorites
  };

  const clearScripts = () => {
    // Clear scripts logic here
    setShowClearDataModal(false);
    // Implementation for clearing scripts
  };

  const clearAppStorage = () => {
    // Clear app storage logic here
    setShowClearDataModal(false);
    // Implementation for clearing app storage
  };

  const clearAllData = () => {
    // Clear all data logic here
    setShowClearDataModal(false);
    if (clearData) clearData();
  };

  const settingsData = [
    { icon: 'brightness-6', title: 'Dark Mode', onPress: toggleDarkMode, value: isDarkMode },
    { icon: 'desktop-windows', title: 'Desktop Mode', onPress: toggleDesktopMode, value: isDesktopMode },
    { icon: 'security', title: 'Safe Mode', onPress: toggleSafeMode, value: isSafeMode },
    { icon: 'person', title: 'User Agent', onPress: openUserAgentSelector },
    { icon: 'history', title: 'History', onPress: openHistory },
    { icon: 'share', title: 'Share', onPress: () => shareUrl(currentUrl) },
    { icon: 'delete', title: 'Clear Data', onPress: () => setShowClearDataModal(true) },
    { icon: 'info', title: 'About', onPress: openAboutModal },
  ];

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
      <Icon name={item.icon} type="material" color="#007AFF" size={24} />
      <Text style={[styles.settingText, { color: textColor }]}>{item.title}</Text>
      {item.value !== undefined && (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.value ? "#f5dd4b" : "#f4f3f4"}
        />
      )}
    </TouchableOpacity>
  ), [textColor]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={settingsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" type="material" color={textColor} size={24} />
      </TouchableOpacity>

      {showClearDataModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.clearDataModalOverlay}>
            <View style={[styles.clearDataModal, { backgroundColor }]}>
              <Text style={[styles.clearDataTitle, { color: textColor }]}>Clear Data Options</Text>
              
              <TouchableOpacity style={styles.clearOption} onPress={() => clearBrowserData()}>
                <Text style={[styles.clearOptionText, { color: textColor }]}>🌐 Clear Browser Data (Cookies, History)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearOption} onPress={() => clearFavorites()}>
                <Text style={[styles.clearOptionText, { color: textColor }]}>⭐ Clear Favorites</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearOption} onPress={() => clearScripts()}>
                <Text style={[styles.clearOptionText, { color: textColor }]}>📜 Clear Scripts</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearOption} onPress={() => clearAppStorage()}>
                <Text style={[styles.clearOptionText, { color: textColor }]}>📱 Clear App Storage</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearOption} onPress={() => clearAllData()}>
                <Text style={[styles.clearOptionText, { color: '#FF4444' }]}>🗑️ Clear All Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowClearDataModal(false)}>
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
  clearDataModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearDataModal: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
  },
  clearDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  clearOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BottomSheet;