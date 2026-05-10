/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_GEMINI_ANALYSIS_MODEL?: string;
  readonly VITE_GEMINI_CHAT_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  aistudio?: {
    hasSelectedApiKey?: () => Promise<boolean>;
    openSelectKey?: () => Promise<void>;
  };
}
