import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const SourceCodeModal = ({ visible, onClose, sourceCode, isDarkMode }) => {
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#444444' : '#CCCCCC';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(sourceCode);
    // You might want to show a toast or some feedback here
  };

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
        <ScrollView style={styles.codeContainer}>
          <Text style={[styles.codeText, { color: textColor }]}>{sourceCode}</Text>
        </ScrollView>
        <TouchableOpacity 
          style={[styles.copyButton, { borderTopColor: borderColor }]} 
          onPress={copyToClipboard}
        >
          <Text style={[styles.copyButtonText, { color: textColor }]}>Copy to Clipboard</Text>
        </TouchableOpacity>
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
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
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