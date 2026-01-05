import { produce } from 'immer';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { GlobalConfig } from '@/types/global-config';

/**
 * 중첩된 config 경로를 업데이트하는 유틸리티 훅
 * 
 * @example
 * const updateOpenAI = useConfigUpdater(setTempConfig, (draft) => draft.llmConfig.openAIConfig);
 * updateOpenAI({ apiKey: 'new-key', temperature: 0.7 });
 */
export function useConfigUpdater<T extends object>(
    setConfig: Dispatch<SetStateAction<GlobalConfig>>,
    selector: (draft: GlobalConfig) => T
) {
    return useCallback(
        (updates: Partial<T>) => {
            setConfig(
                produce((draft) => {
                    const target = selector(draft);
                    Object.assign(target, updates);
                })
            );
        },
        [setConfig, selector]
    );
}
