import React from 'react';
import { View, StyleSheet } from 'react-native';
import TabBar from './TabBar';

const TabManager = ({ 
  tabs, 
  activeTabIndex, 
  setActiveTabIndex, 
  closeTab, 
  addNewTab, 
  isDarkMode, 
  isTabsLoading 
}) => {
  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        activeTabIndex={activeTabIndex}
        onTabPress={setActiveTabIndex}
        onCloseTab={closeTab}
        onAddTab={addNewTab}
        isDarkMode={isDarkMode}
        isLoading={isTabsLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   flex:1
  }
});

export default TabManager;