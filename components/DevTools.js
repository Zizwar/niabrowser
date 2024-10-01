import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions, Switch, Alert, FlatList } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';
import { LineChart } from 'react-native-chart-kit';

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
  toggleSafeMode
}) => {
  const [activeTab, setActiveTab] = useState('network');
  const [injectionCode, setInjectionCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef(null);
  const [showSafeModeModal, setShowSafeModeModal] = useState(false);

  useEffect(() => {
    if (visible && activeTab === 'performance') {
      updatePerformanceMetrics();
    }
  }, [visible, activeTab]);

  useEffect(() => {
    if (showSafeModeModal) {
      const timer = setTimeout(() => {
        setShowSafeModeModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSafeModeModal]);

  if (!visible) return null;

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#F1F3F4';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = isDarkMode ? '#2C2C2C' : '#FFFFFF';

  const filteredNetworkLogs = networkLogs.filter(log => 
    log && typeof log.url === 'string' && log.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Content copied to clipboard');
  };

  const clearNetworkLogs = () => {
    Alert.alert(
      'Clear Network Logs',
      'Are you sure you want to clear all network logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
          // Implement clear network logs functionality
          Alert.alert('Cleared', 'Network logs have been cleared');
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
              <Text style={[styles.networkLogMethod, { color: getMethodColor(item.method) }]}>{item.method}</Text>
              <Text style={[styles.networkLogUrl, { color: textColor }]} numberOfLines={1}>{item.url}</Text>
            </View>
            <View style={styles.networkLogDetails}>
              <Text style={[styles.networkLogStatus, { color: getStatusColor(item.status) }]}>Status: {item.status}</Text>
              <Text style={[styles.networkLogDuration, { color: textColor }]}>Duration: {item.duration}ms</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </>
  );

  const renderConsoleTab = () => (
    <FlatList
      data={consoleOutput}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Text style={[styles.consoleLog, getConsoleLogStyle(item.type, isDarkMode)]}>
          {item.message}
        </Text>
      )}
    />
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
        {Object.entries(performanceMetrics).map(([key, value]) => (
          <View key={key} style={styles.metricItem}>
            <Icon name={getMetricIcon(key)} type="material" color={textColor} size={24} />
            <Text style={[styles.metricLabel, { color: textColor }]}>{formatMetricLabel(key)}:</Text>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {typeof value === 'number' ? value.toFixed(2) : value}
              {typeof value === 'number' ? 'ms' : ''}
            </Text>
          </View>
        ))}
        <LineChart
          data={getPerformanceChartData(performanceMetrics)}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            decimalPlaces: 2,
            color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    )
  );

  const renderSafeModeToggle = () =>{
      if  (false)return null;
      return (
    <View style={styles.safeModeContainer}>
      <Text style={[styles.safeModeText, { color: textColor }]}>Safe Mode:</Text>
      <Switch
        value={isSafeMode}
        onValueChange={(value) => {
          setShowSafeModeModal(true);
          toggleSafeMode(value);
        }}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isSafeMode ? "#f5dd4b" : "#f4f3f4"}
      />
    </View>
  );
}
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
      
      <ScrollView style={styles.content} ref={scrollViewRef}>
        {activeTab === 'Network' && renderNetworkTab()}
        {activeTab === 'Console' && renderConsoleTab()}
        {activeTab === 'Storage' && renderStorageTab()}
        {activeTab === 'Inject' && renderInjectTab()}
        {activeTab === 'Performance' && renderPerformanceTab()}
      </ScrollView>

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
    marginRight: 10,
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
});

const getMethodColor = (method) => {
  switch (method) {
    case 'GET':
      return '#4CAF50';
    case 'POST':
      return '#2196F3';
    case 'PUT':
      return '#FFC107';
    case 'DELETE':
      return '#F44336';
    default:
      return '#9E9E9E';
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