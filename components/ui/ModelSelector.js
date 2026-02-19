import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
 * ModelSelector - Dropdown for AI model selection with provider grouping and search
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
  const [searchQuery, setSearchQuery] = useState('');

  const backgroundColor = isDarkMode ? '#2C2C2E' : '#F0F0F0';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const borderColor = isDarkMode ? '#3C3C3E' : '#E5E5E5';
  const dropdownBg = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const inputBg = isDarkMode ? '#2C2C2E' : '#F0F0F0';

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

  // Group models by provider and filter by search
  const groupedModels = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? models.filter(m =>
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          (m.providerName || m.provider || '').toLowerCase().includes(query) ||
          (m.description || '').toLowerCase().includes(query)
        )
      : models;

    const groups = {};
    filtered.forEach(model => {
      const providerKey = model.providerId || 'unknown';
      if (!groups[providerKey]) {
        groups[providerKey] = {
          name: model.providerName || model.provider || 'Other',
          color: model.providerColor || '#007AFF',
          models: [],
        };
      }
      groups[providerKey].models.push(model);
    });

    return Object.entries(groups);
  }, [models, searchQuery]);

  const getCostColor = (cost) => {
    const c = cost?.toLowerCase()?.replace('*', '');
    switch (c) {
      case 'free': return '#4CAF50';
      case 'low': return '#8BC34A';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return secondaryTextColor;
    }
  };

  const handleSelect = (model) => {
    onModelSelect(model.id, model);
    setIsOpen(false);
    setSearchQuery('');
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
        <View style={[styles.providerDot, { backgroundColor: selectedModel.providerColor || '#007AFF' }]} />
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

  const renderModelItem = (item) => {
    const isSelected = item.id === selectedModelId;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.modelItem,
          { borderBottomColor: borderColor },
          isSelected && styles.selectedItem,
          isSelected && { backgroundColor: isDarkMode ? '#3C3C3E' : '#E8E8E8' },
        ]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.modelInfo}>
          <Text style={[styles.modelName, { color: textColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={[styles.modelDescription, { color: secondaryTextColor }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
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

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { setIsOpen(false); setSearchQuery(''); }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => { setIsOpen(false); setSearchQuery(''); }}>
          <Pressable style={[styles.modalContent, { backgroundColor: dropdownBg }]} onPress={e => e.stopPropagation()}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select AI Model</Text>
              <TouchableOpacity onPress={() => { setIsOpen(false); setSearchQuery(''); }} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
              <MaterialIcons name="search" size={20} color={secondaryTextColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor, backgroundColor: inputBg }]}
                placeholder="Search models..."
                placeholderTextColor={secondaryTextColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="clear" size={18} color={secondaryTextColor} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modelList}
              showsVerticalScrollIndicator={true}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {groupedModels.length === 0 ? (
                <View style={styles.emptySearch}>
                  <MaterialIcons name="search-off" size={32} color={secondaryTextColor} />
                  <Text style={[styles.emptySearchText, { color: secondaryTextColor }]}>No models found</Text>
                </View>
              ) : (
                groupedModels.map(([providerId, group]) => (
                  <View key={providerId}>
                    {/* Provider Section Header */}
                    <View style={[styles.providerHeader, { borderBottomColor: borderColor }]}>
                      <View style={[styles.providerHeaderDot, { backgroundColor: group.color }]} />
                      <Text style={[styles.providerHeaderText, { color: group.color }]}>
                        {group.name}
                      </Text>
                      <View style={[styles.providerHeaderLine, { backgroundColor: group.color + '30' }]} />
                      <Text style={[styles.providerCount, { color: secondaryTextColor }]}>
                        {group.models.length}
                      </Text>
                    </View>
                    {group.models.map(model => renderModelItem(model))}
                  </View>
                ))
              )}
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
  providerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modelList: {
    maxHeight: 450,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  providerHeaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  providerHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  providerHeaderLine: {
    flex: 1,
    height: 1,
  },
  providerCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingLeft: 34,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  modelDescription: {
    fontSize: 11,
    marginTop: 2,
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
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptySearchText: {
    fontSize: 14,
  },
});

export default ModelSelector;
