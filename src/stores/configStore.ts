import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import localforage from 'localforage';
import {
  GlobalConfig,
  DEFAULT_CONFIG,
  ProviderConfig,
  TranslatorConfig,
} from '@/types/global-config';

// localforage
localforage.config({
  name: 'deeplight-app',
  storeName: 'config-store',
});

const storageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem<string>(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

interface ConfigState {
  config: GlobalConfig;

  updateConfig: (newConfig: Partial<GlobalConfig>) => void;

  updateTranslatorConfig:  (updates: Partial<TranslatorConfig>) => void;
  updateOpenAIConfig: (updates: Partial<ProviderConfig>) => void;
  updateGoogleConfig: (updates: Partial<ProviderConfig>) => void;
  updateDeepLConfig: (updates: Partial<{ apiKey: string }>) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    immer((set) => ({
      config: DEFAULT_CONFIG,

      updateConfig: (newConfig) =>
        set((state) => {
          Object.assign(state.config, newConfig);
        }),

      /** 옵션 별 업데이트 함수 */

      updateTranslatorConfig: (updates) => set((state) => {
        Object.assign(state.config.translatorConfig, updates);
      }),

      updateOpenAIConfig: (updates) =>
        set((state) => {
          Object.assign(state.config.llmConfig.openAIConfig, updates);
        }),

      updateGoogleConfig: (updates) =>
        set((state) => {
          Object.assign(state.config.llmConfig.googleConfig, updates);
        }),

      updateDeepLConfig: (updates) =>
        set((state) => {
          Object.assign(state.config.deepLConfig, updates);
        }),
    })),
    {
      name: 'deeplight-config',
      storage: createJSONStorage(() => storageAdapter),
      partialize: (state) => ({ config: state.config }),
    },
  ),
);
