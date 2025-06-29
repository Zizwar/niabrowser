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
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Button, Overlay, Tooltip } from 'react-native-elements';
import { createGreasemonkeyEnvironment, parseMetadata } from '../utils/GreasemonkeyCompatibility';

const { width } = Dimensions.get('window');

const ScriptManager = ({ visible, onClose, scripts, setScripts, injectScript, currentUrl, isDarkMode }) => {
  const [currentScript, setCurrentScript] = useState({
    name: '',
    code: '',
    urls: '',
    isEnabled: true,
    runAt: 'document-idle',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [isAdvancedUrlInput, setIsAdvancedUrlInput] = useState(false);
  const [simpleUrl, setSimpleUrl] = useState('');

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
      setShowEditOverlay(false);
    }
  };

  const editScript = (script) => {
    setCurrentScript(script);
    setIsEditMode(true);
    setShowEditOverlay(true);
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

  const handleToggleScript = useCallback((scriptName) => {
    const updatedScripts = scripts.map(s =>
      s.name === scriptName ? { ...s, isEnabled: !s.isEnabled } : s
    );
    saveScripts(updatedScripts);
  }, [scripts, saveScripts]);

  const renderScriptItem = useCallback(({ item }) => (
    <View style={[styles.scriptItem, { backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF' }]}>
      <View style={styles.scriptHeader}>
        <Text style={[styles.scriptName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{item.name}</Text>
        <Switch 
          value={item.isEnabled} 
          onValueChange={() => handleToggleScript(item.name)} 
          trackColor={{ false: "#767577", true: "#81b0ff" }} 
          thumbColor={item.isEnabled ? "#f5dd4b" : "#f4f3f4"} 
        />
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
  ), [isDarkMode, handleToggleScript, runScript, editScript, deleteScript]);

  const handleSimpleUrlInput = () => {
    if (!simpleUrl) return;

    let processedUrl = simpleUrl;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    const urlObject = new URL(processedUrl);
    
    Alert.alert(
      "URL Options",
      "Choose URL matching option:",
      [
        {
          text: "Exact URL",
          onPress: () => setCurrentScript({...currentScript, urls: processedUrl})
        },
        {
          text: "All pages on this domain",
          onPress: () => setCurrentScript({...currentScript, urls: `${urlObject.protocol}//${urlObject.hostname}/*`})
        },
        {
          text: "All subdomains",
          onPress: () => setCurrentScript({...currentScript, urls: `${urlObject.protocol}//*.${urlObject.hostname.replace(/^www\./, '')}/*`})
        },
        {
          text: "All protocols (http & https)",
          onPress: () => setCurrentScript({...currentScript, urls: `*://${urlObject.hostname}/*`})
        },
        {
          text: "Advanced input",
          onPress: () => setIsAdvancedUrlInput(true)
        }
      ]
    );
  };

  const renderUrlInput = () => (
    <View style={styles.urlInputContainer}>
      {isAdvancedUrlInput ? (
        <View style={styles.advancedUrlContainer}>
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
            placeholder="URLs (comma-separated, use * as wildcard or /regex/)"
            placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
            value={currentScript.urls}
            onChangeText={(text) => setCurrentScript({ ...currentScript, urls: text })}
          />
          <Tooltip
            popover={<Text style={{color: '#FFF'}}>
              Examples:{'\n'}
              https://example.com/*{'\n'}
              *://*.example.com/*{'\n'}
              /^https?://([a-z]+\.)?example\.com/.*$/
            </Text>}
            width={250}
            height={120}
          >
            <Icon name="info" type="feather" color={isDarkMode ? '#FFFFFF' : '#000000'} size={20} />
          </Tooltip>
        </View>
      ) : (
        <View style={styles.simpleUrlContainer}>
          <TextInput
            style={[styles.input, { flex: 1, color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
            placeholder="Enter website URL"
            placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
            value={simpleUrl}
            onChangeText={setSimpleUrl}
          />
          <Button
            title="Set URL"
            onPress={handleSimpleUrlInput}
            buttonStyle={[styles.setUrlButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#2196F3' }]}
          />
        </View>
      )}
      <TouchableOpacity onPress={() => setIsAdvancedUrlInput(!isAdvancedUrlInput)} style={styles.toggleUrlInputButton}>
        <Text style={[styles.toggleUrlInputText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Switch to {isAdvancedUrlInput ? 'Simple' : 'Advanced'} Input
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditOverlay = () => (
    <Overlay
      isVisible={showEditOverlay}
      onBackdropPress={() => setShowEditOverlay(false)}
      overlayStyle={[styles.overlay, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}
    >
      <ScrollView>
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
        {renderUrlInput()}
        <View style={styles.runAtContainer}>
          <Text style={[styles.runAtLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Run at:</Text>
          {['document-start', 'document-end', 'document-idle'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.runAtOption,
                currentScript.runAt === option && styles.runAtOptionActive,
                { borderColor: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}
              onPress={() => setCurrentScript({ ...currentScript, runAt: option })}
            >
              <Text style={[
                styles.runAtOptionText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' },
                currentScript.runAt === option && styles.runAtOptionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title={isEditMode ? "Update Script" : "Add Script"}
          onPress={addOrUpdateScript}
          buttonStyle={[styles.addButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#2196F3' }]}
        />
      </ScrollView>
    </Overlay>
  );



  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Script Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" type="font-awesome" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
        <Button
          title="Add New Script"
          onPress={() => {
            setCurrentScript({ name: '', code: '', urls: '', isEnabled: true, runAt: 'document-idle' });
            setIsEditMode(false);
            setShowEditOverlay(true);
          }}
          buttonStyle={[styles.addButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#2196F3' }]}
        />
        <FlatList
          data={scripts}
          renderItem={renderScriptItem}
          keyExtractor={(item) => item.name}
          style={styles.list}
        />
        {renderEditOverlay()}
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
  addButton: {
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  scriptItem: {
    padding: 15,
    borderRadius: 10,
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
  overlay: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  codeInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  runAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  runAtLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  runAtOption: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  runAtOptionActive: {
    backgroundColor: '#81b0ff',
  },
  runAtOptionText: {
    fontSize: 14,
  },
  runAtOptionTextActive: {
    color: '#FFFFFF',
  },
  urlInputContainer: {
    marginBottom: 10,
  },
  advancedUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simpleUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setUrlButton: {
    marginLeft: 10,
  },
  toggleUrlInputButton: {
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  toggleUrlInputText: {
    textDecorationLine: 'underline',
  },
});

export default ScriptManager;