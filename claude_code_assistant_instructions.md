# NIABrowser Development Instructions

## Overview
You are tasked with improving NIABrowser, a React Native browser app with developer tools. The code is already functional but needs critical fixes and improvements across 3 phases.

## Important Notes
- Each phase should be completed fully before moving to the next
- Test changes thoroughly 
- Maintain existing functionality while fixing issues
- Use modern React Native best practices
- Keep backward compatibility

---

## PHASE 1: CRITICAL FIXES (IMMEDIATE PRIORITY) 🚨

### 1. Fix `[object Object]` in New Tab URLs

**Problem**: When opening new tabs, URLs sometimes show as `[object Object]` causing white screens with spinning loader.

**Location**: `App.js` and `utils/index.js`

**Files to Modify**:
- `App.js` (line ~340, in `handleMessage` function)
- `hooks/index.js` (line ~85, in `addNewTab` function)
- `components/WebViewContainer.js` (line ~280, in `handleMessage` function)

**Required Changes**:

```javascript
// In App.js, handleMessage function:
case 'openInNewTab':
  let urlToOpen = 'https://www.google.com'; // fallback
  
  if (data.url) {
    if (typeof data.url === 'string' && data.url.trim() !== '') {
      urlToOpen = data.url.trim();
    } else if (data.url.href && typeof data.url.href === 'string') {
      urlToOpen = data.url.href;
    } else if (data.url.toString && data.url.toString() !== '[object Object]') {
      urlToOpen = data.url.toString();
    }
  }
  
  // Validate URL format
  if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
    if (urlToOpen.includes('.') && !urlToOpen.includes(' ')) {
      urlToOpen = `https://${urlToOpen}`;
    } else {
      urlToOpen = `https://www.google.com/search?q=${encodeURIComponent(urlToOpen)}`;
    }
  }
  
  addNewTab(urlToOpen);
```

```javascript
// In hooks/index.js, addNewTab function:
const addNewTab = useCallback((url = null) => {
  setTabs(prevTabs => {
    let processedUrl = null;
    
    if (url) {
      if (typeof url === 'string' && url.trim() !== '') {
        processedUrl = url.trim();
      } else if (url.href && typeof url.href === 'string') {
        processedUrl = url.href;
      } else {
        console.warn('Invalid URL object:', url);
        processedUrl = 'https://www.google.com';
      }
    }
    
    const newTabs = [...prevTabs, createNewTab(processedUrl)];
    saveTabs(newTabs);
    setTimeout(() => setActiveTabIndex(newTabs.length - 1), 0);
    return newTabs;
  });
}, []);
```

### 2. Fix User Agent Selector Empty List

**Problem**: UserAgentSelector modal shows empty list of user agents.

**Location**: `components/UserAgentSelector.js`

**Required Changes**:
- Check if `userAgents` array is properly rendered
- Fix modal rendering logic
- Ensure proper state management

```javascript
// In UserAgentSelector.js, replace renderUserAgentItem:
const renderUserAgentItem = (userAgent) => (
  <TouchableOpacity
    key={userAgent.name}
    style={[
      styles.userAgentItem,
      { backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' },
      currentUserAgent === userAgent.value && styles.selectedItem
    ]}
    onPress={() => handleSelectUserAgent(userAgent.value)}
  >
    <View style={styles.userAgentInfo}>
      <Text style={[styles.userAgentName, { color: textColor }]}>{userAgent.name}</Text>
      <Text style={[styles.userAgentDescription, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
        {userAgent.description}
      </Text>
    </View>
    {currentUserAgent === userAgent.value && (
      <Icon name="check" type="material" color="#4CAF50" />
    )}
  </TouchableOpacity>
);

// In the ScrollView, change from:
{userAgents.map(renderUserAgentItem)}
// To:
{userAgents.map(userAgent => renderUserAgentItem(userAgent))}
```

### 3. Add Loading State to Source Code Modal

**Problem**: Source code modal hangs when loading large HTML sources.

**Location**: `components/SourceCodeModal.js`

**Required Changes**:
- Add immediate modal appearance with loading state
- Implement progressive loading for large content
- Add better error handling

```javascript
// In SourceCodeModal.js, modify the component:
const SourceCodeModal = ({ visible, onClose, sourceCode, isDarkMode }) => {
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

  // Modify the render to show loading immediately:
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
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading source code...</Text>
          </View>
        ) : (
          // existing code display logic
        )}
      </View>
    </Modal>
  );
};
```

### 4. Set AI Default URL to "*"

**Problem**: AI script generator sets URL to current website instead of "*" (all sites).

**Location**: `components/ScriptManager.js`

**Required Changes**:

```javascript
// In ScriptManager.js, in generateScriptWithAI function:
// After successful generation, change:
setCurrentScript({
  name: `AI Generated: ${aiTaskDescription.substring(0, 30)}...`,
  code: generatedCode,
  urls: '*', // Changed from currentUrl to '*'
  isEnabled: true,
  runAt: 'document-idle'
});
```

### 5. Remove Arabic Text

**Problem**: Arabic text in app names and descriptions.

**Files to Modify**:
- `package.json`
- `app.json`
- `index.html`

**Required Changes**:

```json
// In package.json:
{
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android", 
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "name": "niabrowser",
  // ... rest remains same
}
```

```json
// In app.json:
{
  "expo": {
    "name": "NIABrowser - Smart Developer Browser",
    "slug": "niabrowser-smart-browser",
    // ... rest remains same
  }
}
```

```html
<!-- In index.html: -->
<title>NIABrowser - Smart Developer Browser</title>
<div class="logo">NIABrowser</div>
<div class="tagline">Advanced Developer Browser with DevTools, JavaScript Injection & Network Monitoring</div>
```

---

## PHASE 2: MEDIUM PRIORITY IMPROVEMENTS 🔧

### 1. Unified Color System

**Location**: Create new file `constants/theme.js` and update all component styles

**Required Changes**:

```javascript
// Create constants/theme.js:
export const theme = {
  colors: {
    primary: '#4A90E2',
    secondary: '#50C878', 
    accent: '#FF6B6B',
    warning: '#FFC107',
    success: '#28A745',
    error: '#DC3545',
    neutral: '#6C757D',
  },
  dark: {
    background: '#1E1E1E',
    surface: '#2C2C2C',
    text: '#ECEDEE',
    textSecondary: '#CCCCCC',
    border: '#444444'
  },
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF', 
    text: '#2C3E50',
    textSecondary: '#666666',
    border: '#CCCCCC'
  }
};
```

Then update all components to use this theme instead of hardcoded colors.

### 2. Improve About Modal

**Location**: `components/AboutModal.js`

**Required Changes**:
- Add app logo/icon
- Update contact information
- Add GitHub link
- Improve design

```javascript
// Add to AboutModal.js:
<View style={styles.logoContainer}>
  <Image source={require('../assets/icon.png')} style={styles.logo} />
  <Text style={[styles.appName, { color: textColor }]}>NIABrowser</Text>
  <Text style={[styles.version, { color: textColor }]}>Version 2.0.0</Text>
