import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import appJson from '../app.json';
import BaseModal from './ui/BaseModal';

const AboutModal = ({ visible, onClose, isDarkMode }) => {
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
      <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: textColor }]}>NIABrowser</Text>
          <Text style={[styles.version, { color: secondaryTextColor }]}>
            Version {appJson.expo?.version || '2.0.0'}
          </Text>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.description, { color: textColor }]}>
            NIABrowser is an advanced web browser designed for developers. It provides developer tools, JavaScript execution capabilities, and AI-powered features for web development and debugging.
          </Text>
        </View>

        {/* Links Section */}
        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>DEVELOPER</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('person', 'Brahim Bidi', () => openLink('https://brah.im'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>CONTACT</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('language', 'Website', () => openLink('https://browser.niascript.com'))}
          {renderLinkItem('email', 'Contact Us', () => openLink('mailto:contact_browser@niascript.com'))}
          {renderLinkItem('feedback', 'Send Feedback', () => openLink('mailto:feedback_browser@niascript.com'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>SOURCE CODE</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('code', 'GitHub Repository', () => openLink('https://github.com/zizwar/niabrowser'))}
          {renderLinkItem('description', 'View License', () => openLink('https://github.com/zizwar/niabrowser/blob/main/LICENSE'))}
        </View>

        <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>LEGAL</Text>
        <View style={styles.linkSection}>
          {renderLinkItem('gavel', 'Terms of Service', () => openLink('https://browser.niascript.com/term'))}
          {renderLinkItem('privacy-tip', 'Privacy Policy', () => openLink('https://browser.niascript.com/privacy'))}
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
});

export default AboutModal;
