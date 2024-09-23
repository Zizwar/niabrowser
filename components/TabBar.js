import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';

const TabBar = ({ tabs, activeTabIndex, onTabPress, onCloseTab, onAddTab, isDarkMode, isLoading }) => {
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#f1f1f1' }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#000'} />
        ) : (
          tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTabIndex === index && styles.activeTab,
                { backgroundColor: isDarkMode ? '#444' : '#fff' }
              ]}
              onPress={() => onTabPress(index)}
            >
              <Text style={[styles.tabText, { color: isDarkMode ? '#fff' : '#000' }]} numberOfLines={1}>
                {tab.title || 'New Tab'}
              </Text>
              <TouchableOpacity onPress={() => onCloseTab(index)} style={styles.closeButton}>
                <Icon name="close" type="material" size={16} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
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
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 5,
    borderRadius: 5,
    maxWidth: 150,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginRight: 5,
    fontSize: 14,
  },
  closeButton: {
    padding: 2,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
});

export default TabBar;