</View>

<TouchableOpacity onPress={() => openLink('https://niabrowser.com')}>
  <Text style={[styles.link, { color: '#4A90E2' }]}>niabrowser.com</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => openLink('mailto:contact@niabrowser.com')}>
  <Text style={[styles.link, { color: '#4A90E2' }]}>contact@niabrowser.com</Text>
</TouchableOpacity>
```

### 3. Add Cost Warning for AI

**Location**: `components/ScriptManager.js`

**Required Changes**:
- Add prominent cost warning
- Show session costs clearly
- Add disclaimer about user responsibility

```javascript
// In ScriptManager.js, add to AI modal:
<View style={styles.warningContainer}>
  <Icon name="warning" type="material" color="#FFC107" size={24} />
  <Text style={[styles.warningText, { color: textColor }]}>
    ⚠️ AI Usage Costs: This app uses external AI services that may charge fees. 
    You are responsible for all API costs. Monitor your usage carefully.
  </Text>
</View>

<View style={styles.costSummary}>
  <Text style={[styles.costTitle, { color: textColor }]}>Session Summary:</Text>
  <Text style={[styles.costDetail, { color: textColor }]}>
    Requests: {sessionCosts.requestCount} | 
    Cost: ${sessionCosts.totalCost.toFixed(6)}
  </Text>
</View>
```

### 4. Network Request Filtering

**Location**: `components/DevTools.js`

**Required Changes**:
- Add method filter buttons (GET, POST, PUT, DELETE)
- Add status code filtering
- Improve search functionality

```javascript
// In DevTools.js, add filter state:
const [selectedMethods, setSelectedMethods] = useState(['GET', 'POST', 'PUT', 'DELETE']);
const [selectedStatuses, setSelectedStatuses] = useState([]);

// Add filter methods:
const filterNetworkLogs = useCallback(() => {
  return networkLogs.filter(log => {
    const methodMatch = selectedMethods.includes(log.method);
    const urlMatch = log.url.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(log.status);
    return methodMatch && urlMatch && statusMatch;
  });
}, [networkLogs, selectedMethods, searchQuery, selectedStatuses]);

// Add filter UI before the FlatList
```

---

## PHASE 3: MAJOR ENHANCEMENTS 🚀

### 1. Resizable DevTools Panel

**Location**: `components/DevTools.js`

**Required Changes**:
- Add drag handle
- Implement resize functionality  
- Save panel size preference
- Add smooth animations

### 2. Quick AI Code Injection

**Location**: `components/BottomNavigation.js` and create `components/QuickAI.js`

**Required Changes**:
- Add AI button to bottom navigation
- Create quick AI popup for immediate code injection
- Add common code templates
- Implement one-click execution

### 3. Element Inspector

**Location**: Create `components/ElementInspector.js`

**Required Changes**:
- Add DOM element selection
- Show element properties
- Enable style modification
- Add XPath generation

### 4. Advanced Script Management

**Location**: `components/ScriptManager.js`

**Required Changes**:
- Import/export Greasemonkey scripts
- AI-powered script editing
- Script templates library
- Performance monitoring per script

---

## Testing Instructions

After each phase:

1. **Test New Tab Creation**: Click various links and ensure no `[object Object]` appears
2. **Test User Agent**: Open selector and verify all options are visible
3. **Test Source Code**: Open large pages and verify loading state appears
4. **Test AI Generation**: Create script and verify URL defaults to "*"
5. **Test All UI**: Ensure consistent colors and no broken layouts

## Deployment Notes

- Test on both Android and iOS simulators
- Verify all modals open/close properly
- Check performance with large HTML pages
- Validate AI cost tracking accuracy

---

## Contact for Questions

If any instructions are unclear, refer back to the original code structure and maintain the existing patterns. Focus on stability over features.