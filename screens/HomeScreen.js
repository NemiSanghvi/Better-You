import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { clearAllData } from '../utils/storage';
import styles from '../styles/StyleSheet';

const getCompanionDisplayName = (companionType) => {
  const names = {
    friend: 'Friend',
    coach: 'Coach',
    drill_sergeant: 'Drill Sergeant',
  };
  return names[companionType] || companionType;
};


const HomeScreen = ({ userName, userIntent, companionType, onReset }) => {
  const handleReset = async () => {
    const success = await clearAllData();
    if (success && onReset) {
      onReset();
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.greeting}>Hello, {userName}</Text>
      </View>
      
      <View style={[styles.card, styles.cardFirst]}>
        <Text style={styles.infoLabel}>Your Intent</Text>
        <Text style={styles.cardText}>{userIntent}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.infoLabel}>Your Companion</Text>
        <Text style={[styles.cardText, { fontSize: 18 }]}>
          {getCompanionDisplayName(companionType)}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { marginTop: 30, backgroundColor: '#FF6B35', borderColor: '#FFA500' }]}
        onPress={handleReset}
      >
        <Text style={styles.buttonText}>Reset Onboarding</Text>
      </TouchableOpacity>
      
      <StatusBar style="light" />
    </View>
  );
};

export default HomeScreen;

