import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Overlay } from 'react-native-elements';
import { createGreasemonkeyEnvironment, parseMetadata } from '../utils/GreasemonkeyCompatibility';
import { SettingsManager } from '../utils/SettingsManager';
import { AIProviderManager } from '../utils/AIProviderManager';
import BaseModal from './ui/BaseModal';
import ModelSelector from './ui/ModelSelector';

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
  const [isSimpleUrlInput, setIsSimpleUrlInput] = useState(false); // Default to advanced (patterns)
  const [simpleUrl, setSimpleUrl] = useState('');
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalScript, setOriginalScript] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiTaskDescription, setAiTaskDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4.1-mini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);
  const [sessionCosts, setSessionCosts] = useState({ totalTokens: { input: 0, output: 0 }, totalCost: 0.0000, requestCount: 0 });
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Use refs for text input values to avoid re-rendering entire component on each keystroke
  const scriptNameRef = useRef('');
  const scriptCodeRef = useRef('');
  const scriptUrlsRef = useRef('');

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#F5F5F5';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const inputBackground = isDarkMode ? '#3C3C3E' : '#F0F0F0';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

  const defaultSystemPrompt = `You are an assistant for creating JavaScript code to be executed in React Native WebView.

Technical Context:
- Environment: WebView with React Native
- Communication: window.ReactNativeWebView.postMessage(JSON.stringify({...}))
- DOM: Full access to page elements
- Security: Avoid malicious code

IMPORTANT: Return ONLY the JavaScript code without any explanation, markdown formatting, or additional text. Just provide the raw JavaScript code that can be executed directly.`;

  useEffect(() => {
    loadScripts();
    loadSessionCosts();
    loadSelectedModel();
    checkApiKey();
    setCustomPrompt(defaultSystemPrompt);
  }, []);

  // Re-check API key when ScriptManager becomes visible
  useEffect(() => {
    if (visible) {
      checkApiKey();
    }
  }, [visible]);

  const checkApiKey = async () => {
    const apiKey = await SettingsManager.getApiKey();
    setHasApiKey(!!apiKey);
  };

  const loadSelectedModel = async () => {
    const model = await SettingsManager.getSelectedModel();
    setSelectedModel(model);
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
    if (!aiTaskDescription.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    const apiKey = await SettingsManager.getApiKey();
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your OpenRouter API Key in Settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            setShowAIGenerator(false);
            // The settings screen will be opened from App.js
          }}
        ]
      );
      return;
    }

    setIsGenerating(true);
    try {
      const activeProvider = await AIProviderManager.getActiveProvider();

      const response = await fetch(`${activeProvider?.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
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
            { role: 'system', content: customPrompt },
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
          'Request Cost',
          `Model: ${selectedModel.split('/').pop()}\nTokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out\nCost: $${cost.toFixed(6)}\nSession Total: $${newCosts.totalCost.toFixed(6)}`,
          [{ text: 'OK' }]
        );

        // Set the generated script
        const genName = `AI: ${aiTaskDescription.substring(0, 30)}...`;
        setCurrentScript({
          name: genName,
          code: generatedCode,
          urls: '*',
          isEnabled: true,
          runAt: 'document-idle'
        });
        scriptNameRef.current = genName;
        scriptCodeRef.current = generatedCode;
        scriptUrlsRef.current = '*';
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
        const parsedScripts = JSON.parse(savedScripts);
        setScripts(parsedScripts);
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const saveScripts = useCallback(async (updatedScripts) => {
    try {
      await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
      setScripts(updatedScripts);
    } catch (error) {
      console.error('Error saving scripts:', error);
    }
  }, [setScripts]);

  const addOrUpdateScript = () => {
    // Sync ref values before saving
    const scriptToSave = {
      ...currentScript,
      name: scriptNameRef.current || currentScript.name,
      code: scriptCodeRef.current || currentScript.code,
      urls: scriptUrlsRef.current || currentScript.urls,
    };
    if (scriptToSave.name && scriptToSave.code) {
      const metadata = parseMetadata(scriptToSave.code);
      const updatedScript = { ...scriptToSave, metadata };
      const updatedScripts = isEditMode
        ? scripts.map(s => s.name === scriptToSave.name ? updatedScript : s)
        : [...scripts, updatedScript];
      saveScripts(updatedScripts);
      setCurrentScript({ name: '', code: '', urls: '', isEnabled: true, runAt: 'document-idle' });
      scriptNameRef.current = '';
      scriptCodeRef.current = '';
      scriptUrlsRef.current = '';
      setIsEditMode(false);
      setShowEditOverlay(false);
      setHasUnsavedChanges(false);
    }
  };

  const editScript = (script) => {
    setCurrentScript(script);
    scriptNameRef.current = script.name;
    scriptCodeRef.current = script.code;
    scriptUrlsRef.current = script.urls;
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

  const handleToggleScript = useCallback(async (scriptName) => {
    const updatedScripts = scripts.map(s =>
      s.name === scriptName ? { ...s, isEnabled: !s.isEnabled } : s
    );
    // Save to AsyncStorage and update state
    try {
      await AsyncStorage.setItem('userScripts', JSON.stringify(updatedScripts));
      setScripts(updatedScripts);
    } catch (error) {
      console.error('Error toggling script:', error);
      Alert.alert('Error', 'Failed to save script state');
    }
  }, [scripts, setScripts]);

  const handleModelSelect = async (modelId) => {
    setSelectedModel(modelId);
    await SettingsManager.setSelectedModel(modelId);
  };

  const renderScriptItem = useCallback(({ item }) => (
    <View style={[styles.scriptItem, { backgroundColor: cardBackground }]}>
      <View style={styles.scriptHeader}>
        <MaterialIcons name="code" size={20} color="#007AFF" />
        <Text style={[styles.scriptName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
      </View>
      <Text style={[styles.scriptUrls, { color: secondaryTextColor }]}>
        <MaterialIcons name="link" size={12} color={secondaryTextColor} /> URLs: {item.urls || 'All'}
      </Text>
      <Text style={[styles.scriptRunAt, { color: secondaryTextColor }]}>
        <MaterialIcons name="schedule" size={12} color={secondaryTextColor} /> Run at: {item.runAt}
      </Text>
      <View style={styles.scriptActions}>
        <TouchableOpacity onPress={() => runScript(item)} style={styles.actionButton}>
          <MaterialIcons name="play-arrow" size={22} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => editScript(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={22} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteScript(item.name)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={22} color="#F44336" />
        </TouchableOpacity>
        <View style={styles.actionButton}>
          <Switch
            value={item.isEnabled}
            onValueChange={() => handleToggleScript(item.name)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={item.isEnabled ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>
    </View>
  ), [isDarkMode, handleToggleScript, runScript, editScript, deleteScript, textColor, secondaryTextColor, cardBackground]);

  const handleSimpleUrlInput = () => {
    if (!simpleUrl) return;

    let processedUrl = simpleUrl;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
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
            text: "Advanced input",
            onPress: () => setIsAdvancedUrlInput(true)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
    }
  };

  const taskExamples = [
    "Collect all image and video links and add download buttons",
    "Convert page direction from left-to-right to right-to-left",
    "Hide all advertisements from the page",
    "Change page colors to dark mode theme",
    "Extract all email addresses from the page"
  ];

  const handleCloseEditOverlay = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setShowEditOverlay(false);
              setHasUnsavedChanges(false);
              setCurrentScript({ name: '', code: '', urls: '', isEnabled: true, runAt: 'document-idle' });
              scriptNameRef.current = '';
              scriptCodeRef.current = '';
              scriptUrlsRef.current = '';
            }
          }
        ]
      );
    } else {
      setShowEditOverlay(false);
    }
  };

  const renderEditOverlay = () => (
    <Overlay
      isVisible={showEditOverlay}
      onBackdropPress={handleCloseEditOverlay}
      overlayStyle={[styles.overlay, { backgroundColor: cardBackground }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.overlayHeader}>
          <Text style={[styles.overlayTitle, { color: textColor }]}>
            {isEditMode ? 'Edit Script' : 'New Script'}
          </Text>
          <TouchableOpacity onPress={handleCloseEditOverlay}>
            <MaterialIcons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.inputLabel, { color: textColor }]}>Script Name</Text>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: inputBackground }]}
          placeholder="Enter script name"
          placeholderTextColor={secondaryTextColor}
          defaultValue={currentScript.name}
          onChangeText={(text) => {
            scriptNameRef.current = text;
            if (!hasUnsavedChanges) setHasUnsavedChanges(true);
          }}
          onEndEditing={() => setCurrentScript(prev => ({ ...prev, name: scriptNameRef.current }))}
        />

        <Text style={[styles.inputLabel, { color: textColor }]}>Script Code</Text>
        <TextInput
          style={[styles.input, styles.codeInput, { color: textColor, backgroundColor: inputBackground }]}
          placeholder="Enter JavaScript code"
          placeholderTextColor={secondaryTextColor}
          defaultValue={currentScript.code}
          onChangeText={(text) => {
            scriptCodeRef.current = text;
            if (!hasUnsavedChanges) setHasUnsavedChanges(true);
          }}
          onEndEditing={() => setCurrentScript(prev => ({ ...prev, code: scriptCodeRef.current }))}
          multiline
        />

        <View style={styles.urlLabelRow}>
          <Text style={[styles.inputLabel, { color: textColor }]}>URL Pattern</Text>
          <TouchableOpacity onPress={() => setShowUrlHelp(true)} style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {isSimpleUrlInput ? (
          <View style={styles.simpleUrlContainer}>
            <TextInput
              style={[styles.input, { flex: 1, color: textColor, backgroundColor: inputBackground }]}
              placeholder="Enter website URL"
              placeholderTextColor={secondaryTextColor}
              value={simpleUrl}
              onChangeText={setSimpleUrl}
            />
            <TouchableOpacity
              style={[styles.setUrlButton, { backgroundColor: '#007AFF' }]}
              onPress={handleSimpleUrlInput}
            >
              <Text style={styles.setUrlButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: inputBackground }]}
            placeholder="URLs (comma-separated, use * as wildcard)"
            placeholderTextColor={secondaryTextColor}
            defaultValue={currentScript.urls}
            onChangeText={(text) => {
              scriptUrlsRef.current = text;
              if (!hasUnsavedChanges) setHasUnsavedChanges(true);
            }}
            onEndEditing={() => setCurrentScript(prev => ({ ...prev, urls: scriptUrlsRef.current }))}
          />
        )}
        <TouchableOpacity
          onPress={() => setIsSimpleUrlInput(!isSimpleUrlInput)}
          style={styles.toggleUrlInputButton}
        >
          <Text style={[styles.toggleUrlInputText, { color: '#007AFF' }]}>
            {isSimpleUrlInput ? 'Advanced Input (Patterns)' : 'Simple Input (URL)'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.inputLabel, { color: textColor }]}>Run At</Text>
        <View style={styles.runAtContainer}>
          {['document-start', 'document-end', 'document-idle'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.runAtOption,
                { borderColor },
                currentScript.runAt === option && styles.runAtOptionActive,
              ]}
              onPress={() => setCurrentScript({ ...currentScript, runAt: option })}
            >
              <Text style={[
                styles.runAtOptionText,
                { color: currentScript.runAt === option ? '#FFFFFF' : textColor },
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#007AFF' }]}
          onPress={addOrUpdateScript}
        >
          <MaterialIcons name="save" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {isEditMode ? "Update Script" : "Add Script"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Overlay>
  );

  const renderInfoModal = () => (
    <BaseModal
      visible={showInfoModal}
      onClose={() => setShowInfoModal(false)}
      title="Script Manager Guide"
      isDarkMode={isDarkMode}
    >
      <ScrollView style={styles.infoContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="lightbulb" size={24} color="#FFC107" />
          <Text style={[styles.infoTitle, { color: textColor }]}>What is Script Manager?</Text>
          <Text style={[styles.infoText, { color: secondaryTextColor }]}>
            Allows you to execute and run custom JavaScript code on any website.
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="description" size={24} color="#2196F3" />
          <Text style={[styles.infoTitle, { color: textColor }]}>Usage Examples</Text>
          <Text style={[styles.infoText, { color: secondaryTextColor }]}>
            {'\u2022'} Change website appearance{'\n'}
            {'\u2022'} Extract data{'\n'}
            {'\u2022'} Automate tasks{'\n'}
            {'\u2022'} Add new features to websites
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: '#FFF3E0' }]}>
          <MaterialIcons name="warning" size={24} color="#FF9800" />
          <Text style={[styles.infoTitle, { color: '#E65100' }]}>Important Warnings</Text>
          <Text style={[styles.infoText, { color: '#BF360C' }]}>
            {'\u2022'} Don't use scripts from untrusted sources{'\n'}
            {'\u2022'} Make sure you understand the code before running it{'\n'}
            {'\u2022'} You take full responsibility{'\n'}
            {'\u2022'} May affect website security
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="psychology" size={24} color="#9C27B0" />
          <Text style={[styles.infoTitle, { color: textColor }]}>AI Script Generation</Text>
          <Text style={[styles.infoText, { color: secondaryTextColor }]}>
            You can use AI to generate scripts with a simple description of the required task.
          </Text>
        </View>
      </ScrollView>
    </BaseModal>
  );

  const renderAIGenerator = () => (
    <BaseModal
      visible={showAIGenerator}
      onClose={() => setShowAIGenerator(false)}
      title="AI Script Generator"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <ScrollView style={[styles.aiContent, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* Warning */}
        <View style={[styles.warningCard, { backgroundColor: '#FFF8E1' }]}>
          <MaterialIcons name="warning" size={20} color="#FF8F00" />
          <Text style={styles.warningText}>
            AI Usage Costs: This app uses external AI services that may charge fees. You are responsible for all API costs.
          </Text>
        </View>

        {/* Session Stats */}
        <View style={[styles.statsCard, { backgroundColor: cardBackground }]}>
          <View style={styles.statsHeader}>
            <MaterialIcons name="analytics" size={20} color="#007AFF" />
            <Text style={[styles.statsTitle, { color: textColor }]}>Session Summary</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Requests:</Text>
            <Text style={[styles.statValue, { color: textColor }]}>{sessionCosts.requestCount}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Total Cost:</Text>
            <Text style={[styles.statValue, { color: textColor }]}>${sessionCosts.totalCost.toFixed(6)}</Text>
          </View>
        </View>

        {/* Task Description */}
        <View style={[styles.inputCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardLabel, { color: textColor }]}>Task Description</Text>
          <TextInput
            style={[styles.taskInput, { color: textColor, backgroundColor: inputBackground }]}
            placeholder="Describe what the script should do..."
            placeholderTextColor={secondaryTextColor}
            value={aiTaskDescription}
            onChangeText={setAiTaskDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Examples */}
        <View style={[styles.inputCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardLabel, { color: textColor }]}>Examples</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {taskExamples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.exampleButton, { backgroundColor: inputBackground }]}
                onPress={() => setAiTaskDescription(example)}
              >
                <Text style={[styles.exampleText, { color: textColor }]} numberOfLines={2}>
                  {example}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Model Selection */}
        <View style={[styles.inputCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardLabel, { color: textColor }]}>AI Model</Text>
          <ModelSelector
            selectedModelId={selectedModel}
            onModelSelect={handleModelSelect}
            isDarkMode={isDarkMode}
          />
        </View>

        {/* Advanced Options Toggle */}
        <TouchableOpacity
          onPress={() => setShowAdvancedAI(!showAdvancedAI)}
          style={styles.advancedToggle}
        >
          <MaterialIcons
            name={showAdvancedAI ? "expand-less" : "expand-more"}
            size={20}
            color="#007AFF"
          />
          <Text style={styles.advancedToggleText}>
            {showAdvancedAI ? 'Hide' : 'Show'} Advanced Options
          </Text>
        </TouchableOpacity>

        {showAdvancedAI && (
          <View style={[styles.inputCard, { backgroundColor: cardBackground }]}>
            <TouchableOpacity
              onPress={() => setShowPromptEditor(true)}
              style={styles.editPromptButton}
            >
              <MaterialIcons name="edit" size={18} color="#007AFF" />
              <Text style={styles.editPromptText}>Edit System Prompt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://openrouter.ai/docs')}
              style={styles.editPromptButton}
            >
              <MaterialIcons name="open-in-new" size={18} color="#007AFF" />
              <Text style={styles.editPromptText}>OpenRouter Documentation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* API Key Status */}
        {!hasApiKey && (
          <View style={[styles.warningCard, { backgroundColor: '#FFEBEE' }]}>
            <MaterialIcons name="error" size={20} color="#D32F2F" />
            <Text style={[styles.warningText, { color: '#B71C1C' }]}>
              API Key not configured. Please add it in Settings.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.aiButtonContainer, { backgroundColor: cardBackground, borderTopColor: borderColor }]}>
        <TouchableOpacity
          onPress={generateScriptWithAI}
          style={[styles.generateButton, !hasApiKey && styles.buttonDisabled]}
          disabled={isGenerating || !hasApiKey}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowAIGenerator(false)}
          style={[styles.cancelButton, { borderColor }]}
        >
          <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );

  const renderPromptEditor = () => (
    <BaseModal
      visible={showPromptEditor}
      onClose={() => setShowPromptEditor(false)}
      title="Edit System Prompt"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <View style={[styles.promptEditorContent, { backgroundColor }]}>
        <TextInput
          style={[styles.promptTextInput, {
            color: textColor,
            backgroundColor: inputBackground
          }]}
          placeholder="Enter custom system prompt..."
          placeholderTextColor={secondaryTextColor}
          value={customPrompt}
          onChangeText={setCustomPrompt}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.promptButtonContainer}>
          <TouchableOpacity
            onPress={() => setCustomPrompt(defaultSystemPrompt)}
            style={[styles.resetPromptButton, { backgroundColor: '#FF5252' }]}
          >
            <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.promptButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPromptEditor(false)}
            style={[styles.savePromptButton, { backgroundColor: '#4CAF50' }]}
          >
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
            <Text style={styles.promptButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Script Manager"
      isDarkMode={isDarkMode}
      fullScreen={true}
      headerActions={
        <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.headerAction}>
          <MaterialIcons name="help-outline" size={24} color={textColor} />
        </TouchableOpacity>
      }
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Add Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Add Script',
              'Choose how to create the script:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Manual Creation', onPress: () => {
                  setCurrentScript({ name: '', code: '', urls: '*', isEnabled: true, runAt: 'document-idle' });
                  scriptNameRef.current = '';
                  scriptCodeRef.current = '';
                  scriptUrlsRef.current = '*';
                  setIsEditMode(false);
                  setShowEditOverlay(true);
                }},
                { text: 'AI Generator', onPress: () => setShowAIGenerator(true) }
              ]
            );
          }}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Script</Text>
        </TouchableOpacity>

        {/* Script List */}
        <FlatList
          data={scripts}
          renderItem={renderScriptItem}
          keyExtractor={(item) => item.name}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="code-off" size={48} color={secondaryTextColor} />
              <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                No scripts yet
              </Text>
              <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
                Tap the button above to add your first script
              </Text>
            </View>
          }
        />

        {renderEditOverlay()}
        {renderInfoModal()}
        {renderAIGenerator()}
        {renderPromptEditor()}
        {renderUrlHelpModal()}
      </View>
    </BaseModal>
  );

  function renderUrlHelpModal() {
    return (
      <BaseModal
        visible={showUrlHelp}
        onClose={() => setShowUrlHelp(false)}
        title="URL Pattern Help"
        isDarkMode={isDarkMode}
      >
        <ScrollView style={styles.infoContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="star" size={24} color="#FFC107" />
            <Text style={[styles.infoTitle, { color: textColor }]}>Wildcard (*)</Text>
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>
              Use * to match any characters.{'\n'}
              {'\u2022'} * = All websites{'\n'}
              {'\u2022'} https://example.com/* = All pages on example.com{'\n'}
              {'\u2022'} https://*.example.com/* = All subdomains
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="format-list-bulleted" size={24} color="#2196F3" />
            <Text style={[styles.infoTitle, { color: textColor }]}>Multiple URLs</Text>
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>
              Separate multiple patterns with commas:{'\n'}
              https://google.com/*, https://bing.com/*
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="code" size={24} color="#9C27B0" />
            <Text style={[styles.infoTitle, { color: textColor }]}>Regex Patterns</Text>
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>
              Wrap regex in slashes:{'\n'}
              /https?:\/\/.*\.google\.com\/.*/
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
            <MaterialIcons name="lightbulb" size={24} color="#1976D2" />
            <Text style={[styles.infoTitle, { color: '#0D47A1' }]}>Examples</Text>
            <Text style={[styles.infoText, { color: '#1565C0' }]}>
              {'\u2022'} https://youtube.com/watch* - YouTube videos{'\n'}
              {'\u2022'} https://*.twitter.com/* - Twitter & subdomains{'\n'}
              {'\u2022'} https://github.com/*/pull/* - GitHub PRs{'\n'}
              {'\u2022'} * - Run on all websites
            </Text>
          </View>
        </ScrollView>
      </BaseModal>
    );
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAction: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scriptItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  scriptName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scriptUrls: {
    fontSize: 13,
    marginBottom: 4,
  },
  scriptRunAt: {
    fontSize: 13,
    marginBottom: 12,
  },
  scriptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    width: width * 0.9,
    maxHeight: '85%',
    borderRadius: 16,
    padding: 20,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  codeInput: {
    height: 150,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  simpleUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setUrlButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  setUrlButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleUrlInputButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  toggleUrlInputText: {
    fontSize: 13,
  },
  urlLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  helpButton: {
    padding: 4,
  },
  runAtContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  runAtOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  runAtOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  runAtOptionText: {
    fontSize: 13,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContent: {
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  aiContent: {
    flex: 1,
    padding: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#5D4037',
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  taskInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exampleButton: {
    padding: 12,
    marginRight: 10,
    borderRadius: 10,
    width: 150,
    minHeight: 60,
    justifyContent: 'center',
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  advancedToggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  editPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  editPromptText: {
    color: '#007AFF',
    fontSize: 14,
  },
  aiButtonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  generateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  promptEditorContent: {
    flex: 1,
    padding: 16,
  },
  promptTextInput: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  promptButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  resetPromptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  savePromptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  promptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ScriptManager;
