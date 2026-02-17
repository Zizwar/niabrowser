import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import BaseModal from './ui/BaseModal';

const NetworkLogModal = ({ visible, onClose, log, isDarkMode, openInCrud, onSaveToCollection }) => {
  const [expandedSections, setExpandedSections] = useState({});

  if (!log) return null;

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const cardColor = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const accentColor = '#007AFF';

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const getStatusColor = (status) => {
    if (!status) return secondaryTextColor;
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 300 && status < 400) return '#FF9800';
    if (status >= 400) return '#F44336';
    return secondaryTextColor;
  };

  // Generate cURL command from network log
  const generateCurl = () => {
    let curl = `curl -X ${log.method || 'GET'} '${log.url}'`;

    if (log.requestHeaders && typeof log.requestHeaders === 'object') {
      Object.entries(log.requestHeaders).forEach(([key, value]) => {
        curl += ` \\\n  -H '${key}: ${value}'`;
      });
    }

    if (log.requestBody) {
      const body = typeof log.requestBody === 'object'
        ? JSON.stringify(log.requestBody)
        : log.requestBody;
      curl += ` \\\n  -d '${body}'`;
    }

    return curl;
  };

  // Generate Postman collection item
  const generatePostmanItem = () => {
    const headers = [];
    if (log.requestHeaders && typeof log.requestHeaders === 'object') {
      Object.entries(log.requestHeaders).forEach(([key, value]) => {
        headers.push({ key, value: String(value), type: 'text' });
      });
    }

    let urlParts = {};
    try {
      const urlObj = new URL(log.url);
      urlParts = {
        raw: log.url,
        protocol: urlObj.protocol.replace(':', ''),
        host: urlObj.hostname.split('.'),
        port: urlObj.port || '',
        path: urlObj.pathname.split('/').filter(Boolean),
        query: Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({ key, value })),
      };
    } catch {
      urlParts = { raw: log.url };
    }

    const item = {
      name: log.url.split('/').pop() || log.url,
      request: {
        method: log.method || 'GET',
        header: headers,
        url: urlParts,
      },
    };

    if (log.requestBody && log.method !== 'GET') {
      item.request.body = {
        mode: 'raw',
        raw: typeof log.requestBody === 'object'
          ? JSON.stringify(log.requestBody, null, 2)
          : log.requestBody,
        options: {
          raw: { language: 'json' },
        },
      };
    }

    return item;
  };

  // Export single request as Postman collection
  const exportAsPostman = async () => {
    const item = generatePostmanItem();
    const collection = {
      info: {
        name: `NiaBrowser Export - ${new Date().toLocaleDateString()}`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [item],
    };

    try {
      const fileName = `niabrowser_postman_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(collection, null, 2));
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Postman Collection',
      });
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  // Copy full network log as JSON
  const copyFullLog = async () => {
    const fullLog = {
      url: log.url,
      method: log.method,
      status: log.status,
      duration: log.duration,
      requestHeaders: log.requestHeaders,
      requestBody: log.requestBody,
      responseHeaders: log.responseHeaders,
      responseBody: log.responseBody,
      requestCookies: log.requestCookies,
      responseCookies: log.responseCookies,
    };
    await copyToClipboard(JSON.stringify(fullLog, null, 2));
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (title, content, icon, key) => {
    const isExpanded = expandedSections[key] !== false; // default expanded
    const displayContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content || 'N/A');

    return (
      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(key)}>
          <MaterialIcons name={icon} size={18} color={accentColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
          <TouchableOpacity
            style={styles.copyIconButton}
            onPress={() => copyToClipboard(displayContent)}
          >
            <MaterialIcons name="content-copy" size={16} color={secondaryTextColor} />
          </TouchableOpacity>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={20}
            color={secondaryTextColor}
          />
        </TouchableOpacity>
        {isExpanded && (
          <Text style={[styles.sectionContent, { color: textColor }]} selectable>
            {displayContent}
          </Text>
        )}
      </View>
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Request Details"
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

        {renderSection('URL', log.url, 'link', 'url')}
        {renderSection('Request Headers', log.requestHeaders, 'upload', 'reqHeaders')}
        {log.requestBody && renderSection('Request Body', log.requestBody, 'description', 'reqBody')}
        {renderSection('Response Headers', log.responseHeaders, 'download', 'resHeaders')}
        {log.responseBody && renderSection('Response Body', log.responseBody, 'code', 'resBody')}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#007AFF' }]} onPress={() => openInCrud(log)}>
            <MaterialIcons name="send" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>CRUD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6B35' }]} onPress={() => copyToClipboard(generateCurl())}>
            <MaterialIcons name="terminal" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>cURL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6C37' }]} onPress={exportAsPostman}>
            <MaterialIcons name="file-download" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Postman</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={copyFullLog}>
            <MaterialIcons name="data-object" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>JSON</Text>
          </TouchableOpacity>

          {onSaveToCollection && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#9C27B0' }]} onPress={() => onSaveToCollection(log)}>
              <MaterialIcons name="library-add" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 12,
  },
  statusOverview: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
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
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  copyIconButton: {
    padding: 4,
  },
  sectionContent: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    marginTop: 8,
  },
  actionsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  actionsScroll: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default NetworkLogModal;
