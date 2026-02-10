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
  BackHandler,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * BaseModal - Unified modal component with consistent styling
 * Fixed: Proper safe area handling to avoid status bar overlap
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

  // Handle back button on Android
  React.useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Get safe area insets for proper padding
  const SafeContent = ({ children: safeChildren }) => {
    try {
      const insets = useSafeAreaInsets();
      return (
        <View style={[
          styles.fullScreenContainer,
          {
            backgroundColor,
            paddingTop: Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 24) : insets.top,
          }
        ]}>
          {safeChildren}
        </View>
      );
    } catch {
      // Fallback if SafeAreaContext not available
      return (
        <View style={[
          styles.fullScreenContainer,
          {
            backgroundColor,
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
          }
        ]}>
          {safeChildren}
        </View>
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={!fullScreen}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {fullScreen ? (
        <SafeContent>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
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
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
        </SafeContent>
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
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
    maxHeight: '85%',
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
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  content: {
    flex: 1,
  },
});

export default BaseModal;
