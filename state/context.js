import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  isBottomSheetVisible: false,
  isHistoryModalVisible: false,
  isAboutModalVisible: false,
  isScriptManagerVisible: false,
};

// Action types
const SET_BOTTOM_SHEET_VISIBLE = 'SET_BOTTOM_SHEET_VISIBLE';
const SET_HISTORY_MODAL_VISIBLE = 'SET_HISTORY_MODAL_VISIBLE';
const SET_ABOUT_MODAL_VISIBLE = 'SET_ABOUT_MODAL_VISIBLE';
const SET_SCRIPT_MANAGER_VISIBLE = 'SET_SCRIPT_MANAGER_VISIBLE';

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case SET_BOTTOM_SHEET_VISIBLE:
      return { ...state, isBottomSheetVisible: action.payload };
    case SET_HISTORY_MODAL_VISIBLE:
      return { ...state, isHistoryModalVisible: action.payload };
    case SET_ABOUT_MODAL_VISIBLE:
      return { ...state, isAboutModalVisible: action.payload };
    case SET_SCRIPT_MANAGER_VISIBLE:
      return { ...state, isScriptManagerVisible: action.payload };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setBottomSheetVisible = (isVisible) => {
    dispatch({ type: SET_BOTTOM_SHEET_VISIBLE, payload: isVisible });
  };

  const setHistoryModalVisible = (isVisible) => {
    dispatch({ type: SET_HISTORY_MODAL_VISIBLE, payload: isVisible });
  };

  const setAboutModalVisible = (isVisible) => {
    dispatch({ type: SET_ABOUT_MODAL_VISIBLE, payload: isVisible });
  };

  const setScriptManagerVisible = (isVisible) => {
    dispatch({ type: SET_SCRIPT_MANAGER_VISIBLE, payload: isVisible });
  };

  const value = {
    ...state,
    setBottomSheetVisible,
    setHistoryModalVisible,
    setAboutModalVisible,
    setScriptManagerVisible,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};