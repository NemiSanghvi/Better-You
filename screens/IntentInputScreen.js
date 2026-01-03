import { useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/StyleSheet';

const IntentInputScreen = ({ onSaveIntent }) => {
  const [intent, setIntent] = useState('');

  const handleNext = () => {
    if (intent.trim()) {
      onSaveIntent(intent.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Text style={styles.greeting}>What do you want to be better at this year?</Text>
      </View>
      <Text style={styles.helperText}>
        Be specific and honest. The more precise you are, the better we can help you.
      </Text>
      <Input
        value={intent}
        onChangeText={setIntent}
        placeholder="e.g., Build a consistent morning routine, Learn to cook healthy meals, Improve my communication skills..."
        multiline
        autoFocus
      />
      <Button
        title="Next"
        onPress={handleNext}
        disabled={!intent.trim()}
      />
      <StatusBar style="light" />
    </View>
  );
};

export default IntentInputScreen;

