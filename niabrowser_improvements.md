# NIABrowser Improvement Guide

## Overview
This document outlines specific improvements needed for the NIABrowser project. Each section includes the exact files to modify and detailed implementation steps.

## 1. Enhanced Clear Data Options

### Location: `components/BottomSheet.js`
**Problem**: Currently only has a simple "Clear Data" option that clears everything
**Solution**: Create a detailed dialog with multiple options

#### Changes Needed:
1. **Modify the clearData function** to show options dialog instead of directly clearing
2. **Add new state** for managing clear data modal
3. **Create selective clearing functions** for different data types

#### Implementation:
```javascript
// Add these imports
import { Alert, Modal } from 'react-native';

// Add state for clear data modal
const [showClearDataModal, setShowClearDataModal] = useState(false);

// Replace the current clearData call with:
onPress: () => setShowClearDataModal(true)

// Add this modal component before the closing tag:
{showClearDataModal && (
  <Modal visible={true} transparent animationType="fade">
    <View style={styles.clearDataModalOverlay}>
      <View style={[styles.clearDataModal, { backgroundColor }]}>
        <Text style={[styles.clearDataTitle, { color: textColor }]}>Clear Data Options</Text>
        
        <TouchableOpacity style={styles.clearOption} onPress={() => clearBrowserData()}>
          <Text style={[styles.clearOptionText, { color: textColor }]}>🌐 Clear Browser Data (Cookies, History)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearOption} onPress={() => clearFavorites()}>
          <Text style={[styles.clearOptionText, { color: textColor }]}>⭐ Clear Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearOption} onPress={() => clearScripts()}>
          <Text style={[styles.clearOptionText, { color: textColor }]}>📜 Clear Scripts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearOption} onPress={() => clearAppStorage()}>
          <Text style={[styles.clearOptionText, { color: textColor }]}>📱 Clear App Storage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearOption} onPress={() => clearAllData()}>
          <Text style={[styles.clearOptionText, { color: '#FF4444' }]}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowClearDataModal(false)}>
          <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
```

#### Add these styles:
```javascript
clearDataModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
clearDataModal: {
  width: '80%',
  borderRadius: 15,
  padding: 20,
},
clearDataTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
},
clearOption: {
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#333',
},
clearOptionText: {
  fontSize: 16,
},
cancelButton: {
  marginTop: 15,
  padding: 15,
  alignItems: 'center',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#666',
},
```

---

## 2. Network Tab Color-Coded Icons

### Location: `components/DevTools.js`
**Problem**: Network methods need distinct colored icons
**Solution**: Add colored icons for different HTTP methods

#### Changes Needed:
In the `renderNetworkTab` function, update the network log item rendering:

```javascript
// Update the networkLogMethod styling
<View style={styles.methodContainer}>
  <Icon 
    name={getMethodIcon(item.method)} 
    type="material" 
    size={16} 
    color={getMethodColor(item.method)} 
  />
  <Text style={[styles.networkLogMethod, { color: getMethodColor(item.method) }]}>
    {item.method}
  </Text>
</View>
```

#### Add these helper functions:
```javascript
const getMethodIcon = (method) => {
  switch (method) {
    case 'GET': return 'download';
    case 'POST': return 'upload';
    case 'PUT': return 'edit';
    case 'DELETE': return 'delete';
    default: return 'http';
  }
};

const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return '#2E7D32';     // Green
    case 'POST': return '#1565C0';    // Blue  
    case 'PUT': return '#F57C00';     // Orange
    case 'DELETE': return '#C62828';  // Red
    default: return '#616161';        // Gray
  }
};
```

#### Update styles:
```javascript
methodContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
networkLogMethod: {
  fontWeight: 'bold',
  marginLeft: 5,
  fontSize: 12,
},
```

---

## 3. Fix Console ScrollView Issue

### Location: `components/DevTools.js`
**Problem**: VirtualizedLists (FlatList) nested in ScrollView causes warnings
**Solution**: Replace ScrollView with proper container structure

#### Changes Needed:
1. **Restructure the main container** to avoid nesting FlatList in ScrollView
2. **Use conditional rendering** instead of ScrollView wrapping

