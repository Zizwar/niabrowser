import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import BaseModal from './ui/BaseModal';

const HistoryFavoritesModal = ({
  visible,
  onClose,
  history,
  onSelectUrl,
  clearHistory,
  isDarkMode,
  favorites,
  addToFavorites,
  removeFromFavorites,
  onHistoryUpdate
}) => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');

  const backgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const cardBackground = isDarkMode ? '#2C2C2E' : '#F5F5F5';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const inputBackground = isDarkMode ? '#3C3C3E' : '#F0F0F0';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';

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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const savedHistory = await AsyncStorage.getItem('browserHistory');
              if (savedHistory) {
                const historyArray = JSON.parse(savedHistory);
                const updatedHistory = historyArray.filter(item => {
                  const itemUrl = typeof item === 'string' ? item : item.url;
                  return itemUrl !== urlToRemove;
                });
                await AsyncStorage.setItem('browserHistory', JSON.stringify(updatedHistory));

                if (onHistoryUpdate) {
                  onHistoryUpdate(updatedHistory);
                }
              }
            } catch (error) {
              console.error('Error removing from history:', error);
            }
          }
        }
      ]
    );
  };

  const copyToClipboard = async (url) => {
    await Clipboard.setStringAsync(url);
    Alert.alert("Copied", "URL copied to clipboard");
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
               title?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : favorites.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = ({ item, index }) => {
    const url = typeof item === 'string' ? item : item.url;
    const title = typeof item === 'string' ? item : item.title;
    const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;

    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: index % 2 === 0 ? cardBackground : backgroundColor }]}
        onPress={() => onSelectUrl(url)}
        onLongPress={() => handleLongPress(url)}
      >
        <View style={styles.itemIcon}>
          <MaterialIcons
            name={activeTab === 'history' ? 'history' : 'star'}
            size={20}
            color={activeTab === 'history' ? secondaryTextColor : '#FFC107'}
          />
        </View>
        <View style={styles.itemContent}>
          {activeTab === 'history' && title && title !== url ? (
            <>
              <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>{title}</Text>
              <Text style={[styles.itemUrl, { color: secondaryTextColor }]} numberOfLines={1}>{displayUrl}</Text>
            </>
          ) : (
            <Text style={[styles.itemText, { color: textColor }]} numberOfLines={2}>{displayUrl}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => activeTab === 'favorites' ? removeFromFavorites(url) : removeFromHistory(url)}
        >
          <MaterialIcons name="delete-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="History & Favorites"
      isDarkMode={isDarkMode}
      fullScreen={true}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <MaterialIcons
              name="history"
              size={20}
              color={activeTab === 'history' ? '#007AFF' : secondaryTextColor}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'history' ? '#007AFF' : textColor }
            ]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <MaterialIcons
              name="star"
              size={20}
              color={activeTab === 'favorites' ? '#007AFF' : secondaryTextColor}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'favorites' ? '#007AFF' : textColor }
            ]}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: inputBackground }]}>
          <MaterialIcons name="search" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={secondaryTextColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name={activeTab === 'history' ? 'history' : 'star-border'}
                size={48}
                color={secondaryTextColor}
              />
              <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                {activeTab === 'history' ? 'No history yet' : 'No favorites yet'}
              </Text>
            </View>
          }
        />

        {/* Clear Button */}
        <TouchableOpacity
          style={[styles.clearButton, { borderTopColor: borderColor }]}
          onPress={() => {
            if (activeTab === 'history') {
              clearHistory();
            } else {
              Alert.alert(
                "Clear All Favorites",
                "Are you sure you want to clear all favorites?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => favorites.forEach(fav => removeFromFavorites(fav))
                  }
                ]
              );
            }
          }}
        >
          <MaterialIcons name="delete-sweep" size={20} color="#F44336" />
          <Text style={styles.clearButtonText}>
            Clear All {activeTab === 'history' ? 'History' : 'Favorites'}
          </Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemUrl: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default HistoryFavoritesModal;
