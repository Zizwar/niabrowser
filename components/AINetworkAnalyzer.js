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
import { SettingsManager } from '../utils/SettingsManager';

const AINetworkAnalyzer = ({ networkLogs, isDarkMode, selectedModel = 'anthropic/claude-3.5-sonnet' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (networkLogs && networkLogs.length > 0) {
      generateQuickInsights();
    }
  }, [networkLogs]);

  const generateQuickInsights = () => {
    const insights = [];

    // تحليل سريع بدون AI
    const totalRequests = networkLogs.length;
    const failedRequests = networkLogs.filter(log => log.status >= 400).length;
    const slowRequests = networkLogs.filter(log => log.duration > 1000).length;
    const largeRequests = networkLogs.filter(log => log.size > 1000000).length;

    if (failedRequests > 0) {
      insights.push({
        type: 'error',
        icon: '❌',
        title: `${failedRequests} طلب فاشل`,
        description: 'توجد طلبات فشلت. استخدم AI للتحليل التفصيلي',
      });
    }

    if (slowRequests > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: `${slowRequests} طلب بطيء`,
        description: 'طلبات تستغرق أكثر من ثانية',
      });
    }

    if (largeRequests > 0) {
      insights.push({
        type: 'info',
        icon: 'ℹ️',
        title: `${largeRequests} طلب كبير`,
        description: 'طلبات بحجم أكبر من 1MB',
      });
    }

    const apiCalls = networkLogs.filter(log =>
      log.url.includes('/api/') || log.url.includes('.json')
    );

    if (apiCalls.length > 0) {
      insights.push({
        type: 'info',
        icon: '🔌',
        title: `${apiCalls.length} API Call`,
        description: 'تم اكتشاف استدعاءات API',
      });
    }

    setInsights(insights);
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);

    try {
      const apiKey = await SettingsManager.getApiKey();
      if (!apiKey) {
        throw new Error('API Key غير موجود');
      }

      // تحضير البيانات للتحليل
      const networkSummary = networkLogs.slice(-20).map(log => ({
        url: log.url,
        method: log.method || 'GET',
        status: log.status,
        duration: log.duration,
        size: log.size,
        headers: log.headers,
      }));

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser Network AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت محلل شبكات خبير. قم بتحليل طلبات الشبكة وتقديم:
1. ملخص عام للطلبات
2. الأخطاء والمشاكل المحتملة
3. تحسينات الأداء
4. مشاكل الأمان
5. توصيات محددة

أعط التحليل بصيغة منظمة وواضحة.`
            },
            {
              role: 'user',
              content: `حلل طلبات الشبكة التالية:\n\n${JSON.stringify(networkSummary, null, 2)}`
            }
          ],
          temperature: 0.5,
          max_tokens: 1500,
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

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Quick Insights */}
      <View style={styles.insightsContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
          📊 تحليل سريع
        </Text>
        {insights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightCard,
              isDarkMode && styles.insightCardDark,
              insight.type === 'error' && styles.insightCardError,
              insight.type === 'warning' && styles.insightCardWarning,
            ]}
          >
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, isDarkMode && styles.insightTitleDark]}>
                {insight.title}
              </Text>
              <Text style={[styles.insightDesc, isDarkMode && styles.insightDescDark]}>
                {insight.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Analysis Button */}
      <TouchableOpacity
        style={[styles.analyzeButton, isDarkMode && styles.analyzeButtonDark]}
        onPress={analyzeWithAI}
        disabled={isAnalyzing || !networkLogs || networkLogs.length === 0}
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="psychology" type="material" size={20} color="#fff" />
        )}
        <Text style={styles.analyzeButtonText}>
          {isAnalyzing ? 'جاري التحليل...' : 'تحليل متقدم بالذكاء الاصطناعي'}
        </Text>
      </TouchableOpacity>

      {/* AI Analysis Results */}
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
  insightsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  insightCardDark: {
    backgroundColor: '#2C2C2E',
  },
  insightCardError: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  insightCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  insightIcon: {
    fontSize: 24,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  insightTitleDark: {
    color: '#fff',
  },
  insightDesc: {
    fontSize: 13,
    color: '#666',
  },
  insightDescDark: {
    color: '#999',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  analyzeButtonDark: {
    backgroundColor: '#0A84FF',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 15,
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

export default AINetworkAnalyzer;
