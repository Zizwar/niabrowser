# 🤖 Claude Code Assistant - Prompt للتعديلات

## المهمة الأساسية
تحويل مشروع WebZview إلى نيةبراوزر (NIABrowser) مع إضافة ميزات الذكاء الاصطناعي وإصلاح جميع المشاكل المذكورة.

## 📋 قائمة التعديلات المطلوبة

### 🔄 التعديلات الفورية (أولوية عالية)

1. **تغيير جميع التسميات**:
   - ابحث عن: `webzview`, `WebZview`, `WEBZVIEW`, `WebZview Developer Browser`
   - استبدل بـ: `niabrowser`, `NIABrowser`, `نيةبراوزر`, `نيةبراوزر - البراوزر الذكي`
   - في جميع الملفات: `.js`, `.json`, `.md`, النصوص

2. **إزالة الأيقونات**:
   - ❌ أيقونة Screenshot من `BottomNavigation.js`
   - ❌ Safe Mode من أسفل `DevTools.js` (احتفظ بالوظيفة في الأعلى)

3. **إضافة أيقونة المعلومات**:
   ```javascript
   // في ScriptManager.js أضف أيقونة info تعرض modal مع:
   - شرح Script Manager
   - أمثلة للاستخدام
   - تحذير: "لا تستخدم سكريپتات غير موثوقة"
   - تحذير: "أنت تتحمل مسؤولية حقن الكود"
   ```

### 🧠 إضافة الذكاء الاصطناعي

4. **AI Script Generator في ScriptManager**:
   ```javascript
   // أضف واجهة لإنشاء السكريپتات بالذكاء الاصطناعي:
   
   const AIConfig = {
     openrouter: {
       baseURL: 'https://openrouter.ai/api/v1/chat/completions',
       models: {
         basic: [
           'openai/gpt-4o-mini',
           'google/gemini-pro',
           'anthropic/claude-3-haiku'
         ],
         advanced: 'manual_input'
       }
     },
     
     systemPrompt: `أنت مساعد لإنشاء JavaScript code للتنفيذ في React Native WebView.
     
السياق التقني:
- البيئة: WebView مع React Native
- التواصل: window.ReactNativeWebView.postMessage(JSON.stringify({...}))
- DOM: وصول كامل لعناصر الصفحة
- الأمان: تجنب الكود الضار

أنشئ كود JavaScript نظيف وآمن وموثق.`
   };
   
   // إضافة UI للـ AI:
   // - TextInput لوصف المهمة
   // - Picker لاختيار المودل  
   // - Toggle للإعدادات المتقدمة (manual model input, parameters)
   // - عرض التكلفة المتوقعة
   // - زر إنشاء السكريپت
   ```

5. **Cost Tracking System**:
   ```javascript
   // إضافة نظام تتبع التكلفة:
   const CostTracker = {
     session: {
       totalTokens: { input: 0, output: 0 },
       totalCost: 0.0000,
       requestCount: 0
     },
     
     calculateCost: (model, inputTokens, outputTokens) => {
       // حساب التكلفة حسب المودل
       const pricing = {
         'openai/gpt-4o-mini': { input: 0.000150, output: 0.000600 },
         'google/gemini-pro': { input: 0.000500, output: 0.001500 },
         'anthropic/claude-3-haiku': { input: 0.000250, output: 0.001250 }
       };
       
       return (inputTokens * pricing[model].input + outputTokens * pricing[model].output) / 1000;
     },
     
     displayAfterRequest: (cost, tokens) => {
       Alert.alert(
         '💰 تكلفة الطلب',
         `المودل: ${model}\nالتوكنات: ${tokens.input} → ${tokens.output}\nالتكلفة: $${cost.toFixed(6)}`,
         [{ text: 'موافق' }]
       );
     }
   };
   ```

### 🔧 إصلاحات المشاكل الحالية

6. **إصلاح Safe Mode**:
   ```javascript
   // في App.js و DevTools.js:
   const SafeModeManager = {
     enable: async () => {
       // احفظ حالة السكريپتات المفعلة
       const enabledScripts = scripts.filter(s => s.isEnabled).map(s => s.name);
       await AsyncStorage.setItem('enabledScriptsBeforeSafeMode', JSON.stringify(enabledScripts));
       
       // عطل جميع السكريپتات
       toggleAllScripts(false);
       setIsSafeMode(true);
     },
     
     disable: async () => {
       // استعيد السكريپتات المفعلة سابقاً
       const savedScripts = await AsyncStorage.getItem('enabledScriptsBeforeSafeMode');
       if (savedScripts) {
         const scriptNames = JSON.parse(savedScripts);
         // أعد تفعيل السكريپتات المحفوظة
         scriptNames.forEach(name => toggleScript(name, true));
       }
       setIsSafeMode(false);
     }
   };
   ```

