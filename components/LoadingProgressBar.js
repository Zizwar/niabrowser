import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const LoadingProgressBar = ({ isLoading, isDarkMode }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // Reset and show
      progress.setValue(0);
      opacity.setValue(1);

      // Animate progress: fast to 30%, slow to 70%, then crawl to 90%
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0.9,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Complete: jump to 100% then fade out
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.delay(150),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        progress.setValue(0);
      });
    }
  }, [isLoading]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            width,
            opacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 2.5,
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});

export default LoadingProgressBar;
