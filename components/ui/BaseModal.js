import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * BaseModal - Unified modal component with consistent styling
 *
 * Props:
 * - visible: boolean - Controls modal visibility
 * - onClose: function - Called when close button is pressed
 * - title: string - Modal header title
 * - showCloseButton: boolean (default: true) - Show/hide close button
 * - animationType: 'slide' | 'fade' | 'none' (default: 'slide')
 * - fullScreen: boolean (default: false) - Full screen modal
 * - headerActions: React.ReactNode - Additional header action buttons
 * - isDarkMode: boolean - Dark mode styling
 * - children: React.ReactNode - Modal content
 * - showHeader: boolean (default: true) - Show/hide header
 * - headerStyle: object - Custom header styles
 * - contentStyle: object - Custom content container styles
 */
const BaseModal = ({
  visible,
  onClose,
  title,
  showCloseButton = true,
  animationType = 'slide',
  fullScreen = false,
  headerActions,
  isDarkMode = false,
  children,
  showHeader = true,
  headerStyle,
  contentStyle,
}) => {
  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const headerBg = isDarkMode ? '#2C2C2E' : '#F8F8F8';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={!fullScreen}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {fullScreen ? (
        <SafeAreaView style={[styles.fullScreenContainer, { backgroundColor }]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={headerBg}
          />
          {showHeader && (
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }, headerStyle]}>
              <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.headerRight}>
                {headerActions}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          <View style={[styles.content, { backgroundColor }, contentStyle]}>
            {children}
          </View>
        </SafeAreaView>
      ) : (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={[styles.modalContainer, { backgroundColor }]}>
            {showHeader && (
              <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }, headerStyle]}>
                <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
                  {title}
                </Text>
                <View style={styles.headerRight}>
                  {headerActions}
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            <View style={[styles.content, { backgroundColor }, contentStyle]}>
              {children}
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
});

export default BaseModal;
