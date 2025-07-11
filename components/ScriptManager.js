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
import * as SecureStore from 'expo-secure-store';
import { Icon, Button, Overlay, Tooltip } from 'react-native-elements';
import { createGreasemonkeyEnvironment, parseMetadata } from '../utils/GreasemonkeyCompatibility';
import { theme } from '../constants/theme';

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiTaskDescription, setAiTaskDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);
  const [sessionCosts, setSessionCosts] = useState({ totalTokens: { input: 0, output: 0 }, totalCost: 0.0000, requestCount: 0 });

  useEffect(() => {
    loadScripts();
    loadApiKey();
    loadSessionCosts();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await SecureStore.getItemAsync('openrouter_api_key');
      if (savedKey) setApiKey(savedKey);
    } catch (error) {
      console.error('Error loading API key securely:', error);
    }
  };

  const saveApiKey = async (key) => {
    try {
      await SecureStore.setItemAsync('openrouter_api_key', key);
      setApiKey(key);
    } catch (error) {
      console.error('Error saving API key securely:', error);
    }
  };

  const loadSessionCosts = async () => {
    try {
      const saved = await AsyncStorage.getItem('ai_session_costs');
      if (saved) setSessionCosts(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading session costs:', error);
    }
  };

  const saveSessionCosts = async (costs) => {
    try {
      await AsyncStorage.setItem('ai_session_costs', JSON.stringify(costs));
      setSessionCosts(costs);
    } catch (error) {
      console.error('Error saving session costs:', error);
    }
  };

  useEffect(() => {
    if (currentUrl) {
      runAutoScripts(currentUrl);
    }
  }, [currentUrl]);

  const AIConfig = {
    openrouter: {
      baseURL: 'https://openrouter.ai/api/v1/chat/completions',
      models: {
        google: [
          'google/gemini-pro-1.5',
          'google/gemini-flash-1.5',
          'google/gemma-2-9b-it'
        ],
        openai: [
          'openai/gpt-4o',
          'openai/gpt-4o-mini',
          'openai/gpt-3.5-turbo'
        ],
        anthropic: [
          'anthropic/claude-3-5-sonnet',
          'anthropic/claude-3-haiku',
          'anthropic/claude-3-opus'
        ],
        opensource: [
          'meta-llama/llama-3.1-70b-instruct',
          'mistralai/mixtral-8x7b-instruct',
          'microsoft/wizardlm-2-8x22b'
        ]
      }
    },
    
    systemPrompt: `You are an assistant for creating JavaScript code to be executed in React Native WebView.

Technical Context:
- Environment: WebView with React Native
- Communication: window.ReactNativeWebView.postMessage(JSON.stringify({...}))
- DOM: Full access to page elements
- Security: Avoid malicious code

IMPORTANT: Return ONLY the JavaScript code without any explanation, markdown formatting, or additional text. Just provide the raw JavaScript code that can be executed directly.`
  };

  const calculateCost = (model, inputTokens, outputTokens) => {
    const pricing = {
      'openai/gpt-4o-mini': { input: 0.000150, output: 0.000600 },
      'anthropic/claude-3-haiku': { input: 0.000250, output: 0.001250 },
      'google/gemini-flash-1.5': { input: 0.000075, output: 0.000300 }
    };
    
    const modelPricing = pricing[model] || { input: 0.001, output: 0.002 };
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000;
  };

  const generateScriptWithAI = async () => {
    if (!aiTaskDescription.trim() || !apiKey.trim()) {
      Alert.alert('Error', 'Please enter task description and API Key');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(AIConfig.openrouter.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/zizwar/niabrowser',
          'X-Title': 'NIABrowser Script Generator'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: AIConfig.systemPrompt },
            { role: 'user', content: `Create a JavaScript script for the following task: ${aiTaskDescription}` }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        let generatedCode = data.choices[0].message.content;
        
        // Extract JavaScript code from markdown code blocks if present
        const jsCodeMatch = generatedCode.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
        if (jsCodeMatch) {
          generatedCode = jsCodeMatch[1];
        }
        
        // Remove common prefixes and explanations
        generatedCode = generatedCode
          .replace(/^Here's the JavaScript code.*?:\s*/i, '')
          .replace(/^Here is the JavaScript code.*?:\s*/i, '')
          .replace(/^JavaScript code:\s*/i, '')
          .replace(/^The JavaScript code:\s*/i, '')
          .replace(/^This JavaScript code.*?:\s*/i, '')
          .trim();
        
        const usage = data.usage;
        
        // Update session costs
        const cost = calculateCost(selectedModel, usage.prompt_tokens, usage.completion_tokens);
        const newCosts = {
          totalTokens: {
            input: sessionCosts.totalTokens.input + usage.prompt_tokens,
            output: sessionCosts.totalTokens.output + usage.completion_tokens
          },
          totalCost: sessionCosts.totalCost + cost,
          requestCount: sessionCosts.requestCount + 1
        };
        saveSessionCosts(newCosts);

        // Show cost info
        Alert.alert(
          '💰 Request Cost',
          `Model: ${selectedModel}\nTokens: ${usage.prompt_tokens} → ${usage.completion_tokens}\nCost: $${cost.toFixed(6)}\nSession Total: $${newCosts.totalCost.toFixed(6)}`,
          [{ text: 'OK' }]
        );

        // Set the generated script
        setCurrentScript({
          name: `AI Generated: ${aiTaskDescription.substring(0, 30)}...`,
          code: generatedCode,
          urls: '*',
          isEnabled: true,
          runAt: 'document-idle'
        });
        setShowAIGenerator(false);
        setShowEditOverlay(true);
        setIsEditMode(false);
      } else {
        Alert.alert('Error', 'Failed to generate script. Check API Key and connection.');
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

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
          buttonStyle={[styles.addButton, { backgroundColor: isDarkMode ? '#4A4A4A' : '#E0E0E0' }]}
          titleStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
        />
      </ScrollView>
    </Overlay>
  );

  const renderInfoModal = () => (
    <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.infoModal, { backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF' }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.infoTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>📖 Script Manager Guide</Text>
            
            <Text style={[styles.infoSection, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>💡 What is Script Manager?</Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
              Allows you to inject and run custom JavaScript code on any website.
            </Text>
            
            <Text style={[styles.infoSection, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>📝 Usage Examples:</Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
              • Change website appearance{'\n'}
              • Extract data{'\n'}
              • Automate tasks{'\n'}
              • Add new features to websites
            </Text>
            
            <Text style={[styles.infoSection, { color: '#FF6B6B' }]}>⚠️ Important Warnings:</Text>
            <Text style={[styles.infoText, { color: '#FF6B6B' }]}>
              • Don't use scripts from untrusted sources{'\n'}
              • Make sure you understand the code before running it{'\n'}
              • You take full responsibility{'\n'}
              • May affect website security
            </Text>
            
            <Text style={[styles.infoSection, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>🧠 Artificial Intelligence:</Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
              You can use AI to generate scripts with a simple description of the required task.
            </Text>
          </ScrollView>
          
          <TouchableOpacity onPress={() => setShowInfoModal(false)} style={[styles.closeInfoButton, { backgroundColor: isDarkMode ? '#4A4A4A' : '#E0E0E0' }]}>
            <Text style={styles.closeInfoButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAIGenerator = () => (
    <Modal visible={showAIGenerator} transparent animationType="slide" onRequestClose={() => setShowAIGenerator(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.aiModal, { backgroundColor: isDarkMode ? theme.dark.surface : theme.light.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.warningContainer}>
              <Icon name="warning" type="material" color={theme.colors.warning} size={24} />
              <Text style={[styles.warningText, { color: isDarkMode ? theme.dark.text : theme.light.text }]}>
                ⚠️ AI Usage Costs: This app uses external AI services that may charge fees. You are responsible for all API costs. Monitor your usage carefully.
              </Text>
            </View>
            
            <View style={styles.costSummary}>
              <Text style={[styles.costTitle, { color: isDarkMode ? theme.dark.text : theme.light.text }]}>Session Summary:</Text>
              <Text style={[styles.costDetail, { color: isDarkMode ? theme.dark.textSecondary : theme.light.textSecondary }]}>
                Requests: {sessionCosts.requestCount} | Cost: ${sessionCosts.totalCost.toFixed(6)}
              </Text>
            </View>
            
            <Text style={[styles.aiTitle, { color: isDarkMode ? theme.dark.text : theme.light.text }]}>🧠 AI Script Generator</Text>
            
            <Text style={[styles.aiLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Task Description:</Text>
            <TextInput
              style={[styles.aiTextInput, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0' }]}
              placeholder="Write a description of the required script (example: hide all ads from the page)"
              placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
              value={aiTaskDescription}
              onChangeText={setAiTaskDescription}
              multiline
              numberOfLines={3}
            />
            
            <Text style={[styles.aiLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Choose Model:</Text>
            <View style={styles.modelPickerContainer}>
              <View style={styles.modelDropdown}>
                <Text style={[styles.modelDropdownText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {selectedModel.split('/')[1] || selectedModel}
                </Text>
                <Icon name="expand-more" type="material" color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </View>
              <View style={styles.modelOptions}>
                {Object.entries(AIConfig.openrouter.models).map(([provider, models]) => (
                  <View key={provider} style={styles.providerSection}>
                    <Text style={[styles.providerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </Text>
                    {models.map((model) => (
                      <TouchableOpacity
                        key={model}
                        style={[styles.modelOption, {
                          backgroundColor: selectedModel === model ? '#4A90E2' : 'transparent'
                        }]}
                        onPress={() => setSelectedModel(model)}
                      >
                        <Text style={[styles.modelOptionText, {
                          color: selectedModel === model ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000')
                        }]}>
                          {model.split('/')[1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={() => setShowAdvancedAI(!showAdvancedAI)} style={styles.advancedToggle}>
              <Text style={[styles.advancedToggleText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {showAdvancedAI ? 'Hide' : 'Show'} Advanced Settings
              </Text>
            </TouchableOpacity>

            {showAdvancedAI && (
              <View style={styles.advancedSection}>
                <Text style={[styles.aiLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Custom Model:</Text>
                <TextInput
                  style={[styles.aiTextInput, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0' }]}
                  placeholder="Enter custom model name (example: anthropic/claude-3-opus)"
                  placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
                  value={selectedModel.includes('/') && !AIConfig.openrouter.models.basic.includes(selectedModel) ? selectedModel : ''}
                  onChangeText={setSelectedModel}
                />
              </View>
            )}

            <Text style={[styles.aiLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>OpenRouter API Key:</Text>
            <TextInput
              style={[styles.aiTextInput, { color: isDarkMode ? '#FFFFFF' : '#000000', backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0' }]}
              placeholder="Enter OpenRouter API Key"
              placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
              value={apiKey}
              onChangeText={(text) => {
                setApiKey(text);
                saveApiKey(text);
              }}
              secureTextEntry
            />

            <View style={styles.costDisplay}>
              <Text style={[styles.costText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                📊 Session Statistics:{'\n'}
                Requests: {sessionCosts.requestCount}{'\n'}
                Tokens: {sessionCosts.totalTokens.input + sessionCosts.totalTokens.output}{'\n'}
                Total Cost: ${sessionCosts.totalCost.toFixed(6)}
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.aiButtonContainer}>
            <TouchableOpacity 
              onPress={generateScriptWithAI} 
              style={[styles.generateButton, { backgroundColor: '#28A745' }]}
              disabled={isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? '⏳ Generating...' : '🚀 Generate'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAIGenerator(false)} style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#3A3A3A' : '#D0D0D0' }]}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Script Manager</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
              <Icon name="info" type="feather" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" type="font-awesome" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            onPress={() => {
              // Show options for manual or AI creation
              Alert.alert(
                'Add Script', 
                'Choose how to create the script:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Manual Creation', onPress: () => {
                    setCurrentScript({ name: '', code: '', urls: '*', isEnabled: true, runAt: 'document-idle' });
                    setIsEditMode(false);
                    setShowEditOverlay(true);
                  }},
                  { text: 'AI Generator', onPress: () => setShowAIGenerator(true) }
                ]
              );
            }}
            style={[styles.mainAddButton, { backgroundColor: '#28A745' }]}
          >
            <Text style={[styles.mainAddButtonText, { color: '#FFFFFF' }]}>
              ➕ Add New Script
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={scripts}
          renderItem={renderScriptItem}
          keyExtractor={(item) => item.name}
          style={styles.list}
        />
        {renderEditOverlay()}
        {renderInfoModal()}
        {renderAIGenerator()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    marginRight: 15,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModal: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  closeInfoButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeInfoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButtonContainer: {
    marginBottom: 20,
  },
  mainAddButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mainAddButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiButton: {
    flex: 1,
  },
  aiModal: {
    width: width * 0.95,
    maxHeight: '90%',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  aiLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  aiTextInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modelPickerContainer: {
    marginBottom: 15,
  },
  modelDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  modelDropdownText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelOptions: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modelOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  modelOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  providerSection: {
    marginBottom: 10,
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  advancedToggle: {
    marginBottom: 15,
    alignSelf: 'center',
  },
  advancedToggleText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  advancedSection: {
    marginBottom: 15,
  },
  costDisplay: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  costText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  generateButton: {
    flex: 2,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  costSummary: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  costDetail: {
    fontSize: 14,
  },
});

export default ScriptManager;