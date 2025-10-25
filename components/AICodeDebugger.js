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

const AICodeDebugger = ({
  consoleLogs,
  isDarkMode,
  webViewRef,
  selectedModel = 'anthropic/claude-3.5-sonnet'
}) => {
  const [errors, setErrors] = useState([]);
  const [isFinding, setIsFinding] = useState(false);
  const [fixingSuggestions, setFixingSuggestions] = useState({});

  useEffect(() => {
    if (consoleLogs && consoleLogs.length > 0) {
      const errorLogs = consoleLogs.filter(log => log.type === 'error' || log.type === 'warn');
      setErrors(errorLogs);
    }
  }, [consoleLogs]);

  const findAndFixError = async (error, index) => {
    setIsFinding(true);

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
          'X-Title': 'NIA Browser Code Debugger AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت خبير في تصحيح أخطاء JavaScript. قم بـ:
1. تحليل الخطأ وتحديد السبب الجذري
2. شرح المشكلة بوضوح
3. تقديم حل مع كود قابل للتنفيذ
4. اقتراح طرق لتجنب هذا الخطأ مستقبلاً

اكتب الكود بدون markdown backticks.`
            },
            {
              role: 'user',
              content: `حلل وأصلح هذا الخطأ:\n\nنوع الخطأ: ${error.type}\nالرسالة: ${error.message}\n\nقدم حل مع كود JavaScript قابل للتنفيذ.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const suggestion = data.choices[0].message.content;

      setFixingSuggestions(prev => ({
        ...prev,
        [index]: suggestion
      }));

    } catch (error) {
      setFixingSuggestions(prev => ({
        ...prev,
        [index]: `❌ خطأ: ${error.message}`
      }));
    } finally {
      setIsFinding(false);
    }
  };

  const autoFixAll = async () => {
    setIsFinding(true);

    try {
      const apiKey = await SecureStore.getItemAsync('openRouterApiKey');
      if (!apiKey) {
        throw new Error('API Key غير موجود');
      }

      const errorsSummary = errors.slice(0, 5).map((err, i) =>
        `${i + 1}. [${err.type}] ${err.message}`
      ).join('\n');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://niabrowser.app',
          'X-Title': 'NIA Browser Auto Fixer AI',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `أنت مصحح أخطاء تلقائي. قم بتحليل الأخطاء وتقديم كود JavaScript شامل لإصلاحها جميعاً. الكود يجب أن:
1. يتعامل مع كل خطأ
2. يضيف معالجة أخطاء عامة
3. يحسن من استقرار الصفحة
4. يكون آمن وقابل للتنفيذ

اكتب الكود فقط بدون شرح.`
            },
            {
              role: 'user',
              content: `أصلح هذه الأخطاء:\n\n${errorsSummary}`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const fixCode = data.choices[0].message.content
        .replace(/```javascript\n?/g, '')
        .replace(/```js\n?/g, '')
        .replace(/```\n?/g, '');

      // تنفيذ الكود
      if (webViewRef?.current) {
        await webViewRef.current.injectJavaScript(`
          (function() {
            try {
              ${fixCode}
              console.log('✅ تم تطبيق الإصلاحات التلقائية');
            } catch (error) {
              console.error('❌ فشل تطبيق الإصلاحات:', error.message);
            }
          })();
        `);

        setFixingSuggestions({
          autoFix: `✅ تم تطبيق الإصلاحات التلقائية:\n\n${fixCode}`
        });
      }

    } catch (error) {
      setFixingSuggestions({
        autoFix: `❌ خطأ في الإصلاح التلقائي: ${error.message}`
      });
    } finally {
      setIsFinding(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
          <Text style={styles.statIcon}>🐛</Text>
          <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
            {errors.filter(e => e.type === 'error').length}
          </Text>
          <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
            أخطاء
          </Text>
        </View>

        <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
          <Text style={styles.statIcon}>⚠️</Text>
          <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>
            {errors.filter(e => e.type === 'warn').length}
          </Text>
          <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>
            تحذيرات
          </Text>
        </View>
      </View>

      {/* Auto Fix All Button */}
      {errors.length > 0 && (
        <TouchableOpacity
          style={[styles.autoFixButton, isDarkMode && styles.autoFixButtonDark]}
          onPress={autoFixAll}
          disabled={isFinding}
        >
          {isFinding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="auto-fix-high" type="material" size={20} color="#fff" />
          )}
          <Text style={styles.autoFixButtonText}>
            {isFinding ? 'جاري الإصلاح...' : 'إصلاح تلقائي لكل الأخطاء'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Auto Fix Result */}
      {fixingSuggestions.autoFix && (
        <View style={styles.fixResultContainer}>
          <Text style={[styles.fixResultText, isDarkMode && styles.fixResultTextDark]}>
            {fixingSuggestions.autoFix}
          </Text>
        </View>
      )}

      {/* Errors List */}
      <ScrollView style={styles.errorsList}>
        {errors.length === 0 ? (
          <View style={styles.noErrors}>
            <Text style={styles.noErrorsIcon}>✅</Text>
            <Text style={[styles.noErrorsText, isDarkMode && styles.noErrorsTextDark]}>
              لا توجد أخطاء!
            </Text>
          </View>
        ) : (
          errors.map((error, index) => (
            <View
              key={index}
              style={[
                styles.errorCard,
                isDarkMode && styles.errorCardDark,
                error.type === 'error' && styles.errorCardError,
              ]}
            >
              <View style={styles.errorHeader}>
                <Text style={styles.errorIcon}>
                  {error.type === 'error' ? '❌' : '⚠️'}
                </Text>
                <Text style={[styles.errorType, isDarkMode && styles.errorTypeDark]}>
                  {error.type === 'error' ? 'خطأ' : 'تحذير'}
                </Text>
              </View>

              <Text style={[styles.errorMessage, isDarkMode && styles.errorMessageDark]}>
                {error.message}
              </Text>

              <TouchableOpacity
                style={[styles.fixButton, isDarkMode && styles.fixButtonDark]}
                onPress={() => findAndFixError(error, index)}
                disabled={isFinding}
              >
                <Icon name="build" type="material" size={16} color="#007AFF" />
                <Text style={styles.fixButtonText}>إصلاح بالذكاء الاصطناعي</Text>
              </TouchableOpacity>

              {fixingSuggestions[index] && (
                <View style={styles.suggestionContainer}>
                  <Text style={[styles.suggestionText, isDarkMode && styles.suggestionTextDark]}>
                    {fixingSuggestions[index]}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  header: {
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
    color: '#FF3B30',
    marginBottom: 4,
  },
  statNumberDark: {
    color: '#FF453A',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statLabelDark: {
    color: '#999',
  },
  autoFixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  autoFixButtonDark: {
    backgroundColor: '#FF9F0A',
  },
  autoFixButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fixResultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  fixResultText: {
    fontSize: 13,
    color: '#000',
    lineHeight: 20,
  },
  fixResultTextDark: {
    color: '#E5E5E5',
  },
  errorsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  noErrors: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noErrorsIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  noErrorsText: {
    fontSize: 16,
    color: '#666',
  },
  noErrorsTextDark: {
    color: '#999',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  errorCardDark: {
    backgroundColor: '#2C2C2E',
  },
  errorCardError: {
    borderLeftColor: '#FF3B30',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  errorTypeDark: {
    color: '#fff',
  },
  errorMessage: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  errorMessageDark: {
    color: '#E5E5E5',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  fixButtonDark: {
    backgroundColor: '#3C3C3E',
  },
  fixButtonText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  suggestionContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  suggestionTextDark: {
    color: '#E5E5E5',
  },
});

export default AICodeDebugger;
