import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  USER_NAME, 
  USER_INTENT, 
  COMPANION_TYPE, 
  HAS_ONBOARDED, 
  USER_TASKS,
  JOURNEY_START_DATE,
  CURRENT_WEEK,
  PREVIOUS_WEEK_TASKS,
  WEEK_START_DATE,
  LAST_NOTIFICATION_DATE,
} from '../constants/storageKeys';

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
    return false;
  }
};

export const saveUserIntent = async (intent) => {
  try {
    await AsyncStorage.setItem(USER_INTENT, intent.trim());
    return true;
  } catch (error) {
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
      AsyncStorage.removeItem(JOURNEY_START_DATE),
      AsyncStorage.removeItem(CURRENT_WEEK),
      AsyncStorage.removeItem(PREVIOUS_WEEK_TASKS),
      AsyncStorage.removeItem(WEEK_START_DATE),
      AsyncStorage.removeItem(LAST_NOTIFICATION_DATE),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

// Task storage functions
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(USER_TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
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
    return null;
  }
};

// Week tracking functions
export const getJourneyStartDate = async () => {
  try {
    const startDate = await AsyncStorage.getItem(JOURNEY_START_DATE);
    return startDate ? new Date(startDate) : null;
  } catch (error) {
    return null;
  }
};

export const saveJourneyStartDate = async () => {
  try {
    const today = new Date().toISOString();
    await AsyncStorage.setItem(JOURNEY_START_DATE, today);
    return true;
  } catch (error) {
    return false;
  }
};

export const getCurrentWeek = async () => {
  try {
    const weekStr = await AsyncStorage.getItem(CURRENT_WEEK);
    return weekStr ? parseInt(weekStr, 10) : 0;
  } catch (error) {
    return 0;
  }
};

export const saveCurrentWeek = async (weekNumber) => {
  try {
    await AsyncStorage.setItem(CURRENT_WEEK, weekNumber.toString());
    return true;
  } catch (error) {
    return false;
  }
};

export const getWeekStartDate = async () => {
  try {
    const dateStr = await AsyncStorage.getItem(WEEK_START_DATE);
    return dateStr ? new Date(dateStr) : null;
  } catch (error) {
    return null;
  }
};

export const saveWeekStartDate = async () => {
  try {
    const today = new Date().toISOString();
    await AsyncStorage.setItem(WEEK_START_DATE, today);
    return true;
  } catch (error) {
    return false;
  }
};

export const getPreviousWeekTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem(PREVIOUS_WEEK_TASKS);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    return [];
  }
};

export const savePreviousWeekTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(PREVIOUS_WEEK_TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    return false;
  }
};

// Notification helpers
export const getLastNotificationDate = async () => {
  try {
    const dateStr = await AsyncStorage.getItem(LAST_NOTIFICATION_DATE);
    return dateStr || null;
  } catch (error) {
    return null;
  }
};

export const saveLastNotificationDate = async (dateStr) => {
  try {
    await AsyncStorage.setItem(LAST_NOTIFICATION_DATE, dateStr);
    return true;
  } catch (error) {
    return false;
  }
};

// Calculate total weeks from start date to end of year
export const calculateTotalWeeks = (startDate) => {
  const start = new Date(startDate);
  const endOfYear = new Date(start.getFullYear(), 11, 31); // Dec 31
  const diffTime = endOfYear - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
};

// Check if a new week has started (7 days since last week start)
export const shouldGenerateNewWeek = async () => {
  try {
    const weekStartDate = await getWeekStartDate();
    
    // First time - no week start date
    if (!weekStartDate) {
      return true;
    }
    
    const today = new Date();
    const daysSinceStart = Math.floor((today - weekStartDate) / (1000 * 60 * 60 * 24));
    
    // Generate new week if 7+ days have passed
    return daysSinceStart >= 7;
  } catch (error) {
    return false;
  }
};

// Get full week status for HomeScreen
export const getWeekStatus = async () => {
  try {
    const [journeyStart, currentWeek, weekStart, tasks, previousTasks] = await Promise.all([
      getJourneyStartDate(),
      getCurrentWeek(),
      getWeekStartDate(),
      getTasks(),
      getPreviousWeekTasks(),
    ]);
    
    const totalWeeks = journeyStart ? calculateTotalWeeks(journeyStart) : 52;
    const needsNewWeek = await shouldGenerateNewWeek();
    
    return {
      journeyStartDate: journeyStart,
      currentWeek: currentWeek || 1,
      totalWeeks,
      weekStartDate: weekStart,
      currentTasks: tasks || [],
      previousTasks: previousTasks || [],
      needsNewWeek,
    };
  } catch (error) {
    return {
      journeyStartDate: null,
      currentWeek: 1,
      totalWeeks: 52,
      weekStartDate: null,
      currentTasks: [],
      previousTasks: [],
      needsNewWeek: true,
    };
  }
};

// Transition to new week - archive current tasks and increment week
export const transitionToNewWeek = async () => {
  try {
    const currentTasks = await getTasks();
    const currentWeek = await getCurrentWeek();
    
    // Save current tasks as previous week tasks
    if (currentTasks && currentTasks.length > 0) {
      await savePreviousWeekTasks(currentTasks);
    }
    
    // Increment week number
    const newWeek = (currentWeek || 0) + 1;
    await saveCurrentWeek(newWeek);
    
    // Update week start date
    await saveWeekStartDate();
    
    // Clear current tasks
    await saveTasks([]);
    
    // Save journey start date if first week
    const journeyStart = await getJourneyStartDate();
    if (!journeyStart) {
      await saveJourneyStartDate();
    }
    
    return newWeek;
  } catch (error) {
    return null;
  }
};
