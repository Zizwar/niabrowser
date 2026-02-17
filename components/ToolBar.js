import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Image, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ToolBar = ({
  url,
  setUrl,
  isDarkMode,
  textColor,
  addToHistory,
  onMenuPress,
  goBack,
  goForward,
  reload,
  canGoBack,
  canGoForward,
  onFavoritesPress,
  isFavorite,
  onToggleFavorite
}) => {
  const getFaviconUrl = (siteUrl) => {
    try {
      const urlObj = new URL(siteUrl);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDisplayUrl = (fullUrl) => {
    try {
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return fullUrl;
    }
  };

  const isSecure = url?.startsWith('https://');
  const faviconUrl = getFaviconUrl(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) setInputUrl(url);
  }, [url, isEditing]);

  const handleUrlSubmit = () => {
    let processedUrl = inputUrl.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      if (processedUrl.includes('.') && !processedUrl.includes(' ')) {
        processedUrl = `https://${processedUrl}`;
      } else {
        processedUrl = `https://www.google.com/search?q=${encodeURIComponent(processedUrl)}`;
      }
    }
    setUrl(processedUrl);
    addToHistory(processedUrl);
    setIsEditing(false);
  };

  const bg = isDarkMode ? '#1A1A1A' : '#FFFFFF';
  const urlBarBg = isDarkMode ? '#2C2C2E' : '#F2F2F7';
  const iconColor = isDarkMode ? '#AAAAAA' : '#8E8E93';
  const activeIconColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5E5' }]}>
      {/* Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goBack} disabled={!canGoBack} style={styles.navBtn}>
          <MaterialIcons name="arrow-back-ios" size={18} color={canGoBack ? activeIconColor : iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goForward} disabled={!canGoForward} style={styles.navBtn}>
          <MaterialIcons name="arrow-forward-ios" size={18} color={canGoForward ? activeIconColor : iconColor} />
        </TouchableOpacity>

        {/* URL Bar */}
        <TouchableOpacity
          style={[styles.urlBar, { backgroundColor: urlBarBg }]}
          onPress={() => {
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          activeOpacity={0.7}
        >
          {isEditing ? (
            <TextInput
              ref={inputRef}
              style={[styles.urlInput, { color: textColor }]}
              value={inputUrl}
              onChangeText={setInputUrl}
              onSubmitEditing={handleUrlSubmit}
              onBlur={() => setIsEditing(false)}
              selectTextOnFocus
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="Search or enter URL"
              placeholderTextColor={iconColor}
              returnKeyType="go"
            />
          ) : (
            <View style={styles.urlDisplay}>
              {faviconUrl && (
                <Image source={{ uri: faviconUrl }} style={styles.favicon} />
              )}
              <MaterialIcons
                name={isSecure ? 'lock' : 'lock-open'}
                size={14}
                color={isSecure ? '#4CAF50' : '#FF9800'}
                style={styles.lockIcon}
              />
              <Text style={[styles.urlText, { color: textColor }]} numberOfLines={1}>
                {getDisplayUrl(url)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={reload} style={styles.navBtn}>
          <MaterialIcons name="refresh" size={20} color={activeIconColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleFavorite} style={styles.navBtn}>
          <MaterialIcons
            name={isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={isFavorite ? '#FFD700' : iconColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  urlBar: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  urlDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 6,
  },
  lockIcon: {
    marginRight: 4,
  },
  urlText: {
    fontSize: 14,
    fontWeight: '400',
    maxWidth: '80%',
  },
  urlInput: {
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
});

export default ToolBar;
