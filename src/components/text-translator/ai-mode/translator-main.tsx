import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import CopyButton from '../copy-button';
import ContentTextarea from '../content-textarea';
import LanguageSelector from '../language-selector';
import ModelSelector from '../model-selector';
import {
  AiTextTranslateProvider,
  useAiTextTranslate,
} from '@/contexts/ai-text-translate-context';
import { swapLangCode } from '@/config/languages';
import { useMutation } from '@tanstack/react-query';
import { AiTranslateRequest } from '@/types/api';
import { useConfigStore } from '@/stores/configStore';
import { AVAILABLE_MODELS } from '@/types/global-config';
import { ApiErrorResponse, isApiErrorResponse } from '@/types/api-error';
import OpenAI from 'openai';

const TranslatorMainContent = () => {
  const t = useTranslations('textTranslate');

  const { transRequest, setTransRequest, result, setResult } =
    useAiTextTranslate();

  const handleClickSwap = () => {
    const { sourceLang, targetLang, text } = transRequest;

    const { newSource, newTarget } = swapLangCode(sourceLang, targetLang);

    setTransRequest({
      ...transRequest,
      sourceLang: newSource,
      targetLang: newTarget,
      text: result,
    });
    setResult(text);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setTransRequest({ ...transRequest, [e.target.name]: e.target.value });
  };

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

  const { mutate: translate, isPending: isTranslating } = useMutation<
    OpenAI.ChatCompletion,
    Error,
    AiTranslateRequest
  >({
    mutationFn: (variables) => {
      const state = useConfigStore.getState();
      const currentModel = state.config.translatorConfig.model ?? 'gemini-3-flash-preview';

      // Find the model info to determine the provider
      const modelInfo = AVAILABLE_MODELS.find((m) => m.id === currentModel);
      const provider = modelInfo?.provider ?? 'google';

      // Get the correct API key and reasoning_effort based on provider
      let apiKey = '';
      let reasoningEffort: OpenAI.ReasoningEffort | undefined;

      if (provider === 'google') {
        apiKey = state.config.llmConfig.googleConfig.apiKey;
        reasoningEffort = state.config.llmConfig.googleConfig.modelOptions?.reasoning_effort;
      } else {
        apiKey = state.config.llmConfig.openAIConfig.apiKey;
        reasoningEffort = state.config.llmConfig.openAIConfig.modelOptions?.reasoning_effort;
      }

      // Include config settings in the request
      const requestWithConfig: AiTranslateRequest = {
        ...variables,
        temperature: state.config.translatorConfig.temperature ?? 0.2,
        reasoning_effort: reasoningEffort,
        model: currentModel,
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

  return (
    <div className="w-full">
      <div className="flex col-span-2 gap-1 w-full">
        <LanguageSelector
          onSourceLanguageChange={(value) => {
            setTransRequest({ ...transRequest, sourceLang: value });
          }}
          onTargetLanguageChange={(value) => {
            setTransRequest({ ...transRequest, targetLang: value });
          }}
          sourceLanguageValue={transRequest.sourceLang}
          targetLanguageValue={transRequest.targetLang}
          isTranslating={isTranslating}
          onClickSwap={handleClickSwap}
        />
      </div>
      <div className="sm:grid sm:grid-cols-2 gap-2 mt-2">
        <ContentTextarea
          name="text"
          isTranslating={isTranslating}
          value={transRequest.text}
          onChange={handleChange}
          placeholder={t('placeholder.text')}
          footer={
            <>
              <ModelSelector />
              <div className="flex-1" />
              <CopyButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(transRequest.text);
                    alert(t('alert.copySuccess'));
                  } catch (error) {
                    alert(t('alert.copyError'));
                    console.error(error);
                  }
                }}
              />
              <Button
                disabled={isTranslating}
                onClick={() => translate(transRequest)}
              >
                {t('button.translate')}
              </Button>
            </>
          }
        />
        <ContentTextarea
          isTranslating={isTranslating}
          value={result}
          readOnly
        />
      </div>
    </div>
  );
};

const TranslatorMain = () => {
  return (
    <AiTextTranslateProvider>
      <TranslatorMainContent />
    </AiTextTranslateProvider>
  );
};

export default TranslatorMain;
