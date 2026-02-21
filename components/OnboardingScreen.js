import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 'welcome',
    icon: null,
    title: 'NIABrowser',
    subtitle: 'AI-Powered Developer Browser',
    description: 'Browse the web with built-in AI, DevTools, script automation, and API testing — all in one app.',
    color: '#007AFF',
    bgColor: '#0A1628',
  },
  {
    key: 'ai-chat',
    icon: 'psychology',
    title: 'Multi-Provider AI Chat',
    subtitle: 'Chat with AI about any page',
    description: 'Attach cookies, network logs, console output, or page HTML for context-aware conversations. Supports OpenRouter, Google Gemini (free!), OpenAI, and custom providers.',
    color: '#5856D6',
    bgColor: '#0F0A28',
  },
  {
    key: 'scripts',
    icon: 'code',
    title: 'Smart Script Manager',
    subtitle: 'AI-powered script generation',
    description: 'Generate JavaScript from plain English, auto-run on matching URLs, import Greasemonkey/Tampermonkey userscripts. AI Edit modifies scripts with natural language instructions.',
    color: '#9C27B0',
    bgColor: '#1A0A28',
  },
  {
    key: 'devtools',
    icon: 'developer-mode',
    title: 'Full DevTools Suite',
    subtitle: 'Console, Network, Storage, Performance',
    description: 'Capture all console methods including table, group, and trace. Monitor network requests, inspect storage, and analyze performance — on mobile.',
    color: '#34C759',
    bgColor: '#0A1A0F',
  },
  {
    key: 'config',
    icon: 'tune',
    title: 'Fully Customizable',
    subtitle: 'Developer config & custom providers',
    description: 'Edit AI prompts, add custom OpenAI-compatible providers, manage models, and configure everything from the Settings UI. Your browser, your rules.',
    color: '#FF9500',
    bgColor: '#1A140A',
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    iconScale.setValue(0);
    titleAnim.setValue(0);
    descAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
      Animated.timing(descAnim, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [currentIndex]);

  const goToSlide = (index) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setCurrentIndex(index);
      Animated.timing(bgAnim, { toValue: index, duration: 400, useNativeDriver: false }).start();
      fadeAnim.setValue(1);
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <View style={[styles.container, { backgroundColor: slide.bgColor }]}>
      <StatusBar barStyle="light-content" />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Icon */}
        {isFirst ? (
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: iconScale }] }]}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logo}
            />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.iconContainer, { backgroundColor: slide.color + '18', transform: [{ scale: iconScale }] }]}>
            <MaterialIcons name={slide.icon} size={56} color={slide.color} />
          </Animated.View>
        )}

        {/* Title */}
        <Animated.View style={{ opacity: titleAnim }}>
          <Text style={[styles.title, isFirst && styles.titleLarge]}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: slide.color }]}>{slide.subtitle}</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View style={{ opacity: descAnim }}>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
              <View style={[
                styles.dot,
                i === currentIndex && [styles.dotActive, { backgroundColor: slide.color }],
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Warning on last slide */}
        {isLast && (
          <View style={styles.warning}>
            <MaterialIcons name="info-outline" size={16} color="#8E8E93" />
            <Text style={styles.warningText}>
              Designed for developers. For regular browsing, a standard browser is recommended.
            </Text>
          </View>
        )}

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: slide.color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLast ? 'Get Started' : 'Continue'}
          </Text>
          <MaterialIcons name={isLast ? 'rocket-launch' : 'arrow-forward'} size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    width: 120,
    height: 120,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F5F5F7',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleLarge: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
    maxWidth: 320,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A4A',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    maxWidth: 320,
  },
  warningText: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 320,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
