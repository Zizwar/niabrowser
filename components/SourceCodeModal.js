import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';

const SourceCodeModal = ({ visible, onClose, sourceCode, isDarkMode }) => {
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#444444' : '#CCCCCC';
  const [useVirtualized, setUseVirtualized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCode, setDisplayCode] = useState('');

  useEffect(() => {
    if (visible && !sourceCode) {
      setIsLoading(true);
    } else if (sourceCode) {
      setIsLoading(false);
      setDisplayCode(sourceCode);
    }
  }, [visible, sourceCode]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(displayCode);
    Alert.alert('Copied', 'Source code copied to clipboard');
  };

  // Split source code into lines for virtualization
  const sourceLines = useMemo(() => {
    if (!displayCode) return [];
    const lines = displayCode.split('\n');
    
    // If more than 1000 lines, use virtualization
    if (lines.length > 1000) {
      setUseVirtualized(true);
      return lines.map((line, index) => ({ id: index, text: line }));
    }
    
    setUseVirtualized(false);
    return lines;
  }, [displayCode]);

  const renderLine = ({ item }) => (
    <Text style={[styles.codeText, { color: textColor }]}>
      {item.text}
    </Text>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerText, { color: textColor }]}>Source Code</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading source code...</Text>
          </View>
        ) : (
          <WebView 
            source={{ html: `
              <!DOCTYPE html>
              <html>
              <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDarkMode ? 'dark' : 'default'}.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
              </head>
              <body style="margin:0;padding:10px;background:${isDarkMode ? '#1e1e1e' : '#ffffff'};">
                <pre><code class="language-html">${displayCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                <script>hljs.highlightAll();</script>
              </body>
              </html>
            ` }}
            style={{ flex: 1 }}
          />
        )}
        {displayCode && (
          <TouchableOpacity 
            style={[styles.copyButton, { borderTopColor: borderColor }]} 
            onPress={copyToClipboard}
          >
            <Text style={[styles.copyButtonText, { color: textColor }]}>Copy to Clipboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  codeContainer: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  copyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
  },
  copyButtonText: {
    fontSize: 16,
  },
});

export default SourceCodeModal;