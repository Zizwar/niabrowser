# NIABrowser — Changelog

All notable changes to this project. Format follows Play Store and App Store release conventions.

---

## v1.1.1 (Build 6) — February 2026

### Play Store Release Notes (max 500 chars)
```
What's new in v1.1.1:

- AI Target Selector — Switch between open tabs while chatting with AI
- Per-site context memory — Each tab keeps its own attachments
- 6 new AI models: GPT-5 Mini, GPT-5.1 Codex Mini, Grok 4, Grok 4.1, Grok Code, Arcee Coder
- Dynamic tab bar — Tabs resize for better readability
- Model management — Browse, edit, and delete models with cost info
- Improved Android navigation bar support across all screens
- Refreshed new tab page with demo access
```

### Full Release Notes
```
NIABrowser v1.1.1 — Smarter AI, Better UX

NEW FEATURES:
- AI Target Selector: Switch between your open tabs directly from the AI chat. Ask AI about any page without leaving the conversation.
- Per-Site Context Memory: Each tab remembers its own attachment selections (cookies, network, console, etc.) — switching tabs preserves your choices.
- 6 New AI Models: GPT-5 Mini, GPT-5.1 Codex Mini, Arcee Coder Large, Grok 4 Fast, Grok 4.1 Fast, and Grok Code Fast now available via OpenRouter.
- Model Management: Full model browser in Settings — view all models with cost tiers, input/output pricing, and max tokens. Edit or remove any model.
- Dynamic Tab Bar: Tabs automatically resize based on count — full-width for 1–2 tabs, compact and scrollable for 3+.

IMPROVEMENTS:
- Refreshed new tab page with Demo button and cleaner quick access layout
- Settings forms (add/edit models and providers) now render inline — no more floating overlays
- AI context panel is now scrollable — the Done button is always visible
- Removed hardcoded model fallbacks — the app always respects your selected model

BUG FIXES:
- Fixed Android system navigation bar overlapping bottom UI across all screens, modals, and sheets
- Fixed new tabs defaulting to Google.com instead of blank page
- Fixed version display in About screen now reads from package.json
```

---

## v1.1.0 (Build 5) — February 2026

### Play Store Release Notes
```
What's new in v1.1.0:
- AI Chat: Talk to AI about any page with Google Gemini (free!), OpenRouter, or OpenAI
- Script Manager: AI generates and edits scripts from plain English
- Full DevTools: Console, Network, Storage, Performance monitoring
- API Client: Test HTTP endpoints with saved collections
- Custom providers: Add your own OpenAI-compatible AI services
- New tab dashboard with quick access to all developer tools
- Userscript import (Greasemonkey/Tampermonkey)
- Data export/import
```

### Full Release Notes
```
NIABrowser v1.1.0 — Major Update

NEW FEATURES:
- Multi-provider AI Chat (Google Gemini free, OpenRouter 100+ models, OpenAI)
- AI Script Generator and AI Edit for script automation
- Full DevTools suite with console, network, storage, and performance
- Built-in API client with collections
- Custom AI provider support
- Developer config panel for prompt customization
- Interactive new tab page
- Greasemonkey/Tampermonkey userscript import

IMPROVEMENTS:
- Enhanced console capture (table, group, trace, and more)
- Model selector with provider grouping and search
- Better keyboard handling in AI chat
- Script toggle reliability fix

This is a major update transforming NIABrowser into a complete mobile development environment.
```

---

## v1.0.0 (Build 1) — Initial Release

```
NIABrowser — AI-Powered Developer Browser

- Multi-tab browsing with desktop/mobile user agent switching
- JavaScript execution on any website
- Favorites and browsing history
- Page source viewer
- Dark and light themes
- Screenshot capture
```
