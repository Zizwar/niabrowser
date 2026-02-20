import React, { forwardRef, useImperativeHandle ,useState} from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewContainer = forwardRef(({
  url,
  onMessage,
  isDarkMode,
  isDesktopMode,
  onNavigationStateChange,
  onLoadStart,
  onLoad,
  addNewTab,
  userAgent: customUserAgent,
  isSafeMode
}, ref) => {


  const defaultUserAgent = isDesktopMode
    ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    : 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36';
  
  const userAgent = customUserAgent || defaultUserAgent;
const [isErudaVisible, setIsErudaVisible] = useState(false);

  const webViewRef = React.useRef(null);

  useImperativeHandle(ref, () => ({
    goBack: () => webViewRef.current?.goBack(),
    goForward: () => webViewRef.current?.goForward(),
    reload: () => webViewRef.current?.reload(),
    injectJavaScript: (script) => webViewRef.current?.injectJavaScript(script),
    getStorageData: () => webViewRef.current?.injectJavaScript('window.getStorageDataOnDemand()'),
    toggleEruda: () => {
    const newState = !isErudaVisible;
    setIsErudaVisible(newState);
    webViewRef.current?.injectJavaScript(`
      if (window.eruda) {
        eruda.${newState ? 'show' : 'hide'}();
      } else {
        var script = document.createElement('script');
        script.src = "//cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = function () {
          eruda.init();
          eruda.${newState ? 'show' : 'hide'}();
        }
      }
      true;
    `);
  }
  }));

  const injectedJavaScript = `
    (function() {
      // Signal dark mode preference to websites via prefers-color-scheme
      ${isDarkMode ? `
      try {
        // Override matchMedia to signal dark mode preference
        var originalMatchMedia = window.matchMedia;
        window.matchMedia = function(query) {
          if (query === '(prefers-color-scheme: dark)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: function(cb) {},
              removeListener: function(cb) {},
              addEventListener: function(type, cb) {},
              removeEventListener: function(type, cb) {},
              dispatchEvent: function() { return true; }
            };
          }
          if (query === '(prefers-color-scheme: light)') {
            return {
              matches: false,
              media: query,
              onchange: null,
              addListener: function(cb) {},
              removeListener: function(cb) {},
              addEventListener: function(type, cb) {},
              removeEventListener: function(type, cb) {},
              dispatchEvent: function() { return true; }
            };
          }
          return originalMatchMedia.call(window, query);
        };
        // Add meta tag for color-scheme
        var metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (!metaColorScheme) {
          metaColorScheme = document.createElement('meta');
          metaColorScheme.name = 'color-scheme';
          document.head.appendChild(metaColorScheme);
        }
        metaColorScheme.content = 'dark';
      } catch(e) {}
      ` : `
      try {
        var metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (!metaColorScheme) {
          metaColorScheme = document.createElement('meta');
          metaColorScheme.name = 'color-scheme';
          document.head.appendChild(metaColorScheme);
        }
        metaColorScheme.content = 'light';
      } catch(e) {}
      `}

      // Intercept and log network requests
      var originalFetch = window.fetch;
      // In WebViewContainer.js, inside the injectedJavaScript
window.fetch = function(url, options) {
  var start = new Date().getTime();
  return originalFetch.apply(this, arguments).then(function(response) {
    var end = new Date().getTime();
    var responseClone = response.clone();
    responseClone.text().then(function(body) {
      var requestHeaders = options ? options.headers : {};
      var responseHeaders = Object.fromEntries(response.headers.entries());
      
      // Capture cookies from headers
      var requestCookies = requestHeaders['cookie'] || requestHeaders['Cookie'] ||requestHeaders['get-cookie'] ||'';
      var responseCookies = responseHeaders['set-cookie'] || '';
      if(requestCookies)
console.log("###: coookis header", requestCookies)
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'networkLog',
        url: url,
        method: options ? options.method : 'GET',
        status: response.status,
        duration: end - start,
        requestHeaders: requestHeaders,
        responseHeaders: responseHeaders,
        responseBody: body,
        requestCookies: requestCookies,
        responseCookies: responseCookies
      }));
    });
    return response;
  });
};
      // Intercept and log console outputs
      var originalConsole = window.console;
      var _consoleTimers = {};
      var _consoleCounts = {};
      var _consoleGroupDepth = 0;
      function _fmtArgs(args) {
        return Array.from(args).map(function(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
          }
          return String(arg);
        });
      }
      function _sendLog(type, args) {
        var prefix = _consoleGroupDepth > 0 ? '  '.repeat(_consoleGroupDepth) : '';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'consoleLog',
          message: { type: type, message: prefix + args.join(' ') }
        }));
      }
      window.console = {
        log: function() { var a = _fmtArgs(arguments); _sendLog('log', a); originalConsole.log.apply(originalConsole, arguments); },
        error: function() { var a = _fmtArgs(arguments); _sendLog('error', a); originalConsole.error.apply(originalConsole, arguments); },
        warn: function() { var a = _fmtArgs(arguments); _sendLog('warn', a); originalConsole.warn.apply(originalConsole, arguments); },
        info: function() { var a = _fmtArgs(arguments); _sendLog('info', a); originalConsole.info.apply(originalConsole, arguments); },
        debug: function() { var a = _fmtArgs(arguments); _sendLog('debug', a); originalConsole.debug.apply(originalConsole, arguments); },
        table: function(data) {
          var msg;
          try {
            if (Array.isArray(data)) {
              var header = Object.keys(data[0] || {});
              msg = '[Table] ' + header.join(' | ') + '\\n' + data.map(function(row) {
                return header.map(function(h) { return String(row[h] || ''); }).join(' | ');
              }).join('\\n');
            } else {
              msg = '[Table] ' + JSON.stringify(data, null, 2);
            }
          } catch(e) { msg = '[Table] ' + String(data); }
          _sendLog('log', [msg]);
          originalConsole.table.apply(originalConsole, arguments);
        },
        group: function() { var a = _fmtArgs(arguments); _sendLog('log', ['▼ ' + (a[0] || 'Group')]); _consoleGroupDepth++; if(originalConsole.group) originalConsole.group.apply(originalConsole, arguments); },
        groupCollapsed: function() { var a = _fmtArgs(arguments); _sendLog('log', ['▶ ' + (a[0] || 'Group')]); _consoleGroupDepth++; if(originalConsole.groupCollapsed) originalConsole.groupCollapsed.apply(originalConsole, arguments); },
        groupEnd: function() { if(_consoleGroupDepth > 0) _consoleGroupDepth--; if(originalConsole.groupEnd) originalConsole.groupEnd.apply(originalConsole, arguments); },
        time: function(label) { label = label || 'default'; _consoleTimers[label] = performance.now(); if(originalConsole.time) originalConsole.time.apply(originalConsole, arguments); },
        timeEnd: function(label) { label = label || 'default'; if(_consoleTimers[label]) { var d = (performance.now() - _consoleTimers[label]).toFixed(2); _sendLog('log', [label + ': ' + d + 'ms']); delete _consoleTimers[label]; } if(originalConsole.timeEnd) originalConsole.timeEnd.apply(originalConsole, arguments); },
        timeLog: function(label) { label = label || 'default'; if(_consoleTimers[label]) { var d = (performance.now() - _consoleTimers[label]).toFixed(2); _sendLog('log', [label + ': ' + d + 'ms (running)']); } if(originalConsole.timeLog) originalConsole.timeLog.apply(originalConsole, arguments); },
        count: function(label) { label = label || 'default'; _consoleCounts[label] = (_consoleCounts[label] || 0) + 1; _sendLog('log', [label + ': ' + _consoleCounts[label]]); if(originalConsole.count) originalConsole.count.apply(originalConsole, arguments); },
        countReset: function(label) { label = label || 'default'; _consoleCounts[label] = 0; if(originalConsole.countReset) originalConsole.countReset.apply(originalConsole, arguments); },
        assert: function(cond) { if(!cond) { var a = _fmtArgs(Array.from(arguments).slice(1)); _sendLog('error', ['Assertion failed: ' + (a.join(' ') || '')]); } if(originalConsole.assert) originalConsole.assert.apply(originalConsole, arguments); },
        dir: function(obj) { var a = _fmtArgs([obj]); _sendLog('log', ['[dir] ' + a[0]]); if(originalConsole.dir) originalConsole.dir.apply(originalConsole, arguments); },
        trace: function() { var a = _fmtArgs(arguments); _sendLog('log', ['[trace] ' + (a[0] || '') + '\\n' + (new Error().stack || '')]); if(originalConsole.trace) originalConsole.trace.apply(originalConsole, arguments); },
        clear: function() { _sendLog('log', ['--- Console Cleared ---']); if(originalConsole.clear) originalConsole.clear.apply(originalConsole, arguments); },
      };

      // Improve storage monitoring
      let lastStorageSnapshot = {
        cookies: document.cookie,
        localStorage: JSON.stringify(localStorage)
      };

      function getStorageData() {
        return {
          cookies: document.cookie,
          localStorage: JSON.stringify(localStorage)
        };
      }

      function sendStorageDataIfChanged() {
        const currentStorage = getStorageData();
        if (currentStorage.cookies !== lastStorageSnapshot.cookies || 
            currentStorage.localStorage !== lastStorageSnapshot.localStorage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storage',
            ...currentStorage
          }));
          lastStorageSnapshot = currentStorage;
        }
      }

      window.addEventListener('storage', sendStorageDataIfChanged);
      window.addEventListener('load', sendStorageDataIfChanged);

      window.getStorageDataOnDemand = function() {
        sendStorageDataIfChanged();
      };

      // Monitor performance metrics
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics = {
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          timeToInteractive: 0,
          totalBlockingTime: 0,
          dnsLookupTime: 0,
          tcpConnectionTime: 0,
          tlsNegotiationTime: 0,
          serverResponseTime: 0,
          pageLoadTime: 0,
          domContentLoaded: 0,
        };

        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          } else if (entry.name === 'largest-contentful-paint') {
            metrics.largestContentfulPaint = entry.startTime;
          } else if (entry.name === 'first-input') {
            metrics.firstInputDelay = entry.processingStart - entry.startTime;
          } else if (entry.name === 'layout-shift') {
            metrics.cumulativeLayoutShift += entry.value;
          }
        });

        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          metrics.dnsLookupTime = navTiming.domainLookupEnd - navTiming.domainLookupStart;
          metrics.tcpConnectionTime = navTiming.connectEnd - navTiming.connectStart;
          metrics.tlsNegotiationTime = navTiming.secureConnectionStart > 0 ? navTiming.connectEnd - navTiming.secureConnectionStart : 0;
          metrics.serverResponseTime = navTiming.responseStart - navTiming.requestStart;
          metrics.pageLoadTime = navTiming.loadEventEnd - navTiming.startTime;
          metrics.domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.startTime;
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'performanceMetrics',
          metrics: metrics
        }));
      });

      observer.observe({entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']});

      window.addEventListener('load', function() {
        console.log('Window load event fired');
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pageFullyLoaded',
          url: window.location.href
        }));
      });

      // Intercept target="_blank" links to open in new tabs within the app
      document.addEventListener('click', function(event) {
        var target = event.target;
        
        // Find the nearest anchor tag
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        
        if (target && target.tagName === 'A') {
          var href = target.href;
          var targetAttr = target.getAttribute('target');
          
          if (targetAttr === '_blank' && href) {
            event.preventDefault();
            // Ensure href is a string
            var urlString = typeof href === 'string' ? href : href.toString();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'openInNewTab',
              url: urlString
            }));
          }
        }
      }, true);

      // Override window.open to open in new tabs within the app
      var originalOpen = window.open;
      window.open = function(url, target, features) {
        if (url) {
          // Ensure url is a string
          var urlString = typeof url === 'string' ? url : url.toString();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'openInNewTab',
            url: urlString
          }));
        }
        return null;
      };

      true;
    })();
  `;

  const handleMessage = (event) => { 
    try {
      const data = JSON.parse(event.nativeEvent.data); 
      console.log('Received message:', data.type);
      
      // Handle specific message types that might cause issues
      if (data.type === 'openInNewTab') {
        // Ensure URL is a string
        if (data.url && typeof data.url !== 'string') {
          data.url = data.url.toString();
        }
        // Create a new event with the sanitized data
        const newEvent = {
          ...event,
          nativeEvent: {
            ...event.nativeEvent,
            data: JSON.stringify(data)
          }
        };
        onMessage(newEvent);
      } else {
        onMessage(event);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      console.error('Raw message data:', event.nativeEvent.data);
    }
  };

  const handleShouldStartLoadWithRequest = (event) => {
    // Allow authentication redirects (Google OAuth, etc.) to continue in same tab
    if (event.url.includes('accounts.google.com') || 
        event.url.includes('oauth') || 
        event.url.includes('auth') ||
        event.url.includes('callback') ||
        event.url.includes('redirect')) {
      return true;
    }
    
    if (event.url !== url && event.navigationType === 'click') {
      addNewTab(event.url);
      return false;
    }
    return true;
  };

  return ( 
   <WebView 
      ref={webViewRef}
      source={{ uri: url }}
      style={styles.webview}
      injectedJavaScript={injectedJavaScript}
      onMessage={handleMessage}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      forceDarkOn={isDarkMode}
      userAgent={userAgent}
      onNavigationStateChange={onNavigationStateChange}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      mixedContentMode="compatibility"
      allowsBackForwardNavigationGestures={true}
    />
  );
});

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default WebViewContainer;