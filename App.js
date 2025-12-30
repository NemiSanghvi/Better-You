import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const USER_NAME_KEY = 'USER_NAME';
const HAS_ONBOARDED_KEY = 'HAS_ONBOARDED';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const [onboarded, name] = await Promise.all([
        AsyncStorage.getItem(HAS_ONBOARDED_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
      ]);

      if (onboarded === 'true' && name) {
        setHasOnboarded(true);
        setUserName(name);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (inputName.trim()) {
      try {
        await Promise.all([
          AsyncStorage.setItem(USER_NAME_KEY, inputName.trim()),
          AsyncStorage.setItem(HAS_ONBOARDED_KEY, 'true'),
        ]);
        setUserName(inputName.trim());
        setHasOnboarded(true);
      } catch (error) {
        console.error('Error saving name:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Hello 👋</Text>
        <Text style={styles.prompt}>What's your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={inputName}
          onChangeText={setInputName}
          autoFocus
          onSubmitEditing={handleSaveName}
        />
        <TouchableOpacity
          style={[styles.button, !inputName.trim() && styles.buttonDisabled]}
          onPress={handleSaveName}
          disabled={!inputName.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {userName} 👋</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
