import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-elements';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 'network',
    title: 'Network Tracking',
    text: 'Monitor and analyze all network requests in real-time.',
    icon: 'wifi',
  },
  {
    key: 'storage',
    title: 'Storage Inspection',
    text: 'Examine cookies, local storage, and session storage.',
    icon: 'storage',
  },
  {
    key: 'performance',
    title: 'Performance Metrics',
    text: 'Track and optimize your web app\'s performance.',
    icon: 'speed',
  },
  {
    key: 'crud',
    title: 'CRUD Operations',
    text: 'Test API endpoints directly within the app.',
    icon: 'build',
  },
  {
    key: 'devtools',
    title: 'Developer Tools',
    text: 'Access a suite of powerful developer tools on your mobile device.',
    icon: 'code',
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Icon name={item.icon} type="material" size={100} color="#4A90E2" />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSlide({ item: slides[currentSlideIndex] })}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>
        This app is intended for developers who understand its capabilities. 
        If you're not a developer, it's recommended to use standard browsers.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});

export default OnboardingScreen;

