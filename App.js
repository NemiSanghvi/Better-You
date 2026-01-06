import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import LoadingSpinner from './components/LoadingSpinner';
import NameInputScreen from './screens/NameInputScreen';
import IntentInputScreen from './screens/IntentInputScreen';
import CompanionSelectionScreen from './screens/CompanionSelectionScreen';
import HomeScreen from './screens/HomeScreen';
import { checkOnboardingStatus, saveUserName, saveUserIntent, saveCompanionType } from './utils/storage';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [companionType, setCompanionType] = useState('');
  const [onboardingStep, setOnboardingStep] = useState('name'); // 'name', 'intent', or 'companion'

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    const { hasOnboarded: onboarded, userName: name, userIntent: intent, companionType: companion } = await checkOnboardingStatus();
    setHasOnboarded(onboarded);
    setUserName(name);
    setUserIntent(intent);
    setCompanionType(companion);
    setIsLoading(false);
  };

  const handleSaveName = async (name) => {
    const success = await saveUserName(name);
    if (success) {
      setUserName(name);
      setOnboardingStep('intent');
    }
  };

  const handleSaveIntent = async (intent) => {
    const success = await saveUserIntent(intent);
    if (success) {
      setUserIntent(intent);
      setOnboardingStep('companion');
    }
  };

  const handleSelectCompanion = async (companion) => {
    const success = await saveCompanionType(companion);
    if (success) {
      setCompanionType(companion);
      setHasOnboarded(true);
    }
  };

  const handleReset = () => {
    setHasOnboarded(false);
    setUserName('');
    setUserIntent('');
    setCompanionType('');
    setOnboardingStep('name');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasOnboarded) {
    if (onboardingStep === 'name') {
      return <NameInputScreen onSaveName={handleSaveName} />;
    } else if (onboardingStep === 'intent') {
      return <IntentInputScreen onSaveIntent={handleSaveIntent} />;
    } else {
      return <CompanionSelectionScreen onSelectCompanion={handleSelectCompanion} />;
    }
  }

  return <HomeScreen userName={userName} userIntent={userIntent} companionType={companionType} onReset={handleReset} />;
}
