// components/CrudModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CrudModal = ({ visible, onClose, isDarkMode, webViewRef, initialData }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('raw');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [activeView, setActiveView] = useState('request'); // request, collections, import
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const backgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
  const surfaceColor = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardColor = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const inputBg = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E0E0E0';
  const accentColor = '#007AFF';

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const bodyTypes = ['raw', 'form-data', 'x-www-form-urlencoded'];

  const methodColors = {
    GET: '#4CAF50', POST: '#2196F3', PUT: '#FF9800',
    DELETE: '#F44336', PATCH: '#9C27B0', HEAD: '#607D8B', OPTIONS: '#009688'
  };

  useEffect(() => {
    loadCollections();
    if (initialData) {
      setUrl(initialData.url || '');
      setMethod(initialData.method || 'GET');
      setHeaders(JSON.stringify(initialData.requestHeaders || {}, null, 2));
      setBody(initialData.requestBody || '');
      const contentType = initialData.requestHeaders?.['Content-Type'] || '';
      if (contentType.includes('x-www-form-urlencoded')) {
        setBodyType('x-www-form-urlencoded');
      } else if (contentType.includes('multipart/form-data')) {
        setBodyType('form-data');
      } else {
        setBodyType('raw');
      }
      setActiveView('request');
    }
  }, [initialData]);

  const loadCollections = async () => {
    try {
      const saved = await AsyncStorage.getItem('apiCollections');
      if (saved) setCollections(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading collections:', e);
    }
  };

  const saveCollections = async (cols) => {
    try {
      await AsyncStorage.setItem('apiCollections', JSON.stringify(cols));
      setCollections(cols);
    } catch (e) {
      console.error('Error saving collections:', e);
    }
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCol = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };
    saveCollections([...collections, newCol]);
    setNewCollectionName('');
  };

  const deleteCollection = (colId) => {
    Alert.alert('Delete Collection', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        saveCollections(collections.filter(c => c.id !== colId));
        if (selectedCollection?.id === colId) setSelectedCollection(null);
      }}
    ]);
  };

  const saveToCollection = (colId) => {
    const item = {
      id: Date.now().toString(),
      name: url.split('/').pop() || url,
      url, method, headers, body, bodyType,
      savedAt: new Date().toISOString(),
    };
    const updated = collections.map(c =>
      c.id === colId ? { ...c, items: [...c.items, item] } : c
    );
    saveCollections(updated);
    Alert.alert('Saved', 'Request saved to collection');
  };

  const deleteFromCollection = (colId, itemId) => {
    const updated = collections.map(c =>
      c.id === colId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    );
    saveCollections(updated);
  };

  const loadFromCollection = (item) => {
    setUrl(item.url);
    setMethod(item.method);
    setHeaders(item.headers);
    setBody(item.body);
    setBodyType(item.bodyType);
    setActiveView('request');
  };

  // Postman import
  const importPostmanCollection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);

      // Parse Postman v2.1 format
      if (data.info && data.item) {
        const colName = data.info.name || 'Imported Collection';
        const items = parsePostmanItems(data.item);
        const newCol = {
          id: Date.now().toString(),
          name: colName,
          items,
          createdAt: new Date().toISOString(),
          importedFrom: 'postman',
        };
        saveCollections([...collections, newCol]);
        Alert.alert('Import Successful', `Imported "${colName}" with ${items.length} requests`);
      }
      // Parse Postman v1 format
      else if (data.requests) {
        const items = data.requests.map(req => ({
          id: Date.now().toString() + Math.random(),
          name: req.name || req.url,
          url: req.url,
          method: req.method || 'GET',
          headers: JSON.stringify(req.headerData?.reduce((acc, h) => {
            if (h.key) acc[h.key] = h.value;
            return acc;
          }, {}) || {}, null, 2),
          body: req.rawModeData || req.data || '',
          bodyType: 'raw',
          savedAt: new Date().toISOString(),
        }));
        const newCol = {
          id: Date.now().toString(),
          name: data.name || 'Imported Collection',
          items,
          createdAt: new Date().toISOString(),
          importedFrom: 'postman',
        };
        saveCollections([...collections, newCol]);
        Alert.alert('Import Successful', `Imported ${items.length} requests`);
      }
      // Parse cURL
      else if (typeof content === 'string' && content.trim().startsWith('curl')) {
        const parsed = parseCurl(content.trim());
        if (parsed) {
          setUrl(parsed.url);
          setMethod(parsed.method);
          setHeaders(parsed.headers);
          setBody(parsed.body);
          setActiveView('request');
          Alert.alert('cURL Imported', 'Request loaded from cURL command');
        }
      } else {
        Alert.alert('Unsupported Format', 'Please import a Postman collection (v1 or v2.1) or cURL file');
      }
    } catch (e) {
      Alert.alert('Import Failed', e.message);
    }
  };

  const parsePostmanItems = (items, prefix = '') => {
    const result = [];
    items.forEach(item => {
      if (item.item) {
        // Folder - recurse
        result.push(...parsePostmanItems(item.item, item.name + '/'));
      } else if (item.request) {
        const req = item.request;
        const urlRaw = typeof req.url === 'string' ? req.url : (req.url?.raw || '');
        const headerObj = {};
        if (req.header) {
          req.header.forEach(h => { if (h.key) headerObj[h.key] = h.value; });
        }
        result.push({
          id: Date.now().toString() + Math.random(),
          name: prefix + (item.name || urlRaw),
          url: urlRaw,
          method: req.method || 'GET',
          headers: JSON.stringify(headerObj, null, 2),
          body: req.body?.raw || '',
          bodyType: req.body?.mode === 'urlencoded' ? 'x-www-form-urlencoded' :
                    req.body?.mode === 'formdata' ? 'form-data' : 'raw',
          savedAt: new Date().toISOString(),
        });
      }
    });
    return result;
  };

  const parseCurl = (curlStr) => {
    try {
      const urlMatch = curlStr.match(/curl\s+(?:-X\s+\w+\s+)?['"]?(https?:\/\/[^\s'"]+)['"]?/);
      const methodMatch = curlStr.match(/-X\s+(\w+)/);
      const headerMatches = [...curlStr.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
      const dataMatch = curlStr.match(/-d\s+['"]([^'"]+)['"]/);

      if (!urlMatch) return null;

      const headers = {};
      headerMatches.forEach(m => {
        const [key, ...valueParts] = m[1].split(':');
        if (key) headers[key.trim()] = valueParts.join(':').trim();
      });

      return {
        url: urlMatch[1],
        method: methodMatch ? methodMatch[1] : (dataMatch ? 'POST' : 'GET'),
        headers: JSON.stringify(headers, null, 2),
        body: dataMatch ? dataMatch[1] : '',
      };
    } catch {
      return null;
    }
  };

  // Export collection as Postman format
  const exportCollection = async (col) => {
    const postmanCollection = {
      info: {
        name: col.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: col.items.map(item => {
        let headerArr = [];
        try {
          const h = JSON.parse(item.headers || '{}');
          headerArr = Object.entries(h).map(([key, value]) => ({ key, value: String(value), type: 'text' }));
        } catch {}

        let urlParts = { raw: item.url };
        try {
          const u = new URL(item.url);
          urlParts = {
            raw: item.url,
            protocol: u.protocol.replace(':', ''),
            host: u.hostname.split('.'),
            path: u.pathname.split('/').filter(Boolean),
          };
        } catch {}

        const req = {
          name: item.name,
          request: {
            method: item.method,
            header: headerArr,
            url: urlParts,
          },
        };

        if (item.body && item.method !== 'GET') {
          req.request.body = { mode: 'raw', raw: item.body };
        }

        return req;
      }),
    };

    try {
      const fileName = `${col.name.replace(/\s+/g, '_')}_postman_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(postmanCollection, null, 2));
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const sendRequest = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      let requestOptions = {
        method,
        headers: headers ? JSON.parse(headers) : {},
      };

      if (method !== 'GET' && body) {
        if (bodyType === 'raw') {
          requestOptions.body = body;
        } else if (bodyType === 'form-data') {
          const formData = new FormData();
          const jsonBody = JSON.parse(body);
          Object.keys(jsonBody).forEach(key => formData.append(key, jsonBody[key]));
          requestOptions.body = formData;
        } else if (bodyType === 'x-www-form-urlencoded') {
          const params = new URLSearchParams();
          const jsonBody = JSON.parse(body);
          Object.keys(jsonBody).forEach(key => params.append(key, jsonBody[key]));
          requestOptions.body = params.toString();
          requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const res = await fetch(url, requestOptions);
      const responseHeaders = {};
      res.headers.forEach((value, key) => { responseHeaders[key] = value; });
      const responseText = await res.text();

      setResponse(JSON.stringify({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseText,
      }, null, 2));
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    await Clipboard.setStringAsync(response);
    Alert.alert('Copied', 'Response copied to clipboard');
  };

  // Generate cURL from current request
  const copyCurl = async () => {
    let curl = `curl -X ${method} '${url}'`;
    try {
      const h = JSON.parse(headers || '{}');
      Object.entries(h).forEach(([k, v]) => { curl += ` \\\n  -H '${k}: ${v}'`; });
    } catch {}
    if (body && method !== 'GET') curl += ` \\\n  -d '${body}'`;
    await Clipboard.setStringAsync(curl);
    Alert.alert('Copied', 'cURL command copied');
  };

  // Paste cURL
  const pasteCurl = async () => {
    const clip = await Clipboard.getStringAsync();
    if (clip && clip.trim().toLowerCase().startsWith('curl')) {
      const parsed = parseCurl(clip.trim());
      if (parsed) {
        setUrl(parsed.url);
        setMethod(parsed.method);
        setHeaders(parsed.headers);
        setBody(parsed.body);
        Alert.alert('Loaded', 'Request loaded from clipboard cURL');
      } else {
        Alert.alert('Error', 'Could not parse cURL command');
      }
    } else {
      Alert.alert('No cURL', 'Clipboard does not contain a cURL command');
    }
  };

  const renderRequestView = () => (
    <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
      {/* URL + Method Row */}
      <View style={[styles.urlRow, { borderColor }]}>
        <TouchableOpacity
          style={[styles.methodBadge, { backgroundColor: methodColors[method] || '#607D8B' }]}
          onPress={() => {
            const idx = methods.indexOf(method);
            setMethod(methods[(idx + 1) % methods.length]);
          }}
        >
          <Text style={styles.methodBadgeText}>{method}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.urlInput, { color: textColor }]}
          placeholder="Enter URL"
          placeholderTextColor={secondaryTextColor}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Headers */}
      <View style={[styles.fieldCard, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.fieldLabel, { color: secondaryTextColor }]}>HEADERS</Text>
        <TextInput
          style={[styles.fieldInput, { color: textColor, backgroundColor: inputBg }]}
          placeholder='{"Content-Type": "application/json"}'
          placeholderTextColor={isDarkMode ? '#555' : '#BBB'}
          value={headers}
          onChangeText={setHeaders}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Body */}
      {method !== 'GET' && (
        <View style={[styles.fieldCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.fieldHeaderRow}>
            <Text style={[styles.fieldLabel, { color: secondaryTextColor }]}>BODY</Text>
            <View style={styles.bodyTypeRow}>
              {bodyTypes.map(bt => (
                <TouchableOpacity
                  key={bt}
                  style={[styles.bodyTypeChip, bodyType === bt && { backgroundColor: accentColor }]}
                  onPress={() => setBodyType(bt)}
                >
                  <Text style={[styles.bodyTypeText, bodyType === bt && { color: '#FFF' }]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={[styles.fieldInput, styles.bodyInput, { color: textColor, backgroundColor: inputBg }]}
            placeholder="Request body"
            placeholderTextColor={isDarkMode ? '#555' : '#BBB'}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={5}
          />
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: accentColor }]} onPress={sendRequest} disabled={isLoading}>
          <MaterialIcons name="send" size={18} color="#FFF" />
          <Text style={styles.sendBtnText}>{isLoading ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: surfaceColor }]} onPress={copyCurl}>
          <MaterialIcons name="terminal" size={20} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: surfaceColor }]} onPress={pasteCurl}>
          <MaterialIcons name="content-paste" size={20} color={textColor} />
        </TouchableOpacity>
        {collections.length > 0 && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: surfaceColor }]}
            onPress={() => {
              Alert.alert('Save to Collection', 'Choose a collection',
                collections.map(c => ({ text: c.name, onPress: () => saveToCollection(c.id) }))
                  .concat([{ text: 'Cancel', style: 'cancel' }])
              );
            }}
          >
            <MaterialIcons name="library-add" size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && <ActivityIndicator size="large" color={accentColor} style={{ marginVertical: 16 }} />}

      {error ? (
        <View style={[styles.responseCard, { backgroundColor: '#FDE8E8', borderColor: '#F44336' }]}>
          <Text style={[styles.responseLabel, { color: '#F44336' }]}>ERROR</Text>
          <Text style={{ color: '#D32F2F' }}>{error}</Text>
        </View>
      ) : null}

      {response ? (
        <View style={[styles.responseCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.responseHeader}>
            <Text style={[styles.responseLabel, { color: secondaryTextColor }]}>RESPONSE</Text>
            <TouchableOpacity onPress={copyResponse}>
              <MaterialIcons name="content-copy" size={18} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.responseScroll, { backgroundColor: inputBg }]} nestedScrollEnabled>
            <Text style={[styles.responseText, { color: textColor }]} selectable>{response}</Text>
          </ScrollView>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderCollectionsView = () => (
    <ScrollView style={styles.content}>
      {/* Create new collection */}
      <View style={[styles.createColRow, { borderColor }]}>
        <TextInput
          style={[styles.colNameInput, { color: textColor, backgroundColor: inputBg }]}
          placeholder="New collection name..."
          placeholderTextColor={secondaryTextColor}
          value={newCollectionName}
          onChangeText={setNewCollectionName}
        />
        <TouchableOpacity style={[styles.createColBtn, { backgroundColor: accentColor }]} onPress={createCollection}>
          <MaterialIcons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="folder-open" size={48} color={secondaryTextColor} />
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>No collections yet</Text>
          <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
            Create a collection or import from Postman
          </Text>
        </View>
      ) : (
        collections.map(col => (
          <View key={col.id} style={[styles.collectionCard, { backgroundColor: cardColor, borderColor }]}>
            <TouchableOpacity
              style={styles.colHeader}
              onPress={() => setSelectedCollection(selectedCollection?.id === col.id ? null : col)}
            >
              <MaterialIcons
                name={selectedCollection?.id === col.id ? 'folder-open' : 'folder'}
                size={22}
                color={accentColor}
              />
              <View style={styles.colInfo}>
                <Text style={[styles.colName, { color: textColor }]}>{col.name}</Text>
                <Text style={[styles.colCount, { color: secondaryTextColor }]}>
                  {col.items.length} requests {col.importedFrom ? `(${col.importedFrom})` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => exportCollection(col)} style={styles.colAction}>
                <MaterialIcons name="file-download" size={20} color={secondaryTextColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCollection(col.id)} style={styles.colAction}>
                <MaterialIcons name="delete-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </TouchableOpacity>

            {selectedCollection?.id === col.id && (
              <View style={styles.colItems}>
                {col.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.colItem, { borderColor }]}
                    onPress={() => loadFromCollection(item)}
                  >
                    <Text style={[styles.colItemMethod, { color: methodColors[item.method] || '#607D8B' }]}>
                      {item.method}
                    </Text>
                    <Text style={[styles.colItemName, { color: textColor }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => deleteFromCollection(col.id, item.id)}>
                      <MaterialIcons name="close" size={16} color={secondaryTextColor} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>API Client</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={importPostmanCollection} style={styles.headerBtn}>
              <MaterialIcons name="file-upload" size={22} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <MaterialIcons name="close" size={22} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeView === 'request' && styles.tabItemActive]}
            onPress={() => setActiveView('request')}
          >
            <MaterialIcons name="send" size={18} color={activeView === 'request' ? accentColor : secondaryTextColor} />
            <Text style={[styles.tabText, { color: activeView === 'request' ? accentColor : secondaryTextColor }]}>
              Request
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeView === 'collections' && styles.tabItemActive]}
            onPress={() => setActiveView('collections')}
          >
            <MaterialIcons name="folder" size={18} color={activeView === 'collections' ? accentColor : secondaryTextColor} />
            <Text style={[styles.tabText, { color: activeView === 'collections' ? accentColor : secondaryTextColor }]}>
              Collections ({collections.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeView === 'request' ? renderRequestView() : renderCollectionsView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { padding: 4 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, fontWeight: '500' },
  content: { flex: 1, padding: 16 },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  methodBadge: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  urlInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, height: 46 },
  fieldCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldInput: {
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    fontFamily: 'monospace',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bodyInput: { minHeight: 100 },
  bodyTypeRow: { flexDirection: 'row', gap: 6 },
  bodyTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  bodyTypeText: { fontSize: 11, fontWeight: '500', color: '#888' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  sendBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  responseScroll: { maxHeight: 250, borderRadius: 8, padding: 10 },
  responseText: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  // Collections
  createColRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  colNameInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  createColBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 13 },
  collectionCard: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  colInfo: { flex: 1 },
  colName: { fontSize: 15, fontWeight: '600' },
  colCount: { fontSize: 12, marginTop: 2 },
  colAction: { padding: 4 },
  colItems: { borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' },
  colItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  colItemMethod: { fontSize: 11, fontWeight: '700', width: 50 },
  colItemName: { flex: 1, fontSize: 13 },
});

export default CrudModal;
