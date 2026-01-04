import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import CopyButton from '../copy-button';
import ContentTextarea from '../content-textarea';
import LanguageSelector from '../language-selector';
import {
  AiTextTranslateProvider,
  useAiTextTranslate,
} from '@/contexts/ai-text-translate-context';
import { swapLangCode } from '@/config/languages';
import { useMutation } from '@tanstack/react-query';
import { AiTranslateRequest } from '@/types/api';
import { useConfigStore } from '@/stores/configStore';
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
    const { data } = await axios.post<OpenAI.ChatCompletion>(
      '/api/completion',
      requestParams,
      {
        headers: { 'x-api-key': apiKey },
      },
    );
    return data;
  };

  const { mutate: translate, isPending: isTranslating } = useMutation<
    OpenAI.ChatCompletion,
    Error,
    AiTranslateRequest
  >({
    mutationFn: (variables) => {
      const state = useConfigStore.getState();
      const apiKey = state.config.llmConfig.googleConfig.apiKey;
      return getTranslate(variables, apiKey);
    },
    onSuccess: (data) => {
      setResult(data.choices[0]?.message?.content ?? '');
    },
    onError: (error) => {
      alert(error.message);
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
