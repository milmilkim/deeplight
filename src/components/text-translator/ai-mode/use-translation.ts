import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import OpenAI from 'openai';
import { useConfigStore } from '@/stores/configStore';
import { useHistoryStore } from '@/stores/historyStore';
import { AiTranslateRequest } from '@/types/api';
import { isApiErrorResponse } from '@/types/api-error';
import { AVAILABLE_MODELS, CustomProvider } from '@/types/global-config';
import { DEFAULT_TRANSLATOR_PROMPT } from '@/config/constans';

const getTranslate = async (
    requestParams: AiTranslateRequest,
    apiKey: string,
): Promise<OpenAI.ChatCompletion> => {
    try {
        const { data } = await axios.post<OpenAI.ChatCompletion>(
            '/api/completion',
            requestParams,
            {
                headers: { 'x-api-key': apiKey },
            },
        );
        return data;
    } catch (error) {
        // Extract error message from axios error response
        if (axios.isAxiosError(error) && error.response?.data) {
            const errorData = error.response.data;
            if (isApiErrorResponse(errorData)) {
                // Format: "Error: Message (CODE: STATUS)"
                let message = errorData.error;
                if (errorData.code || errorData.status) {
                    const details = [];
                    if (errorData.code) details.push(`${errorData.code}`);
                    if (errorData.status) details.push(errorData.status);
                    message += ` (${details.join(': ')})`;
                }
                throw new Error(message);
            }
        }
        throw error;
    }
};

interface UseTranslationProps {
    setResult: (text: string) => void;
    setUsage?: (usage: any) => void;
}

export const useTranslation = ({ setResult, setUsage }: UseTranslationProps) => {
    const addHistory = useHistoryStore((state) => state.addHistory);

    return useMutation<OpenAI.ChatCompletion, Error, AiTranslateRequest>({
        mutationFn: (variables) => {
            const state = useConfigStore.getState();
            const currentModel =
                state.config.translatorConfig.model ?? 'gemini-3-flash-preview';

            // Find the model info to determine the provider
            let modelInfo = AVAILABLE_MODELS.find((m) => m.id === currentModel);
            let customProvider: CustomProvider | undefined;

            if (!modelInfo) {
                // Check custom providers
                customProvider = state.config.customProviders?.find((p) => p.id === currentModel);
                if (customProvider) {
                    modelInfo = {
                        id: customProvider.id,
                        name: customProvider.name,
                        provider: 'custom',
                        baseUrl: customProvider.baseUrl,
                    };
                }
            }

            const provider = modelInfo?.provider ?? 'google';

            // Get the correct API key and reasoning_effort based on provider
            let apiKey = '';
            let reasoningEffort: OpenAI.ReasoningEffort | undefined;

            if (provider === 'google') {
                apiKey = state.config.llmConfig.googleConfig.apiKey;
                reasoningEffort =
                    state.config.llmConfig.googleConfig.modelOptions?.reasoning_effort;
            } else if (provider === 'openai') {
                apiKey = state.config.llmConfig.openAIConfig.apiKey;
                reasoningEffort =
                    state.config.llmConfig.openAIConfig.modelOptions?.reasoning_effort;
            } else if (provider === 'custom' && customProvider) {
                apiKey = customProvider.apiKey;
                // Custom providers usually don't support reasoning_effort unless specified, ignoring for now or could add to custom settings
            }

            // --- SYSTEM PROMPT GENERATION ---
            const translatorConfig = state.config.translatorConfig;
            const prompts = translatorConfig.prompts ?? [];
            const activePromptId = translatorConfig.activePromptId;

            // Find active prompt, or fallback to default if not found/empty
            let mainPromptContent = prompts.find(
                (p) => p.id === activePromptId,
            )?.content;

            if (!mainPromptContent) {
                mainPromptContent = DEFAULT_TRANSLATOR_PROMPT;
            }

            const fragments = translatorConfig.promptFragments ?? [];
            const activeFragmentIds = translatorConfig.activePromptFragmentIds ?? [];
            const activeFragmentsContent = fragments
                .filter((f) => activeFragmentIds.includes(f.id))
                .map((f) => f.content)
                .join('\n\n');

            const fullSystemPrompt =
                `${mainPromptContent}\n\n${activeFragmentsContent}`.trim();

            // --- Parameters Logic ---
            const supportsReasoning = modelInfo?.capabilities?.supportsReasoningEffort;
            const supportsServiceTier = modelInfo?.capabilities?.supportsServiceTier;

            const effectiveReasoningEffort = supportsReasoning ? reasoningEffort : undefined;

            const configServiceTier = state.config.llmConfig.openAIConfig.modelOptions?.serviceTier;
            const effectiveServiceTier = (supportsServiceTier && configServiceTier !== 'auto')
                ? configServiceTier
                : undefined;

            // Include config settings in the request
            const requestWithConfig: AiTranslateRequest = {
                ...variables,
                temperature: state.config.translatorConfig.temperature ?? 0.2,
                reasoning_effort: effectiveReasoningEffort,
                serviceTier: effectiveServiceTier,
                model: (provider === 'custom' && customProvider) ? customProvider.model : currentModel,
                systemPrompt: fullSystemPrompt, // Combined Prompt
                baseUrl: modelInfo?.baseUrl ?? state.config.translatorConfig.baseUrl,
            };

            return getTranslate(requestWithConfig, apiKey);
        },
        onSuccess: (data, variables) => {
            const translatedText = data.choices[0]?.message?.content ?? '';
            setResult(translatedText);
            if (setUsage && data.usage) {
                setUsage(data.usage);
            }

            if (translatedText) {
                // Resolve the actual model used from the store, similar to mutationFn
                const state = useConfigStore.getState();
                const currentModel =
                    state.config.translatorConfig.model ?? 'gemini-3-flash-preview';

                let modelInfo = AVAILABLE_MODELS.find((m) => m.id === currentModel);
                let customProvider: CustomProvider | undefined;

                if (!modelInfo) {
                    customProvider = state.config.customProviders?.find((p) => p.id === currentModel);
                    if (customProvider) {
                        modelInfo = {
                            id: customProvider.id,
                            name: customProvider.name,
                            provider: 'custom',
                            baseUrl: customProvider.baseUrl,
                        };
                    }
                }

                const providerName = modelInfo?.name ?? currentModel;

                addHistory({
                    sourceText: variables.text,
                    translatedText,
                    provider: providerName,
                });
            }
        },
        onError: (error) => {
            const errorMessage = error.message || 'Translation failed';
            alert(errorMessage);
            setResult('');
        },
    });
};
