import { useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/StyleSheet';

const NameInputScreen = ({ onSaveName }) => {
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim()) {
      onSaveName(name.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.greeting}>Hello</Text>
      </View>
      <Text style={styles.prompt}>What's your name?</Text>
      <Input
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoFocus
        onSubmitEditing={handleNext}
      />
      <Button
        title="Next"
        onPress={handleNext}
        disabled={!name.trim()}
      />
      <StatusBar style="light" />
    </View>
  );
};

export default NameInputScreen;

