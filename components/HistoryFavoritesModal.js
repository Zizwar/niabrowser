import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

const HistoryFavoritesModal = ({ visible, onClose, history, onSelectUrl, clearHistory, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = (url) => {
    const updatedFavorites = [...favorites, url];
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  const removeFromFavorites = (url) => {
    const updatedFavorites = favorites.filter(fav => fav !== url);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

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

  const removeFromHistory = (url) => {
    // Implement remove from history functionality
    Alert.alert("Removed from history", url);
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
    ? history.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : favorites.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.item, 
        { backgroundColor: index % 2 === 0 ? backgroundColor : isDarkMode ? '#2C2C2C' : '#F0F0F0' }
      ]} 
      onPress={() => onSelectUrl(item)}
      onLongPress={() => handleLongPress(item)}
    >
      <Text style={[styles.itemText, { color: textColor }]}>{item}</Text>
      {activeTab === 'favorites' && (
        <TouchableOpacity onPress={() => removeFromFavorites(item)}>
          <Icon name="star" type="material" color="#FFD700" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

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
  itemText: {
    fontSize: 16,
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