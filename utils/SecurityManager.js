import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';

export const SecurityManager = {
  /**
   * Hash a string using SHA256
   * @param {String} text - Text to hash
   * @returns {Promise<String>} Hashed string
   */
  async hash(text) {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text
      );
      return hash;
    } catch (error) {
      console.error('Hashing error:', error);
      return null;
    }
  },

  /**
   * Validate API Key format
   * @param {String} key - API key to validate
   * @returns {Boolean} True if valid
   */
  validateApiKey(key) {
    if (!key || typeof key !== 'string') return false;

    // OpenRouter keys typically start with "sk-" or "pk-"
    if (!key.startsWith('sk-') && !key.startsWith('pk-')) {
      return false;
    }

    // Check minimum length
    if (key.length < 20) return false;

    return true;
  },

  /**
   * Sanitize URL to prevent XSS
   * @param {String} url - URL to sanitize
   * @returns {String} Sanitized URL
   */
  sanitizeUrl(url) {
    if (!url) return '';

    // Remove javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      console.warn('Blocked javascript: protocol');
      return '';
    }

    // Remove data: URIs that could contain scripts
    if (url.toLowerCase().startsWith('data:text/html')) {
      console.warn('Blocked data:text/html URI');
      return '';
    }

    // Ensure URL has a valid protocol
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    return url;
  },

  /**
   * Sanitize JavaScript code before injection
   * @param {String} code - Code to sanitize
   * @returns {String|null} Sanitized code or null if dangerous
   */
  sanitizeScript(code) {
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*['"].*?['"]\s*\)/gi,
      /setInterval\s*\(\s*['"].*?['"]\s*\)/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        console.warn('Potentially dangerous code detected!');
        return null;
      }
    }

    return code;
  },

  /**
   * Content Security Policy check
   * @param {String} url - URL to check
   * @returns {Boolean} True if URL passes CSP
   */
  checkCSP(url) {
    try {
      const urlObj = new URL(url);

      // Allow only HTTPS (except localhost for development)
      if (urlObj.protocol !== 'https:' && urlObj.hostname !== 'localhost' && urlObj.hostname !== '127.0.0.1') {
        console.warn('Insecure protocol:', urlObj.protocol);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Invalid URL:', error);
      return false;
    }
  },

  /**
   * Rate limiter for API calls
   */
  rateLimiter: {
    calls: {},

    /**
     * Check if rate limit is exceeded
     * @param {String} key - Identifier for the rate limit
     * @param {Number} maxCalls - Maximum calls allowed
     * @param {Number} timeWindow - Time window in milliseconds
     * @returns {Boolean} True if within limit
     */
    check(key, maxCalls = 10, timeWindow = 60000) {
      const now = Date.now();

      if (!this.calls[key]) {
        this.calls[key] = [];
      }

      // Remove old calls outside time window
      this.calls[key] = this.calls[key].filter(
        time => now - time < timeWindow
      );

      // Check if limit exceeded
      if (this.calls[key].length >= maxCalls) {
        return false;
      }

      // Add current call
      this.calls[key].push(now);
      return true;
    },

    /**
     * Reset rate limit for a key
     * @param {String} key - Identifier to reset
     */
    reset(key) {
      if (this.calls[key]) {
        this.calls[key] = [];
      }
    }
  },

  /**
   * Validate input to prevent injection attacks
   * @param {String} input - User input to validate
   * @returns {Boolean} True if safe
   */
  validateInput(input) {
    if (typeof input !== 'string') return false;

    // Check for script tags
    if (/<script/gi.test(input)) {
      console.warn('Script tag detected in input');
      return false;
    }

    // Check for event handlers
    if (/on\w+\s*=/gi.test(input)) {
      console.warn('Event handler detected in input');
      return false;
    }

    return true;
  },

  /**
   * Escape HTML to prevent XSS
   * @param {String} text - Text to escape
   * @returns {String} Escaped text
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
