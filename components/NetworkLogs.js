// components/NetworkLogs.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const NetworkLogs = ({ logs, setSelectedLog, setActiveModal }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Network Logs:</Text>
    <ScrollView>
      {logs.map((log, index) => (
        <TouchableOpacity
          key={index}
          style={styles.logItem}
          onPress={() => {
            setSelectedLog(log);
            setActiveModal('logDetails');
          }}
        >
          <Text style={styles.logText}>{log.method} {log.url}</Text>
          <Text style={styles.logText}>Status: {log.status}, Duration: {log.duration}ms</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logText: {
    fontSize: 12,
  },
});

export default NetworkLogs;