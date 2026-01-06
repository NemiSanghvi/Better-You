import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  clearAllData, 
  saveTasks, 
  updateTaskCompletion,
  getWeekStatus,
  transitionToNewWeek,
  calculateTotalWeeks,
  getLastNotificationDate,
  saveLastNotificationDate,
} from '../utils/storage';
import { generateWeeklyTasks } from '../utils/chatgpt';
import { scheduleTodayTaskNotification, requestNotificationPermissions } from '../utils/notifications';
import styles from '../styles/StyleSheet';

const getCompanionDisplayName = (companionType) => {
  const names = {
    friend: 'Friend',
    coach: 'Coach',
    drill_sergeant: 'Drill Sergeant',
  };
  return names[companionType] || companionType;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getTodayDateString = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Use local date parts to avoid timezone issues with toISOString
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodaysPendingTask = (allTasks) => {
  // Instead of relying on dates (which can be tricky with timezones),
  // treat "today" as the next incomplete task in the current week.
  return allTasks.find((t) => !t.completed) || null;
};

const HomeScreen = ({ userName, userIntent, companionType, onReset }) => {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(52);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeekStatus();
  }, []);

  const loadWeekStatus = async () => {
    setIsLoading(true);
    try {
      // Request notification permissions on app load
      await requestNotificationPermissions();
      
      const status = await getWeekStatus();
      
      setCurrentWeek(status.currentWeek);
      setTotalWeeks(status.totalWeeks);
      setTasks(status.currentTasks);

      // After loading tasks, schedule today's notification if needed
      await maybeScheduleTodayNotification(status.currentTasks);
    } catch (err) {
      setError('Failed to load tasks');
    }
    setIsLoading(false);
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Transition to new week (archives current tasks, increments week)
      const status = await getWeekStatus();
      let weekNum = status.currentWeek;
      let prevTasks = status.previousTasks;
      let weeks = status.totalWeeks;
      
      // If first time or new week needed, transition
      if (status.needsNewWeek || status.currentTasks.length === 0) {
        weekNum = await transitionToNewWeek();
        prevTasks = status.currentTasks; // Current becomes previous
        
        // Recalculate total weeks if first time
        if (!status.journeyStartDate) {
          weeks = calculateTotalWeeks(new Date());
        }
      }
      
      const generatedTasks = await generateWeeklyTasks(weekNum, weeks, prevTasks);
      await saveTasks(generatedTasks);
      
      setTasks(generatedTasks);
      setCurrentWeek(weekNum);
      setTotalWeeks(weeks);

      // Schedule notification for today's new task
      await maybeScheduleTodayNotification(generatedTasks);
    } catch (err) {
      setError(err.message || 'Failed to generate tasks. Please try again.');
    }
    setIsGenerating(false);
  };

  const maybeScheduleTodayNotification = async (allTasks) => {
    try {
      const todayStr = getTodayDateString();
      const lastNotified = await getLastNotificationDate();

      // Only schedule once per day
      if (lastNotified === todayStr) {
        return;
      }

      const todaysTask = getTodaysPendingTask(allTasks);
      if (!todaysTask) {
        return;
      }

      await scheduleTodayTaskNotification(companionType);
      await saveLastNotificationDate(todayStr);
    } catch (error) {
      // Silent fail
    }
  };

  const handleToggleTask = async (taskDay) => {
    const task = tasks.find(t => t.day === taskDay);
    if (task) {
      const updatedTasks = await updateTaskCompletion(taskDay, !task.completed);
      if (updatedTasks) {
        setTasks(updatedTasks);
      }
    }
  };

  const handleReset = async () => {
    const success = await clearAllData();
    if (success && onReset) {
      onReset();
    }
  };

  // Progress for current week
  const completedCount = tasks.filter(t => t.completed).length;
  const weekProgressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  
  // Overall journey progress
  const journeyProgressPercent = totalWeeks > 0 ? Math.round((currentWeek / totalWeeks) * 100) : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1, width: '100%' }} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center' }}>
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

          {tasks.length === 0 ? (
            <View style={{ marginTop: 20, width: '100%', maxWidth: 300 }}>
              <Text style={[styles.helperText, { textAlign: 'center', marginBottom: 15 }]}>
                {currentWeek > 1 
                  ? `Ready for Week ${currentWeek}! Generate your new tasks.`
                  : 'Start your journey! Generate your first week of tasks.'}
              </Text>
              {error && (
                <Text style={{ color: '#FF6B6B', textAlign: 'center', marginBottom: 10 }}>
                  {error}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4ECDC4', borderColor: '#3BA99C' }]}
                onPress={handleGenerateTasks}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1a1a2e" style={{ marginRight: 10 }} />
                    <Text style={styles.buttonText}>Generating...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    {currentWeek > 1 ? `Generate Week ${currentWeek}` : 'Start Week 1'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 20, width: '100%', maxWidth: 350 }}>
              {/* Journey Progress */}
              <View style={[styles.card, { marginBottom: 10 }]}>
                <Text style={styles.infoLabel}>Journey Progress</Text>
                <Text style={[styles.cardText, { fontSize: 20, color: '#4ECDC4' }]}>
                  Week {currentWeek} of {totalWeeks}
                </Text>
                <View style={{ 
                  height: 6, 
                  backgroundColor: '#2a2a4a', 
                  borderRadius: 3, 
                  marginTop: 8,
                  overflow: 'hidden'
                }}>
                  <View style={{ 
                    height: '100%', 
                    width: `${journeyProgressPercent}%`, 
                    backgroundColor: '#9B59B6',
                    borderRadius: 3
                  }} />
                </View>
                <Text style={[styles.helperText, { marginTop: 5, textAlign: 'right', fontSize: 11 }]}>
                  {journeyProgressPercent}% of journey
                </Text>
              </View>

              {/* Week Progress */}
              <View style={[styles.card, { marginBottom: 15 }]}>
                <Text style={styles.infoLabel}>This Week's Progress</Text>
                <Text style={[styles.cardText, { fontSize: 24, color: '#4ECDC4' }]}>
                  {completedCount} / {tasks.length} tasks
                </Text>
                <View style={{ 
                  height: 8, 
                  backgroundColor: '#2a2a4a', 
                  borderRadius: 4, 
                  marginTop: 10,
                  overflow: 'hidden'
                }}>
                  <View style={{ 
                    height: '100%', 
                    width: `${weekProgressPercent}%`, 
                    backgroundColor: '#4ECDC4',
                    borderRadius: 4
                  }} />
                </View>
                <Text style={[styles.helperText, { marginTop: 5, textAlign: 'right' }]}>
                  {weekProgressPercent}% complete
                </Text>
              </View>

              <Text style={[styles.infoLabel, { marginBottom: 10, textAlign: 'center' }]}>
                Week {currentWeek} Tasks
              </Text>
              
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.day}
                  style={[
                    styles.card,
                    { 
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      opacity: task.completed ? 0.6 : 1,
                      borderColor: task.completed ? '#4ECDC4' : '#3a3a5a'
                    }
                  ]}
                  onPress={() => handleToggleTask(task.day)}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: task.completed ? '#4ECDC4' : '#666',
                    backgroundColor: task.completed ? '#4ECDC4' : 'transparent',
                    marginRight: 12,
                    marginTop: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {task.completed && (
                      <Text style={{ color: '#1a1a2e', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.helperText, { fontSize: 12, marginBottom: 4 }]}>
                      Day {task.day} • {formatDate(task.date)}
                    </Text>
                    <Text style={[
                      styles.cardText, 
                      { 
                        fontSize: 14,
                        textDecorationLine: task.completed ? 'line-through' : 'none'
                      }
                    ]}>
                      {task.task}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 30, backgroundColor: '#FF6B35', borderColor: '#FFA500' }]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset Onboarding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <StatusBar style="light" />
    </View>
  );
};

export default HomeScreen;
