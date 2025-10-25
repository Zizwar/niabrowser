import React, { useState } from 'react';
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

const AICookieInspector = ({ storageData, isDarkMode, selectedModel = 'anthropic/claude-3.5-sonnet' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeStorage = async () => {
    setIsAnalyzing(true);

    try {
      const apiKey = await SecureStore.getItemAsync('openRouterApiKey');
      if (!apiKey) {
        throw new Error('API Key غير موجود');
      }

      const cookieCount = storageData?.cookies?.length || 0;
      const localStorageSize = JSON.stringify(storageData?.localStorage || {}).length;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser Storage AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت خبير في فحص التخزين والكوكيز. قم بتحليل البيانات وتقديم:
1. ملخص عن الكوكيز والتخزين
2. مخاطر الخصوصية المحتملة
3. الكوكيز المشبوهة أو غير الآمنة
4. توصيات للأمان والخصوصية`
            },
            {
              role: 'user',
              content: `حلل البيانات التالية:\n\nعدد الكوكيز: ${cookieCount}\nحجم localStorage: ${localStorageSize} bytes\n\nالكوكيز:\n${storageData?.cookies || 'لا توجد كوكيز'}\n\nlocalStorage:\n${JSON.stringify(storageData?.localStorage || {}, null, 2)}`
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

  const cookieCount = storageData?.cookies?.split(';').filter(c => c.trim()).length || 0;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
          <Text style={styles.statIcon}>🍪</Text>
          <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
            {cookieCount}
          </Text>
          <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
            كوكيز
          </Text>
        </View>

        <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
          <Text style={styles.statIcon}>💾</Text>
          <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
            {Object.keys(storageData?.localStorage || {}).length}
          </Text>
          <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
            localStorage
          </Text>
        </View>
      </View>

      {/* Analyze Button */}
      <TouchableOpacity
        style={[styles.analyzeButton, isDarkMode && styles.analyzeButtonDark]}
        onPress={analyzeStorage}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="security" type="material" size={20} color="#fff" />
        )}
        <Text style={styles.analyzeButtonText}>
          {isAnalyzing ? 'جاري الفحص...' : 'فحص الأمان والخصوصية'}
        </Text>
      </TouchableOpacity>

      {/* Analysis Results */}
      {analysis && (
        <ScrollView style={styles.analysisContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            🔒 تحليل الأمان
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
            {analysis}
          </Text>
        </ScrollView>
      )}

      {/* Cookie List */}
      {storageData?.cookies && (
        <View style={styles.cookieList}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            📋 قائمة الكوكيز
          </Text>
          {storageData.cookies.split(';').map((cookie, index) => {
            const trimmed = cookie.trim();
            if (!trimmed) return null;
            const [name, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=');
            return (
              <View key={index} style={[styles.cookieItem, isDarkMode && styles.cookieItemDark]}>
                <Text style={[styles.cookieName, isDarkMode && styles.cookieNameDark]}>
                  {name}
                </Text>
                <Text style={[styles.cookieValue, isDarkMode && styles.cookieValueDark]} numberOfLines={1}>
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statCardDark: {
    backgroundColor: '#2C2C2E',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statNumberDark: {
    color: '#0A84FF',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statLabelDark: {
    color: '#999',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  analyzeButtonDark: {
    backgroundColor: '#30D158',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  sectionTitleDark: {
    color: '#fff',
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
    marginHorizontal: 15,
  },
  analysisTextDark: {
    color: '#E5E5E5',
    backgroundColor: '#2C2C2E',
  },
  cookieList: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  cookieItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cookieItemDark: {
    backgroundColor: '#2C2C2E',
  },
  cookieName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  cookieNameDark: {
    color: '#0A84FF',
  },
  cookieValue: {
    fontSize: 12,
    color: '#666',
  },
  cookieValueDark: {
    color: '#999',
  },
});

export default AICookieInspector;