7. **إصلاح Performance Metrics**:
   ```javascript
   // في DevTools.js:
   // - اقلب ترتيب النتائج (reverse order)
   // - فلتر القيم الصفرية
   // - تأكد من صحة الحسابات في WebViewContainer.js
   
   const sortedMetrics = Object.entries(performanceMetrics)
     .filter(([key, value]) => value > 0)
     .reverse();
   ```

8. **إصلاح Console و Network Logs**:
   ```javascript
   // في DevTools.js أضف:
   
   // للكونسول:
   const clearConsoleLogs = () => {
     updateTabInfo(activeTabIndex, { consoleOutput: [] });
   };
   
   const copyAllLogs = async () => {
     const allLogs = consoleOutput.map(log => `[${log.type}] ${log.message}`).join('\n');
     await Clipboard.setStringAsync(allLogs);
     Alert.alert('تم النسخ', 'تم نسخ جميع اللوغات');
   };
   
   // للشبكة - إصلاح الحذف:
   const clearNetworkLogs = () => {
     Alert.alert(
       'مسح سجلات الشبكة',
       'هل أنت متأكد؟',
       [
         { text: 'إلغاء', style: 'cancel' },
         { text: 'مسح', onPress: () => {
           if (typeof updateTabInfo === 'function') {
             updateTabInfo(activeTabIndex, { networkLogs: [] });
           }
         }}
       ]
     );
   };
   ```

9. **إصلاح History و Favorites**:
   ```javascript
   // في HistoryFavoritesModal.js:
   
   const removeFromHistory = async (urlToRemove) => {
     try {
       const savedHistory = await AsyncStorage.getItem('browserHistory');
       if (savedHistory) {
         const historyArray = JSON.parse(savedHistory);
         const updatedHistory = historyArray.filter(item => {
           const itemUrl = typeof item === 'string' ? item : item.url;
           return itemUrl !== urlToRemove;
         });
         await AsyncStorage.setItem('browserHistory', JSON.stringify(updatedHistory));
         
         // إعادة تحميل القائمة
         onClose(); // أغلق وأعد فتح لإعادة التحميل
       }
     } catch (error) {
       console.error('Error removing from history:', error);
     }
   };
   
   // أضف أيقونة سلة المهملات:
   <TouchableOpacity onPress={() => removeFromHistory(item)} style={styles.deleteIcon}>
     <Icon name="delete" type="material" color="#FF5252" size={20} />
   </TouchableOpacity>
   ```

10. **إصلاح حفظ واستعادة التابات**:
    ```javascript
    // في hooks/index.js:
    
    const saveTabs = async (tabsToSave, activeIndex) => {
      try {
        const tabsData = tabsToSave.map((tab, index) => ({
          url: tab.url,
          title: tab.title,
          id: tab.id,
          isActive: index === activeIndex
        }));
        await AsyncStorage.setItem('savedTabs', JSON.stringify(tabsData));
        await AsyncStorage.setItem('activeTabIndex', activeIndex.toString());
      } catch (error) {
        console.error('Error saving tabs:', error);
      }
    };
    
    const loadTabs = async () => {
      try {
        const savedTabs = await AsyncStorage.getItem('savedTabs');
        const savedActiveIndex = await AsyncStorage.getItem('activeTabIndex');
        
        if (savedTabs) {
          const parsedTabs = JSON.parse(savedTabs);
          setTabs(parsedTabs);
          
          if (savedActiveIndex) {
            setActiveTabIndex(parseInt(savedActiveIndex));
          }
        }
      } catch (error) {
        console.error('Error loading tabs:', error);
      }
    };
    ```

### 🎨 تحسينات UI/UX

