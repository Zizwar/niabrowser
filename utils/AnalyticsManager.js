import AsyncStorage from '@react-native-async-storage/async-storage';

export const AnalyticsManager = {
  /**
   * Track an event
   * @param {String} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  async trackEvent(eventName, properties = {}) {
    try {
      const events = await this.getEvents();

      events.push({
        name: eventName,
        properties,
        timestamp: Date.now()
      });

      // Keep only last 1000 events
      const trimmed = events.slice(-1000);

      await AsyncStorage.setItem('analytics_events', JSON.stringify(trimmed));

      console.log(`📊 Event tracked: ${eventName}`, properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  /**
   * Get all tracked events
   * @returns {Promise<Array>} Array of events
   */
  async getEvents() {
    try {
      const data = await AsyncStorage.getItem('analytics_events');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Get analytics statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    const events = await this.getEvents();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Filter by time period
    const today = events.filter(e => now - e.timestamp < oneDay);
    const thisWeek = events.filter(e => now - e.timestamp < oneWeek);

    // Count by event type
    const eventCounts = events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {});

    return {
      total: events.length,
      today: today.length,
      thisWeek: thisWeek.length,
      byType: eventCounts,
      mostCommon: Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    };
  },

  /**
   * Track page visit
   * @param {String} url - Page URL
   * @param {String} title - Page title
   */
  async trackPageVisit(url, title) {
    await this.trackEvent('page_visit', { url, title });
  },

  /**
   * Track AI usage
   * @param {String} model - AI model used
   * @param {Number} tokens - Tokens used
   * @param {Number} cost - Estimated cost
   */
  async trackAIUsage(model, tokens, cost = 0) {
    await this.trackEvent('ai_usage', { model, tokens, cost });
  },

  /**
   * Track script execution
   * @param {String} scriptName - Name of the script
   * @param {Boolean} success - Whether execution succeeded
   */
  async trackScriptExecution(scriptName, success) {
    await this.trackEvent('script_execution', { scriptName, success });
  },

  /**
   * Track search query
   * @param {String} query - Search query
   * @param {Number} results - Number of results
   */
  async trackSearch(query, results = 0) {
    await this.trackEvent('search', { query, results });
  },

  /**
   * Track tab operation
   * @param {String} operation - Operation type (open, close, switch)
   */
  async trackTabOperation(operation) {
    await this.trackEvent('tab_operation', { operation });
  },

  /**
   * Track feature usage
   * @param {String} feature - Feature name
   */
  async trackFeatureUsage(feature) {
    await this.trackEvent('feature_usage', { feature });
  },

  /**
   * Export analytics data
   * @returns {Promise<Object>} Exported data
   */
  async exportAnalytics() {
    const events = await this.getEvents();
    const stats = await this.getStats();

    return {
      exportDate: new Date().toISOString(),
      events,
      stats
    };
  },

  /**
   * Clear all analytics data
   */
  async clearAnalytics() {
    try {
      await AsyncStorage.removeItem('analytics_events');
      console.log('✅ Analytics cleared');
      return true;
    } catch (error) {
      console.error('Error clearing analytics:', error);
      return false;
    }
  },

  /**
   * Get usage summary
   * @returns {Promise<Object>} Usage summary
   */
  async getUsageSummary() {
    const events = await this.getEvents();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Page visits today
    const pageVisitsToday = events.filter(
      e => e.name === 'page_visit' && now - e.timestamp < oneDay
    ).length;

    // AI requests today
    const aiRequestsToday = events.filter(
      e => e.name === 'ai_usage' && now - e.timestamp < oneDay
    ).length;

    // Scripts executed today
    const scriptsToday = events.filter(
      e => e.name === 'script_execution' && now - e.timestamp < oneDay
    ).length;

    // Total tokens used
    const totalTokens = events
      .filter(e => e.name === 'ai_usage')
      .reduce((sum, e) => sum + (e.properties.tokens || 0), 0);

    // Most visited pages
    const pageVisits = events.filter(e => e.name === 'page_visit');
    const urlCounts = pageVisits.reduce((acc, event) => {
      const url = event.properties.url;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([url, count]) => ({ url, count }));

    return {
      today: {
        pageVisits: pageVisitsToday,
        aiRequests: aiRequestsToday,
        scripts: scriptsToday
      },
      totals: {
        events: events.length,
        tokens: totalTokens
      },
      topPages
    };
  }
};
