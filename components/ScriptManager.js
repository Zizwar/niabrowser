import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';
import { createGreasemonkeyEnvironment, parseMetadata } from './GreasemonkeyWrapper';

const ScriptManager = ({ visible, onClose, injectScript, currentUrl, isDarkMode }) => {
  const [scripts, setScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState({
    name: '',
    code: '',
    urls: '',
    isEnabled: true,
    At: 'document-idle',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadScripts();
  }, []);

  useEffect(() => {
    if (currentUrl) {
      runAutoScripts(currentUrl);
    }
  }, [currentUrl]);

  const loadScripts = async () => {
    try {
      const savedScripts = await AsyncStorage.getItem('customScripts');
      if (savedScripts) {
        setScripts(JSON.parse(savedScripts));
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const saveScripts = async (updatedScripts) => {
    try {
      await AsyncStorage.setItem('customScripts', JSON.stringify(updatedScripts));
      setScripts(updatedScripts);
    } catch (error) {
      console.error('Error saving scripts:', error);
    }
  };

  const addOrUpdateScript = () => {
    if (currentScript.name && currentScript.code) {
      const metadata = parseMetadata(currentScript.code);
      const updatedScript = { ...currentScript, metadata };
      const updatedScripts = isEditMode
        ? scripts.map(s => s.name === currentScript.name ? updatedScript : s)
        : [...scripts, updatedScript];
      saveScripts(updatedScripts);
      setCurrentScript({ name: '', code: '', urls: '', isEnabled: true, runAt: 'document-idle' });
      setIsEditMode(false);
    }
  };

  const editScript = (script) => {
    setCurrentScript(script);
    setIsEditMode(true);
  };

  const deleteScript = (scriptName) => {
    Alert.alert(
      "Delete Script",
      `Are you sure you want to delete "${scriptName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          const updatedScripts = scripts.filter(s => s.name !== scriptName);
          saveScripts(updatedScripts);
        }}
      ]
    );
  };

  const toggleScript = (scriptName) => {
    const updatedScripts = scripts.map(s =>
      s.name === scriptName ? { ...s, isEnabled: !s.isEnabled } : s
    );
    saveScripts(updatedScripts);
  };

  const runScript = (script) => {
  if (script.isEnabled && shouldRunOnCurrentUrl(script.urls, currentUrl)) {
    const metadata = parseMetadata(script.code);
    const wrappedScript = createGreasemonkeyEnvironment(script.code, metadata);
    injectScript(wrappedScript);
  }
};

  const runAutoScripts = (url) => {
    scripts.forEach(script => {
      if (script.isEnabled && script.runAt === 'document-idle' && shouldRunOnCurrentUrl(script.urls, url)) {
        const wrappedScript = createGreasemonkeyEnvironment(script.code, script.metadata);
        injectScript(wrappedScript);
      }
    });
  };

  const shouldRunOnCurrentUrl = (scriptUrls, currentUrl) => {
    if (!scriptUrls) return true;
    const urlPatterns = scriptUrls.split(',').map(u => u.trim());
    return urlPatterns.some(pattern => {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        const regex = new RegExp(pattern.slice(1, -1));
        return regex.test(currentUrl);
      } else {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(currentUrl);
      }
    });
  };


  const renderScriptItem = ({ item }) => (
    <View style={styles.scriptItem}>
      <View style={styles.scriptHeader}>
        <Text style={styles.scriptName}>{item.name}</Text>
        <Switch
          value={item.isEnabled}
          onValueChange={() => toggleScript(item.name)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.isEnabled ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <Text style={styles.scriptUrls}>URLs: {item.urls || 'All'}</Text>
      <Text style={styles.scriptRunAt}>Run at: {item.runAt}</Text>
      <View style={styles.scriptActions}>
        <TouchableOpacity onPress={() => runScript(item)} style={styles.actionButton}>
          <Icon name="play" type="font-awesome" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => editScript(item)} style={styles.actionButton}>
          <Icon name="edit" type="font-awesome" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteScript(item.name)} style={styles.actionButton}>
          <Icon name="trash" type="font-awesome" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Script Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" type="font-awesome" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Script Name"
          value={currentScript.name}
          onChangeText={(text) => setCurrentScript({ ...currentScript, name: text })}
        />
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="Script Code"
          value={currentScript.code}
          onChangeText={(text) => setCurrentScript({ ...currentScript, code: text })}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="URLs (comma-separated, use * as wildcard or /regex/)"
          value={currentScript.urls}
          onChangeText={(text) => setCurrentScript({ ...currentScript, urls: text })}
        />
        <View style={styles.optionsContainer}>
          <Text style={styles.optionLabel}>Run at:</Text>
          <TouchableOpacity
            style={[styles.optionButton, currentScript.runAt === 'pageLoad' && styles.optionButtonActive]}
            onPress={() => setCurrentScript({ ...currentScript, runAt: 'pageLoad' })}
          >
            <Text style={styles.optionButtonText}>Page Load</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, currentScript.runAt === 'manual' && styles.optionButtonActive]}
            onPress={() => setCurrentScript({ ...currentScript, runAt: 'manual' })}
          >
            <Text style={styles.optionButtonText}>Manual</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={addOrUpdateScript} style={styles.addButton}>
          <Text style={styles.addButtonText}>{isEditMode ? 'Update Script' : 'Add Script'}</Text>
        </TouchableOpacity>
        <FlatList
          data={scripts}
          renderItem={renderScriptItem}
          keyExtractor={(item) => item.name}
          style={styles.list}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  codeInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    marginRight: 10,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#DDDDDD',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  optionButtonActive: {
    backgroundColor: '#81b0ff',
  },
  optionButtonText: {
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  scriptItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scriptName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scriptUrls: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  scriptRunAt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  scriptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 15,
  },
});

export default ScriptManager;