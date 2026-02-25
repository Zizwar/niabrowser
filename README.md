# NIABrowser

<p align="center">
  <img src="./assets/icon.png" alt="NIABrowser Logo" width="120" height="120">
</p>

<p align="center">
  <strong>AI-Powered Developer Browser</strong>
</p>

<p align="center">
  A mobile browser built for developers with multi-provider AI chat, smart script management, full DevTools, and API client — all in one app.
</p>

<p align="center">
  <a href="https://niabrowser.vibzcode.com">Website</a> •
  <a href="https://github.com/zizwar/niabrowser/releases">Download</a> •
  <a href="https://niabrowser.vibzcode.com/privacy">Privacy</a> •
  <a href="https://niabrowser.vibzcode.com/terms">Terms</a>
</p>

---

## Key Features

### NIA AI Chat
Conversational AI assistant with full access to your browser's developer tools.

- **Multi-provider support**: OpenRouter (100+ models), Google Gemini (free daily quota), OpenAI direct
- **Context attachments**: Choose what data to share — cookies, localStorage, network logs, console output, page HTML/text
- **Code execution**: AI-generated JavaScript runs directly on the page
- **Conversation history**: Auto-saved, searchable chat history
- **Token tracking**: Monitor context size and usage across sessions
- **Privacy-first**: You control exactly what data the AI receives

### Script Manager
Create, edit, and auto-run JavaScript on any website.

- **AI Generator**: Describe what you want, AI writes the script
- **AI Edit**: Modify existing scripts with natural language instructions
- **Greasemonkey/Tampermonkey Import**: Paste userscripts, AI converts GM_* APIs for WebView
- **URL patterns**: Auto-run scripts on matching pages (wildcards, regex supported)
- **Greasemonkey compatibility**: Built-in GM API emulation layer
- **Custom system prompts**: Fine-tune AI code generation behavior

### DevTools
Full browser developer tools with AI analysis on every panel.

- **Console**: View logs, errors, warnings with AI analysis button
- **Network**: Monitor all HTTP requests with headers, bodies, timing
- **Storage**: Inspect cookies and localStorage with lazy loading
- **Performance**: Page load metrics, DOM stats, Core Web Vitals
- **AI buttons**: One-tap to analyze any panel data with NIA AI

### API Client
Built-in HTTP client for testing and debugging APIs.

- **Full REST support**: GET, POST, PUT, PATCH, DELETE
- **Import/Export**: cURL commands, Postman collections
- **Collections**: Save and organize request groups
- **Network integration**: Long-press any network log to test in API Client
- **AI analysis**: Send request data to NIA AI for debugging

### Browser
Full-featured mobile browser with developer extras.

- **Multi-tab browsing** with efficient tab management
- **Favorites**: Star icon to save, long-press star for favorites list
- **History**: Full browsing history with search
- **Desktop mode**: Toggle desktop user agent
- **User agent switching**: Test with different browsers
- **Safe mode**: Disable all scripts temporarily
- **Dark/Light theme**: System-wide theme support
- **Custom home page**: Set your preferred start page

## AI Providers

NIABrowser supports three AI providers, each with separate API keys and model lists:

| Provider | Key Feature | Models |
|----------|-------------|--------|
| **OpenRouter** | 100+ models, single API | GPT-4.1, Claude, Gemini, DeepSeek, Llama, Mistral, Grok |
| **Google Gemini** | Free daily quota | Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash |
| **OpenAI** | Direct access | GPT-4.1 Mini/Nano, GPT-4o, o4-mini |

Configure providers in Settings > AI Provider Settings. Switch between providers anytime.

## Getting Started

### Prerequisites
- Node.js v16+
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio or Xcode

### Installation

```bash
git clone https://github.com/zizwar/niabrowser.git
cd niabrowser
npm install
npm start
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS (macOS) |
| `npm run web` | Run in browser |

### Building

```bash
# Android APK
eas build --platform android

# Android AAB (Play Store)
eas build --platform android --profile production

# iOS
eas build --platform ios
```

## Architecture

Built with React Native + Expo 55:

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83, Expo 55 |
| WebView | react-native-webview 13.16 |
| State | React Context + Hooks |
| Storage | AsyncStorage + SecureStore |
| AI | OpenRouter / Google Gemini / OpenAI APIs |
| Navigation | Custom tab/modal system |

### Key Components

```
App.js                  — Main app, tab management, modal orchestration
components/
  AICommandInterface.js — NIA AI chat with context attachments
  ScriptManager.js      — Script CRUD, AI generation, import
  DevTools.js           — Console, Network, Storage, Performance panels
  CrudModal.js          — API Client with collections
  BottomNavigation.js   — Main navigation bar
  WebViewContainer.js   — WebView wrapper with injected scripts
utils/
  AIProviderManager.js  — Multi-provider AI configuration
  SettingsManager.js    — App settings persistence
  GreasemonkeyCompatibility.js — GM API emulation
```

## Privacy

- All browsing data stored locally on device
- AI data sent only to your chosen provider with your explicit action
- You control exactly what context is shared via the attachment panel
- No analytics, tracking, or data collection by the app
- Open source for full transparency

See [Privacy Policy](https://niabrowser.vibzcode.com/privacy) for details.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Links

- **Website**: [niabrowser.vibzcode.com](https://niabrowser.vibzcode.com)
- **GitHub**: [github.com/zizwar/niabrowser](https://github.com/zizwar/niabrowser)
- **Issues**: [GitHub Issues](https://github.com/zizwar/niabrowser/issues)
- **Contact**: niabrowser@vibzcode.com
- **Developer**: [Brahim Bidi](https://brah.im)
