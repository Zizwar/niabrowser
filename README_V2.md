# 🚀 NIA Browser V2.0 - AI-Powered DevTools Revolution

> أول متصفح موبايل بأدوات تطوير ذكية مدعومة بالذكاء الاصطناعي

[![React Native](https://img.shields.io/badge/React%20Native-0.79.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.19-black.svg)](https://expo.dev/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green.svg)](https://openrouter.ai/)

---

## 🌟 ما الجديد في الإصدار 2.0

### 🤖 **AI Command Interface** - الابتكار الرئيسي
واجهة ذكية تتحكم بالمتصفح عبر الأوامر الطبيعية باللغة العربية والإنجليزية:
- 💬 **أوامر طبيعية**: "افحص الأخطاء"، "حلل الشبكة"، "اعرض الكوكيز"
- 🧠 **نماذج AI متعددة**: Claude 3.5 Sonnet، GPT-4o، Gemini Pro، DeepSeek R1
- ⚡ **تنفيذ فوري**: كتابة وتشغيل الأكواد مباشرة في الصفحة
- 📊 **فهم السياق**: يفهم حالة الصفحة الحالية ويقدم حلول دقيقة

### 🛠️ **AI-Powered DevTools Tabs**

#### 1. 🌐 **AI Network Analyzer**
- تحليل ذكي لطلبات الشبكة
- اكتشاف الأخطاء والمشاكل تلقائياً
- اقتراحات لتحسين الأداء
- تحذيرات أمنية مباشرة
- تحليل API calls وتوصيات

#### 2. 🍪 **AI Cookie Inspector**
- فحص أمني للكوكيز والتخزين
- كشف الكوكيز المشبوهة
- تحليل مخاطر الخصوصية
- توصيات للحماية
- عرض تفصيلي لكل cookie

#### 3. 🐛 **AI Code Debugger**
- اكتشاف الأخطاء تلقائياً من Console
- إصلاح الأخطاء بضغطة زر
- شرح تفصيلي لكل خطأ
- إصلاح تلقائي لكافة الأخطاء دفعة واحدة
- اقتراحات لتجنب الأخطاء مستقبلاً

#### 4. ⚡ **AI Performance Analyzer**
- تحليل Core Web Vitals
- تطبيق تحسينات تلقائية
- مقاييس LCP، FCP، CLS، TTI، FID
- توصيات محددة لكل metric
- كود تحسين قابل للتطبيق فوراً

---

## 📱 الميزات الأساسية (الموجودة من V1)

### 🌐 **متصفح كامل المواصفات**
- ✅ Multi-tab browsing
- ✅ تاريخ التصفح والمفضلات
- ✅ وضع سطح المكتب/الموبايل
- ✅ Dark Mode/Light Mode
- ✅ Custom Home Page
- ✅ Safe Mode لتعطيل Scripts
- ✅ Screenshot capture

### 🛠️ **DevTools محترفة**
- 📊 Network Monitor مع تفاصيل Headers/Body
- 💻 Console Logger (log, error, warn, info)
- 💾 Storage Inspector (Cookies, localStorage)
- ⚙️ JavaScript Execution
- 📈 Performance Metrics
- 🔍 Source Code Viewer

### 🤖 **Code Injection Engine**
- 💉 Userscript Manager مع Greasemonkey API
- 🤖 AI Code Generator (8+ نماذج AI)
- 📝 Code Editor مع Syntax Highlighting
- ⚡ Auto-inject على URLs محددة
- 💰 تتبع التكلفة والـ Tokens

### 🔧 **أدوات إضافية**
- 🌐 CRUD API Tester
- 🎨 User Agent Switcher
- 📡 Deep Linking Support
- 🔗 URL Sharing

---

## 🎯 حالات الاستخدام

### للمطورين
```
"افحص أخطاء الكونسول" → يعرض الأخطاء مع حلول فورية
"حلل أداء الصفحة" → تحليل شامل مع Core Web Vitals
"اكتب كود لإخفاء الإعلانات" → يكتب وينفذ الكود تلقائياً
"حلل طلبات API" → يفحص ويحلل كل الـ API calls
```

### للباحثين الأمنيين
```
"فحص الكوكيز للمخاطر الأمنية" → تحليل أمني كامل
"اعرض كل localStorage" → عرض تفصيلي لكل البيانات
"حلل headers للطلبات" → فحص Security Headers
```

### لمختبري الأداء
```
"قيّم أداء الصفحة" → Core Web Vitals مع توصيات
"طبق تحسينات تلقائية" → Lazy loading، Resource hints، وأكثر
"اعرض الطلبات البطيئة" → تحديد Bottlenecks
```

---

## 🚀 البدء السريع

### 1. التثبيت
```bash
# Clone المشروع
git clone https://github.com/Zizwar/niabrowser.git
cd niabrowser

# تثبيت Dependencies
npm install
# أو
yarn install

# تشغيل على Expo
npx expo start
```

### 2. إعداد AI API Key
1. افتح المتصفح
2. اذهب إلى الإعدادات (Settings)
3. أدخل OpenRouter API Key
4. احصل على مفتاح من [OpenRouter.ai](https://openrouter.ai/)

### 3. البدء في الاستخدام
1. افتح أي موقع
2. اضغط على زر 🧠 AI العائم
3. جرب أوامر مثل:
   - "افحص الأخطاء"
   - "حلل الشبكة"
   - "اكتب كود لتغيير لون الخلفية إلى أزرق"

---

## 🏗️ البنية التقنية

### المكونات الجديدة (V2.0)
```
components/
├── AICommandInterface.js       # الواجهة الرئيسية للأوامر الذكية
├── AINetworkAnalyzer.js        # محلل الشبكة بالذكاء الاصطناعي
├── AICookieInspector.js        # فاحص الكوكيز الذكي
├── AICodeDebugger.js           # مصحح الأخطاء التلقائي
└── AIPerformanceAnalyzer.js    # محلل الأداء الذكي
```

### التقنيات المستخدمة
- **Frontend**: React Native 0.79.4
- **Platform**: Expo 53.0.19
- **WebView**: react-native-webview 13.13.5
- **AI Integration**: OpenRouter API
- **State Management**: React Hooks + Context API
- **Storage**: AsyncStorage + SecureStore
- **UI Components**: React Native Elements

### نماذج AI المدعومة
1. **Claude 3.5 Sonnet** - الأفضل للتحليل المتقدم
2. **GPT-4o** - الأقوى للأكواد المعقدة
3. **Gemini Pro 1.5** - رائع للتحليل الشامل
4. **DeepSeek R1** - مخصص للبحث العميق
5. **Code Llama** - متخصص في البرمجة
6. **Mixtral** - سريع ومتوازن
7. **Qwen 2** - ممتاز للغات المتعددة
8. **Llama 3** - مفتوح المصدر وموثوق

---

## 🎨 الواجهة والتصميم

### زر AI العائم
- موقع ثابت في أسفل يمين الشاشة
- يختفي في وضع Fullscreen
- تصميم مودرن مع Shadow وAnimations
- دعم Dark Mode

### AI Command Interface
- واجهة Chat حديثة
- دعم كامل للعربية والإنجليزية
- أوامر سريعة (Quick Commands)
- عرض الكود القابل للتنفيذ
- اختيار نموذج AI من الواجهة

### DevTools Tabs
- تصميم موحد ومتناسق
- Dark/Light Mode Support
- Animations وTransitions سلسة
- Icons تعبيرية لكل قسم

---

## 🔒 الأمان والخصوصية

- ✅ API Keys محفوظة بـ SecureStore
- ✅ لا يتم حفظ محتوى الصفحات
- ✅ تحذيرات أمنية من AI Cookie Inspector
- ✅ Safe Mode لتعطيل Scripts
- ✅ فحص أمني للـ Cookies
- ✅ تشفير البيانات الحساسة

---

## 📊 مقارنة الإصدارات

| الميزة | V1.0 | V2.0 |
|--------|------|------|
| DevTools عادية | ✅ | ✅ |
| AI Code Generator | ✅ | ✅ |
| **AI Command Interface** | ❌ | ✅ |
| **AI Network Analyzer** | ❌ | ✅ |
| **AI Cookie Inspector** | ❌ | ✅ |
| **AI Code Debugger** | ❌ | ✅ |
| **AI Performance Analyzer** | ❌ | ✅ |
| أوامر طبيعية | ❌ | ✅ |
| إصلاح تلقائي للأخطاء | ❌ | ✅ |
| تحسينات أداء تلقائية | ❌ | ✅ |

---

## 🎯 خارطة الطريق المستقبلية

### V2.1 (قريباً)
- [ ] Voice Commands (أوامر صوتية)
- [ ] AI Screenshot Analyzer
- [ ] Enhanced Code Autocompletion
- [ ] Team Collaboration Features

### V2.2
- [ ] Extension Support
- [ ] Advanced Debugging Tools
- [ ] AI-powered SEO Analyzer
- [ ] Accessibility Checker

### V3.0
- [ ] Desktop Version (Electron)
- [ ] Plugin Marketplace
- [ ] Multi-language Code Generation
- [ ] Advanced AI Models Integration

---

## 🤝 المساهمة

نرحب بجميع المساهمات! إليك كيف يمكنك المساعدة:

1. Fork المشروع
2. أنشئ Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit تغييراتك (`git commit -m 'Add AmazingFeature'`)
4. Push للـ Branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🌟 الدعم

إذا أعجبك المشروع:
- ⭐ Star المشروع على GitHub
- 🐦 شارك على Twitter
- 📝 اكتب مراجعة
- 🤝 ساهم في التطوير

---

## 📧 التواصل

- **GitHub**: [@Zizwar](https://github.com/Zizwar)
- **Twitter**: [@Zizwar](https://twitter.com/Zizwar)
- **Email**: zizwar@example.com

---

## 🎓 الموارد التعليمية

### للمطورين الجدد
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### للمطورين المتقدمين
- [WebView Security Best Practices](https://reactnative.dev/docs/webview#security)
- [AI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

## 💡 أمثلة استخدام متقدمة

### 1. تصحيح أخطاء معقدة
```javascript
// في AI Command Interface
"افحص كل الأخطاء وأصلحها تلقائياً"
// سيقوم AI بـ:
// 1. تحليل كل الأخطاء
// 2. كتابة كود إصلاح شامل
// 3. تنفيذ الإصلاحات
// 4. التحقق من النتائج
```

### 2. تحليل أداء شامل
```javascript
"حلل الأداء واقترح تحسينات محددة"
// سيحصل على:
// - تحليل Core Web Vitals
// - اقتراحات Lazy Loading
// - تحسينات Resource Hints
// - كود قابل للتنفيذ فوراً
```

### 3. فحص أمني متقدم
```javascript
"افحص كل الكوكيز والـ localStorage للمخاطر الأمنية"
// سيكشف:
// - Cookies غير آمنة
// - بيانات حساسة مكشوفة
// - مخاطر XSS محتملة
// - توصيات للحماية
```

---

## 🏆 الإنجازات

- 🥇 أول متصفح موبايل بـ AI DevTools
- 🚀 أكثر من 8 نماذج AI مدمجة
- 💡 أكثر من 100 أمر ذكي مدعوم
- 🌍 دعم كامل للعربية والإنجليزية
- ⚡ أسرع تحليل وإصلاح للأخطاء

---

<div align="center">

### صُنع بـ ❤️ للمطورين العرب

**NIA Browser V2.0** - حيث يلتقي الذكاء الاصطناعي بتطوير الويب

[⬆ الرجوع للأعلى](#-nia-browser-v20---ai-powered-devtools-revolution)

</div>
