# 🎨 تحسينات التصميم والتوزيع

## 🌟 نظام التصميم الجديد

### الألوان الموحدة

```javascript
// constants/colors.js
export const Colors = {
  light: {
    primary: '#007AFF',      // أزرق iOS
    secondary: '#5856D6',    // بنفسجي
    success: '#34C759',      // أخضر
    warning: '#FF9500',      // برتقالي
    error: '#FF3B30',        // أحمر
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    shadow: 'rgba(0,0,0,0.1)'
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    shadow: 'rgba(255,255,255,0.1)'
  }
};

// استخدام:
const getColors = (isDarkMode) => isDarkMode ? Colors.dark : Colors.light;
```

---

### التايبوغرافي (Typography)

```javascript
// constants/typography.js
export const Typography = {
  // Headers
  h1: {
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 41
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28
  },
  
  // Body
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22
  },
  bodyBold: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22
  },
  
  // Caption
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18
  },
  
  // Button
  button: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22
  }
};
```

---

### المسافات الموحدة (Spacing)

```javascript
// constants/spacing.js
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  }
};
```

---

## 🎯 إعادة تصميم المكونات الرئيسية

### 1. Bottom Navigation المحسن

```javascript
// components/BottomNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { Icon } from 'react-native-elements';
import { Colors, Spacing, Shadows } from '../constants';

const NavButton = ({ icon, label, onPress, onLongPress, active, isDarkMode, disabled }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };
  
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.navButton,
          active && { backgroundColor: colors.primary + '20' },
          disabled && { opacity: 0.3 }
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Icon
          name={icon}
          type="ionicon"
          size={24}
          color={active ? colors.primary : colors.text}
        />
        {label && (
          <Text style={[
            styles.navLabel,
            { color: active ? colors.primary : colors.textSecondary }
          ]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const BottomNavigation = ({
  isDarkMode,
  onHomePress,
  onHomeLongPress,
  onBackPress,
  onForwardPress,
  onRefreshPress,
  onSettingsPress,
  onDevToolsPress,
  onSmartChatPress,
  canGoBack,
  canGoForward
}) => {
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border
      },
      Shadows.lg
    ]}>
      <NavButton
        icon="home-outline"
        onPress={onHomePress}
        onLongPress={onHomeLongPress}
        isDarkMode={isDarkMode}
      />
      
      <NavButton
        icon="arrow-back-outline"
        onPress={onBackPress}
        isDarkMode={isDarkMode}
        disabled={!canGoBack}
      />
      
      <NavButton
        icon="arrow-forward-outline"
        onPress={onForwardPress}
        isDarkMode={isDarkMode}
        disabled={!canGoForward}
      />
      
      <NavButton
        icon="refresh-outline"
        onPress={onRefreshPress}
        isDarkMode={isDarkMode}
      />
      
      <NavButton
        icon="chatbubble-outline"
        onPress={onSmartChatPress}
        isDarkMode={isDarkMode}
        active={true}
      />
      
      <NavButton
        icon="code-slash-outline"
        onPress={onDevToolsPress}
        isDarkMode={isDarkMode}
      />
      
      <NavButton
        icon="settings-outline"
        onPress={onSettingsPress}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderTopWidth: 0.5
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 48
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500'
  }
});

export default BottomNavigation;
```

---

### 2. Tab Bar المحسن

```javascript
// components/TabBar.js
import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ScrollView,
  Animated
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants';

const TabItem = ({ tab, isActive, onPress, onClose, isDarkMode }) => {
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };
  
  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }] },
        { marginRight: Spacing.sm }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: isActive ? colors.surface : colors.background,
            borderWidth: 1,
            borderColor: isActive ? colors.primary : colors.border
          },
          isActive && Shadows.md
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {/* Favicon */}
        <View style={[
          styles.favicon,
          { backgroundColor: colors.primary + '20' }
        ]}>
          <Icon
            name="globe-outline"
            type="ionicon"
            size={16}
            color={colors.primary}
          />
        </View>
        
        {/* Title */}
        <Text
          style={[
            styles.tabTitle,
            { color: colors.text },
            !isActive && { color: colors.textSecondary }
          ]}
          numberOfLines={1}
        >
          {tab.title || 'New Tab'}
        </Text>
        
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            onClose();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="close-outline"
            type="ionicon"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TabBar = ({ tabs, activeTabIndex, onTabPress, onTabClose, onNewTab, isDarkMode }) => {
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border
      }
    ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={index === activeTabIndex}
            onPress={() => onTabPress(index)}
            onClose={() => onTabClose(index)}
            isDarkMode={isDarkMode}
          />
        ))}
        
        {/* New Tab Button */}
        <TouchableOpacity
          style={[
            styles.newTabButton,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }
          ]}
          onPress={onNewTab}
        >
          <Icon
            name="add-outline"
            type="ionicon"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: 0.5
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center'
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    maxWidth: 200,
    minWidth: 120
  },
  favicon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  tabTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500'
  },
  closeButton: {
    marginLeft: Spacing.xs,
    padding: 2
  },
  newTabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed'
  }
});

export default TabBar;
```

---

### 3. Search Bar المحسن

