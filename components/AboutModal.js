import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { theme } from '../constants/theme';
import appJson from '../app.json';

const AboutModal = ({ visible, onClose, isDarkMode }) => {
  const backgroundColor = isDarkMode ? theme.dark.background : theme.light.background;
  const textColor = isDarkMode ? theme.dark.text : theme.light.text;
  const secondaryTextColor = isDarkMode ? theme.dark.textSecondary : theme.light.textSecondary;

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/icon.png')} style={styles.logo} />
            <Text style={[styles.appName, { color: textColor }]}>NIABrowser</Text>
            <Text style={[styles.version, { color: secondaryTextColor }]}>
              Version {appJson.expo?.version || '2.0.0'}
            </Text>
          </View>
          <Text style={[styles.title, { color: textColor }]}>About NIABrowser</Text>
          <Text style={[styles.text, { color: textColor }]}>
            NIABrowser - Smart Developer Browser is an advanced web browser application designed specifically for developers. It provides developer tools, JavaScript execution capabilities, and network monitoring features to assist in web development and debugging.
          </Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Developer</Text>
          <TouchableOpacity onPress={() => openLink('https://brah.im')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Brahim Bidi</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>Website</Text>
          <TouchableOpacity onPress={() => openLink('https://niabrowser.com')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>niabrowser.com</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>Contact</Text>
          <TouchableOpacity onPress={() => openLink('mailto:contact@niabrowser.com')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>contact@niabrowser.com</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>Feedback</Text>
          <TouchableOpacity onPress={() => openLink('mailto:feedback@niabrowser.com')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>feedback@niabrowser.com</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>Source Code</Text>
          <TouchableOpacity onPress={() => openLink('https://github.com/zizwar/niabrowser')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>GitHub Repository</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>License</Text>
          <Text style={[styles.text, { color: textColor }]}>
            This project is open source and available under the MIT License.
          </Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Legal</Text>
          <TouchableOpacity onPress={() => openLink('https://niabrowser.com/disclaimer')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Disclaimer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://niabrowser.com/terms')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://niabrowser.com/privacy')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>

          <Text style={[styles.subTitle, { color: textColor }]}>Open Source</Text>
          <Text style={[styles.text, { color: textColor }]}>
            This project is open source and welcomes contributions from the community.
          </Text>
          <TouchableOpacity onPress={() => openLink('https://github.com/zizwar/niabrowser/blob/main/LICENSE')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>View License</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://github.com/zizwar/niabrowser/blob/main/CONTRIBUTING.md')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Contributing Guidelines</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>Important Notice</Text>
          <Text style={[styles.text, { color: textColor }]}>
            This app is intended for developers who understand its capabilities and the potential risks associated with executing code. Users should exercise caution when using the app's features.
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" type="material" color={textColor} size={30} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default AboutModal;

