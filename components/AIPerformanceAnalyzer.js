import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

const AIPerformanceAnalyzer = ({
  performanceData,
  isDarkMode,
  webViewRef,
  selectedModel = 'anthropic/claude-3.5-sonnet'
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizations, setOptimizations] = useState([]);

  useEffect(() => {
    if (performanceData) {
      generateQuickInsights();
    }
  }, [performanceData]);

  const generateQuickInsights = () => {
    const insights = [];

    if (performanceData.lcp > 2500) {
      insights.push({
        type: 'error',
        icon: '🐌',
        title: 'LCP بطيء جداً',
        description: `${(performanceData.lcp / 1000).toFixed(2)}s - يجب أن يكون أقل من 2.5s`,
        metric: 'lcp'
      });
    }

    if (performanceData.fcp > 1800) {
      insights.push({
        type: 'warning',
        icon: '⏱️',
        title: 'FCP يحتاج تحسين',
        description: `${(performanceData.fcp / 1000).toFixed(2)}s - يجب أن يكون أقل من 1.8s`,
        metric: 'fcp'
      });
    }

    if (performanceData.cls > 0.1) {
      insights.push({
        type: 'warning',
        icon: '📐',
        title: 'CLS مرتفع',
        description: `${performanceData.cls.toFixed(3)} - تحركات غير متوقعة في التخطيط`,
        metric: 'cls'
      });
    }

    if (performanceData.tti > 3800) {
      insights.push({
        type: 'info',
        icon: '⚡',
        title: 'TTI يحتاج تحسين',
        description: `${(performanceData.tti / 1000).toFixed(2)}s - وقت التفاعل طويل`,
        metric: 'tti'
      });
    }

    setOptimizations(insights);
  };

  const analyzePerformance = async () => {
    setIsAnalyzing(true);

    try {
      const apiKey = await SecureStore.getItemAsync('openRouterApiKey');
      if (!apiKey) {
        throw new Error('API Key غير موجود');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser Performance AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت خبير في تحسين أداء الويب وCore Web Vitals. قم بتحليل البيانات وتقديم:
1. تقييم شامل للأداء
2. تحديد المشاكل الحرجة
3. حلول عملية قابلة للتطبيق
4. كود JavaScript لتحسين الأداء تلقائياً
5. توصيات طويلة المدى

استخدم معايير Google Core Web Vitals:
- LCP (Largest Contentful Paint): يجب < 2.5s
- FID (First Input Delay): يجب < 100ms
- CLS (Cumulative Layout Shift): يجب < 0.1
- FCP (First Contentful Paint): يجب < 1.8s
- TTI (Time to Interactive): يجب < 3.8s`
            },
            {
              role: 'user',
              content: `حلل الأداء التالي:\n\n${JSON.stringify(performanceData, null, 2)}\n\nقدم تحليل شامل مع كود تحسين قابل للتنفيذ.`
            }
          ],
          temperature: 0.4,
          max_tokens: 2500,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setAnalysis(data.choices[0].message.content);

    } catch (error) {
      setAnalysis(`❌ خطأ في التحليل: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAutoOptimizations = async () => {
    if (!webViewRef?.current) {
      alert('WebView غير متاح');
      return;
    }

    const optimizationCode = `
      // تحسينات تلقائية للأداء
      (function() {
        console.log('🚀 بدء تطبيق التحسينات...');

        // 1. تفعيل Lazy Loading للصور
        document.querySelectorAll('img:not([loading])').forEach(img => {
          img.loading = 'lazy';
        });

        // 2. تأجيل تحميل الإطارات (iframes)
        document.querySelectorAll('iframe:not([loading])').forEach(iframe => {
          iframe.loading = 'lazy';
        });

        // 3. تحسين الخطوط
        if (document.fonts) {
          document.fonts.ready.then(() => {
            console.log('✅ تم تحميل الخطوط');
          });
        }

        // 4. Resource Hints
        const head = document.head;
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = window.location.origin;
        head.appendChild(preconnect);

        // 5. تقليل Layout Shifts
        document.querySelectorAll('img').forEach(img => {
          if (!img.width || !img.height) {
            img.style.aspectRatio = 'auto';
          }
        });

        // 6. تحسين الأداء العام
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // تنظيف الذاكرة
            if (window.gc) window.gc();
          });
        }

        console.log('✅ تم تطبيق التحسينات التلقائية');
      })();
    `;

    try {
      await webViewRef.current.injectJavaScript(optimizationCode);
      alert('✅ تم تطبيق التحسينات التلقائية');
    } catch (error) {
      alert(`❌ خطأ: ${error.message}`);
    }
  };

  const getScoreColor = (metric, value) => {
    const thresholds = {
      lcp: { good: 2500, needs: 4000 },
      fcp: { good: 1800, needs: 3000 },
      cls: { good: 0.1, needs: 0.25 },
      fid: { good: 100, needs: 300 },
      tti: { good: 3800, needs: 7300 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return '#34C759';

    if (value <= threshold.good) return '#34C759'; // أخضر
    if (value <= threshold.needs) return '#FF9500'; // برتقالي
    return '#FF3B30'; // أحمر
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Performance Metrics */}
      {performanceData && (
        <View style={styles.metricsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            📊 Core Web Vitals
          </Text>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, isDarkMode && styles.metricCardDark]}>
              <Text style={styles.metricLabel}>LCP</Text>
              <Text style={[
                styles.metricValue,
                { color: getScoreColor('lcp', performanceData.lcp) }
              ]}>
                {(performanceData.lcp / 1000).toFixed(2)}s
              </Text>
            </View>

            <View style={[styles.metricCard, isDarkMode && styles.metricCardDark]}>
              <Text style={styles.metricLabel}>FCP</Text>
              <Text style={[
                styles.metricValue,
                { color: getScoreColor('fcp', performanceData.fcp) }
              ]}>
                {(performanceData.fcp / 1000).toFixed(2)}s
              </Text>
            </View>

            <View style={[styles.metricCard, isDarkMode && styles.metricCardDark]}>
              <Text style={styles.metricLabel}>CLS</Text>
              <Text style={[
                styles.metricValue,
                { color: getScoreColor('cls', performanceData.cls) }
              ]}>
                {performanceData.cls?.toFixed(3) || '0'}
              </Text>
            </View>

            <View style={[styles.metricCard, isDarkMode && styles.metricCardDark]}>
              <Text style={styles.metricLabel}>TTI</Text>
              <Text style={[
                styles.metricValue,
                { color: getScoreColor('tti', performanceData.tti) }
              ]}>
                {(performanceData.tti / 1000).toFixed(2)}s
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Optimizations */}
      {optimizations.length > 0 && (
        <View style={styles.optimizationsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            💡 فرص التحسين
          </Text>
          {optimizations.map((opt, index) => (
            <View
              key={index}
              style={[
                styles.optimizationCard,
                isDarkMode && styles.optimizationCardDark,
              ]}
            >
              <Text style={styles.optimizationIcon}>{opt.icon}</Text>
              <View style={styles.optimizationContent}>
                <Text style={[styles.optimizationTitle, isDarkMode && styles.optimizationTitleDark]}>
                  {opt.title}
                </Text>
                <Text style={[styles.optimizationDesc, isDarkMode && styles.optimizationDescDark]}>
                  {opt.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.analyzeButton, isDarkMode && styles.analyzeButtonDark]}
          onPress={analyzePerformance}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="analytics" type="material" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {isAnalyzing ? 'جاري التحليل...' : 'تحليل متقدم بالذكاء الاصطناعي'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.optimizeButton, isDarkMode && styles.optimizeButtonDark]}
          onPress={applyAutoOptimizations}
        >
          <Icon name="speed" type="material" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            تطبيق تحسينات تلقائية
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Analysis */}
      {analysis && (
        <ScrollView style={styles.analysisContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            🤖 تحليل الذكاء الاصطناعي
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
            {analysis}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  metricsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  metricCardDark: {
    backgroundColor: '#2C2C2E',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  optimizationsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  optimizationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  optimizationCardDark: {
    backgroundColor: '#2C2C2E',
  },
  optimizationIcon: {
    fontSize: 24,
  },
  optimizationContent: {
    flex: 1,
  },
  optimizationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optimizationTitleDark: {
    color: '#fff',
  },
  optimizationDesc: {
    fontSize: 13,
    color: '#666',
  },
  optimizationDescDark: {
    color: '#999',
  },
  actionsContainer: {
    paddingHorizontal: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
  },
  analyzeButtonDark: {
    backgroundColor: '#0A84FF',
  },
  optimizeButton: {
    backgroundColor: '#34C759',
  },
  optimizeButtonDark: {
    backgroundColor: '#30D158',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  analysisText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  analysisTextDark: {
    color: '#E5E5E5',
    backgroundColor: '#2C2C2E',
  },
});

export default AIPerformanceAnalyzer;
