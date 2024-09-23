import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';

const NetworkLogModal = ({ visible, onClose, log, isDarkMode, openInCrud }) => {
  if (!log) return null;

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = isDarkMode ? '#2C2C2C' : '#F0F0F0';

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // You might want to show a toast or some feedback here
  };

  const renderSection = (title, content, icon) => (
    <View style={[styles.section, { backgroundColor: cardColor }]}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} type="material" color={textColor} size={24} />
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionContent, { color: textColor }]}>
        {typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
      </Text>
      <TouchableOpacity 
        style={styles.copyButton} 
        onPress={() => copyToClipboard(typeof content === 'object' ? JSON.stringify(content, null, 2) : content)}
      >
        <Icon name="content-copy" type="material" color={textColor} size={20} />
        <Text style={[styles.copyButtonText, { color: textColor }]}>Copy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: textColor }]}>Network Log Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" type="material" color={textColor} size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          {renderSection('URL', log.url, 'link')}
          {renderSection('Method', log.method, 'call')}
          {renderSection('Status', log.status, 'info')}
          {renderSection('Duration', `${log.duration}ms`, 'timer')}
          {renderSection('Request Headers', log.requestHeaders, 'send')}
          {renderSection('Request Body', log.requestBody, 'upload')}
          {renderSection('Response Headers', log.responseHeaders, 'receipt')}
          {renderSection('Response Body', log.responseBody, 'data-object')}
        </ScrollView>
        <TouchableOpacity 
          style={[styles.crudButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#2196F3' }]}
          onPress={() => openInCrud(log)}
        >
          <Icon name="edit" type="material" color="#FFFFFF" size={24} />
          <Text style={styles.crudButtonText}>Open in CRUD</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContent: {
    fontSize: 14,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  copyButtonText: {
    marginLeft: 5,
    fontSize: 14,
  },
  crudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  crudButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default NetworkLogModal;