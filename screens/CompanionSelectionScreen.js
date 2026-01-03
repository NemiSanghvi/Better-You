import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../components/Button';
import styles from '../styles/StyleSheet';

const COMPANIONS = [
  {
    type: 'friend',
    title: 'Friend',
    description: 'Calm and supportive. Encourages you gently and celebrates your progress.',
  },
  {
    type: 'coach',
    title: 'Coach',
    description: 'Firm and accountable. Pushes you to stay on track and reach your goals.',
  },
  {
    type: 'drill_sergeant',
    title: 'Drill Sergeant',
    description: 'Strict and blunt. No-nonsense approach to keep you disciplined and focused.',
  },
];

const CompanionSelectionScreen = ({ onSelectCompanion }) => {
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const handleSelect = (companionType) => {
    setSelectedCompanion(companionType);
  };

  const handleContinue = () => {
    if (selectedCompanion) {
      onSelectCompanion(selectedCompanion);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Choose your companion</Text>
      <Text style={styles.helperText}>
        Select the tone that will help you stay motivated and accountable.
      </Text>
      
      <View style={{ width: '100%', maxWidth: 300 }}>
        {COMPANIONS.map((companion) => (
          <TouchableOpacity
            key={companion.type}
            style={[
              styles.companionOption,
              selectedCompanion === companion.type && styles.companionOptionSelected,
            ]}
            onPress={() => handleSelect(companion.type)}
          >
            <Text style={styles.companionTitle}>{companion.title}</Text>
            <Text style={styles.companionDescription}>{companion.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        disabled={!selectedCompanion}
      />
      <StatusBar style="light" />
    </View>
  );
};

export default CompanionSelectionScreen;

