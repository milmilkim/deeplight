export type LLMProvider = 'openai' | 'google' | 'custom';

export interface CustomProvider {
  id: string;
  alias: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ProviderConfig {
  apiKey: string;
}

export interface GlobalConfig {
  deepLConfig: {
    apiKey: string;
  };
  llmConfig: {
    googleConfig: ProviderConfig;
  };
  customProviders: CustomProvider[];
}

export const DEFAULT_CONFIG: GlobalConfig = {
  deepLConfig: {
    apiKey: '',
  },
  llmConfig: {
    googleConfig: {
      apiKey: '',
    },
  },
  customProviders: [],
};
