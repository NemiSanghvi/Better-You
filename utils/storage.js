import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_NAME, USER_INTENT, COMPANION_TYPE, HAS_ONBOARDED, USER_TASKS } from '../constants/storageKeys';

export const checkOnboardingStatus = async () => {
  try {
    const [onboarded, name, intent, companion] = await Promise.all([
      AsyncStorage.getItem(HAS_ONBOARDED),
      AsyncStorage.getItem(USER_NAME),
      AsyncStorage.getItem(USER_INTENT),
      AsyncStorage.getItem(COMPANION_TYPE),
    ]);

    return {
      hasOnboarded: onboarded === 'true' && name && intent && companion ? true : false,
      userName: name || '',
      userIntent: intent || '',
      companionType: companion || '',
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      hasOnboarded: false,
      userName: '',
      userIntent: '',
      companionType: '',
    };
  }
};

export const saveUserName = async (name) => {
  try {
    await AsyncStorage.setItem(USER_NAME, name.trim());
    return true;
  } catch (error) {
    console.error('Error saving name:', error);
    return false;
  }
};

export const saveUserIntent = async (intent) => {
  try {
    await AsyncStorage.setItem(USER_INTENT, intent.trim());
    return true;
  } catch (error) {
    console.error('Error saving intent:', error);
    return false;
  }
};

export const saveCompanionType = async (companionType) => {
  try {
    await Promise.all([
      AsyncStorage.setItem(COMPANION_TYPE, companionType),
      AsyncStorage.setItem(HAS_ONBOARDED, 'true'),
    ]);
    return true;
  } catch (error) {
    console.error('Error saving companion type:', error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(USER_NAME),
      AsyncStorage.removeItem(USER_INTENT),
      AsyncStorage.removeItem(COMPANION_TYPE),
      AsyncStorage.removeItem(HAS_ONBOARDED),
      AsyncStorage.removeItem(USER_TASKS),
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(USER_TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

export const getTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem(USER_TASKS);
    if (tasksJson) {
      return JSON.parse(tasksJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return null;
  }
};

export const updateTaskCompletion = async (taskDay, completed) => {
  try {
    const tasks = await getTasks();
    if (tasks) {
      const updatedTasks = tasks.map(task => 
        task.day === taskDay ? { ...task, completed } : task
      );
      await saveTasks(updatedTasks);
      return updatedTasks;
    }
    return null;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

