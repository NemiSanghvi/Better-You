import Constants from 'expo-constants';
import { checkOnboardingStatus } from './storage';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || process.env.OPENAI_API_KEY;

const getCompanionDescription = (companionType) => {
  const descriptions = {
    friend: 'Calm and supportive. Encourages gently and celebrates progress. Use warm, friendly language.',
    coach: 'Firm and accountable. Pushes to stay on track and reach goals. Use motivating, action-oriented language.',
    drill_sergeant: 'Strict and blunt. No-nonsense approach to keep disciplined and focused. Use direct, commanding language.',
  };
  return descriptions[companionType] || descriptions.friend;
};

export const sendToChatGPT = async (userMessage) => {
  const { userIntent, companionType } = await checkOnboardingStatus();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${getCompanionDescription(companionType)} User intent: ${userIntent}` },
        { role: 'user', content: userMessage }
      ],
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateWeeklyTasks = async (weekNumber, totalWeeks, previousTasks = []) => {
  const { userIntent, companionType } = await checkOnboardingStatus();
  
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];

  // Build previous tasks context
  let previousTasksContext = '';
  if (previousTasks.length > 0) {
    const completedTasks = previousTasks.filter(t => t.completed);
    const incompleteTasks = previousTasks.filter(t => !t.completed);
    
    if (completedTasks.length > 0) {
      previousTasksContext += `\nLast week's completed tasks:\n${completedTasks.map(t => `- ${t.task}`).join('\n')}`;
    }
    if (incompleteTasks.length > 0) {
      previousTasksContext += `\n\nLast week's incomplete tasks:\n${incompleteTasks.map(t => `- ${t.task}`).join('\n')}`;
    }
  }

  const systemPrompt = `You are a system that generates daily self-improvement tasks.

User intent:
"${userIntent}"

Tone:
"${getCompanionDescription(companionType)}"

Progress:
Week ${weekNumber} of ${totalWeeks} (${Math.round((weekNumber / totalWeeks) * 100)}% through the journey)
${previousTasksContext}

Rules:
- Generate exactly 7 daily tasks for this week
- Tasks must build on previous week's progress${previousTasks.length > 0 ? ' (address incomplete tasks if any)' : ''}
- Difficulty level: ${weekNumber <= totalWeeks * 0.3 ? 'Beginner' : weekNumber <= totalWeeks * 0.7 ? 'Intermediate' : 'Advanced'}
- Tasks must be realistic and actionable
- No task should exceed 45 minutes
- Tasks must not repeat from previous weeks
- Do NOT reveal future context in task text

Output format:
Return a JSON array only.

Each item must be:
{
  "day": number (1-7),
  "task": string
}

Do not include markdown.
Do not include commentary.
Return valid JSON only.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 7 daily tasks for week ${weekNumber}.` }
      ],
      temperature: 0.7,
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Failed to generate tasks');
  }
  
  let content = data.choices[0].message.content;
  
  if (content.includes('```json')) {
    content = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    content = content.split('```')[1].split('```')[0].trim();
  }
  
  const rawTasks = JSON.parse(content);
  
  // Add date and completed fields to each task
  const tasks = rawTasks.map((task, index) => {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + index);
    return {
      day: task.day,
      date: taskDate.toISOString().split('T')[0],
      task: task.task,
      completed: false
    };
  });
  
  return tasks;
};
