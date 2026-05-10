const API_KEY_ENV_NAMES = [
  'VITE_GEMINI_API_KEY',
  'VITE_API_KEY',
  'VITE_GOOGLE_API_KEY',
] as const;

const getEnv = (name: typeof API_KEY_ENV_NAMES[number]) => {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
};

export const getGeminiApiKey = () => {
  for (const name of API_KEY_ENV_NAMES) {
    const value = getEnv(name);
    if (value) return value;
  }
  return '';
};

export const assertGeminiApiKey = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'AUTHORIZATION_REQUIRED: Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file or hosting environment.'
    );
  }
  return apiKey;
};

export const getAnalysisModel = () =>
  import.meta.env.VITE_GEMINI_ANALYSIS_MODEL?.trim() || 'gemini-3-pro-preview';

export const getChatModel = () =>
  import.meta.env.VITE_GEMINI_CHAT_MODEL?.trim() || 'gemini-3-flash-preview';

export const hasAiStudioKeySelector = () =>
  typeof window !== 'undefined' && typeof window.aistudio?.openSelectKey === 'function';

export const hasSelectedAiStudioApiKey = async () => {
  if (typeof window === 'undefined' || typeof window.aistudio?.hasSelectedApiKey !== 'function') {
    return false;
  }
  return window.aistudio.hasSelectedApiKey();
};

export const openAiStudioKeySelector = async () => {
  const openSelectKey = window.aistudio?.openSelectKey;
  if (typeof openSelectKey === 'function') {
    await openSelectKey();
    return true;
  }
  return false;
};
