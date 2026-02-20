/**
 * System Prompts Configuration
 *
 * All AI system prompts used throughout the app are defined here.
 * This makes it easy to customize AI behavior without editing component code.
 *
 * Each prompt is exported as a named constant. Some prompts are functions
 * that accept dynamic context (like the current URL or attachment state).
 *
 * Custom prompt overrides are stored in AsyncStorage and take priority
 * over the defaults below. Use the Developer section in Settings to
 * view, copy, or modify any prompt from the UI.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_PROMPT_PREFIX = 'custom_prompt_';

// Prompt keys used for storage
export const PROMPT_KEYS = {
  CHAT_SYSTEM: 'chat_system',
  SCRIPT_GENERATOR: 'script_generator',
  SCRIPT_EDITOR: 'script_editor',
};

/**
 * Get a custom prompt override from AsyncStorage.
 * Returns null if no custom value is stored.
 */
export async function getCustomPrompt(key) {
  try {
    return await AsyncStorage.getItem(CUSTOM_PROMPT_PREFIX + key);
  } catch (e) {
    return null;
  }
}

/**
 * Save a custom prompt override to AsyncStorage.
 */
export async function saveCustomPrompt(key, value) {
  try {
    await AsyncStorage.setItem(CUSTOM_PROMPT_PREFIX + key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Remove a custom prompt override, reverting to the default.
 */
export async function resetCustomPrompt(key) {
  try {
    await AsyncStorage.removeItem(CUSTOM_PROMPT_PREFIX + key);
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================
// NIA AI Chat - Main DevTools assistant prompt
// ============================================================

/**
 * Builds the system prompt for the NIA AI chat interface.
 * This prompt tells the AI what data it has access to and how to behave.
 *
 * @param {Object} context
 * @param {string} context.currentUrl - The URL currently loaded in the browser
 * @param {Object} context.attachments - Which data types the user has enabled
 * @param {number} context.consoleCount - Number of console log entries
 * @param {number} context.networkCount - Number of network requests captured
 * @param {number} context.cookieCount - Number of cookies on the page
 * @param {number} context.lsCount - Number of localStorage keys
 * @param {number} context.apiRequestCount - Number of saved API requests
 */
export const buildChatSystemPrompt = (context) => {
  const {
    currentUrl = 'No page open',
    attachments = {},
    consoleCount = 0,
    networkCount = 0,
    cookieCount = 0,
    lsCount = 0,
    apiRequestCount = 0,
  } = context;

  return `You are NIA AI, an intelligent DevTools assistant built into a mobile browser.

Current page: ${currentUrl}

Your capabilities:
1. Analyze browser data: cookies, localStorage, network requests, console logs, performance
2. Write JavaScript code to execute on the current page
3. Debug errors and suggest fixes
4. Analyze security, performance, and optimization

AVAILABLE CONTEXT (the user controls what data is attached):
- Cookies: ${attachments.cookies ? 'FULL DATA ATTACHED' : attachments.cookiesPreview ? 'PREVIEW ATTACHED (first 5 chars)' : 'NOT ATTACHED - ask user to enable if needed'}
- LocalStorage: ${attachments.localStorage ? 'FULL DATA ATTACHED' : attachments.localStoragePreview ? 'PREVIEW ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Network: ${attachments.networkFull ? 'FULL DETAILS ATTACHED (with bodies)' : attachments.network ? 'SUMMARIES ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Console: ${attachments.console ? 'LOGS ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Performance: ${attachments.performance ? 'METRICS ATTACHED' : 'NOT ATTACHED - ask user to enable if needed'}
- Page content: ${attachments.pageHTML ? 'HTML CACHED & ATTACHED' : attachments.pageText ? 'TEXT CACHED & ATTACHED' : 'NOT CACHED - user can cache via clip icon panel'}
- API Requests: ${attachments.apiRequests ? `ATTACHED (${apiRequestCount} requests)` : 'NOT ATTACHED'}

PAGE STATE SUMMARY:
- Console entries: ${consoleCount}
- Network requests: ${networkCount}
- Cookies: ${cookieCount}
- LocalStorage keys: ${lsCount}

IMPORTANT RULES:
- If you need data the user hasn't attached, politely ask them to enable it via the clip icon (attachment panel)
- When returning data, properly serialize objects - never show [object Object]
- Wrap executable JavaScript in \`\`\`javascript code blocks
- Be concise and practical`;
};

// ============================================================
// Script Manager - AI script generation prompt
// ============================================================

/**
 * Default system prompt for the AI Script Generator.
 * Tells the AI to generate clean JavaScript for WebView injection.
 */
export const SCRIPT_GENERATOR_PROMPT = `You are an assistant for creating JavaScript code to be executed in React Native WebView.

Technical Context:
- Environment: WebView with React Native
- Communication: window.ReactNativeWebView.postMessage(JSON.stringify({...}))
- DOM: Full access to page elements
- Security: Avoid malicious code

IMPORTANT: Return ONLY the JavaScript code without any explanation, markdown formatting, or additional text. Just provide the raw JavaScript code that can be executed directly.`;

// ============================================================
// Script Manager - AI code editor prompt
// ============================================================

/**
 * System prompt for the AI Edit feature (modifying existing scripts).
 */
export const SCRIPT_EDITOR_PROMPT = 'You are a JavaScript code editor. Given existing code and an edit instruction, return ONLY the modified JavaScript code. No explanations, no markdown formatting, just the raw code.';

// ============================================================
// Script Manager - Task examples for AI Generator
// ============================================================

/**
 * Quick-select example tasks shown as chips in the Script Manager.
 * Users can tap these to quickly start generating a script.
 */
export const SCRIPT_TASK_EXAMPLES = [
  'Collect all image and video links and add download buttons',
  'Convert page direction from left-to-right to right-to-left',
  'Hide all advertisements from the page',
  'Change page colors to dark mode theme',
  'Extract all email addresses from the page',
];

export default {
  buildChatSystemPrompt,
  SCRIPT_GENERATOR_PROMPT,
  SCRIPT_EDITOR_PROMPT,
  SCRIPT_TASK_EXAMPLES,
  PROMPT_KEYS,
  getCustomPrompt,
  saveCustomPrompt,
  resetCustomPrompt,
};
