// components/NavigationControls.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Icon } from 'react-native-elements';

const NavigationControls = ({ webViewRef }) => {
  return (
    <View style={styles.container}>
      <Button
        icon={<Icon name="arrow-back" type="material" color="white" />}
        onPress={() => webViewRef.current.goBack()}
        buttonStyle={styles.button}
      />
      <Button
        icon={<Icon name="arrow-forward" type="material" color="white" />}
        onPress={() => webViewRef.current.goForward()}
        buttonStyle={styles.button}
      />
      <Button
        icon={<Icon name="home" type="material" color="white" />}
        onPress={() => webViewRef.current.reload()}
        buttonStyle={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#007AFF',
    width: 50,
  },
});

export default NavigationControls;