# Apple App Store Listing - NIABrowser

> Note: iOS submission through App Store Connect (https://appstoreconnect.apple.com)
> Requires Apple Developer account ($99/year)

## App Name (max 30 chars)
```
NIABrowser
```

## Subtitle (max 30 chars)
```
AI Developer Browser & Tools
```

## Promotional Text (max 170 chars)
```
Browse with built-in AI chat, DevTools, script automation & API client. Connect to Google Gemini (free!), OpenRouter, OpenAI, or your own AI provider.
```

## Description (max 4000 chars)

```
NIABrowser is the all-in-one browser built for developers. Browse the web with built-in AI chat, a full DevTools suite, smart script automation, and an API testing client.

AI CHAT WITH 100+ MODELS
Chat with AI about any page you visit. Attach cookies, network logs, console output, or page content for context-aware conversations.

Supported providers:
- Google Gemini with free daily quota
- OpenRouter with 100+ models
- OpenAI direct access
- Custom OpenAI-compatible providers

DEVTOOLS ON YOUR DEVICE
- Console viewer with full method support
- Network request monitor with filters
- Storage inspector for cookies and localStorage
- Performance metrics dashboard
- One-tap AI analysis for any panel

SMART SCRIPT MANAGER
- AI Generator: describe what you want, AI writes the code
- AI Edit: modify scripts with natural language
- Auto-run on matching URLs
- Import Greasemonkey/Tampermonkey userscripts
- URL pattern matching with wildcards and regex

API CLIENT
- Full HTTP client (GET, POST, PUT, DELETE, PATCH)
- Custom headers and body editor
- Save requests to collections
- Import from captured network logs

DEVELOPER BROWSING
- Multi-tab with independent DevTools
- Desktop/mobile user agent switching
- Page source viewer
- Dark and light themes
- Screenshot capture
- Favorites and history

FULLY CUSTOMIZABLE
- Edit AI prompts from Settings
- Add custom AI providers
- Export/import all data
- Open source on GitHub

Your API keys stay on your device. All AI requests go directly to your chosen provider.

Website: https://niabrowser.vibzcode.com
```

## Keywords (max 100 chars, comma separated)
```
developer,browser,devtools,AI,script,API,console,network,debug,webdev,code,tools
```

## Categories
```
Primary: Developer Tools
Secondary: Productivity
```

## App Store Setup Steps

### Step 1: App Store Connect
1. Log in to https://appstoreconnect.apple.com
2. Go to My Apps > click "+"  > New App
3. Fill in:
   - Platform: iOS
   - Name: NIABrowser
   - Primary Language: English (U.S.)
   - Bundle ID: com.zizwar.niabrowser
   - SKU: niabrowser-v1

### Step 2: App Information
1. Category: Developer Tools (Primary), Productivity (Secondary)
2. Content Rights: Does not contain third-party content
3. Age Rating: 17+ (because it's a web browser with unrestricted web access)

### Step 3: Pricing and Availability
1. Price: Free
2. Availability: All territories

### Step 4: App Privacy
1. Go to App Privacy section
2. Data Types Collected: **None** (collected by the app itself)
3. Note: Users provide their own API keys which are stored locally only
4. Privacy Policy URL: `https://niabrowser.vibzcode.com/privacy.html`

### Step 5: Version Information
1. Paste the Description, Promotional Text, Keywords
2. Upload screenshots:
   - iPhone 6.7" (1290 x 2796) — required
   - iPhone 6.5" (1242 x 2688) — required
   - iPad 12.9" (2048 x 2732) — if supporting iPad
3. Upload App Icon (1024 x 1024, no alpha, no rounded corners — Apple rounds them)

### Step 6: Build
1. Build with: `eas build --platform ios`
2. Upload via Xcode or Transporter app
3. Select the build in App Store Connect

### Step 7: Review Notes (for Apple reviewer)
```
NIABrowser is a developer-focused browser with built-in debugging tools.

AI features require the user to provide their own API key from supported providers (Google Gemini, OpenRouter, or OpenAI). The app does not include any pre-configured API access.

To test AI features:
1. Open Settings > AI tab
2. Switch to "Google Gemini" provider
3. Enter a Gemini API key (free from ai.google.dev)
4. Open AI Chat and send a message

The Script Manager allows developers to create and run their own JavaScript on web pages they visit, similar to browser extensions like Tampermonkey. This is a standard developer tool feature.

No account registration is required. The app is open source: https://github.com/zizwar/niabrowser
```

### Step 8: Submit
1. Ensure all fields have green checkmarks
2. Click "Add for Review"
3. Review time: typically 24-48 hours

---

## iOS-Specific Considerations

| Topic | Notes |
|-------|-------|
| Age Rating | 17+ recommended due to unrestricted web access |
| WebView usage | Apple allows WebView-based browsers. Ensure WKWebView is used (react-native-webview uses it by default on iOS) |
| JavaScript execution | Frame as "developer tools" and "automation" — standard for dev tool apps |
| API key handling | Stored in AsyncStorage. Consider migrating to expo-secure-store for iOS Keychain |
| In-App Browser | Apple requires all iOS browsers use WebKit. react-native-webview complies |
