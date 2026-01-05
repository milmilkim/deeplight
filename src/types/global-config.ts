import OpenAI from 'openai';

export type LLMProvider = 'openai' | 'google' | 'custom';

export interface CustomProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string; // The model ID sent to the API
}

export interface ProviderConfig {
  apiKey: string;
  modelOptions?: {
    reasoning_effort?: OpenAI.ReasoningEffort;
  };
}

export interface OpenAIProviderConfig extends ProviderConfig {
  modelOptions?: {
    reasoning_effort?: OpenAI.ReasoningEffort;
    serviceTier?: 'auto' | 'flex';
  };
}

export interface GoogleProviderConfig extends ProviderConfig {
  modelOptions?: {
    reasoning_effort?: OpenAI.ReasoningEffort;
  };
}

export interface PromptPreset {
  id: string;
  name: string;
  content: string;
  description?: string;
}

export interface PromptFragment {
  id: string;
  name: string;
  content: string;
  description?: string;
}

export interface TranslatorConfig {
  temperature: number;
  languages: string[];
  enabledModels: string[];
  prompts: PromptPreset[];
  promptFragments: PromptFragment[]; // Sub-prompts (Glossary, Tone, etc.)
  activePromptId: string; // Main system prompt (Single selection)
  activePromptFragmentIds: string[]; // Active sub-prompts (Multiple selection)
  model: string;
  baseUrl: string;
}

export interface GlobalConfig {
  deepLConfig: {
    apiKey: string;
  };
  llmConfig: {
    googleConfig: GoogleProviderConfig;
    openAIConfig: OpenAIProviderConfig;
  };
  customProviders: CustomProvider[];
  translatorConfig: Partial<TranslatorConfig>;
}

export const DEFAULT_CONFIG: GlobalConfig = {
  deepLConfig: {
    apiKey: '',
  },
  llmConfig: {
    googleConfig: {
      apiKey: '',
      modelOptions: {
        reasoning_effort: 'low'
      }
    },
    openAIConfig: {
      apiKey: '',
      modelOptions: {
        reasoning_effort: 'low',
        serviceTier: 'auto'
      }
    },
  },
  customProviders: [],

  translatorConfig: {
    temperature: 0.2,
    model: 'gemini-2.5-flash-lite',
    enabledModels: [
      'gemini-2.5-flash-lite',
      'gemini-3-flash-preview',
      'gpt-4.1-nano',
      'gpt-4.1-mini',
    ],
    prompts: [],
    promptFragments: [],
    activePromptId: 'default',
    activePromptFragmentIds: [],
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    languages: ['ko', 'en'],
  },
};

// Model configurations
export interface ModelInfo {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'custom';
  baseUrl: string;
  capabilities?: {
    supportsReasoningEffort?: boolean;
    supportsServiceTier?: boolean;
  };
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Google Models
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  },
  // OpenAI Models
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    capabilities: {
      supportsServiceTier: true,
      supportsReasoningEffort: true,
    },
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    capabilities: {
      supportsServiceTier: true,
      supportsReasoningEffort: true,
    },
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    capabilities: {
      supportsServiceTier: true,
      supportsReasoningEffort: true,
    },
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    capabilities: {
      supportsServiceTier: true,
    },
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    capabilities: {
      supportsServiceTier: true,
    },
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
  },
];
