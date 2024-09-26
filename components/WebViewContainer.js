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
  addNewTab
}, ref) => { 


  const userAgent = isDesktopMode
    ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    : undefined;
const [isErudaVisible, setIsErudaVisible] = useState(false);

  const webViewRef = React.useRef(null);

  useImperativeHandle(ref, () => ({
    goBack: () => webViewRef.current?.goBack(),
    goForward: () => webViewRef.current?.goForward(),
    reload: () => webViewRef.current?.reload(),
    injectJavaScript: (script) => webViewRef.current?.injectJavaScript(script),
    getStorageData: () => webViewRef.current?.injectJavaScript('window.getStorageDataOnDemand()'),
    toggleEruda: () => {
    setIsErudaVisible((prev) => !prev); // هذا هو التصحيح
    webViewRef.current?.injectJavaScript(`
      if (window.eruda) {
        eruda.${isErudaVisible ? 'hide' : 'show'}();
      } else {
        var script = document.createElement('script');
        script.src = "//cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = function () {
          eruda.init();
          eruda.${isErudaVisible ? 'hide' : 'show'}();
        }
      }
      true;
    `);
  }
  }));

  const injectedJavaScript = `
    (function() {
      // اعتراض وتسجيل طلبات الشبكة
      var originalFetch = window.fetch;
      window.fetch = function(url, options) {
        var start = new Date().getTime();
        return originalFetch.apply(this, arguments).then(function(response) {
          var end = new Date().getTime();
          var responseClone = response.clone();
          responseClone.text().then(function(body) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'networkLog',
              url: url,
              method: options ? options.method : 'GET',
              status: response.status,
              duration: end - start,
              requestHeaders: options ? options.headers : {},
              responseHeaders: Object.fromEntries(response.headers.entries()),
              responseBody: body
            }));
          });
          return response;
        });
      };

      // اعتراض وتسجيل مخرجات وحدة التحكم
      var originalConsole = window.console;
      window.console = {
        log: function() {
          var args = Array.from(arguments);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'consoleLog',
            message: { type: 'log', message: args.join(' ') }
          }));
          originalConsole.log.apply(originalConsole, arguments);
        },
        error: function() {
          var args = Array.from(arguments);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'consoleLog',
            message: { type: 'error', message: args.join(' ') }
          }));
          originalConsole.error.apply(originalConsole, arguments);
        },
        warn: function() {
          var args = Array.from(arguments);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'consoleLog',
            message: { type: 'warn', message: args.join(' ') }
          }));
          originalConsole.warn.apply(originalConsole, arguments);
        },
        info: function() {
          var args = Array.from(arguments);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'consoleLog',
            message: { type: 'info', message: args.join(' ') }
          }));
          originalConsole.info.apply(originalConsole, arguments);
        }
      };

      // تحسين مراقبة التخزين
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

      // مراقبة مقاييس الأداء
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

      true;
    })();
  `;

  const handleMessage = (event) => { 
    const data = JSON.parse(event.nativeEvent.data); 
    console.log('Received message:', data.type);
    onMessage(event);
  };

  const handleShouldStartLoadWithRequest = (event) => {
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