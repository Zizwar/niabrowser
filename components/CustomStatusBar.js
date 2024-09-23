import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';

const CustomStatusBar = ({ isDarkMode }) => {
  return (
    <View style={[styles.statusBar, { backgroundColor: isDarkMode ? '#121212' : '#F1F3F4' }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? '#121212' : '#F1F3F4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: 13//StatusBar.currentHeight,
  },
});

export default CustomStatusBar;