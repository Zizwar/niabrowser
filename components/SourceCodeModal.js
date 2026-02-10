import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import BaseModal from './ui/BaseModal';

const SourceCodeModal = ({ visible, onClose, sourceCode, isDarkMode }) => {
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
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

  const headerActions = displayCode ? (
    <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
      <MaterialIcons name="content-copy" size={22} color={textColor} />
    </TouchableOpacity>
  ) : null;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Source Code"
      isDarkMode={isDarkMode}
      fullScreen={true}
      headerActions={headerActions}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
              Loading source code...
            </Text>
          </View>
        ) : (
          <WebView
            source={{
              html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDarkMode ? 'atom-one-dark' : 'atom-one-light'}.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
                <style>
                  body {
                    margin: 0;
                    padding: 12px;
                    background: ${isDarkMode ? '#1C1C1E' : '#FFFFFF'};
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                  }
                  pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                  }
                  code {
                    font-family: 'Monaco', 'Menlo', monospace;
                  }
                  .hljs {
                    background: transparent !important;
                    padding: 0 !important;
                  }
                </style>
              </head>
              <body>
                <pre><code class="language-html">${displayCode
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                }</code></pre>
                <script>hljs.highlightAll();</script>
              </body>
              </html>
            `
            }}
            style={{ flex: 1, backgroundColor }}
            showsVerticalScrollIndicator={true}
          />
        )}

        {displayCode && (
          <TouchableOpacity style={styles.bottomCopyButton} onPress={copyToClipboard}>
            <MaterialIcons name="content-copy" size={18} color="#FFFFFF" />
            <Text style={styles.bottomCopyButtonText}>Copy to Clipboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  copyButton: {
    padding: 4,
    marginRight: 8,
  },
  bottomCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  bottomCopyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SourceCodeModal;