#### Implementation:
Replace the current content structure:
```javascript
// REMOVE the ScrollView wrapper around content
// BEFORE:
<ScrollView style={styles.content} ref={scrollViewRef}>
  {activeTab === 'Console' && renderConsoleTab()}
</ScrollView>

// AFTER:
<View style={styles.content}>
  {activeTab === 'Console' && renderConsoleTab()}
</View>
```

#### Update renderConsoleTab:
```javascript
const renderConsoleTab = () => (
  <View style={styles.consoleContainer}>
    <View style={styles.searchContainer}>
      <TouchableOpacity onPress={copyAllLogs} style={styles.clearButton}>
        <Icon name="content-copy" type="material" color={textColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={clearConsoleLogs} style={styles.clearButton}>
        <Icon name="delete" type="material" color={textColor} />
      </TouchableOpacity>
    </View>
    <FlatList
      style={styles.consoleList}
      data={consoleOutput}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Text style={[styles.consoleLog, getConsoleLogStyle(item.type, isDarkMode)]}>
          {item.message}
        </Text>
      )}
    />
  </View>
);
```

---

## 4. Enhanced User Agent Selector

### Location: `components/UserAgentSelector.js`
**Problem**: Empty window appears, needs popular browser options
**Solution**: Already implemented in the current code, but needs verification

#### Verify these user agents are working:
- Chrome Desktop/Mobile
- Firefox Desktop  
- Safari Desktop/Mobile
- Edge Desktop
- Opera Desktop

#### Add these popular options if missing:
```javascript
{
  name: 'Chrome Android Tablet',
  value: 'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  description: 'Chrome on Android Tablet'
},
{
  name: 'iPad Safari',  
  value: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/537.36',
  description: 'Safari on iPad'
}
```

---

## 5. Fullscreen Mode Toggle

### Location: `components/BottomNavigation.js`
**Problem**: Back/Forward arrows need to be replaced with fullscreen toggle
**Solution**: Add fullscreen state management

#### Changes Needed:
1. **Add fullscreen prop** to BottomNavigation component
2. **Replace back/forward buttons** with fullscreen toggle
3. **Update App.js** to handle fullscreen state

#### In App.js, add:
```javascript
const [isFullscreen, setIsFullscreen] = useState(false);

// Pass to BottomNavigation:
onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
isFullscreen={isFullscreen}

// Conditionally render toolbar and tab bar:
{!isFullscreen && (
  <>
    <TabBar ... />
    <ToolBar ... />
  </>
)}

// Update BottomNavigation visibility:
{!isSafeMode && (
  <BottomNavigation
    ...
    onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
    isFullscreen={isFullscreen}
  />
)}
```

#### Update BottomNavigation component:
```javascript
// Replace back/forward buttons with:
<TouchableOpacity onPress={onFullscreenToggle} style={styles.button}>
  <Icon 
    name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
    type="material" 
    color={iconColor} 
  />
</TouchableOpacity>
```

---

## 6. Script Manager UI Improvements

### Location: `components/ScriptManager.js`
**Problem**: Blue color for "Add New Script" button needs change, button layout needs improvement
**Solution**: Update colors and button positioning

#### Changes Needed:
```javascript
// Update mainAddButton style:
mainAddButton: {
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 2,
  backgroundColor: '#28A745', // Changed from blue to green
},

// In the Alert.alert for "Add Script", change order:
Alert.alert(
  'Add Script', 
  'Choose how to create the script:',
  [
    { text: 'Cancel', style: 'cancel' }, // Moved to top
    { text: 'Manual Creation', onPress: () => { ... }},
    { text: 'AI Generator', onPress: () => setShowAIGenerator(true) },
  ]
);
```

---

## 7. Home Page Setting (Long Press)

### Location: `components/BottomNavigation.js` and `App.js`
**Problem**: Need long press on home button to set custom home page
**Solution**: Add long press handler and home page setting modal

