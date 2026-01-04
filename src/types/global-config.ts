export type LLMProvider = 'openai' | 'google' | 'custom';

export interface CustomProvider {
  id: string;
  alias: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface GlobalConfig {
  appMode: 'DEEPL' | 'LLM';

  deepLConfig: {
    apiKey: string;
  };
  llmConfig: {
    provider: LLMProvider;
    model: string;
  };
  customProviders: CustomProvider[];
}

export const DEFAULT_CONFIG: GlobalConfig = {
  appMode: 'DEEPL',
  deepLConfig: {
    apiKey: '',
  },
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4.1',
  },
  customProviders: [],
};