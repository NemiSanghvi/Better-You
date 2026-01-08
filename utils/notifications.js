import * as Notifications from 'expo-notifications';
import { getTasks } from './storage';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const buildNotificationMessage = (companionType, yesterdayCompleted, taskText) => {
  // Tone based on companionType and yesterday's completion
  const toneKey = `${companionType}_${yesterdayCompleted ? 'done' : 'missed'}`;

  const templates = {
    friend_done: {
      title: 'Great progress! 💪',
      body: `You did amazing yesterday! Today: ${taskText}`,
    },
    friend_missed: {
      title: 'Fresh start ✨',
      body: `New day, new opportunity. Today: ${taskText}`,
    },
    coach_done: {
      title: 'Stay consistent',
      body: `You're on track! Today's task: ${taskText}`,
    },
    coach_missed: {
      title: 'Get back on track',
      body: `Time to refocus. Today: ${taskText}`,
    },
    drill_sergeant_done: {
      title: 'Good work',
      body: `Keep it up. Today: ${taskText}`,
    },
    drill_sergeant_missed: {
      title: 'No excuses',
      body: `You missed yesterday. Today: ${taskText}`,
    },
  };

  const fallback = {
    title: "Today's Task",
    body: taskText,
  };

  return templates[toneKey] || fallback;
};

// Cancel all existing notifications before scheduling new ones
const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    // Silent fail
  }
};

// Schedules notifications for all remaining incomplete tasks in the week at 9:00 AM
export const scheduleTodayTaskNotification = async (companionType) => {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    const tasks = await getTasks();
    if (!tasks || tasks.length === 0) {
      return;
    }

    // Cancel existing notifications
    await cancelAllNotifications();

    const now = new Date();
    const notificationIds = [];

    // Schedule notifications for all incomplete tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.completed) {
        continue; // Skip completed tasks
      }

      const previousTask = i > 0 ? tasks[i - 1] : null;
      const yesterdayCompleted = previousTask ? !!previousTask.completed : false;
      
      const { title, body } = buildNotificationMessage(
        companionType,
        yesterdayCompleted,
        task.task
      );

      // Parse the task date (format: YYYY-MM-DD)
      const [year, month, day] = task.date.split('-').map(Number);
      const triggerDate = new Date(year, month - 1, day, 9, 0, 0, 0);
      
      // Only schedule if the notification time hasn't passed yet
      if (triggerDate.getTime() > now.getTime()) {
        const trigger = {
          type: 'date',
          date: triggerDate,
        };

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger,
        });
        
        notificationIds.push(notificationId);
      }
    }
    
    return notificationIds;
  } catch (error) {
    throw error;
  }
};


