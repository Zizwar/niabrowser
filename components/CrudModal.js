// components/CrudModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator, FlatList } from 'react-native';
import { Icon, Button, Divider, Overlay } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CrudModal = ({ visible, onClose, isDarkMode, webViewRef, initialData }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('raw');
  const [useWebView, setUseWebView] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedApis, setSavedApis] = useState([]);
  const [isSavedApisVisible, setIsSavedApisVisible] = useState(false);

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputBackgroundColor = isDarkMode ? '#2C2C2C' : '#F0F0F0';

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const bodyTypes = ['raw', 'form-data', 'x-www-form-urlencoded'];

  useEffect(() => {
    loadSavedApis();
    if (initialData) {
      setUrl(initialData.url || '');
      setMethod(initialData.method || 'GET');
      setHeaders(JSON.stringify(initialData.requestHeaders || {}, null, 2));
      setBody(initialData.requestBody || '');
      const contentType = initialData.requestHeaders?.['Content-Type'] || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        setBodyType('x-www-form-urlencoded');
      } else if (contentType.includes('multipart/form-data')) {
        setBodyType('form-data');
      } else {
        setBodyType('raw');
      }
    }
  }, [initialData]);

  const loadSavedApis = async () => {
    try {
      const savedApisString = await AsyncStorage.getItem('savedApis');
      if (savedApisString) {
        setSavedApis(JSON.parse(savedApisString));
      }
    } catch (error) {
      console.error('Error loading saved APIs:', error);
    }
  };

  const saveCurrentApi = async () => {
    try {
      const newApi = { url, method, headers, body, bodyType };
      const updatedApis = [...savedApis, newApi];
      await AsyncStorage.setItem('savedApis', JSON.stringify(updatedApis));
      setSavedApis(updatedApis);
      alert('API saved successfully!');
    } catch (error) {
      console.error('Error saving API:', error);
      alert('Failed to save API');
    }
  };

  const deleteApi = async (index) => {
    try {
      const updatedApis = savedApis.filter((_, i) => i !== index);
      await AsyncStorage.setItem('savedApis', JSON.stringify(updatedApis));
      setSavedApis(updatedApis);
    } catch (error) {
      console.error('Error deleting API:', error);
      alert('Failed to delete API');
    }
  };

  const loadApi = (api) => {
    setUrl(api.url);
    setMethod(api.method);
    setHeaders(api.headers);
    setBody(api.body);
    setBodyType(api.bodyType);
    setIsSavedApisVisible(false);
  };

  const sendRequest = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      let requestOptions = {
        method: method,
        headers: headers ? JSON.parse(headers) : {},
      };

      if (method !== 'GET' && body) {
        if (bodyType === 'raw') {
          requestOptions.body = body;
        } else if (bodyType === 'form-data') {
          const formData = new FormData();
          const jsonBody = JSON.parse(body);
          Object.keys(jsonBody).forEach(key => {
            formData.append(key, jsonBody[key]);
          });
          requestOptions.body = formData;
        } else if (bodyType === 'x-www-form-urlencoded') {
          const params = new URLSearchParams();
          const jsonBody = JSON.parse(body);
          Object.keys(jsonBody).forEach(key => {
            params.append(key, jsonBody[key]);
          });
          requestOptions.body = params.toString();
          requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      if (useWebView) {
        const script = `
          fetch('${url}', ${JSON.stringify(requestOptions)})
            .then(response => response.text())
            .then(data => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'crudResponse',
                data: data
              }));
            })
            .catch(error => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'crudResponse',
                error: error.toString()
              }));
            });
        `;
        webViewRef.current.injectJavaScript(script);
      } else {
        const response = await fetch(url, requestOptions);
        const data = await response.text();
        setResponse(data);
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    await Clipboard.setStringAsync(response);
    alert('Response copied to clipboard');
  };

  const renderSavedApiItem = ({ item, index }) => (
    <View style={styles.savedApiItem}>
      <TouchableOpacity onPress={() => loadApi(item)} style={styles.savedApiInfo}>
        <Text style={[styles.savedApiMethod, { color: textColor }]}>{item.method}</Text>
        <Text style={[styles.savedApiUrl, { color: textColor }]} numberOfLines={1}>{item.url}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteApi(index)}>
        <Icon name="delete" type="material" color={textColor} size={24} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: textColor }]}>CRUD Operations</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={saveCurrentApi} style={styles.headerButton}>
              <Icon name="save" type="material" color={textColor} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSavedApisVisible(true)} style={styles.headerButton}>
              <Icon name="folder" type="material" color={textColor} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Icon name="close" type="material" color={textColor} size={24} />
            </TouchableOpacity>
          </View>
        </View>
 <ScrollView style={styles.content}>
  <View style={styles.inputContainer}>
    <Icon name="link" type="material" color={textColor} size={24} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { color: textColor, backgroundColor: inputBackgroundColor }]}
      placeholder="Enter URL"
      placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
      value={url}
      onChangeText={setUrl}
    />
  </View>
  
  <View style={styles.pickerContainer}>
    <Icon name="http" type="material" color={textColor} size={24} style={styles.pickerIcon} />
    <Picker
      selectedValue={method}
      onValueChange={(itemValue) => setMethod(itemValue)}
      style={[styles.picker, { color: textColor }]}
      dropdownIconColor={textColor}
    >
      {methods.map((m) => (
        <Picker.Item key={m} label={m} value={m} />
      ))}
    </Picker>
  </View>
  
  <View style={styles.inputContainer}>
    <Icon name="list" type="material" color={textColor} size={24} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { color: textColor, backgroundColor: inputBackgroundColor }]}
      placeholder="Headers (JSON format)"
      placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
      value={headers}
      onChangeText={setHeaders}
      multiline
    />
  </View>
  
  {method !== 'GET' && (
    <>
      <View style={styles.pickerContainer}>
        <Icon name="data-object" type="material" color={textColor} size={24} style={styles.pickerIcon} />
        <Picker
          selectedValue={bodyType}
          onValueChange={(itemValue) => setBodyType(itemValue)}
          style={[styles.picker, { color: textColor }]}
          dropdownIconColor={textColor}
        >
          {bodyTypes.map((bt) => (
            <Picker.Item key={bt} label={bt} value={bt} />
          ))}
        </Picker>
      </View>
      <View style={styles.inputContainer}>
        <Icon name="code" type="material" color={textColor} size={24} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.bodyInput, { color: textColor, backgroundColor: inputBackgroundColor }]}
          placeholder="Body"
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
          value={body}
          onChangeText={setBody}
          multiline
        />
      </View>
    </>
  )}

  <View style={styles.switchContainer}>
    <Text style={{ color: textColor }}>Use WebView:</Text>
    <Switch
      value={useWebView}
      onValueChange={setUseWebView}
      trackColor={{ false: "#767577", true: "#81b0ff" }}
      thumbColor={useWebView ? "#f5dd4b" : "#f4f3f4"}
    />
  </View>

  <Button
    title={isLoading ? "Sending..." : "Send Request"}
    icon={<Icon name="send" type="material" color="white" size={20} style={{ marginRight: 10 }} />}
    onPress={sendRequest}
    containerStyle={styles.buttonContainer}
    buttonStyle={styles.sendButton}
    disabled={isLoading}
  />

  {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

  {error && (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorTitle, { color: 'red' }]}>Error:</Text>
      <Text style={{ color: 'red' }}>{error}</Text>
    </View>
  )}

  {response && (
    <View style={styles.responseContainer}>
      <Text style={[styles.responseTitle, { color: textColor }]}>Response:</Text>
      <ScrollView style={[styles.responseScroll, { backgroundColor: inputBackgroundColor }]}>
        <Text style={{ color: textColor }}>{response}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.copyButton} onPress={copyResponse}>
        <Icon name="content-copy" type="material" color={textColor} size={20} />
        <Text style={[styles.copyButtonText, { color: textColor }]}>Copy Response</Text>
      </TouchableOpacity>
    </View>
  )}
</ScrollView>
      </View>
      
      <Overlay
        isVisible={isSavedApisVisible}
        onBackdropPress={() => setIsSavedApisVisible(false)}
        overlayStyle={[styles.savedApisOverlay, { backgroundColor }]}
      >
        <Text style={[styles.savedApisTitle, { color: textColor }]}>Saved APIs</Text>
        <FlatList
          data={savedApis}
          renderItem={renderSavedApiItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.savedApisList}
        />
        <Button
          title="Close"
          onPress={() => setIsSavedApisVisible(false)}
          buttonStyle={[styles.closeButton, { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
          titleStyle={{ color: textColor }}
        />
      </Overlay>
    </Modal>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  bodyInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 10,
  },
  responseContainer: {
    marginTop: 20,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseScroll: {
    maxHeight: 200,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 10,
  },
  copyButtonText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFEEEE',
    borderRadius: 5,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  savedApisOverlay: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  savedApisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  savedApisList: {
    maxHeight: '80%',
  },
  savedApiItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  savedApiInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedApiMethod: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  savedApiUrl: {
    flex: 1,
  },
  closeButton: {
    marginTop: 15,
  },
});

export default CrudModal;;