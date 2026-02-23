# Google Play Policy Declarations

## 1. Advertising ID Declaration

### Does your app use advertising ID?
**NO**

### Explanation
- التطبيق لا يستخدم معرف الإعلانات (Advertising ID) على الإطلاق
- لا توجد أي مكتبات إعلانات مثل AdMob أو أي SDK إعلانات أخرى
- نظام AnalyticsManager الموجود في التطبيق هو نظام محلي بالكامل يخزن البيانات في AsyncStorage ولا يرسل أي بيانات لخوادج خارجية
- التطبيق لا يحتوي على إعلانات ولا يتتبع المستخدمين لأغراض إعلانية

---

## 2. Photo and Video Permissions Declaration

التطبيق يستخدم الصلاحيات التالية:
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_VIDEO`
- `android.permission.READ_MEDIA_AUDIO`

### لماذا نستخدم هذه الصلاحيات؟

⚠️ **ملاحظة مهمة**: هذه الصلاحيات مضافة تلقائياً بواسطة مكتبة `expo-media-library` لكن **التطبيق لا يستخدمها حالياً**.

### الاستخدام الفعلي للتطبيق:

#### 1. تصدير/استيراد بيانات المتصفح (Export/Import)

التطبيق يستخدم الملفات لـ:
- **تصدير البيانات**: حفظ المفضلات، التاريخ، السكريبتات، الإعدادات كملفات JSON
- **استيراد البيانات**: استعادة البيانات من ملفات JSON

**المواقع في الكود:**
- `SettingsScreen.js:210-298` - وظائف export/import
- `BottomSheet.js:117-190` - وظائف export/import

**المكتبات المستخدمة:**
- `expo-document-picker` - لاختيار الملفات للاستيراد
- `expo-file-system` - لقراءة وكتابة ملفات JSON
- `expo-sharing` - لمشاركة الملفات المصدرة

**هذه المكتبات لا تحتاج إلى `READ_MEDIA_*` permissions!**

### لماذا الصلاحيات موجودة إذن؟

الصلاحيات موجودة في AndroidManifest لأن:
1. مكتبة `expo-media-library` مضافة في plugins (app.json:63)
2. المكتبة تضيف الصلاحيات تلقائياً حتى لو لم نستخدمها
3. كانت موجودة لميزة Screenshot لكنها **غير مفعلة حالياً**

---

## الإجابات المطلوبة لـ Google Play Console

### 1. Advertising ID
**Question:** Does your app use advertising ID?
**Answer:** ✅ **No**

**Reason:** The app does not use advertising ID and contains no advertising SDKs.

---

### 2. Read media images
**Question:** Describe your app's use of the READ_MEDIA_IMAGES permission

**الإجابة الصحيحة (أقل من 250 حرف):**
```
The permission is requested by expo-media-library dependency but not actively used. The app uses DocumentPicker and FileSystem APIs (no permissions required) for importing/exporting browser data as JSON files.
```

**بالعربية:**
```
الإذن مطلوب من مكتبة expo-media-library لكن غير مستخدم فعلياً. التطبيق يستخدم DocumentPicker و FileSystem (لا تحتاج صلاحيات) لاستيراد/تصدير بيانات المتصفح كملفات JSON.
```

**أو إجابة أبسط:**
```
Not actively used. Required by expo-media-library dependency. App exports/imports browser data using system file picker which doesn't access media files.
```

---

### 3. Read media video
**Question:** Describe your app's use of the READ_MEDIA_VIDEO permission

**الإجابة الصحيحة:**
```
Not actively used. Required by expo-media-library dependency. No video files are accessed. App only exports/imports JSON data files via system file picker.
```

**بالعربية:**
```
غير مستخدم فعلياً. مطلوب من مكتبة expo-media-library. لا يتم الوصول لملفات الفيديو. التطبيق فقط يصدر/يستورد ملفات JSON عبر منتقي الملفات.
```

---

## الخيارات المتاحة

### الخيار 1: إزالة الصلاحيات (موصى به ✅)

إزالة `expo-media-library` من app.json إذا لم تكن ميزة Screenshot مطلوبة:

```json
"plugins": [
  "expo-web-browser",
  // "expo-media-library",  // احذف هذا السطر
  "expo-secure-store",
  "expo-font",
  "expo-sharing"
]
```

هذا سيزيل الصلاحيات تلقائياً ولن تحتاج للرد على Google Play.

### الخيار 2: الإبقاء على الصلاحيات

إذا كنت تخطط لإضافة ميزة Screenshot مستقبلاً، استخدم الإجابات أعلاه.

---

## ملاحظات فنية مهمة

### الاستخدام الفعلي للملفات في التطبيق:

#### ✅ Import/Export Data (لا يحتاج READ_MEDIA permissions)
```javascript
// SettingsScreen.js & BottomSheet.js
- DocumentPicker.getDocumentAsync()     // نظام Android picker - لا يحتاج صلاحيات
- FileSystem.writeAsStringAsync()       // الكتابة في app directory
- FileSystem.readAsStringAsync()        // القراءة من app directory
- Sharing.shareAsync()                  // نظام Android share - لا يحتاج صلاحيات
```

#### ❌ Screenshot (يحتاج READ_MEDIA لكن غير مستخدم)
```javascript
// App.js:378 - موجود لكن لا يتم استدعاؤه
- MediaLibrary.saveToLibraryAsync()     // يحتاج READ_MEDIA_IMAGES
```

### لماذا لا نحتاج الصلاحيات؟

✅ **DocumentPicker** - يستخدم Android's SAF (Storage Access Framework) - لا يحتاج صلاحيات
✅ **FileSystem** - يعمل في app's scoped storage - لا يحتاج صلاحيات
✅ **Sharing** - يستخدم Android's ShareSheet - لا يحتاج صلاحيات
❌ **MediaLibrary** - يحتاج صلاحيات لكن **غير مستخدم في التطبيق**

---

## التوصية النهائية

**أفضل حل:** احذف `expo-media-library` من plugins في app.json

هذا سيحل المشكلة تماماً ولن تحتاج للإجابة على أسئلة Google Play عن Photo/Video permissions.
