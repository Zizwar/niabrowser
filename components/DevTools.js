// components/DevTools.js
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

const DevTools = ({ visible, onClose, networkLogs, consoleOutput, storage, injectJavaScript, isDarkMode, onNetworkLogPress, onNetworkLogLongPress, performanceMetrics, onOpenScriptManager, }) => {
      
  const [activeTab, setActiveTab] = useState('network');
  const [injectionCode, setInjectionCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef(null);

  if (!visible) return null;

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#F1F3F4';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const filteredNetworkLogs = networkLogs.filter(log => { if (!log || typeof log.url !== 'string') return false; return log.url.toLowerCase().includes(searchQuery.toLowerCase()); });

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // You might want to show a toast or some feedback here
  };

  const clearStorage = (type) => {
    const script = type === 'cookies' 
      ? 'document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));'
      : 'localStorage.clear();';
    injectJavaScript(script);
  };

  const TabButton = ({ name, icon }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === name && styles.activeTab]}
      onPress={() => setActiveTab(name)}
    >
      <Icon name={icon} type="material" size={20} color={textColor} />
      <Text style={[styles.tabText, { color: textColor }]}>{name}</Text>
    </TouchableOpacity>
  );
  


  return (
    <View style={[styles.container, { backgroundColor }, { display: visible ? 'flex' : 'none' }]}>
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          <TabButton name="Network" icon="wifi" />
          <TabButton name="Console" icon="code" />
          <TabButton name="Storage" icon="storage" />
          <TabButton name="Inject" icon="input" />
          <TabButton name="Performance" icon="speed" />
        </ScrollView>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" type="material" color={textColor} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} ref={scrollViewRef}>
      {activeTab === 'Network' && (
  <>
    <TextInput
      style={[styles.searchInput, { color: textColor, borderColor: textColor }]}
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Search URLs"
      placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
    />
    {filteredNetworkLogs.map((log, index) => (
      <TouchableOpacity 
        key={index} 
        onPress={() => onNetworkLogPress(log)}
        onLongPress={() => onNetworkLogLongPress(log)}
        delayLongPress={500}
      >
        <Text style={{ color: textColor }}>
          {`${log.method || 'N/A'} ${log.url || 'Unknown URL'} - Status: ${log.status || 'N/A'}, Duration: ${log.duration || 'N/A'}ms`}
        </Text>
      </TouchableOpacity>
    ))}
  </>
)}
        {activeTab === 'Console' && (
          consoleOutput.map((log, index) => (
            <Text key={index} style={[styles.consoleLog, getConsoleLogStyle(log.type)]}>
              {log.message}
            </Text>
          ))
        )}
        {activeTab === 'Storage' && (
          <>
            <View style={styles.storageSection}>
              <Text style={[styles.storageTitle, { color: textColor }]}>Cookies:</Text>
              <TouchableOpacity onPress={() => copyToClipboard(storage.cookies)}>
                <Icon name="content-copy" type="material" color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => clearStorage('cookies')}>
                <Icon name="delete" type="material" color={textColor} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: textColor }}>{storage.cookies}</Text>
            <View style={styles.storageSection}>
              <Text style={[styles.storageTitle, { color: textColor }]}>LocalStorage:</Text>
              <TouchableOpacity onPress={() => copyToClipboard(storage.localStorage)}>
                <Icon name="content-copy" type="material" color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => clearStorage('localStorage')}>
                <Icon name="delete" type="material" color={textColor} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: textColor }}>{storage.localStorage}</Text>
          </>
        )}
        {activeTab === 'Inject' && (
          <>
          <Button
        title="Script Manager"
        onPress={onOpenScriptManager}
        
      />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textColor }]}
              value={injectionCode}
              onChangeText={setInjectionCode}
              placeholder="Enter JavaScript to inject"
              placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
              multiline
            />
            <TouchableOpacity
              style={styles.injectButton}
              onPress={() => injectJavaScript(injectionCode)}
            >
              <Text style={{ color: textColor }}>Inject</Text>
            </TouchableOpacity>
          </>
        )}
        {activeTab === 'Performance' && performanceMetrics && (
          <View>
            {Object.entries(performanceMetrics).map(([key, value]) => (
              <Text key={key} style={{ color: textColor }}>
                {`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
  },
  injectButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  storageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  consoleLog: {
    fontSize: 12,
    marginBottom: 5,
  },
});

const getConsoleLogStyle = (type) => {
  switch(type) {
    case 'error': return { color: 'red' };
    case 'warn': return { color: 'yellow' };
    case 'info': return { color: 'cyan' };
    default: return { color: 'white' };
  }
};

export default DevTools;