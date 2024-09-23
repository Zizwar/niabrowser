// components/ModalManager.js
import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';

const ModalManager = ({ activeModal, setActiveModal, selectedLog, networkLogs, webViewRef }) => {
  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // You might want to show a toast or some feedback here
  };

  const renderLogDetails = () => (
    <ScrollView>
      <Text>URL: {selectedLog.url}</Text>
      <Text>Method: {selectedLog.method}</Text>
      <Text>Status: {selectedLog.status}</Text>
      <Text>Duration: {selectedLog.duration}ms</Text>
      <Text>Request Headers: {JSON.stringify(selectedLog.requestHeaders, null, 2)}</Text>
      <Text>Request Body: {selectedLog.requestBody || 'N/A'}</Text>
      <Text>Response Headers: {JSON.stringify(selectedLog.responseHeaders, null, 2)}</Text>
      <Text>Response Body: {selectedLog.responseBody || 'N/A'}</Text>
      <Text>Cookies in Header: {selectedLog.cookiesInHeader || 'N/A'}</Text>
    </ScrollView>
  );

  const renderCookies = () => (
    <ScrollView>
      <Text>{networkLogs[0]?.cookies || 'No cookies'}</Text>
      <Button title="Copy" onPress={() => copyToClipboard(networkLogs[0]?.cookies || '')} />
      <Button title="Clear Cookies" onPress={() => webViewRef.current.injectJavaScript('document.cookie = ""; true;')} />
    </ScrollView>
  );

  const renderLocalStorage = () => (
    <ScrollView>
      <Text>{networkLogs[0]?.localStorage || 'No local storage data'}</Text>
      <Button title="Copy" onPress={() => copyToClipboard(networkLogs[0]?.localStorage || '')} />
      <Button title="Clear LocalStorage" onPress={() => webViewRef.current.injectJavaScript('localStorage.clear(); true;')} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeModal) {
      case 'logDetails':
        return renderLogDetails();
      case 'cookies':
        return renderCookies();
      case 'localStorage':
        return renderLocalStorage();
      case 'clearLogs':
        return (
          <View>
            <Text>Are you sure you want to clear all logs?</Text>
            <Button title="Yes" onPress={() => {
              // Clear logs logic here
              setActiveModal(null);
            }} />
            <Button title="No" onPress={() => setActiveModal(null)} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={!!activeModal}
      onRequestClose={() => setActiveModal(null)}
      animationType="slide"
    >
      <View style={styles.container}>
        {renderContent()}
        <Button title="Close" onPress={() => setActiveModal(null)} />
      
 
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
});

export default ModalManager; 
      