import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Icon } from 'react-native-elements';

const HistoryModal = ({ visible, onClose, history, onSelectUrl, clearHistory, isDarkMode }) => {
  const backgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all browsing history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: clearHistory }
      ]
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
          <Text style={[styles.title, { color: textColor }]}>Browsing History</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" type="material" color={textColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => onSelectUrl(item)}>
              <Text style={[styles.itemText, { color: textColor }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
          <Icon name="delete" type="material" color={textColor} />
          <Text style={[styles.clearButtonText, { color: textColor }]}>Clear History</Text>
        </TouchableOpacity>
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
  item: {
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

export default HistoryModal;