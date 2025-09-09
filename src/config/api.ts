// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  CHAT_STREAM: `${API_BASE_URL}/.netlify/functions/chat-stream`,
  CHAT: `${API_BASE_URL}/.netlify/functions/chat`,
  HEALTH: `${API_BASE_URL}/.netlify/functions/health`,
  TEST: `${API_BASE_URL}/.netlify/functions/chat`,
};

export default API_ENDPOINTS;


