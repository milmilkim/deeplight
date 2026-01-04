import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { GlobalConfig, DEFAULT_CONFIG } from '@/types/global-config';

// localforage
localforage.config({
  name: 'deeplight-app',
  storeName: 'config_store',
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
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      _hasHydrated: false,

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
    }),
    {
      name: 'deeplight-config',
      storage: createJSONStorage(() => storageAdapter),
      partialize: (state) => ({ config: state.config }),
    },
  ),
);
