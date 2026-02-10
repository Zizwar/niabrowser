import React from 'react';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

/**
 * AppIcons - Centralized icon definitions replacing emojis
 * Uses Material Design icons from @expo/vector-icons
 */

// Icon name mappings for common use cases
export const IconNames = {
  // AI & Smart features
  ai: 'psychology',
  brain: 'psychology',
  smartToy: 'smart-toy',
  robot: 'smart-toy',

  // Security & Keys
  key: 'vpn-key',
  apiKey: 'vpn-key',
  security: 'security',
  lock: 'lock',

  // Settings & Config
  settings: 'settings',
  tune: 'tune',
  build: 'build',

  // Web & Network
  web: 'language',
  globe: 'language',
  network: 'wifi',
  cloud: 'cloud',

  // Data & Files
  clipboard: 'content-paste',
  copy: 'content-copy',
  paste: 'content-paste',
  file: 'description',
  folder: 'folder',
  document: 'description',

  // Development & Debug
  bug: 'bug-report',
  debug: 'bug-report',
  code: 'code',
  terminal: 'terminal',
  console: 'developer-mode',

  // Data Types
  cookie: 'cookie',
  storage: 'storage',
  database: 'storage',

  // Actions
  bolt: 'bolt',
  flash: 'bolt',
  lightbulb: 'lightbulb',
  idea: 'lightbulb-outline',
  save: 'save',
  download: 'download',
  upload: 'upload',
  share: 'share',
  refresh: 'refresh',
  sync: 'sync',
  play: 'play-arrow',
  pause: 'pause',
  stop: 'stop',
  send: 'send',

  // Status & Feedback
  checkCircle: 'check-circle',
  check: 'check',
  success: 'check-circle',
  cancel: 'cancel',
  error: 'error',
  warning: 'warning',
  info: 'info',
  help: 'help',

  // Navigation
  close: 'close',
  back: 'arrow-back',
  forward: 'arrow-forward',
  up: 'keyboard-arrow-up',
  down: 'keyboard-arrow-down',
  left: 'chevron-left',
  right: 'chevron-right',
  menu: 'menu',
  moreVert: 'more-vert',
  moreHoriz: 'more-horiz',

  // Content
  add: 'add',
  remove: 'remove',
  delete: 'delete',
  edit: 'edit',
  search: 'search',
  filter: 'filter-list',
  sort: 'sort',

  // Devices
  phone: 'phone-android',
  mobile: 'phone-android',
  computer: 'computer',
  desktop: 'desktop-windows',
  tablet: 'tablet',

  // Theme
  darkMode: 'dark-mode',
  lightMode: 'light-mode',
  brightness: 'brightness-6',

  // Media
  image: 'image',
  video: 'videocam',
  audio: 'audiotrack',
  camera: 'camera-alt',

  // Communication
  chat: 'chat',
  message: 'message',
  email: 'email',

  // Misc
  star: 'star',
  starOutline: 'star-border',
  favorite: 'favorite',
  favoriteOutline: 'favorite-border',
  history: 'history',
  time: 'access-time',
  calendar: 'calendar-today',
  rocket: 'rocket-launch',
  speed: 'speed',
  analytics: 'analytics',
  chart: 'bar-chart',
  list: 'list',
  grid: 'grid-view',
  expand: 'expand-more',
  collapse: 'expand-less',
  fullscreen: 'fullscreen',
  exitFullscreen: 'fullscreen-exit',
  visibility: 'visibility',
  visibilityOff: 'visibility-off',
  person: 'person',
  group: 'group',
  home: 'home',
  bookmark: 'bookmark',
  bookmarkOutline: 'bookmark-border',
  link: 'link',
  unlink: 'link-off',
  attach: 'attach-file',
  print: 'print',
  qrCode: 'qr-code',
  script: 'code',
  extension: 'extension',
  palette: 'palette',
  format: 'format-paint',
  textFormat: 'text-format',
};

/**
 * AppIcon component - Renders a Material Design icon
 *
 * @param {string} name - Icon name (from IconNames or MaterialIcons name)
 * @param {number} size - Icon size (default: 24)
 * @param {string} color - Icon color (default: #000)
 * @param {object} style - Additional styles
 */
export const AppIcon = ({ name, size = 24, color = '#000', style }) => {
  // Map friendly name to MaterialIcons name if available
  const iconName = IconNames[name] || name;

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
};

/**
 * Pre-configured icon components for common use cases
 */
export const AIIcon = ({ size = 24, color = '#007AFF' }) => (
  <MaterialIcons name="psychology" size={size} color={color} />
);

export const SettingsIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="settings" size={size} color={color} />
);

export const KeyIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="vpn-key" size={size} color={color} />
);

export const BugIcon = ({ size = 24, color = '#FF6B6B' }) => (
  <MaterialIcons name="bug-report" size={size} color={color} />
);

export const NetworkIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="language" size={size} color={color} />
);

export const CookieIcon = ({ size = 24, color = '#FF9800' }) => (
  <MaterialCommunityIcons name="cookie" size={size} color={color} />
);

export const BoltIcon = ({ size = 24, color = '#FFC107' }) => (
  <MaterialIcons name="bolt" size={size} color={color} />
);

