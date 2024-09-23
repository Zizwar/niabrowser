import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Icon } from 'react-native-elements';

const AboutModal = ({ visible, onClose, isDarkMode }) => {
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

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
          <Text style={[styles.title, { color: textColor }]}>About webZview</Text>
          <Text style={[styles.text, { color: textColor }]}>
            webZview is an open-source web browser application designed specifically for developers working on mobile devices. It provides a rich set of features to assist in web development and debugging on-the-go.
          </Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Developer</Text>
          <Text style={[styles.text, { color: textColor }]}>Brahim Bidi</Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Contact</Text>
          <Text style={[styles.text, { color: textColor }]}>zip.exe@googlemail.com</Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Source Code</Text>
          <TouchableOpacity onPress={() => openLink('https://github.com/zizwar/webZview')}>
            <Text style={[styles.link, { color: '#4A90E2' }]}>GitHub Repository</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: textColor }]}>License</Text>
          <Text style={[styles.text, { color: textColor }]}>
            This project is open source and available under the MIT License.
          </Text>
          <Text style={[styles.subTitle, { color: textColor }]}>Disclaimer</Text>
          <Text style={[styles.text, { color: textColor }]}>
            This app is intended for developers who understand its capabilities and the potential risks associated with injecting code. Users should exercise caution when using the app's features.
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
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default AboutModal;

