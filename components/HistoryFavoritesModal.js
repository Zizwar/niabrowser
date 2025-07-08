import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

const HistoryFavoritesModal = ({ visible, onClose, history, onSelectUrl, clearHistory, isDarkMode, favorites, addToFavorites, removeFromFavorites, onHistoryUpdate }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';


  const handleLongPress = (item) => {
    Alert.alert(
      "Options",
      "Choose an action",
      [
        { text: "Open in New Tab", onPress: () => onSelectUrl(item, true) },
        { text: "Delete", onPress: () => activeTab === 'history' ? removeFromHistory(item) : removeFromFavorites(item) },
        { text: "Copy", onPress: () => copyToClipboard(item) },
        { text: "Share", onPress: () => shareUrl(item) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const removeFromHistory = async (urlToRemove) => {
    Alert.alert(
      'Delete from History',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const savedHistory = await AsyncStorage.getItem('browserHistory');
            if (savedHistory) {
              const historyArray = JSON.parse(savedHistory);
              const updatedHistory = historyArray.filter(item => {
                const itemUrl = typeof item === 'string' ? item : item.url;
                return itemUrl !== urlToRemove;
              });
              await AsyncStorage.setItem('browserHistory', JSON.stringify(updatedHistory));
              
              // Call the parent callback to update the history state
              if (onHistoryUpdate) {
                onHistoryUpdate(updatedHistory);
              }
              
              Alert.alert('Deleted', 'Item has been deleted from history');
            }
          } catch (error) {
            console.error('Error removing from history:', error);
            Alert.alert('Error', 'Failed to delete item from history');
          }
        }}
      ]
    );
  };

  const copyToClipboard = async (url) => {
    await Clipboard.setStringAsync(url);
    Alert.alert("Copied to clipboard", url);
  };

  const shareUrl = async (url) => {
    try {
      await Share.share({ message: url });
    } catch (error) {
      console.error('Error sharing URL:', error);
    }
  };

  const filteredData = activeTab === 'history' 
    ? history.filter(item => {
        const url = typeof item === 'string' ? item : item.url;
        const title = typeof item === 'string' ? item : item.title;
        return url.toLowerCase().includes(searchQuery.toLowerCase()) || 
               title.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : favorites.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = ({ item, index }) => {
    const url = typeof item === 'string' ? item : item.url;
    const title = typeof item === 'string' ? item : item.title;
    const displayUrl = url.length > 60 ? url.substring(0, 57) + '...' : url;
    
    return (
      <TouchableOpacity 
        style={[
          styles.item, 
          { backgroundColor: index % 2 === 0 ? backgroundColor : isDarkMode ? '#2C2C2C' : '#F0F0F0' }
        ]} 
        onPress={() => onSelectUrl(url)}
        onLongPress={() => handleLongPress(url)}
      >
        <View style={styles.itemContent}>
          {activeTab === 'history' && title !== url ? (
            <>
              <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>{title}</Text>
              <Text style={[styles.itemUrl, { color: isDarkMode ? '#AAAAAA' : '#666666' }]} numberOfLines={1}>{displayUrl}</Text>
            </>
          ) : (
            <Text style={[styles.itemText, { color: textColor }]} numberOfLines={2}>{displayUrl}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => {
          if (activeTab === 'favorites') {
            removeFromFavorites(url);
          } else {
            removeFromHistory(url);
          }
        }}>
          <Icon name="delete" type="material" color="#FF5252" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>History & Favorites</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" type="material" color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, { color: textColor }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]} 
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, { color: textColor }]}>Favorites</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.searchInput, { color: textColor, backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}
          placeholder="Search..."
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        {activeTab === 'history' && (
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Icon name="delete" type="material" color={textColor} />
            <Text style={[styles.clearButtonText, { color: textColor }]}>Clear History</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'favorites' && (
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            Alert.alert(
              "Clear All Favorites",
              "Are you sure you want to clear all favorites?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", onPress: () => {
                  favorites.forEach(fav => removeFromFavorites(fav));
                }}
              ]
            );
          }}>
            <Icon name="delete" type="material" color={textColor} />
            <Text style={[styles.clearButtonText, { color: textColor }]}>Clear All Favorites</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
  },
  searchInput: {
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemUrl: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  clearButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default HistoryFavoritesModal;