```javascript
// components/SearchBar.js
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants';

const SearchBar = ({ 
  currentUrl, 
  onSubmit, 
  isLoading, 
  isDarkMode,
  onVoiceSearch,
  onAIAssist
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false
    }).start();
  };
  
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });
  
  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderColor: borderColor,
        borderWidth: 2
      },
      isFocused && Shadows.md
    ]}>
      {/* Security Icon */}
      <View style={[
        styles.securityIcon,
        { backgroundColor: colors.success + '20' }
      ]}>
        <Icon
          name="lock-closed"
          type="ionicon"
          size={14}
          color={colors.success}
        />
      </View>
      
      {/* Input */}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value || currentUrl}
        onChangeText={setValue}
        onSubmitEditing={() => onSubmit(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="ابحث أو أدخل عنوان الموقع..."
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        selectTextOnFocus
      />
      
      {/* Loading / Clear */}
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : value ? (
        <TouchableOpacity
          onPress={() => setValue('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="close-circle"
            type="ionicon"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      ) : null}
      
      {/* Voice Search */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onVoiceSearch}
      >
        <Icon
          name="mic-outline"
          type="ionicon"
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      
      {/* AI Assist */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: colors.primary }
        ]}
        onPress={onAIAssist}
      >
        <Icon
          name="sparkles"
          type="ionicon"
          size={18}
          color="#FFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    height: 48
  },
  securityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400'
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs
  }
});

export default SearchBar;
```

---

### 4. Smart Chat Floating Button

```javascript
// components/FloatingChatButton.js
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Colors, Shadows } from '../constants';

const FloatingChatButton = ({ onPress, isDarkMode, hasUnread }) => {
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    // Pulse animation if unread
    if (hasUnread) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [hasUnread]);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };
  
  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) }
        ]
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          Shadows.lg
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Icon
          name="chatbubble-ellipses"
          type="ionicon"
          size={28}
          color="#FFF"
        />
        
        {hasUnread && (
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF'
  }
});

export default FloatingChatButton;
```

---

## 📱 التخطيط العام (Layout)

```javascript
// App.js - التخطيط المحسن
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { Colors } from './constants';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Tab Bar */}
      <TabBar {...tabBarProps} />
      
      {/* Search Bar */}
      <SearchBar {...searchBarProps} />
      
      {/* Main Content */}
      <View style={styles.content}>
        <WebViewManager {...webViewProps} />
      </View>
      
      {/* Floating Chat Button */}
      <FloatingChatButton
        onPress={() => setShowSmartChat(true)}
        isDarkMode={isDarkMode}
        hasUnread={false}
      />
      
      {/* Bottom Navigation */}
      <BottomNavigation {...navigationProps} />
      
      {/* Modals */}
      <SmartChatAssistant {...chatProps} />
      <UnifiedSettings {...settingsProps} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  }
});
```

---

## 🎭 الرسوم المتحركة (Animations)

```javascript
// utils/animations.js
import { Animated, Easing } from 'react-native';

export const Animations = {
  // Fade In
  fadeIn: (animValue, duration = 300) => {
    return Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: true
    });
  },
  
  // Slide Up
  slideUp: (animValue, duration = 300) => {
    return Animated.spring(animValue, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    });
  },
  
  // Scale Bounce
  scaleBounce: (animValue) => {
    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]);
  },
  
  // Shake
  shake: (animValue) => {
    return Animated.sequence([
      Animated.timing(animValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true })
    ]);
  }
};
```

---

## 🌈 الثيمات (Themes)

```javascript
// themes/index.js
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants';

export const createTheme = (isDarkMode) => ({
  colors: Colors[isDarkMode ? 'dark' : 'light'],
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  
  // Component Styles
  button: {
    primary: {
      backgroundColor: Colors[isDarkMode ? 'dark' : 'light'].primary,
      color: '#FFFFFF',
      ...Shadows.md
    },
    secondary: {
      backgroundColor: Colors[isDarkMode ? 'dark' : 'light'].secondary,
      color: '#FFFFFF'
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors[isDarkMode ? 'dark' : 'light'].primary,
      color: Colors[isDarkMode ? 'dark' : 'light'].primary
    }
  },
  
  card: {
    backgroundColor: Colors[isDarkMode ? 'dark' : 'light'].surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm
  }
});

// استخدام:
const theme = createTheme(isDarkMode);
```

---

## 🎨 خلاصة التحسينات

### ما تم تحسينه:

✅ **نظام ألوان موحد** - 16 لون لكل ثيم
✅ **تايبوغرافي متناسق** - 6 أحجام نصوص
✅ **مسافات موحدة** - من xs إلى xxl
✅ **ظلال احترافية** - 3 مستويات
✅ **رسوم متحركة سلسة** - Animated API
✅ **زر دردشة عائم** - مع Pulse animation
✅ **Tab Bar ديناميكي** - Scroll horizontal
✅ **Search Bar ذكي** - مع Voice & AI
✅ **Bottom Navigation جميل** - 7 أزرار
✅ **Theme System كامل** - Light & Dark

---

**🎉 الآن المتصفح يبدو احترافياً وحديثاً!**