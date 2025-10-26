import { SettingsManager } from './SettingsManager';
import { Alert } from 'react-native';

export const AIHelper = {
  /**
   * Send a request to OpenRouter API
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Optional parameters (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} Response from the API
   */
  async sendRequest(messages, options = {}) {
    try {
      // Get API key and model from settings
      const apiKey = await SettingsManager.getApiKey();
      const model = await SettingsManager.getSelectedModel();

      if (!apiKey) {
        throw new Error('API Key غير موجود. يرجى إضافة المفتاح في الإعدادات.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        raw: data
      };

    } catch (error) {
      console.error('AI Helper Error:', error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  },

  /**
   * Execute JavaScript code in WebView
   * @param {Object} webViewRef - Reference to WebView
   * @param {String} code - JavaScript code to execute
   */
  async executeInWebView(webViewRef, code) {
    try {
      if (!webViewRef || !webViewRef.current) {
        throw new Error('WebView reference is not available');
      }

      webViewRef.current.injectJavaScript(`
        (function() {
          try {
            ${code}
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          }
        })();
      `);

      return { success: true };
    } catch (error) {
      console.error('Execute in WebView Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get page source code
   * @param {Object} webViewRef - Reference to WebView
   * @returns {Promise<String>} HTML source code
   */
  async getPageSource(webViewRef) {
    return new Promise((resolve, reject) => {
      try {
        if (!webViewRef || !webViewRef.current) {
          reject(new Error('WebView reference is not available'));
          return;
        }

        const handleMessage = (event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'sourceCode') {
              resolve(data.code);
            }
          } catch (error) {
            reject(error);
          }
        };

        webViewRef.current.injectJavaScript(`
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'sourceCode',
            code: document.documentElement.outerHTML
          }));
        `);

        // Timeout after 5 seconds
        setTimeout(() => {
          reject(new Error('Timeout getting page source'));
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get cookies from current page
   * @param {Object} webViewRef - Reference to WebView
   * @returns {Promise<Array>} Array of cookies
   */
  async getCookies(webViewRef) {
    return new Promise((resolve, reject) => {
      try {
        if (!webViewRef || !webViewRef.current) {
          reject(new Error('WebView reference is not available'));
          return;
        }

        webViewRef.current.injectJavaScript(`
          (function() {
            try {
              const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'cookiesResult',
                cookies: cookies
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: error.message
              }));
            }
          })();
        `);

        // Timeout after 5 seconds
        setTimeout(() => {
          resolve([]);
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Analyze code with AI
   * @param {String} code - Code to analyze
   * @param {String} question - Specific question about the code
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeCode(code, question = 'حلل هذا الكود وأخبرني بما يفعله') {
    const messages = [
      {
        role: 'system',
        content: 'أنت مساعد ذكي لتحليل الكود. قدم تحليلات واضحة ومفيدة.'
      },
      {
        role: 'user',
        content: `${question}\n\n\`\`\`\n${code}\n\`\`\``
      }
    ];

    return await this.sendRequest(messages);
  },

  /**
   * Get AI suggestions for cookies
   * @param {Array} cookies - Array of cookie strings
   * @returns {Promise<Object>} AI analysis
   */
  async analyzeCookies(cookies) {
    const messages = [
      {
        role: 'system',
        content: 'أنت مساعد ذكي لتحليل الكوكيز. اشرح ما تفعله هذه الكوكيز وما هي المعلومات التي تحتوي عليها.'
      },
      {
        role: 'user',
        content: `حلل هذه الكوكيز:\n${cookies.join('\n')}`
      }
    ];

    return await this.sendRequest(messages);
  },

  /**
   * Show error alert
   * @param {String} message - Error message
   */
  showError(message) {
    Alert.alert('خطأ', message, [{ text: 'حسناً' }]);
  },

  /**
   * Show success alert
   * @param {String} message - Success message
   */
  showSuccess(message) {
    Alert.alert('نجح', message, [{ text: 'حسناً' }]);
  }
};
