import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useConfigStore } from '@/stores/configStore';
import { AVAILABLE_MODELS } from '@/types/global-config';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function ModelSelector() {
    const config = useConfigStore((state) => state.config);
    const updateTranslatorConfig = useConfigStore((state) => state.updateTranslatorConfig);
    const currentModel = config.translatorConfig.model ?? 'gemini-3-flash-preview';

    // API KEY 있으면 표시
    const getApiKeyStatus = (provider: 'google' | 'openai' | 'custom', modelId?: string) => {
        if (provider === 'google') {
            const hasKey = !!config.llmConfig.googleConfig.apiKey && config.llmConfig.googleConfig.apiKey.trim().length > 0;
            return hasKey;
        }
        if (provider === 'openai') {
            const hasKey = !!config.llmConfig.openAIConfig.apiKey && config.llmConfig.openAIConfig.apiKey.trim().length > 0;
            return hasKey;
        }
        // Custom provider: key is stored in the provider object itself
        const customProvider = config.customProviders?.find(p => p.id === modelId);
        return !!customProvider?.apiKey && customProvider.apiKey.trim().length > 0;
    };

    const allModels = useMemo(() => {
        const customModels: unknown[] = (config.customProviders || []).map(cp => ({
            id: cp.id,
            name: cp.name,
            provider: 'custom',
            baseUrl: cp.baseUrl,
        }));
        // Cast to ModelInfo[] to avoid excessive type errors if properties mismatch slightly, though they match.
        // Actually, let's just use spread and specific type.
        return [...AVAILABLE_MODELS, ...customModels as any[]];
    }, [config.customProviders]);

    const handleModelChange = (modelId: string) => {
        const model = allModels.find((m) => m.id === modelId);
        if (model) {
            updateTranslatorConfig({
                model: model.id,
                baseUrl: model.baseUrl,
            });
        }
    };

    // Filter models based on enabledModels in config
    const enabledModels = useMemo(() => {
        const enabledIds = config.translatorConfig.enabledModels ?? [];
        return allModels.filter((model) => enabledIds.includes(model.id));
    }, [config.translatorConfig.enabledModels, allModels]);

    return (
        <Select value={currentModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[130px] lg:w-[200px] h-9 text-xs">
                <div className="truncate flex-1 text-left">
                    <SelectValue />
                </div>
            </SelectTrigger>
            <SelectContent>
                {enabledModels.map((model) => {
                    const hasApiKey = getApiKeyStatus(model.provider as any, model.id);
                    return (
                        <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                                {hasApiKey ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                    <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                <span>{model.name}</span>
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
