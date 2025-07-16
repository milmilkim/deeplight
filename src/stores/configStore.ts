import { create } from 'zustand';
import localforage from 'localforage';

export interface Config {
  apiKey: string;
}

export const CONFIG_KEY = 'deeplight-config';

interface ConfigStore {
  config: Config;
  setConfig: (config: Config) => void;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  config: { apiKey: '' },
  setConfig: (config) => set({ config }),
  loadConfig: async () => {
    try {
      const value = await localforage.getItem(CONFIG_KEY);
      if (value && typeof value === 'object') {
        set({ config: value as Config });
      }
    } catch (err) {
      console.log(err);
    }
  },
  saveConfig: async (config) => {
    try {
      await localforage.setItem(CONFIG_KEY, config);
      set({ config });
    } catch (err) {
      console.log(err);
    }
  },
})); 