export const SaveIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="save" size={size} color={color} />
);

export const DeleteIcon = ({ size = 24, color = '#F44336' }) => (
  <MaterialIcons name="delete" size={size} color={color} />
);

export const CloseIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="close" size={size} color={color} />
);

export const CheckIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="check-circle" size={size} color={color} />
);

export const ErrorIcon = ({ size = 24, color = '#F44336' }) => (
  <MaterialIcons name="error" size={size} color={color} />
);

export const WarningIcon = ({ size = 24, color = '#FF9800' }) => (
  <MaterialIcons name="warning" size={size} color={color} />
);

export const InfoIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="info" size={size} color={color} />
);

export const RefreshIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="refresh" size={size} color={color} />
);

export const DownloadIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="download" size={size} color={color} />
);

export const UploadIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="upload" size={size} color={color} />
);

export const RocketIcon = ({ size = 24, color = '#9C27B0' }) => (
  <MaterialIcons name="rocket-launch" size={size} color={color} />
);

export const LightbulbIcon = ({ size = 24, color = '#FFC107' }) => (
  <MaterialIcons name="lightbulb" size={size} color={color} />
);

export const CodeIcon = ({ size = 24, color = '#607D8B' }) => (
  <MaterialIcons name="code" size={size} color={color} />
);

export const PlayIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="play-arrow" size={size} color={color} />
);

export const EditIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="edit" size={size} color={color} />
);

export const StarIcon = ({ size = 24, color = '#FFC107' }) => (
  <MaterialIcons name="star" size={size} color={color} />
);

export const HistoryIcon = ({ size = 24, color = '#9E9E9E' }) => (
  <MaterialIcons name="history" size={size} color={color} />
);

export const StorageIcon = ({ size = 24, color = '#795548' }) => (
  <MaterialIcons name="storage" size={size} color={color} />
);

export const SpeedIcon = ({ size = 24, color = '#00BCD4' }) => (
  <MaterialIcons name="speed" size={size} color={color} />
);

export const AnalyticsIcon = ({ size = 24, color = '#673AB7' }) => (
  <MaterialIcons name="analytics" size={size} color={color} />
);

export const ExpandIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="expand-more" size={size} color={color} />
);

export const CollapseIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="expand-less" size={size} color={color} />
);

export const SendIcon = ({ size = 24, color = '#007AFF' }) => (
  <MaterialIcons name="send" size={size} color={color} />
);

export const AddIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="add" size={size} color={color} />
);

export const PersonIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="person" size={size} color={color} />
);

export const DesktopIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="computer" size={size} color={color} />
);

export const MobileIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="phone-android" size={size} color={color} />
);

export const DarkModeIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="dark-mode" size={size} color={color} />
);

export const LightModeIcon = ({ size = 24, color = '#FFC107' }) => (
  <MaterialIcons name="light-mode" size={size} color={color} />
);

export const HomeIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="home" size={size} color={color} />
);

export const SecurityIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="security" size={size} color={color} />
);

export const ShareIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="share" size={size} color={color} />
);

export const FolderIcon = ({ size = 24, color = '#FFC107' }) => (
  <MaterialIcons name="folder" size={size} color={color} />
);

export const MenuIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="menu" size={size} color={color} />
);

export const MoreIcon = ({ size = 24, color = '#666' }) => (
  <MaterialIcons name="more-vert" size={size} color={color} />
);

export const ExtensionIcon = ({ size = 24, color = '#9C27B0' }) => (
  <MaterialIcons name="extension" size={size} color={color} />
);

export const ScriptIcon = ({ size = 24, color = '#607D8B' }) => (
  <MaterialIcons name="code" size={size} color={color} />
);

export const ConsoleIcon = ({ size = 24, color = '#607D8B' }) => (
  <MaterialIcons name="developer-mode" size={size} color={color} />
);

export const TestIcon = ({ size = 24, color = '#4CAF50' }) => (
  <MaterialIcons name="science" size={size} color={color} />
);

export const CloudIcon = ({ size = 24, color = '#2196F3' }) => (
  <MaterialIcons name="cloud" size={size} color={color} />
);

export default {
  IconNames,
  AppIcon,
  AIIcon,
  SettingsIcon,
  KeyIcon,
  BugIcon,
  NetworkIcon,
  CookieIcon,
  BoltIcon,
  SaveIcon,
  DeleteIcon,
  CloseIcon,
  CheckIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  RefreshIcon,
  DownloadIcon,
  UploadIcon,
  RocketIcon,
  LightbulbIcon,
  CodeIcon,
  PlayIcon,
  EditIcon,
  StarIcon,
  HistoryIcon,
  StorageIcon,
  SpeedIcon,
  AnalyticsIcon,
  ExpandIcon,
  CollapseIcon,
  SendIcon,
  AddIcon,
  PersonIcon,
  DesktopIcon,
  MobileIcon,
  DarkModeIcon,
  LightModeIcon,
  HomeIcon,
  SecurityIcon,
  ShareIcon,
  FolderIcon,
  MenuIcon,
  MoreIcon,
  ExtensionIcon,
  ScriptIcon,
  ConsoleIcon,
  TestIcon,
  CloudIcon,
};
