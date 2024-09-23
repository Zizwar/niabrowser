// في WebViewContainer.js
import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewContainer = forwardRef(({ url, onMessage, isDarkMode, isDesktopMode, onNavigationStateChange, runAutoScripts }, ref) => { 

  const userAgent = isDesktopMode
    ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    : undefined;

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
      var originalConsoleLog = console.log;
      var originalConsoleError = console.error;
      var originalConsoleWarn = console.warn;
      var originalConsoleInfo = console.info;

      console.log = function() {
        var args = Array.from(arguments);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'consoleLog',
          message: { type: 'log', message: args.join(' ') }
        }));
        originalConsoleLog.apply(console, arguments);
      };

      console.error = function() {
        var args = Array.from(arguments);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'consoleLog',
          message: { type: 'error', message: args.join(' ') }
        }));
        originalConsoleError.apply(console, arguments);
      };

      console.warn = function() {
        var args = Array.from(arguments);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'consoleLog',
          message: { type: 'warn', message: args.join(' ') }
        }));
        originalConsoleWarn.apply(console, arguments);
      };

      console.info = function() {
        var args = Array.from(arguments);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'consoleLog',
          message: { type: 'info', message: args.join(' ') }
        }));
        originalConsoleInfo.apply(console, arguments);
      };

      // مراقبة التخزين
      setInterval(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage',
          cookies: document.cookie,
          localStorage: JSON.stringify(localStorage)
        }));
      }, 1000);

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

      // إضافة منطق لتنفيذ السكريبتات عند تحميل الصفحة
      document.addEventListener('DOMContentLoaded', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pageLoaded',
          url: window.location.href
        }));
      });

      true;
    })();
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'pageLoaded') {
      runAutoScripts(data.url);
    }
    onMessage(event);
  };

  return ( <WebView ref={ref} source={{ uri: url }} style={styles.webview} injectedJavaScript={injectedJavaScript} onMessage={onMessage} forceDarkOn={isDarkMode} userAgent={userAgent} onNavigationStateChange={onNavigationStateChange} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} scalesPageToFit={true} mixedContentMode="compatibility" allowsBackForwardNavigationGestures={true} /> ); });

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default WebViewContainer;