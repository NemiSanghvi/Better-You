import { checkOnboardingStatus } from './storage';

const OPENAI_API_KEY = 'your-api-key-here'; // Replace with your key

export const sendToChatGPT = async (userMessage) => {
  const { userIntent, companionType } = await checkOnboardingStatus();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `Companion type: ${companionType}. User intent: ${userIntent}` },
        { role: 'user', content: userMessage }
      ],
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};

