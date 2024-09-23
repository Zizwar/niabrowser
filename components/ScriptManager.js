import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Modal, 
  Switch, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Button } from 'react-native-elements';
import { createGreasemonkeyEnvironment, parseMetadata } from '../utils/GreasemonkeyCompatibility';

const ScriptManager = ({ visible, onClose, injectScript, currentUrl, isDarkMode }) => {
  const [scripts, setScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState({
    name: '',
    code: '',
    urls: '',
    isEnabled: true,
    runAt: 'document-idle',
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
      const savedScripts = await AsyncStorage.getItem('userScripts');
      if (savedScripts) {
        setScripts(JSON.parse(savedScripts));
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const saveScripts = async (updatedScripts) => {
    try {
      await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
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
      const wrappedScript = createGreasemonkeyEnvironment(script.code, script.metadata);
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

  const renderScriptItem = useCallback(({ item }) => (
    <View style={[styles.scriptItem, { backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF' }]}>
      <View style={styles.scriptHeader}>
        <Text style={[styles.scriptName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{item.name}</Text>
        <Switch value={item.isEnabled} onValueChange={() => toggleScript(item.name)} trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={item.isEnabled ? "#f5dd4b" : "#f4f3f4"} />
      </View>
      <Text style={[styles.scriptUrls, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>URLs: {item.urls || 'All'}</Text>
      <Text style={[styles.scriptRunAt, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>Run at: {item.runAt}</Text>
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
  ), [isDarkMode,toggleScript]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Script Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" type="font-awesome" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
          placeholder="Script Name"
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
          value={currentScript.name}
          onChangeText={(text) => setCurrentScript({ ...currentScript, name: text })}
        />
        <TextInput
          style={[styles.input, styles.codeInput, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
          placeholder="Script Code"
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
          value={currentScript.code}
          onChangeText={(text) => setCurrentScript({ ...currentScript, code: text })}
          multiline
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
          placeholder="URLs (comma-separated, use * as wildcard or /regex/)"
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
          value={currentScript.urls}
          onChangeText={(text) => setCurrentScript({ ...currentScript, urls: text })}
        />
        <View style={styles.optionsContainer}>
          <Text style={[styles.optionLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Run at:</Text>
          <TouchableOpacity
            style={[styles.optionButton, currentScript.runAt === 'document-start' && styles.optionButtonActive]}
            onPress={() => setCurrentScript({ ...currentScript, runAt: 'document-start' })}
          >
            <Text style={styles.optionButtonText}>Document Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, currentScript.runAt === 'document-end' && styles.optionButtonActive]}
            onPress={() => setCurrentScript({ ...currentScript, runAt: 'document-end' })}
          >
            <Text style={styles.optionButtonText}>Document End</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, currentScript.runAt === 'document-idle' && styles.optionButtonActive]}
            onPress={() => setCurrentScript({ ...currentScript, runAt: 'document-idle' })}
          >
            <Text style={styles.optionButtonText}>Document Idle</Text>
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
  },
  closeButton: {
    padding: 5,
  },
  input: {
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
  },
  scriptUrls: {
    fontSize: 14,
    marginBottom: 3,
  },
  scriptRunAt: {
    fontSize: 14,
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