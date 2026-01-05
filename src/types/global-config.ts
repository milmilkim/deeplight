import OpenAI from 'openai';

export type LLMProvider = 'openai' | 'google' | 'custom';

export interface CustomProvider {
  id: string;
  alias: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ProviderConfig {
  apiKey: string;
}

export interface CompletionParameters {
  temperature: number;
  reasoning_effort: OpenAI.ReasoningEffort;
}

export interface TranslatorConfig {
  modelOptions: Partial<CompletionParameters>;
  languages: string[];
  prompts: string[];
  model: string;
  baseUrl: string;
}

export interface GlobalConfig {
  deepLConfig: {
    apiKey: string;
  };
  llmConfig: {
    googleConfig: ProviderConfig;
    openAIConfig: ProviderConfig;
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
    },
    openAIConfig: {
      apiKey: '',
    },
  },
  customProviders: [],

  translatorConfig: {
    modelOptions: {
      temperature: 0.2,
      reasoning_effort: 'minimal'
    },
    model: 'gemini-3-flash-preview',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    languages: ['ko', 'en'],
  },
};
