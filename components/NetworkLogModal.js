import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import BaseModal from './ui/BaseModal';

const NetworkLogModal = ({ visible, onClose, log, isDarkMode, openInCrud }) => {
  if (!log) return null;

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const cardColor = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  const getStatusColor = (status) => {
    if (!status) return secondaryTextColor;
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 300 && status < 400) return '#FF9800';
    if (status >= 400) return '#F44336';
    return secondaryTextColor;
  };

  const renderSection = (title, content, icon) => (
    <View style={[styles.section, { backgroundColor: cardColor }]}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={20} color="#007AFF" />
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        <TouchableOpacity
          style={styles.copyIconButton}
          onPress={() => copyToClipboard(typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content))}
        >
          <MaterialIcons name="content-copy" size={18} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionContent, { color: textColor }]} selectable>
        {typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content || 'N/A')}
      </Text>
    </View>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Network Log Details"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Overview */}
        <View style={[styles.statusOverview, { backgroundColor: cardColor }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Method</Text>
              <Text style={[styles.statusValue, { color: textColor }]}>{log.method || 'GET'}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(log.status) }]}>
                {log.status || 'Pending'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Duration</Text>
              <Text style={[styles.statusValue, { color: textColor }]}>{log.duration || 0}ms</Text>
            </View>
          </View>
        </View>

        {renderSection('URL', log.url, 'link')}
        {renderSection('Request Headers', log.requestHeaders, 'upload')}
        {log.requestBody && renderSection('Request Body', log.requestBody, 'description')}
        {renderSection('Response Headers', log.responseHeaders, 'download')}
        {log.responseBody && renderSection('Response Body', log.responseBody, 'code')}
      </ScrollView>

      <TouchableOpacity
        style={styles.crudButton}
        onPress={() => openInCrud(log)}
      >
        <MaterialIcons name="edit" size={20} color="#FFFFFF" />
        <Text style={styles.crudButtonText}>Open in CRUD</Text>
      </TouchableOpacity>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  statusOverview: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  copyIconButton: {
    padding: 4,
  },
  sectionContent: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  crudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  crudButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkLogModal;
