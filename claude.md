# Claude.md - طلبات 
# التعديل النهائية لـ 
# NIABrowser
## فهم المشروع
NIABrowser هو متصفح 
متقدم للمطورين مبني بـ 
React Native. المشروع 
يحتوي على: - نظام 
تبويبات متعددة - أدوات 
مطور متقدمة - إدارة 
السكريبتات مع دعم 
الذكاء الاصطناعي - 
مراقبة الشبكة والأداء
## الطلبات المطلوب 
## تنفيذها:
### 1. إصلاح وظيفة 
### Clear Data
**الملف المستهدف:** 
`components/BottomSheet.js` 
**المشكلة:** وظيفة 
Clear Data لا تعمل 
بشكل صحيح **التعديلات 
المطلوبة:** في 
`BottomSheet.js`، يجب 
تعديل دوال المسح 
وإضافة webViewRef 
prop: ```javascript
// تعديل دالة 
// clearBrowserData:
const clearBrowserData 
= async () => {
  // مسح الكوكيز من 
  // WebView
  if (webViewRef && 
  webViewRef.current) 
  {
    webViewRef.current.injectJavaScript(`
      // مسح جميع 
      // الكوكيز
      document.cookie.split(";").forEach(function(c) 
      {
        document.cookie 
        = c.replace(/^ 
        +/, 
        "").replace(/=.*/, 
        "=;expires=" + 
        new 
        Date().toUTCString() 
        + ";path=/");
      });
      
      // مسح 
      // localStorage
      localStorage.clear();
      
      // مسح 
      // sessionStorage
      sessionStorage.clear();
      
      true; `);
  }
  
  // مسح التاريخ 
  // والفيفوريت
  try { await 
    AsyncStorage.removeItem('browserHistory'); 
    await 
    AsyncStorage.removeItem('favorites');
  } catch (error) {
    console.error('Error 
    clearing browser 
    data:', error);
  }
  
  setShowClearDataModal(false); 
  Alert.alert('Success', 
  'Browser data 
  cleared 
  successfully');
};
// تعديل دالة 
// clearAllData:
const clearAllData = 
async () => {
  Alert.alert( "Clear 
    All Data", "This 
    will delete:\n• 
    All browsing 
    history\n• All 
    favorites\n• All 
    saved scripts\n• 
    All app 
    settings\n\nThis 
    action cannot be 
    undone.", [
      { text: 
      "Cancel", style: 
      "cancel" }, {
        text: "Delete 
        All", style: 
        "destructive", 
        onPress: async 
        () => {
          try { await 
            AsyncStorage.clear(); 
            Alert.alert("Data 
            Cleared", 
            "All app 
            data has 
            been 
            cleared 
            successfully."); 
            setShowClearDataModal(false);
          } catch 
          } (error) {
            Alert.alert("Error", 
            "Failed to 
            clear 
            data. 
            Please try 
            again.");
          }
        }
      }
    ] );
};
``` وإضافة webViewRef 
prop في parameters 
الكومبوننت وتمريره من 
App.js.
### 2. إصلاح User 
### Agent Selector
**الملف المستهدف:** 
`App.js` و 
`components/BottomSheet.js` 
**المشكلة:** المودال 
لا يظهر عند النقر على 
زر User Agent في 
`App.js`: 
```javascript
// التأكد من وجود 
// state:
const 
[isUserAgentSelectorVisible, 
setUserAgentSelectorVisible] 
= useState(false);
// في JSX تأكد من 
// وجود:
<UserAgentSelector 
  visible={isUserAgentSelectorVisible} 
  onClose={() => 
  setUserAgentSelectorVisible(false)} 
  onSelectUserAgent={setCurrentUserAgent} 
  currentUserAgent={currentUserAgent} 
  isDarkMode={isDarkMode}
/> ``` في 
`BottomSheet.js`: 
```javascript
// إضافة 
// openUserAgentSelector 
// prop وتمريره للزر:
{ icon: 'person', 
title: 'User Agent', 
onPress: 
openUserAgentSelector 
},
```
### 3. إضافة Full 
### Screen مع إخفاء 
### Status Bar
**الملف المستهدف:** 
`App.js` **التعديل 
المطلوب:** 
```javascript
// إضافة import في 
// أعلى الملف:
import { StatusBar } 
from 
'expo-status-bar';
// في AppContent 
// component إضافة:
const [isFullscreen, 
setIsFullscreen] = 
useState(false);
// تعديل JSX لإخفاء 
// StatusBar في وضع 
// Full Screen:
{isFullscreen ? ( 
  <StatusBar 
  hidden={true} />
) : ( <CustomStatusBar 
  isDarkMode={isDarkMode} 
  />
)}
// تمرير props للـ 
// BottomNavigation:
onFullscreenToggle={() 
=> 
setIsFullscreen(!isFullscreen)} 
isFullscreen={isFullscreen} 
```
### 4. تعديل Bottom 
### Navigation - نظام 
### إظهار/إخفاء 
### الأزرار
**الملف المستهدف:** 
`components/BottomNavigation.js` 
**التعديل المطلوب:** 
```javascript const 
BottomNavigation = ({
  isDarkMode, 
  onHomePress, 
  onHomeLongPress, 
  onSettingsPress, 
  onDevToolsPress, 
  onCRUDPress, 
  onScriptManagerPress, 
  onGetSourcePress, 
  onToggleErudaPress, 
  onFullscreenToggle, 
  isFullscreen
}) => {
  const 
  [showAllButtons, 
  setShowAllButtons] = 
  useState(false); 
  const iconColor = 
  isDarkMode ? 
  '#FFFFFF' : 
  '#000000'; return (
    <View 
    style={[styles.container, 
    { backgroundColor: 
    isDarkMode ? 
    '#1E1E1E' : 
    '#F1F3F4' }]}>
      {showAllButtons 
      && (
        <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}>
          <TouchableOpacity 
          onPress={onHomePress} 
          onLongPress={onHomeLongPress} 
          style={styles.button}>
            <Icon 
            name="home" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onFullscreenToggle} 
          style={styles.button}>
            <Icon 
            name={isFullscreen 
            ? 
            "fullscreen-exit" 
            : 
            "fullscreen"} 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onDevToolsPress} 
          style={styles.button}>
            <Icon 
            name="developer-mode" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onCRUDPress} 
          style={styles.button}>
            <Icon 
            name="build" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onScriptManagerPress} 
          style={styles.button}>
            <Icon 
            name="extension" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onGetSourcePress} 
          style={styles.button}>
            <Icon 
            name="code" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
          <TouchableOpacity 
          onPress={onToggleErudaPress} 
          style={styles.button}>
            <Icon 
            name="bug-report" 
            type="material" 
            color={iconColor} 
            />
          </TouchableOpacity> 
        </ScrollView>
      )} 
      <TouchableOpacity
        onPress={() => 
        setShowAllButtons(!showAllButtons)} 
        style={styles.settingsButton}
      >
        <Icon 
        name="settings" 
        type="material" 
        color={iconColor} 
        />
      </TouchableOpacity> 
    </View>
  );
};
```
### 5. تعديل Script 
### Manager - نقل 
### Switch إلى الأسفل
**الملف المستهدف:** 
`components/ScriptManager.js` 
**التعديل المطلوب:** 
```javascript
// في renderScriptItem 
// function، نقل 
// Switch من 
// scriptHeader إلى 
// scriptActions:
const renderScriptItem 
= useCallback(({ item 
}) => (
  <View 
  style={[styles.scriptItem, 
  { backgroundColor: 
  isDarkMode ? 
  '#2C2C2C' : 
  '#FFFFFF' }]}>
    <View 
    style={styles.scriptHeader}>
      <Text 
      style={[styles.scriptName, 
      { color: 
      isDarkMode ? 
      '#FFFFFF' : 
      '#000000' 
      }]}>{item.name}</Text>
      {/* إزالة Switch 
      من هنا */}
    </View> <Text 
    style={[styles.scriptUrls, 
    { color: 
    isDarkMode ? 
    '#CCCCCC' : 
    '#666666' 
    }]}>URLs: 
    {item.urls || 
    'All'}</Text> 
    <Text 
    style={[styles.scriptRunAt, 
    { color: 
    isDarkMode ? 
    '#CCCCCC' : 
    '#666666' }]}>Run 
    at: 
    {item.runAt}</Text> 
    <View 
    style={styles.scriptActions}>
      <TouchableOpacity 
      onPress={() => 
      runScript(item)} 
      style={styles.actionButton}>
        <Icon 
        name="play" 
        type="font-awesome" 
        size={20} 
        color="#4CAF50" 
        />
      </TouchableOpacity> 
      <TouchableOpacity 
      onPress={() => 
      editScript(item)} 
      style={styles.actionButton}>
        <Icon 
        name="edit" 
        type="font-awesome" 
        size={20} 
        color="#2196F3" 
        />
      </TouchableOpacity> 
      <TouchableOpacity 
      onPress={() => 
      deleteScript(item.name)} 
      style={styles.actionButton}>
        <Icon 
        name="trash" 
        type="font-awesome" 
        size={20} 
        color="#F44336" 
        />
      </TouchableOpacity> 
      {/* إضافة Switch 
      هنا */} <View 
      style={styles.actionButton}>
        <Switch 
          value={item.isEnabled} 
          onValueChange={() 
          => 
          handleToggleScript(item.name)} 
          trackColor={{ 
          false: 
          "#767577", 
          true: 
          "#81b0ff" }} 
          thumbColor={item.isEnabled 
          ? "#f5dd4b" 
          : "#f4f3f4"}
        /> </View> 
    </View>
  </View> ), 
[isDarkMode, 
handleToggleScript, 
runScript, editScript, 
deleteScript]); ```
### 6. تحسين AI Model 
### Selector - 
### إخفاء/إظهار 
### الموديلات
**الملف المستهدف:** 
`components/ScriptManager.js` 
**التعديل المطلوب:** 
```javascript
// إضافة state للتحكم 
// في إظهار/إخفاء 
// الموديلات:
const 
[showModelDropdown, 
setShowModelDropdown] 
= useState(false);
// تعديل 
// renderAIGenerator 
// في جزء اختيار 
// الموديل:
<Text 
style={[styles.aiLabel, 
{ color: isDarkMode ? 
'#FFFFFF' : '#000000' 
}]}>Choose 
Model:</Text> <View 
style={styles.modelPickerContainer}>
  <TouchableOpacity 
    style={styles.modelDropdown} 
    onPress={() => 
    setShowModelDropdown(!showModelDropdown)}
  >
    <Text 
    style={[styles.modelDropdownText, 
    { color: 
    isDarkMode ? 
    '#FFFFFF' : 
    '#000000' }]}>
      {selectedModel.split('/')[1] 
      || 
      selectedModel} 
    </Text> <Icon
      name={showModelDropdown 
      ? "expand-less" 
      : "expand-more"}
      type="material" 
      color={isDarkMode 
      ? '#FFFFFF' : 
      '#000000'}
    /> 
  </TouchableOpacity>
  
  {showModelDropdown 
  && (
    <ScrollView 
    style={styles.modelOptions} 
    nestedScrollEnabled={true} 
    showsVerticalScrollIndicator={false}>
      {Object.entries(AIConfig.openrouter.models).map(([provider, 
      models]) => (
        <View 
        key={provider} 
        style={styles.providerSection}>
          <Text 
          style={[styles.providerTitle, 
          { color: 
          isDarkMode ? 
          '#FFFFFF' : 
          '#000000' 
          }]}>
            {provider.charAt(0).toUpperCase() 
            + 
            provider.slice(1)}
          </Text> 
          {models.map((model) 
          => (
            <TouchableOpacity 
              key={model} 
              style={[styles.modelOption, 
              {
                backgroundColor: 
                selectedModel 
                === 
                model 
                ? 
                '#4A90E2' 
                : 
                'transparent'
              }]}
              onPress={() 
              => {
                setSelectedModel(model); 
                setShowModelDropdown(false);
              }}
            >
              <Text 
              style={[styles.modelOptionText, 
              {
                color: 
                selectedModel 
                === 
                model 
                ? 
                '#FFFFFF' 
                : 
                (isDarkMode 
                ? 
                '#FFFFFF' 
                : 
                '#000000')
              }]}>
                {model.split('/')[1]} 
              </Text>
            </TouchableOpacity> 
          ))}
        </View> ))} 
    </ScrollView>
  )} </View>
// إضافة style للـ 
// modelOptions:
modelOptions: { 
  borderWidth: 1, 
  borderColor: 
  '#CCCCCC', 
  borderRadius: 8, 
  maxHeight: 200, 
  overflow: 'hidden',
},
```
### 7. إضافة أمثلة للـ 
### AI Task Generator
**الملف المستهدف:** 
`components/ScriptManager.js` 
**التعديل المطلوب:** 
```javascript
// إضافة قائمة الأمثلة 
// قبل 
// renderAIGenerator:
const taskExamples = [ 
  "كود يقوم بجمع روابط 
  الصور والفيديوهات 
  ووضع رابط التنزيل", 
  "كود يقوم بتحويل 
  اتجاه الصفحة من 
  اليسار إلى اليمين", 
  "إخفاء جميع 
  الإعلانات من 
  الصفحة", "تغيير 
  ألوان الصفحة إلى 
  الوضع المظلم", 
  "استخراج جميع روابط 
  البريد الإلكتروني من 
  الصفحة"
];
// في 
// renderAIGenerator، 
// إضافة بعد Task 
// Description 
// TextInput:
<Text 
style={[styles.aiLabel, 
{ color: isDarkMode ? 
'#FFFFFF' : '#000000' 
}]}>أمثلة 
المهام:</Text> 
<ScrollView horizontal 
showsHorizontalScrollIndicator={false} 
style={styles.examplesContainer}>
  {taskExamples.map((example, 
  index) => (
    <TouchableOpacity 
      key={index} 
      style={[styles.exampleButton, 
      { 
      backgroundColor: 
      isDarkMode ? 
      '#3A3A3A' : 
      '#E0E0E0' }]} 
      onPress={() => 
      setAiTaskDescription(example)}
    >
      <Text 
      style={[styles.exampleText, 
      { color: 
      isDarkMode ? 
      '#FFFFFF' : 
      '#000000' }]} 
      numberOfLines={3}>
        {example} 
      </Text>
    </TouchableOpacity> 
  ))}
</ScrollView>
// إضافة الأنماط 
// المطلوبة في styles:
examplesContainer: { 
  marginBottom: 15, 
  paddingHorizontal: 
  5,
},
exampleButton: { 
  padding: 10, 
  marginRight: 10, 
  borderRadius: 8, 
  width: 160, 
  minHeight: 70, 
  justifyContent: 
  'center',
},
exampleText: { 
  fontSize: 12, 
  textAlign: 'center', 
  lineHeight: 16,
},
```
### 8. تحديثات Props 
### المطلوبة
**الملف المستهدف:** 
`App.js` تأكد من تمرير 
جميع الـ props 
المطلوبة: 
```javascript
// في BottomSheet 
// component:
<BottomSheet 
  visible={isBottomSheetVisible} 
  onClose={() => 
  setBottomSheetVisible(false)} 
  isDarkMode={isDarkMode} 
  toggleDarkMode={toggleDarkMode} 
  toggleDesktopMode={toggleDesktopMode} 
  isDesktopMode={isDesktopMode} 
  shareUrl={() => 
  shareUrl(tabs[activeTabIndex]?.url)} 
  clearData={clearData} 
  openHistory={() => 
  setHistoryModalVisible(true)} 
  openAboutModal={() 
  => 
  setAboutModalVisible(true)} 
  openUserAgentSelector={() 
  => 
  setUserAgentSelectorVisible(true)} 
  currentUrl={tabs[activeTabIndex]?.url 
  || ''}
  isSafeMode={isSafeMode} 
  toggleSafeMode={toggleSafeMode} 
  webViewRef={webViewRefs.current[activeTabIndex]} 
  // إضافة هذا
/>
// في BottomNavigation 
// component إزالة 
// الأزرار غير 
// المطلوبة:
<BottomNavigation 
  isDarkMode={isDarkMode} 
  onHomePress={goHome} 
  onHomeLongPress={() 
  => 
  setShowHomePageModal(true)} 
  onSettingsPress={() 
  => 
  setBottomSheetVisible(true)} 
  onDevToolsPress={toggleDevTools} 
  onCRUDPress={() => 
  openCrudModal()} 
  onScriptManagerPress={() 
  => 
  setScriptManagerVisible(true)} 
  onGetSourcePress={getSourceHtml} 
  onToggleErudaPress={toggleEruda} 
  onFullscreenToggle={() 
  => 
  setIsFullscreen(!isFullscreen)} 
  isFullscreen={isFullscreen}
/> ```
### 9. تحسين ألوان 
### أزرار Network 
### Methods
**الملف المستهدف:** 
`components/DevTools.js` 
**التعديل المطلوب:** 
```javascript
// تحديث دالة 
// getMethodColor 
// لألوان أفضل:
const getMethodColor = 
(method) => {
  switch (method) { 
    case 'GET': return 
    '#28A745'; // أخضر 
    قوي case 'POST': 
    return '#007BFF'; 
    // أزرق قوي
    case 'PUT': return 
    '#FD7E14'; // 
    برتقالي قوي case 
    'DELETE': return 
    '#DC3545'; // أحمر 
    قوي case 'PATCH': 
    return '#6F42C1'; 
    // بنفسجي
    case 'HEAD': 
    return '#6C757D'; 
    // رمادي
    case 'OPTIONS': 
    return '#20C997'; 
    // تركوازي
    default: return 
    '#6C757D'; // 
    رمادي افتراضي
  }
};
// في 
// renderNetworkTab، 
// تحديث filterButton 
// styles:
{['GET', 'POST', 
'PUT', 'DELETE', 
'PATCH'].map(method => 
(
  <TouchableOpacity 
    key={method} 
    style={[
      styles.filterButton, 
      {
        backgroundColor: 
        selectedMethods.includes(method) 
        ? 
        getMethodColor(method) 
        : 
        'transparent', 
        borderColor: 
        getMethodColor(method), 
        borderWidth: 2
      }
    ]} onPress={() => 
    {
      setSelectedMethods(prev 
      =>
        prev.includes(method) 
          ? 
          prev.filter(m 
          => m !== 
          method)
          : [...prev, 
          : method]
      );
    }}
  >
    <Text style={[ 
      styles.filterButtonText, 
      {
        color: 
        selectedMethods.includes(method) 
        ? '#FFFFFF' : 
        getMethodColor(method), 
        fontWeight: 
        'bold'
      }
    ]}> {method} 
    </Text>
  </TouchableOpacity> 
))} ```
## ملاحظات مهمة:
1. **لا تقم بأي 
اختبار** - قم 
بالتعديلات فقط 2. تأكد 
من أن الـ imports 
المطلوبة موجودة في 
بداية كل ملف 3. تأكد 
من تمرير الـ props 
المطلوبة بين المكونات 
4. تأكد من أن useState 
imports موجودة في 
الملفات المحدثة 5. 
**ركز على تنفيذ الكود 
فقط بدون محاولة 
التشغيل أو الاختبار**
انتهى ملف التعديلات المطلوبة.
