import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import appJson from '../app.json';
import BaseModal from './ui/BaseModal';

const GuideContent = ({ isDarkMode, onNavigate }) => {
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const cardBg = isDarkMode ? '#2C2C2E' : '#F5F5F5';

  const sections = [
    { icon: 'psychology', color: '#007AFF', title: 'NIA AI Chat', items: [
      'Ask AI about any page - analyze cookies, network, console logs',
      'Use the clip icon to control what data AI receives',
      'Supports multiple AI providers (OpenRouter, Google Gemini, OpenAI)',
      'Conversation history saved automatically',
    ]},
    { icon: 'build', color: '#FF9800', title: 'API Client', items: [
      'Send HTTP requests (GET, POST, PUT, DELETE)',
      'Import from cURL commands or Postman collections',
      'Save request collections for reuse',
    ]},
    { icon: 'developer-mode', color: '#4CAF50', title: 'DevTools', items: [
      'Console: View logs, errors, warnings',
      'Network: Monitor HTTP requests with full details',
      'Storage: Inspect cookies and localStorage',
      'AI buttons to analyze each section',
    ]},
    { icon: 'extension', color: '#9C27B0', title: 'Script Manager', items: [
      'AI Generator: Describe what you want, AI writes the code',
      'AI Edit: Modify existing scripts with AI assistance',
      'Import Greasemonkey/Tampermonkey userscripts',
      'URL patterns to auto-run scripts',
    ]},
    { icon: 'tab', color: '#2196F3', title: 'Browser Features', items: [
      'Multi-tab browsing with tab management',
      'Favorites: Star to save, long-press for list',
      'Desktop mode, user agent switching, safe mode',
    ]},
    { icon: 'settings', color: '#607D8B', title: 'Settings', items: [
      'Configure AI providers and API keys',
      'Export/import all data',
      'Dark mode support',
    ]},
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {sections.map((section, i) => (
        <View key={i} style={[styles.guideCard, { backgroundColor: cardBg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <MaterialIcons name={section.icon} size={22} color={section.color} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>{section.title}</Text>
          </View>
          {section.items.map((item, j) => (
            <View key={j} style={{ flexDirection: 'row', paddingLeft: 4, marginBottom: 6 }}>
              <Text style={{ color: secondaryTextColor, fontSize: 13, marginRight: 8 }}>{'\u2022'}</Text>
              <Text style={{ color: secondaryTextColor, fontSize: 13, lineHeight: 19, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
      <TouchableOpacity
        style={[styles.guideCard, { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', gap: 12 }]}
        onPress={() => onNavigate ? onNavigate('https://niabrowser.vibzcode.com/demo/') : Linking.openURL('https://niabrowser.vibzcode.com/demo/')}
      >
        <MaterialIcons name="science" size={24} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Interactive Demo</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Try all features with the live test page</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const AboutModal = ({ visible, onClose, isDarkMode, onNavigate }) => {
  const [showGuide, setShowGuide] = useState(false);
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#F5F5F5';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderLinkItem = (icon, title, onPress) => (
    <TouchableOpacity style={[styles.linkItem, { backgroundColor: cardBackground }]} onPress={onPress}>
      <MaterialIcons name={icon} size={20} color="#007AFF" />
      <Text style={[styles.linkText, { color: textColor }]}>{title}</Text>
      <MaterialIcons name="chevron-right" size={20} color={secondaryTextColor} />
    </TouchableOpacity>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="About"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* App Info */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: textColor }]}>NIABrowser</Text>
          <Text style={[styles.version, { color: secondaryTextColor }]}>
            Version {appJson.expo?.version || '1.1.0'}
          </Text>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.description, { color: textColor }]}>
            AI-powered developer browser with built-in DevTools, script manager, API client, and multi-provider AI chat for web development and debugging.
          </Text>
        </View>

        <TouchableOpacity style={[styles.guideButton, { backgroundColor: '#007AFF' }]} onPress={() => setShowGuide(true)}>
          <MaterialIcons name="menu-book" size={20} color="#FFF" />
          <Text style={styles.guideButtonText}>App Guide</Text>
          <MaterialIcons name="chevron-right" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Links Section */}
        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>DEVELOPER</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('person', 'Brahim Bidi', () => openLink('https://brah.im'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>CONTACT</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('language', 'Website', () => openLink('https://niabrowser.vibzcode.com'))}
          {renderLinkItem('email', 'Contact Us', () => openLink('mailto:contact-niabrowser@vibzcode.com'))}
          {renderLinkItem('feedback', 'Send Feedback', () => openLink('mailto:feedback-niabrowser@vibzcode.com'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>SOURCE CODE</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('code', 'GitHub Repository', () => openLink('https://github.com/zizwar/niabrowser'))}
          {renderLinkItem('description', 'View License', () => openLink('https://github.com/zizwar/niabrowser/blob/main/LICENSE'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>LEGAL</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('gavel', 'Terms of Service', () => openLink('https://niabrowser.vibzcode.com/terms.html'))}
          {renderLinkItem('privacy-tip', 'Privacy Policy', () => openLink('https://niabrowser.vibzcode.com/privacy.html'))}
          {renderLinkItem('info', 'Disclaimer', () => openLink('https://niabrowser.vibzcode.com/disclaimer.html'))}
        </View>

        {/* Notice */}
        <View style={[styles.notice, { backgroundColor: '#FFF8E1' }]}>
          <MaterialIcons name="info" size={20} color="#FF8F00" />
          <Text style={styles.noticeText}>
            This app is intended for developers who understand its capabilities. Use with caution and responsibility.
          </Text>
        </View>

        {/* License */}
        <Text style={[styles.license, { color: secondaryTextColor }]}>
          Open source under MIT License
        </Text>
      </ScrollView>
      <BaseModal visible={showGuide} onClose={() => setShowGuide(false)} title="NIABrowser Guide" isDarkMode={isDarkMode} fullScreen={true}>
        <GuideContent isDarkMode={isDarkMode} onNavigate={onNavigate} />
      </BaseModal>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  linkSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#5D4037',
  },
  license: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 20,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  guideButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  guideCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});

export default AboutModal;
