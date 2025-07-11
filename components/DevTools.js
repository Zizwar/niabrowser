import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions, Switch, Alert, FlatList } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../constants/theme';
//import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DevTools = ({ 
  visible, 
  onClose, 
  networkLogs, 
  consoleOutput, 
  storage, 
  injectJavaScript, 
  isDarkMode, 
  onNetworkLogPress, 
  onNetworkLogLongPress, 
  performanceMetrics, 
  onOpenScriptManager,
  updateStorageData,
  isSafeMode,
  toggleSafeMode,
  activeTabIndex,
  updateTabInfo
}) => {
  const [activeTab, setActiveTab] = useState('network');
  const [injectionCode, setInjectionCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef(null);
  const [showSafeModeModal, setShowSafeModeModal] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState(['GET', 'POST', 'PUT', 'DELETE']);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const updatePerformanceMetrics = useCallback(() => {
    // This function would normally trigger a performance metrics update
    // For now, it's just a placeholder that ensures the component doesn't crash
  }, []);

  useEffect(() => {
    if (visible && activeTab === 'performance') {
      updatePerformanceMetrics();
    }
  }, [visible, activeTab, updatePerformanceMetrics]);

  useEffect(() => {
    if (showSafeModeModal) {
      const timer = setTimeout(() => {
        setShowSafeModeModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSafeModeModal]);

  const filterNetworkLogs = useCallback(() => {
    return networkLogs.filter(log => {
      if (!log || typeof log.url !== 'string') return false;
      const methodMatch = selectedMethods.includes(log.method);
      const urlMatch = log.url.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(log.status);
      return methodMatch && urlMatch && statusMatch;
    });
  }, [networkLogs, selectedMethods, searchQuery, selectedStatuses]);

  if (!visible) return null;

  const backgroundColor = isDarkMode ? theme.dark.background : theme.light.background;
  const textColor = isDarkMode ? theme.dark.text : theme.light.text;
  const cardColor = isDarkMode ? theme.dark.surface : theme.light.surface;
  
  const filteredNetworkLogs = filterNetworkLogs();

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Content copied to clipboard');
  };

  const formatApiName = (url, method) => {
    try {
      // Extract the last segment after the final /
      const urlParts = url.split('/');
      const lastSegment = urlParts[urlParts.length - 1];
      // If the last segment is empty (URL ends with /), use the second-to-last segment
      const apiName = lastSegment || urlParts[urlParts.length - 2] || 'api';
      return `${apiName} ${method.toUpperCase()}`;
    } catch (error) {
      return `${method.toUpperCase()} ${url}`;
    }
  };

  const clearNetworkLogs = () => {
    Alert.alert(
      'Clear Network Logs',
      'Are you sure you want to clear all network logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
          if (typeof updateTabInfo === 'function' && activeTabIndex !== undefined) {
            updateTabInfo(activeTabIndex, { networkLogs: [] });
            Alert.alert('Cleared', 'Network logs have been cleared');
          }
        }}
      ]
    );
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

const renderNetworkTab = () => (
  <>
    <View style={styles.searchContainer}>
      <TextInput
        style={[styles.searchInput, { color: textColor, borderColor: textColor }]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search URLs"
        placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
      />
      <TouchableOpacity onPress={clearNetworkLogs} style={styles.clearButton}>
        <Icon name="delete" type="material" color={textColor} />
      </TouchableOpacity>
    </View>
    
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
          <TouchableOpacity
            key={method}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedMethods.includes(method) ? getMethodColor(method) : 'transparent',
                borderColor: getMethodColor(method),
                borderWidth: 2
              }
            ]}
            onPress={() => {
              setSelectedMethods(prev => 
                prev.includes(method) 
                  ? prev.filter(m => m !== method)
                  : [...prev, method]
              );
            }}
          >
            <Text style={[
              styles.filterButtonText, 
              {
                color: selectedMethods.includes(method) ? '#FFFFFF' : getMethodColor(method),
                fontWeight: 'bold'
              }
            ]}>
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    <FlatList
      data={filteredNetworkLogs}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <TouchableOpacity 
          style={[styles.networkLogItem, { backgroundColor: index % 2 === 0 ? cardColor : backgroundColor }]}
          onPress={() => onNetworkLogPress(item)}
          onLongPress={() => onNetworkLogLongPress(item)}
          delayLongPress={500}
        >
          <View style={styles.networkLogHeader}>
            <View style={styles.methodContainer}>
              <Icon 
                name={getMethodIcon(item.method)} 
                type="material" 
                size={16} 
                color={getMethodColor(item.method)} 
              />
              <Text style={[styles.networkLogMethod, { color: getMethodColor(item.method) }]}>
                {item.method}
              </Text>
            </View>
            <Text style={[styles.networkLogUrl, { color: textColor }]} numberOfLines={1}>{item.url}</Text>
          </View>
          <View style={styles.networkLogDetails}>
            <Text style={[styles.networkLogStatus, { color: getStatusColor(item.status) }]}>Status: {item.status}</Text>
            <Text style={[styles.networkLogDuration, { color: textColor }]}>Duration: {item.duration}ms</Text>
          </View>
          {/* Add cookie information */}
          {(item.requestCookies || item.responseCookies) && (
            <View style={styles.cookieInfo}>
              {item.requestCookies && (
                <Text style={[styles.cookieText, { color: textColor }]}>Request Cookies: {item.requestCookies}</Text>
              )}
              {item.responseCookies && (
                <Text style={[styles.cookieText, { color: textColor }]}>Response Cookies: {item.responseCookies}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  </>
);
  const clearConsoleLogs = () => {
    Alert.alert(
      'Clear Console Logs',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
          if (typeof updateTabInfo === 'function' && activeTabIndex !== undefined) {
            updateTabInfo(activeTabIndex, { consoleOutput: [] });
            Alert.alert('Cleared', 'All console logs have been cleared');
          }
        }}
      ]
    );
  };

  const copyAllLogs = async () => {
    const allLogs = consoleOutput.map(log => `[${log.type}] ${log.message}`).join('\n');
    await Clipboard.setStringAsync(allLogs);
    Alert.alert('Copied', 'All logs have been copied');
  };

  const renderConsoleTab = () => (
    <View style={styles.consoleContainer}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={copyAllLogs} style={styles.clearButton}>
          <Icon name="content-copy" type="material" color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={clearConsoleLogs} style={styles.clearButton}>
          <Icon name="delete" type="material" color={textColor} />
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.consoleList}
        data={consoleOutput}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={[styles.consoleLog, getConsoleLogStyle(item.type, isDarkMode)]}>
            {item.message}
          </Text>
        )}
      />
    </View>
  );

  const renderStorageTab = () => (
    <>
      <Button
        title="Refresh Storage Data"
        onPress={updateStorageData}
        buttonStyle={[styles.button, { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
        titleStyle={{ color: textColor }}
      />
      <View style={styles.storageSection}>
        <Text style={[styles.storageTitle, { color: textColor }]}>Cookies:</Text>
        <TouchableOpacity onPress={() => copyToClipboard(storage.cookies)}>
          <Icon name="content-copy" type="material" color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => clearStorage('cookies')}>
          <Icon name="delete" type="material" color={textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.storageContent}>
        <Text style={{ color: textColor }}>{storage.cookies}</Text>
      </ScrollView>
      <View style={styles.storageSection}>
        <Text style={[styles.storageTitle, { color: textColor }]}>LocalStorage:</Text>
        <TouchableOpacity onPress={() => copyToClipboard(storage.localStorage)}>
          <Icon name="content-copy" type="material" color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => clearStorage('localStorage')}>
          <Icon name="delete" type="material" color={textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.storageContent}>
        <Text style={{ color: textColor }}>{storage.localStorage}</Text>
      </ScrollView>
    </>
  );

  const renderInjectTab = () => (
    <View style={styles.injectContainer}>
      <TextInput
        style={[styles.injectInput, { color: textColor, borderColor: textColor }]}
        value={injectionCode}
        onChangeText={setInjectionCode}
        placeholder="Enter JavaScript to inject"
        placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
        multiline
      />
      <TouchableOpacity
        style={[styles.injectButton, { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
        onPress={() => injectJavaScript(injectionCode)}
      >
        <Text style={{ color: textColor }}>Inject</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.scriptManagerButton, { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
        onPress={onOpenScriptManager}
      >
        <Text style={{ color: textColor }}>Script Manager</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPerformanceTab = () => (
    performanceMetrics && (
      <View style={styles.performanceContainer}>
        {Object.entries(performanceMetrics)
          .filter(([key, value]) => value > 0) // Filter out zero values
          .reverse() // Reverse order
          .map(([key, value]) => (
          <View key={key} style={styles.metricItem}>
            <Icon name={getMetricIcon(key)} type="material" color={textColor} size={24} />
            <Text style={[styles.metricLabel, { color: textColor }]}>{formatMetricLabel(key)}:</Text>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {typeof value === 'number' ? value.toFixed(2) : value}
              {typeof value === 'number' ? 'ms' : ''}
            </Text>
          </View>
        ))}
        
      </View>
    )
  );

  const renderSafeModeToggle = () => {
    return null; // Safe mode toggle removed
  };
  const renderSafeModeModal = () => (
    showSafeModeModal && (
      <View style={styles.safeModeModalContainer}>
        <View style={[styles.safeModeModal, { backgroundColor: cardColor }]}>
          <Icon name={isSafeMode ? "security" : "warning"} type="material" size={50} color={isSafeMode ? "#4CAF50" : "#FFC107"} />
          <Text style={[styles.safeModeModalText, { color: textColor }]}>
            {isSafeMode ? "Entering Safe Mode..." : "Exiting Safe Mode..."}
          </Text>
        </View>
      </View>
    )
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
      
      {renderSafeModeToggle()}
      
      <View style={styles.content}>
        {activeTab === 'Network' && renderNetworkTab()}
        {activeTab === 'Console' && renderConsoleTab()}
        {activeTab === 'Storage' && renderStorageTab()}
        {activeTab === 'Inject' && renderInjectTab()}
        {activeTab === 'Performance' && renderPerformanceTab()}
      </View>

      {renderSafeModeModal()}
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
  tabs: {
    flexDirection: 'row',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  clearButton: {
    padding: 10,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  networkLogItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  networkLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  networkLogMethod: {
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
  networkLogUrl: {
    flex: 1,
  },
  networkLogDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  networkLogStatus: {
    fontWeight: 'bold',
  },
  networkLogDuration: {
    fontStyle: 'italic',
  },
  consoleLog: {
    fontSize: 12,
    marginBottom: 5,
  },
  storageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  storageContent: {
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 5,
  },
  injectContainer: {
    marginBottom: 10,
  },
  injectInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  injectButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  scriptManagerButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  performanceContainer: {
    padding: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  safeModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  safeModeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  safeModeModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeModeModal: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  safeModeModalText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cookieInfo: {
    marginTop: 5,
  },
  cookieText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  consoleContainer: {
    flex: 1,
  },
  consoleList: {
    flex: 1,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const getMethodIcon = (method) => {
  switch (method) {
    case 'GET': return 'download';
    case 'POST': return 'upload';
    case 'PUT': return 'edit';
    case 'DELETE': return 'delete';
    default: return 'http';
  }
};

const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return '#28A745';      // أخضر قوي
    case 'POST': return '#007BFF';     // أزرق قوي
    case 'PUT': return '#FD7E14';      // برتقالي قوي
    case 'DELETE': return '#DC3545';   // أحمر قوي
    case 'PATCH': return '#6F42C1';    // بنفسجي
    case 'HEAD': return '#6C757D';     // رمادي
    case 'OPTIONS': return '#20C997';  // تركوازي
    default: return '#6C757D';         // رمادي افتراضي
  }
};

const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return '#4CAF50';
  if (status >= 300 && status < 400) return '#FFC107';
  if (status >= 400 && status < 500) return '#F44336';
  return '#9E9E9E';
};

const getConsoleLogStyle = (type, isDarkMode) => {
  const baseStyle = { color: isDarkMode ? '#FFFFFF' : '#000000' };
  switch(type) {
    case 'error': return { ...baseStyle, color: '#F44336' };
    case 'warn': return { ...baseStyle, color: '#FFC107' };
    case 'info': return { ...baseStyle, color: '#2196F3' };
    default: return baseStyle;
  }
};

const getMetricIcon = (key) => {
  switch (key) {
    case 'firstContentfulPaint':
      return 'brush';
    case 'largestContentfulPaint':
      return 'photo-size-select-actual';
    case 'firstInputDelay':
      return 'touch-app';
    case 'cumulativeLayoutShift':
      return 'swap-horiz';
    case 'timeToInteractive':
      return 'touch-app';
    case 'totalBlockingTime':
      return 'timer';
    default:
      return 'speed';
  }
};

const formatMetricLabel = (key) => {
  return key.split(/(?=[A-Z])/).join(' ');
};

const getPerformanceChartData = (performanceMetrics) => {
  return {
    labels: ["FCP", "LCP", "FID", "CLS", "TTI"],
    datasets: [
      {
        data: [
          performanceMetrics.firstContentfulPaint || 0,
          performanceMetrics.largestContentfulPaint || 0,
          performanceMetrics.firstInputDelay || 0,
          (performanceMetrics.cumulativeLayoutShift || 0) * 1000, // Convert to ms for visibility
          performanceMetrics.timeToInteractive || 0
        ]
      }
    ]
  };
};

export default DevTools;