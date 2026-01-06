import * as Notifications from 'expo-notifications';
import { getTasks } from './storage';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
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
      console.warn('[notifications] Permission not granted:', finalStatus);
      return false;
    }

    console.log('[notifications] Permission granted');
    return true;
  } catch (error) {
    console.error('[notifications] Error requesting permissions:', error);
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
    console.log('[notifications] Cancelled all existing notifications');
  } catch (error) {
    console.error('[notifications] Error cancelling notifications:', error);
  }
};

// Schedules a notification for today's task at 9:00 AM
export const scheduleTodayTaskNotification = async (companionType) => {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[notifications] No permission, cannot schedule notification');
      return;
    }

    const tasks = await getTasks();
    if (!tasks || tasks.length === 0) {
      console.log('[notifications] No tasks found, skipping notification');
      return;
    }

    // Find the first incomplete task in the current week
    const todayIndex = tasks.findIndex((t) => !t.completed);
    if (todayIndex === -1) {
      console.log('[notifications] All tasks completed, skipping notification');
      return;
    }

    const todaysTask = tasks[todayIndex];
    const yesterdaysTask = todayIndex > 0 ? tasks[todayIndex - 1] : null;

    const yesterdayCompleted = yesterdaysTask ? !!yesterdaysTask.completed : false;
    const { title, body } = buildNotificationMessage(
      companionType,
      yesterdayCompleted,
      todaysTask.task
    );

    // Cancel existing notifications
    await cancelAllNotifications();

    // Calculate trigger time: 9:00 AM today, or tomorrow if it's past 9 AM
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(9, 0, 0, 0);
    
    // If it's past 9 AM, schedule for tomorrow
    if (now.getTime() >= triggerDate.getTime()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

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

    console.log('[notifications] Notification scheduled for:', triggerDate.toLocaleString());
    
    return notificationId;
  } catch (error) {
    console.error('[notifications] Error scheduling today notification:', error);
    throw error;
  }
};