#### In App.js, add:
```javascript
const [customHomePage, setCustomHomePage] = useState('https://www.google.com');
const [showHomePageModal, setShowHomePageModal] = useState(false);

// Add to AsyncStorage loading:
const loadCustomHomePage = async () => {
  try {
    const saved = await AsyncStorage.getItem('customHomePage');
    if (saved) setCustomHomePage(saved);
  } catch (error) {
    console.error('Error loading custom home page:', error);
  }
};

// Update goHome function:
const goHome = useCallback(() => {
  updateTabUrl(activeTabIndex, customHomePage);
}, [activeTabIndex, updateTabUrl, customHomePage]);
```

#### Add Modal for setting home page:
```javascript
{showHomePageModal && (
  <Modal visible={true} transparent animationType="slide">
    <View style={styles.homeModalOverlay}>
      <View style={[styles.homeModal, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
        <Text style={[styles.homeModalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Set Home Page
        </Text>
        <TextInput
          style={[styles.homeInput, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
          value={customHomePage}
          onChangeText={setCustomHomePage}
          placeholder="Enter home page URL"
        />
        <View style={styles.homeModalButtons}>
          <TouchableOpacity onPress={() => setShowHomePageModal(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveHomePage}>
            <Text>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}
```

#### Update BottomNavigation:
```javascript
<TouchableOpacity 
  onPress={onHomePress} 
  onLongPress={onHomeLongPress}
  style={styles.button}
>
  <Icon name="home" type="material" color={iconColor} />
</TouchableOpacity>
```

---

## 8. AI Script Generator UI Fix

### Location: `components/ScriptManager.js`
**Problem**: Generate button has white text on gray background, not visible
**Solution**: Fix button colors and text

#### Changes Needed:
```javascript
// Update generateButton style:
generateButton: {
  flex: 2,
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  backgroundColor: '#28A745', // Green background
},
generateButtonText: {
  color: '#FFFFFF', // White text
  fontSize: 16,
  fontWeight: 'bold',
},

// Update button text:
<Text style={styles.generateButtonText}>
  {isGenerating ? '⏳ Generating...' : '🚀 Generate'}
</Text>
```

---

## 9. Updated AI Models List

### Location: `components/ScriptManager.js`
**Problem**: AI models list needs latest versions organized by provider
**Solution**: Update AIConfig with latest models and better organization

#### Implementation:
```javascript
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
  }
};

// Update model picker to show categories:
const renderModelPicker = () => (
  <View style={styles.modelPickerContainer}>
    {Object.entries(AIConfig.openrouter.models).map(([provider, models]) => (
      <View key={provider} style={styles.providerSection}>
        <Text style={[styles.providerTitle, { color: textColor }]}>
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
              color: selectedModel === model ? '#FFFFFF' : textColor
            }]}>
              {model.split('/')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ))}
  </View>
);
```

---

## 10. Dynamic Version in About Page

### Location: `components/AboutModal.js`
**Problem**: Version is hardcoded, should read from package.json
**Solution**: Import version dynamically

#### Changes Needed:
```javascript
// Add import at top:
import packageJson from '../package.json';

// Or if that doesn't work, import app.json:
import appJson from '../app.json';

// Update version display:
<Text style={[styles.version, { color: secondaryTextColor }]}>
  Version {packageJson.version || appJson.expo?.version || '2.0.0'}
</Text>
```

---

## Implementation Order
1. Fix Console ScrollView Issue (Critical)
2. Enhanced Clear Data Options  
3. Network Tab Color-Coded Icons
4. Fullscreen Mode Toggle
5. Script Manager UI Improvements
6. AI Script Generator UI Fix
7. Updated AI Models List
8. Home Page Setting
9. Dynamic Version in About Page
10. User Agent Selector Verification

## Testing Checklist
- [ ] Console scrolling works without warnings
- [ ] Clear data shows options dialog
- [ ] Network methods have colored icons
- [ ] Fullscreen mode hides/shows UI properly
- [ ] Script manager buttons are properly colored
- [ ] AI generator button is visible
- [ ] Long press on home opens setting modal
- [ ] About page shows correct version
- [ ] User agent selector shows all options

## Notes
- Test each change individually before moving to the next
- Ensure dark mode compatibility for all new UI elements
- Verify AsyncStorage operations don't conflict
- Test on both Android and iOS if possible