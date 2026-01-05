import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import localforage from 'localforage';

// Use same localforage instance/config for simplicity
// or we could just rely on storageAdapter logic being reusable.

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

export interface HistoryItem {
    id: string;
    sourceText: string;
    translatedText: string;
    provider: string; // 'google', 'openai', 'custom', or model name
    timestamp: number;
}

interface HistoryState {
    history: HistoryItem[];
    addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
    removeFromHistory: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        immer((set) => ({
            history: [],
            addHistory: (item) =>
                set((state) => {
                    const newItem: HistoryItem = {
                        ...item,
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                    };
                    // Add to beginning of array
                    // Add to beginning of array
                    state.history.unshift(newItem);
                }),
            clearHistory: () =>
                set((state) => {
                    state.history = [];
                }),
            removeFromHistory: (id) =>
                set((state) => {
                    state.history = state.history.filter((item) => item.id !== id);
                }),
        })),
        {
            name: 'deeplight-history',
            storage: createJSONStorage(() => storageAdapter),
            partialize: (state) => ({ history: state.history }),
        },
    ),
);