11. **تحسين URL Bar**:
    ```javascript
    // في ToolBar.js أضف:
    
    // Favicon support:
    const getFaviconUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return `https://${urlObj.hostname}/favicon.ico`;
      } catch {
        return null;
      }
    };
    
    // Auto-complete من History + Favorites:
    const [suggestions, setSuggestions] = useState([]);
    
    const handleUrlChange = (text) => {
      setInputUrl(text);
      
      if (text.length > 2) {
        const historySuggestions = history.filter(item => 
          item.url.toLowerCase().includes(text.toLowerCase()) ||
          item.title.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 5);
        
        const favoriteSuggestions = favorites.filter(fav =>
          fav.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 3);
        
        setSuggestions([...favoriteSuggestions, ...historySuggestions]);
      } else {
        setSuggestions([]);
      }
    };
    ```

12. **إصلاح target="_blank" Links**:
    ```javascript
    // في WebViewContainer.js أضف للـ injectedJavaScript:
    
    `
    // معالجة target="_blank" و window.open
    document.addEventListener('click', function(event) {
      var target = event.target;
      
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      if (target && target.tagName === 'A') {
        var href = target.href;
        var targetAttr = target.getAttribute('target');
        
        if (targetAttr === '_blank' && href) {
          event.preventDefault();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'openInNewTab',
            url: href
          }));
        }
      }
    }, true);
    
    // Override window.open
    const originalOpen = window.open;
    window.open = function(url, target, features) {
      if (url) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openInNewTab',
          url: url
        }));
      }
      return null;
    };
    `
    
    // وفي handleMessage أضف:
    case 'openInNewTab':
      addNewTab(data.url);
      setTimeout(() => setActiveTabIndex(tabs.length), 100);
      break;
    ```

### 📱 تحسينات إضافية

13. **إعداد الروابط الخارجية**:
    ```javascript
    // في app.json أضف:
    "expo": {
      "scheme": "niabrowser",
      "android": {
        "intentFilters": [
          {
            "action": "VIEW",
            "data": [
              { "scheme": "https" },
              { "scheme": "http" }
            ],
            "category": ["BROWSABLE", "DEFAULT"]
          }
        ]
      }
    }
    
    // في App.js أضف معالج:
    useEffect(() => {
      const handleUrl = (event) => {
        addNewTab(event.url);
        setActiveTabIndex(tabs.length);
      };
      
      Linking.addEventListener('url', handleUrl);
      return () => Linking.removeEventListener('url', handleUrl);
    }, []);
    ```

14. **تحسين Code Highlighting والنسخ**:
    ```javascript
    // في ScriptManager.js أضف:
    
    import SyntaxHighlighter from 'react-native-syntax-highlighter';
    
    const CodeEditor = ({ code, onCodeChange }) => {
      const [showLineNumbers, setShowLineNumbers] = useState(true);
      
      return (
        <View style={styles.codeEditor}>
          <View style={styles.codeToolbar}>
            <TouchableOpacity onPress={() => copyCodeToClipboard(code)}>
              <Icon name="content-copy" /> <Text>نسخ الكود</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowLineNumbers(!showLineNumbers)}>
              <Icon name="format-list-numbered" /> <Text>أرقام الأسطر</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.codeInput, { fontFamily: 'monospace' }]}
            value={code}
            onChangeText={onCodeChange}
            multiline
            textAlignVertical="top"
            placeholder="// اكتب JavaScript code هنا..."
          />
        </View>
      );
    };
    
    const copyCodeToClipboard = async (code) => {
      await Clipboard.setStringAsync(code);
      Alert.alert('تم النسخ', 'تم نسخ الكود إلى الحافظة');
    };
    ```

### 🚨 تحذيرات ومعلومات

15. **تحديث OnboardingScreen**:
    ```javascript
    // في OnboardingScreen.js أضف شريحة تحذير:
    
    const slides = [
      {
        key: 'warning',
        title: '⚠️ تحذير هام',
        text: 'نيةبراوزر مصمم للمطورين المحترفين الذين يفهمون مخاطر حقن الكود. إذا لم تكن مطوراً، يُنصح بشدة باستخدام المتصفحات التقليدية مثل Chrome أو Firefox.',
        icon: 'warning',
        color: '#FF6B6B'
      },
      {
        key: 'responsibility',
        title: '🔒 المسؤولية',
        text: 'أنت تتحمل المسؤولية الكاملة عن أي كود يتم حقنه أو تنفيذه. تأكد من فهم وثقة في أي سكريپت قبل تشغيله.',
        icon: 'security',
        color: '#4ECDC4'
      },
      // باقي الشرائح الحالية...
    ];
    ```

16. **تحديث تحذيرات Script Manager**:
    ```javascript
    // في ScriptManager.js أضف modal للمعلومات:
    
    const InfoModal = ({ visible, onClose }) => (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.infoModal}>
            <ScrollView>
              <Text style={styles.infoTitle}>📖 دليل Script Manager</Text>
              
              <Text style={styles.infoSection}>💡 ما هو Script Manager؟</Text>
              <Text style={styles.infoText}>
                يسمح لك بحقن وتشغيل JavaScript code مخصص على أي موقع ويب.
              </Text>
              
              <Text style={styles.infoSection}>📝 أمثلة للاستخدام:</Text>
              <Text style={styles.infoText}>
                • تغيير مظهر المواقع{'\n'}
                • استخراج البيانات{'\n'}
                • أتمتة المهام{'\n'}
                • إضافة وظائف جديدة للمواقع
              </Text>
              
              <Text style={styles.infoSection}>⚠️ تحذيرات مهمة:</Text>
              <Text style={[styles.infoText, { color: '#FF6B6B' }]}>
                • لا تستخدم سكريپتات من مصادر غير موثوقة{'\n'}
                • تأكد من فهم الكود قبل تشغيله{'\n'}
                • أنت تتحمل المسؤولية الكاملة{'\n'}
                • قد يؤثر على أمان المواقع
              </Text>
              
              <Text style={styles.infoSection}>🧠 الذكاء الاصطناعي:</Text>
              <Text style={styles.infoText}>
                يمكنك استخدام الذكاء الاصطناعي لإنشاء سكريپتات بوصف بسيط للمهمة المطلوبة.
              </Text>
            </ScrollView>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>فهمت</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
    ```

## 🎯 أولويات التنفيذ

### الأولوية الأولى (فوري):
1. ✅ تغيير جميع التسميات
2. ✅ إزالة أيقونة Screenshot  
3. ✅ إصلاح Safe Mode
4. ✅ إصلاح clear functions في DevTools

### الأولوية الثانية (هذا الأسبوع):
5. ✅ إضافة AI Script Generator
6. ✅ إصلاح History/Favorites deletion
7. ✅ إصلاح tab restoration
8. ✅ إصلاح target="_blank" links

### الأولوية الثالثة (الأسبوع القادم):
9. ✅ تحسين URL bar مع auto-complete
10. ✅ إضافة Favicon support
11. ✅ تحسين Code Editor
12. ✅ إضافة External links handling

## 🧪 اختبارات مطلوبة

### بعد كل تعديل اختبر:
- ✅ الوظيفة تعمل بشكل صحيح
- ✅ لا توجد errors في console
- ✅ الواجهة تبدو جيدة
- ✅ التطبيق مستقر ولا يتعطل

### اختبارات شاملة:
- ✅ فتح وإغلاق التابات
- ✅ حفظ واستعادة البيانات
- ✅ تشغيل السكريپتات
- ✅ استخدام DevTools
- ✅ التنقل بين المواقع

## 🔧 نصائح للتطوير

1. **النسخ الاحتياطية**: احفظ نسخة قبل التعديلات الكبيرة
2. **التدرج**: طبق تعديل واحد في كل مرة
3. **الاختبار**: اختبر على Android و iOS
4. **الوضوح**: أضف تعليقات للكود الجديد
5. **الأمان**: تأكد من validation للمدخلات

## 📋 Checklist للتأكد

- [ ] تم تغيير جميع أسماء webzview
- [ ] تمت إزالة أيقونة Screenshot
- [ ] Safe Mode يعمل بشكل صحيح
- [ ] DevTools clear functions تعمل
- [ ] AI Script Generator مضاف ويعمل
- [ ] Cost tracking يعمل
- [ ] History/Favorites deletion يعمل
- [ ] Tab restoration يعمل
- [ ] Target="_blank" links تفتح في تابات داخلية
- [ ] URL auto-complete يعمل
- [ ] Favicon يظهر بشكل صحيح
- [ ] Code highlighting والنسخ يعمل
- [ ] Info modal في Script Manager مضاف
- [ ] تحذيرات الأمان مضافة
- [ ] External links handling يعمل

## 🚀 النتيجة المتوقعة

بعد تطبيق جميع التعديلات ستحصل على:

1. **نيةبراوزر** بدلاً من WebZview
2. **ذكاء اصطناعي** لإنشاء السكريپتات
3. **واجهة محسنة** مع إصلاح جميع المشاكل
4. **أمان محسن** مع التحذيرات المناسبة
5. **تجربة مستخدم** أفضل وأكثر سلاسة

---

**ملاحظة هامة**: طبق التعديلات بالتدريج واختبر كل واحد قبل الانتقال للتالي. هذا سيضمن استقرار التطبيق والعثور على المشاكل مبكراً.