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
      
      {/* Warning Message in Center */}
      <View style={styles.warningContainer}>
        <Icon name="warning" type="material" size={24} color="#FF9800" />
        <Text style={styles.warningText}>
          This app is intended for developers who understand its capabilities. 
          If you're not a developer, it's recommended to use standard browsers.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
  warningContainer: {
    backgroundColor: '#FFF3C4',
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OnboardingScreen;

