import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AIProviderManager } from '../../utils/AIProviderManager';

/**
 * ModelSelector - Compact dropdown for AI model selection
 * Fixed: Uses Modal instead of absolute positioning to avoid VirtualizedList nesting issues
 */
const ModelSelector = ({
  selectedModelId,
  onModelSelect,
  isDarkMode = false,
  disabled = false,
  compact = false,
  showCost = true,
  showProvider = true,
  label = 'AI Model',
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
          <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Loading...</Text>
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
            <Text style={[styles.selectedProvider, { color: secondaryTextColor }]} numberOfLines={1}>
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

  const renderModelItem = (item, index) => {
    const isSelected = item.id === selectedModelId;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.modelItem,
          { borderBottomColor: borderColor },
          isSelected && styles.selectedItem,
          isSelected && { backgroundColor: isDarkMode ? '#3C3C3E' : '#E8E8E8' },
          index === models.length - 1 && { borderBottomWidth: 0 },
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
          <Text style={[styles.modelProvider, { color: secondaryTextColor }]} numberOfLines={1}>
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
      {label && (
        <Text style={[styles.label, { color: secondaryTextColor }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor, borderColor },
          compact && styles.compactSelector,
          disabled && styles.disabledSelector,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        {renderSelectedModel()}
        <MaterialIcons
          name="expand-more"
          size={compact ? 20 : 24}
          color={disabled ? secondaryTextColor : textColor}
        />
      </TouchableOpacity>

      {/* Model Selection Modal - Avoids VirtualizedList nesting issues */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: dropdownBg }]} onPress={e => e.stopPropagation()}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select AI Model</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modelList}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              {models.map((model, index) => renderModelItem(model, index))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  compactSelector: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledSelector: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 13,
  },
  selectedProvider: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modelList: {
    maxHeight: 400,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 15,
    fontWeight: '500',
  },
  modelProvider: {
    fontSize: 12,
    marginTop: 3,
  },
  modelRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
