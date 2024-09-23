// components/ConsoleOutput.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ConsoleOutput = ({ output }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Console Output:</Text>
    <ScrollView>
      {output.map((log, index) => (
        <Text key={index} style={styles.logText}>{log}</Text>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ConsoleOutput;