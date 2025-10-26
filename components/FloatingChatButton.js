import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Icon } from 'react-native-elements';

const FloatingChatButton = ({ onPress, isDarkMode }) => {
  const colors = {
    primary: '#4CAF50',
    shadow: isDarkMode ? '#000000' : '#333333'
  };

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { backgroundColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name="chat" type="material" color="#FFFFFF" size={28} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000
  }
});

export default FloatingChatButton;
