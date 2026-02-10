import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Icon } from 'react-native-elements';

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
  // Get favicon URL from website
  const getFaviconUrl = (siteUrl) => {
    try {
      const urlObj = new URL(siteUrl);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isEditing ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isEditing, fadeAnim]);

  const handleUrlChange = (text) => {
    setInputUrl(text);
  };

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

  const handleFocus = () => {
    setIsEditing(true);
    inputRef.current.setNativeProps({
      selection: { start: 0, end: inputUrl.length }
    });
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F1F3F4' }]}>
      <TouchableOpacity onPress={goBack} disabled={!canGoBack}>
        <Icon name="arrow-back" type="material" color={canGoBack ? textColor : '#888888'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={goForward} disabled={!canGoForward}>
        <Icon name="arrow-forward" type="material" color={canGoForward ? textColor : '#888888'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={reload}>
        <Icon name="refresh" type="material" color={textColor} />
      </TouchableOpacity>
      <View style={styles.urlContainer}>
        {faviconUrl && (
          <Image source={{ uri: faviconUrl }} style={styles.favicon} />
        )}
        <Animated.View style={[
          styles.urlInfo,
          { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }
        ]}>
          <Icon name="lock" type="material" size={16} color={textColor} />
          <Animated.Text style={[styles.urlText, { color: textColor }]} numberOfLines={1}>
            {url}
          </Animated.Text>
        </Animated.View>
        <TextInput
          ref={inputRef}
          style={[
            styles.urlInput,
            { color: textColor, backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }
          ]}
          value={inputUrl}
          onChangeText={handleUrlChange}
          onSubmitEditing={handleUrlSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectTextOnFocus={true}
          placeholder="Enter URL or search"
          placeholderTextColor={isDarkMode ? '#888888' : '#CCCCCC'}
        />
      </View>
      <TouchableOpacity onPress={onToggleFavorite} style={styles.iconButton}>
        <Icon name={isFavorite ? "star" : "star-border"} type="material" color={isFavorite ? "#FFD700" : textColor} size={22} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <Icon name="more-vert" type="material" color={textColor} size={22} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  favicon: {
    width: 18,
    height: 18,
    marginLeft: 8,
    marginRight: 4,
    borderRadius: 2,
  },
  iconButton: {
    padding: 6,
  },
  urlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 10,
    right: 10,
    top: 0,
    bottom: 0,
    paddingHorizontal: 10,
  },
  urlText: {
    marginLeft: 5,
    fontSize: 14,
  },
  urlInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
  },
});

export default ToolBar;