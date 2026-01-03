import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styles from '../styles/StyleSheet';

const LoadingSpinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD23F" />
      <StatusBar style="light" />
    </View>
  );
};

export default LoadingSpinner;

