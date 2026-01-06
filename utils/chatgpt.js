import { checkOnboardingStatus } from './storage';

const OPENAI_API_KEY = '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';

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

  console.log('[generateWeeklyTasks] Week:', weekNumber, 'of', totalWeeks);
  console.log('[generateWeeklyTasks] Start date:', startDate);
  console.log('[generateWeeklyTasks] User intent:', userIntent);
  console.log('[generateWeeklyTasks] Companion type:', companionType);
  console.log('[generateWeeklyTasks] Previous tasks count:', previousTasks.length);

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

  console.log('[generateWeeklyTasks] System prompt:', systemPrompt);

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
  
  console.log('[generateWeeklyTasks] Response status:', response.status);
  
  const data = await response.json();
  console.log('[generateWeeklyTasks] Full API response:', JSON.stringify(data, null, 2));
  
  if (data.error) {
    console.error('[generateWeeklyTasks] API Error:', data.error);
    throw new Error(data.error.message || 'Failed to generate tasks');
  }
  
  console.log('[generateWeeklyTasks] Model used:', data.model);
  console.log('[generateWeeklyTasks] Usage - Prompt tokens:', data.usage?.prompt_tokens);
  console.log('[generateWeeklyTasks] Usage - Completion tokens:', data.usage?.completion_tokens);
  console.log('[generateWeeklyTasks] Usage - Total tokens:', data.usage?.total_tokens);
  
  let content = data.choices[0].message.content;
  console.log('[generateWeeklyTasks] Raw response:', content);
  
  if (content.includes('```json')) {
    console.log('[generateWeeklyTasks] Detected ```json block, extracting...');
    content = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    console.log('[generateWeeklyTasks] Detected ``` block, extracting...');
    content = content.split('```')[1].split('```')[0].trim();
  }
  
  console.log('[generateWeeklyTasks] Parsing JSON...');
  const rawTasks = JSON.parse(content);
  console.log('[generateWeeklyTasks] Successfully parsed', rawTasks.length, 'tasks');
  
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
  
  console.log('[generateWeeklyTasks] Tasks with dates:', JSON.stringify(tasks, null, 2));
  
  return tasks;
};
