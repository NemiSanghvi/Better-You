import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { clearAllData, getTasks, saveTasks, updateTaskCompletion } from '../utils/storage';
import { generateDailyTasks } from '../utils/chatgpt';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const HomeScreen = ({ userName, userIntent, companionType, onReset }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    const savedTasks = await getTasks();
    if (savedTasks && savedTasks.length > 0) {
      setTasks(savedTasks);
    }
    setIsLoading(false);
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const generatedTasks = await generateDailyTasks();
      await saveTasks(generatedTasks);
      setTasks(generatedTasks);
    } catch (err) {
      setError(err.message || 'Failed to generate tasks. Please try again.');
      console.error('Error generating tasks:', err);
    }
    setIsGenerating(false);
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

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

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
                Generate your personalized daily tasks to achieve your goal by Dec 31, 2026
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
                    <Text style={styles.buttonText}>Generating Tasks...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Generate My Tasks</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 20, width: '100%', maxWidth: 350 }}>
              <View style={[styles.card, { marginBottom: 15 }]}>
                <Text style={styles.infoLabel}>Progress</Text>
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
                    width: `${progressPercent}%`, 
                    backgroundColor: '#4ECDC4',
                    borderRadius: 4
                  }} />
                </View>
                <Text style={[styles.helperText, { marginTop: 5, textAlign: 'right' }]}>
                  {progressPercent}% complete
                </Text>
              </View>

              <Text style={[styles.infoLabel, { marginBottom: 10, textAlign: 'center' }]}>
                Your Daily Tasks
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
