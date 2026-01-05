import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import OpenAI from 'openai';
import { useConfigStore } from '@/stores/configStore';
import { AiTranslateRequest } from '@/types/api';
import { isApiErrorResponse } from '@/types/api-error';
import { AVAILABLE_MODELS } from '@/types/global-config';
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
}

export const useTranslation = ({ setResult }: UseTranslationProps) => {
    return useMutation<OpenAI.ChatCompletion, Error, AiTranslateRequest>({
        mutationFn: (variables) => {
            const state = useConfigStore.getState();
            const currentModel =
                state.config.translatorConfig.model ?? 'gemini-3-flash-preview';

            // Find the model info to determine the provider
            const modelInfo = AVAILABLE_MODELS.find((m) => m.id === currentModel);
            const provider = modelInfo?.provider ?? 'google';

            // Get the correct API key and reasoning_effort based on provider
            let apiKey = '';
            let reasoningEffort: OpenAI.ReasoningEffort | undefined;

            if (provider === 'google') {
                apiKey = state.config.llmConfig.googleConfig.apiKey;
                reasoningEffort =
                    state.config.llmConfig.googleConfig.modelOptions?.reasoning_effort;
            } else {
                apiKey = state.config.llmConfig.openAIConfig.apiKey;
                reasoningEffort =
                    state.config.llmConfig.openAIConfig.modelOptions?.reasoning_effort;
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

            // Include config settings in the request
            const requestWithConfig: AiTranslateRequest = {
                ...variables,
                temperature: state.config.translatorConfig.temperature ?? 0.2,
                reasoning_effort: reasoningEffort,
                serviceTier:
                    state.config.llmConfig.openAIConfig.modelOptions?.serviceTier,
                model: currentModel,
                systemPrompt: fullSystemPrompt, // Combined Prompt
                baseUrl: state.config.translatorConfig.baseUrl,
            };

            return getTranslate(requestWithConfig, apiKey);
        },
        onSuccess: (data) => {
            setResult(data.choices[0]?.message?.content ?? '');
        },
        onError: (error) => {
            const errorMessage = error.message || 'Translation failed';
            alert(errorMessage);
            setResult('');
        },
    });
};
