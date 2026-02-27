import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';

const TabBar = ({ tabs, activeTabIndex, onTabPress, onCloseTab, onAddTab, isDarkMode, isLoading }) => {
  // Get favicon URL from a website URL
  const getFaviconUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  // Dynamic tab sizing: larger when few tabs, smaller when many
  const screenWidth = Dimensions.get('window').width;
  const addButtonWidth = 40;
  const availableWidth = screenWidth - addButtonWidth - 8; // 8 for container padding
  const tabCount = tabs.length;

  // Calculate tab width: fill available space when few tabs, scroll when many
  let tabWidth;
  if (tabCount <= 2) {
    tabWidth = Math.min(availableWidth / tabCount - 4, 220); // large tabs
  } else if (tabCount <= 4) {
    tabWidth = Math.min(availableWidth / tabCount - 4, 160); // medium tabs
  } else {
    tabWidth = 120; // compact, scrollable
  }
  tabWidth = Math.max(tabWidth, 80); // minimum width

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#000'} />
        ) : (
          tabs.map((tab, index) => {
            const isActive = activeTabIndex === index;
            const faviconUrl = getFaviconUrl(tab.url);

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && styles.activeTab,
                  {
                    width: tabWidth,
                    backgroundColor: isActive
                      ? (tab.isPrivate ? '#5856D6' : '#007AFF')
                      : tab.isPrivate
                        ? (isDarkMode ? '#2A2040' : '#EDE7F6')
                        : (isDarkMode ? '#2C2C2E' : '#FFFFFF')
                  }
                ]}
                onPress={() => onTabPress(index)}
              >
                {tab.isPrivate ? (
                  <MaterialIcons name="visibility-off" size={14} color={isActive ? '#FFFFFF' : '#5856D6'} style={{ marginRight: 6 }} />
                ) : faviconUrl ? (
                  <Image
                    key={faviconUrl}
                    source={{ uri: faviconUrl }}
                    style={styles.favicon}
                    defaultSource={require('../assets/icon.png')}
                  />
                ) : null}
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000') }
                  ]}
                  numberOfLines={1}
                >
                  {tab.title || 'New Tab'}
                </Text>
                <TouchableOpacity onPress={() => onCloseTab(index)} style={styles.closeButton}>
                  <Icon
                    name="close"
                    type="material"
                    size={14}
                    color={isActive ? '#FFFFFF' : (isDarkMode ? '#A0A0A0' : '#666666')}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity onPress={onAddTab} style={styles.addButton}>
        <Icon name="add" type="material" size={24} color={isDarkMode ? '#fff' : '#000'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 8,
    overflow: 'hidden',
    height: 34,
  },
  activeTab: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  favicon: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
  },
  tabText: {
    marginRight: 4,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
});

export default TabBar;