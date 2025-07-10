import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';

const UserAgentSelector = ({ visible, onClose, onSelectUserAgent, currentUserAgent, isDarkMode }) => {
  const [customUserAgent, setCustomUserAgent] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const userAgents = [
    {
      name: 'Default (Auto)',
      value: null,
      description: 'Uses system default based on desktop mode'
    },
    {
      name: 'Chrome Desktop',
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      description: 'Chrome on Windows'
    },
    {
      name: 'Chrome Mobile',
      value: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      description: 'Chrome on Android'
    },
    {
      name: 'Firefox Desktop',
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      description: 'Firefox on Windows'
    },
    {
      name: 'Safari Desktop',
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36',
      description: 'Safari on macOS'
    },
    {
      name: 'Safari Mobile',
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36',
      description: 'Safari on iOS'
    },
    {
      name: 'Edge Desktop',
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      description: 'Microsoft Edge'
    },
    {
      name: 'Opera Desktop',
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      description: 'Opera on Windows'
    }
  ];

  const handleSelectUserAgent = (userAgent) => {
    onSelectUserAgent(userAgent);
    onClose();
  };

  const handleCustomUserAgent = () => {
    if (customUserAgent.trim()) {
      handleSelectUserAgent(customUserAgent.trim());
      setCustomUserAgent('');
      setShowCustomInput(false);
    }
  };

  const renderUserAgentItem = (userAgent) => (
    <TouchableOpacity
      key={userAgent.name}
      style={[
        styles.userAgentItem,
        { backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' },
        currentUserAgent === userAgent.value && styles.selectedItem
      ]}
      onPress={() => handleSelectUserAgent(userAgent.value)}
    >
      <View style={styles.userAgentInfo}>
        <Text style={[styles.userAgentName, { color: textColor }]}>{userAgent.name}</Text>
        <Text style={[styles.userAgentDescription, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
          {userAgent.description}
        </Text>
      </View>
      {currentUserAgent === userAgent.value && (
        <Icon name="check" type="material" color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Select User Agent</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" type="material" color={textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {userAgents.map(userAgent => renderUserAgentItem(userAgent))}
            
            <TouchableOpacity
              style={[styles.customButton, { backgroundColor: isDarkMode ? '#3A3A3A' : '#E0E0E0' }]}
              onPress={() => setShowCustomInput(!showCustomInput)}
            >
              <Text style={[styles.customButtonText, { color: textColor }]}>
                {showCustomInput ? 'Hide' : 'Custom User Agent'}
              </Text>
            </TouchableOpacity>
            
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={[styles.customInput, { color: textColor, borderColor: isDarkMode ? '#666666' : '#CCCCCC' }]}
                  placeholder="Enter custom user agent..."
                  placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
                  value={customUserAgent}
                  onChangeText={setCustomUserAgent}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: isDarkMode ? '#4A4A4A' : '#E0E0E0' }]}
                  onPress={handleCustomUserAgent}
                >
                  <Text style={[styles.applyButtonText, { color: textColor }]}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  userAgentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  userAgentInfo: {
    flex: 1,
  },
  userAgentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userAgentDescription: {
    fontSize: 14,
  },
  customButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customInputContainer: {
    marginTop: 15,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  applyButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserAgentSelector;