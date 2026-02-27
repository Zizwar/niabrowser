import { Share, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createNewTab = (url, title = 'New Tab', isPrivate = false) => ({
  id: Date.now(),
  url: url || 'about:blank',
  title,
  isPrivate,
  networkLogs: [],
  consoleOutput: [],
  storage: { cookies: '', localStorage: '' },
  performanceMetrics: null,
  isDevToolsVisible: false,
  isCrudModalVisible: false,
  crudInitialData: null,
  isSourceCodeModalVisible: false,
  sourceCode: '',
  selectedNetworkLog: null,
  isNetworkLogModalVisible: false,
  canGoBack: false,
  canGoForward: false,
});

export const shareUrl = async (url) => {
  try {
    await Share.share({ message: url });
  } catch (error) {
    console.error('Error sharing URL:', error);
  }
};

export const clearData = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert("Data Cleared", "All app data has been cleared successfully.");
  } catch (error) {
    console.error('Error clearing data:', error);
    Alert.alert("Error", "Failed to clear data. Please try again.");
  }
};

export const createGreasemonkeyEnvironment = (script, metadata) => {
  return `
    (function() {
      const GM = {
        addStyle: (css) => {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
        },
        xmlHttpRequest: (details) => {
          return fetch(details.url, {
            method: details.method || 'GET',
            headers: details.headers,
            body: details.data
          }).then(response => response.text())
            .then(responseText => {
              if (details.onload) {
                details.onload({ responseText });
              }
            });
        },
        getValue: (key, defaultValue) => {
          return defaultValue;
        },
        setValue: (key, value) => {
          console.log('setValue called with', key, value);
        },
      };

      const GM_info = {
        script: ${JSON.stringify(metadata)}
      };

      window.GM_addStyle = GM.addStyle;
      window.GM_xmlhttpRequest = GM.xmlHttpRequest;
      window.GM_getValue = GM.getValue;
      window.GM_setValue = GM.setValue;
      window.GM_info = GM_info;

      ${script}
    })();
  `;
};

export const parseMetadata = (scriptContent) => {
  const metadataRegex = /\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/;
  const match = scriptContent.match(metadataRegex);
  if (!match) return {};

  const metadata = {};
  const lines = match[1].split('\n');
  lines.forEach(line => {
    const [key, value] = line.split(/\s+/).filter(Boolean);
    if (key && value) {
      const cleanKey = key.replace('@', '').trim();
      metadata[cleanKey] = value.trim();
    }
  });

  return metadata;
};

export const shouldRunOnUrl = (scriptUrls, currentUrl) => {
  if (!scriptUrls) return true;
  const urlPatterns = scriptUrls.split(',').map(u => u.trim());
  return urlPatterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(currentUrl);
  });
};

export const injectJavaScript = (webViewRef, code) => {
  if (webViewRef && webViewRef.injectJavaScript) {
    webViewRef.injectJavaScript(`
      (function() {
        try {
          ${code}
        } catch (error) {
          console.error('Error executing script:', error);
        }
      })();
      true;
    `);
  }
};