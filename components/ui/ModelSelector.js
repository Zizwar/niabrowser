import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AIProviderManager } from '../../utils/AIProviderManager';

/**
 * ModelSelector - Compact dropdown for AI model selection
 *
 * Props:
 * - selectedModelId: string - Currently selected model ID
 * - onModelSelect: function(modelId, model) - Called when a model is selected
 * - isDarkMode: boolean - Dark mode styling
 * - disabled: boolean - Disable the selector
 * - compact: boolean - Use compact mode (smaller UI)
 * - showCost: boolean - Show cost indicator (default: true)
 * - showProvider: boolean - Show provider name (default: true)
 */
const ModelSelector = ({
  selectedModelId,
  onModelSelect,
  isDarkMode = false,
  disabled = false,
  compact = false,
  showCost = true,
  showProvider = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';
  const dropdownBg = isDarkMode ? '#1C1C1E' : '#FFFFFF';

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const allModels = await AIProviderManager.getAllModels();
      setModels(allModels);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  const getCostColor = (cost) => {
    switch (cost?.toLowerCase()) {
      case 'free':
        return '#4CAF50';
      case 'low':
        return '#8BC34A';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return secondaryTextColor;
    }
  };

  const handleSelect = (model) => {
    onModelSelect(model.id, model);
    setIsOpen(false);
  };

  const renderSelectedModel = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      );
    }

    if (!selectedModel) {
      return (
        <Text style={[styles.placeholderText, { color: secondaryTextColor }]}>
          Select Model
        </Text>
      );
    }

    return (
      <View style={styles.selectedContent}>
        <View style={styles.selectedInfo}>
          <Text
            style={[styles.selectedName, { color: textColor }, compact && styles.compactText]}
            numberOfLines={1}
          >
            {selectedModel.name}
          </Text>
          {showProvider && !compact && (
            <Text style={[styles.selectedProvider, { color: secondaryTextColor }]}>
              {selectedModel.providerName || selectedModel.provider}
            </Text>
          )}
        </View>
        {showCost && selectedModel.cost && (
          <View style={[styles.costBadge, { backgroundColor: getCostColor(selectedModel.cost) + '20' }]}>
            <Text style={[styles.costText, { color: getCostColor(selectedModel.cost) }]}>
              {selectedModel.cost}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderModelItem = ({ item }) => {
    const isSelected = item.id === selectedModelId;

    return (
      <TouchableOpacity
        style={[
          styles.modelItem,
          { borderBottomColor: borderColor },
          isSelected && styles.selectedItem,
          isSelected && { backgroundColor: isDarkMode ? '#3C3C3E' : '#E8E8E8' },
        ]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.modelInfo}>
          <Text
            style={[styles.modelName, { color: textColor }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.modelProvider, { color: secondaryTextColor }]}>
            {item.providerName || item.provider}
            {item.description && ` - ${item.description}`}
          </Text>
        </View>
        <View style={styles.modelRight}>
          {showCost && item.cost && (
            <View style={[styles.costBadge, { backgroundColor: getCostColor(item.cost) + '20' }]}>
              <Text style={[styles.costText, { color: getCostColor(item.cost) }]}>
                {item.cost}
              </Text>
            </View>
          )}
          {isSelected && (
            <MaterialIcons name="check" size={20} color="#007AFF" style={styles.checkIcon} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor, borderColor },
          compact && styles.compactSelector,
          disabled && styles.disabledSelector,
        ]}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {renderSelectedModel()}
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={compact ? 20 : 24}
          color={disabled ? secondaryTextColor : textColor}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor }]}>
          <FlatList
            data={models}
            renderItem={renderModelItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={styles.modelList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactSelector: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledSelector: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    flex: 1,
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 13,
  },
  selectedProvider: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modelList: {
    maxHeight: 290,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  modelInfo: {
    flex: 1,
    marginRight: 12,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '500',
  },
  modelProvider: {
    fontSize: 12,
    marginTop: 2,
  },
  modelRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  costText: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default ModelSelector;
