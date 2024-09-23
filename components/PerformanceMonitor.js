// components/PerformanceMonitor.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PerformanceMonitor = ({ metrics, isDarkMode }) => {
  if (!metrics) return null;

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#F1F3F4';

  const formatTime = (time) => `${time.toFixed(2)}ms`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Performance Metrics</Text>
      <ScrollView>
        <MetricItem label="First Contentful Paint" value={formatTime(metrics.firstContentfulPaint)} color={textColor} />
        <MetricItem label="Largest Contentful Paint" value={formatTime(metrics.largestContentfulPaint)} color={textColor} />
        <MetricItem label="First Input Delay" value={formatTime(metrics.firstInputDelay)} color={textColor} />
        <MetricItem label="Cumulative Layout Shift" value={metrics.cumulativeLayoutShift.toFixed(3)} color={textColor} />
        <MetricItem label="Time to Interactive" value={formatTime(metrics.timeToInteractive)} color={textColor} />
        <MetricItem label="Total Blocking Time" value={formatTime(metrics.totalBlockingTime)} color={textColor} />
        <MetricItem label="DNS Lookup Time" value={formatTime(metrics.dnsLookupTime)} color={textColor} />
        <MetricItem label="TCP Connection Time" value={formatTime(metrics.tcpConnectionTime)} color={textColor} />
        <MetricItem label="TLS Negotiation Time" value={formatTime(metrics.tlsNegotiationTime)} color={textColor} />
        <MetricItem label="Server Response Time" value={formatTime(metrics.serverResponseTime)} color={textColor} />
        <MetricItem label="Page Load Time" value={formatTime(metrics.pageLoadTime)} color={textColor} />
        <MetricItem label="Dom Content Loaded" value={formatTime(metrics.domContentLoaded)} color={textColor} />
      </ScrollView>
    </View>
  );
};

const MetricItem = ({ label, value, color }) => (
  <View style={styles.metricItem}>
    <Text style={[styles.metricLabel, { color }]}>{label}:</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 200,
    right: 10,
    width: 250,
    maxHeight: 300,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PerformanceMonitor;