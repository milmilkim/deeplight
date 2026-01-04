import { Button } from '../../ui/button';
import axios from 'axios';
import { useConfigStore } from '@/stores/configStore';
import { SourceLanguageCode, type TextResult } from 'deepl-node';
import { useMutation } from '@tanstack/react-query';
import {
  swapLangCode,
} from '@/config/languages';
import { DeepLTranslateRequest } from '@/types/api';
import {
  useTextTranslate,
  TextTranslateProvider,
} from '@/contexts/text-translate-context';
import AdvancedSettings from './advanced-settings';
import { useTranslations } from 'next-intl';
import CopyButton from '../copy-button';
import LanguageSelector from '../language-selector';
import ContentTextarea from '../content-textarea';

const MAX_BYTES = 100 * 1024;

const getTranslate = async (
  transRequest: DeepLTranslateRequest,
  apiKey: string,
) => {
  const { data } = await axios.post<TextResult>(
    '/api/translate',
    transRequest,
    { headers: { 'x-api-key': apiKey } },
  );
  return data;
};

const TranslatorMainContent = () => {
  const {
    transRequest,
    setTransRequest,
    result,
    setResult,
    billedCharacters,
    setBilledCharacters,
  } = useTextTranslate();

  const { config } = useConfigStore();

  const t = useTranslations('textTranslate');

  const { mutate: translate, isPending: isTranslating } = useMutation<
    {
      text: string;
      billedCharacters: number;
      detectedSourceLang: SourceLanguageCode;
    },
    Error,
    DeepLTranslateRequest
  >({
    mutationFn: async (transRequest: DeepLTranslateRequest) => {
      if (!config.deepLConfig.apiKey) {
        throw new Error(t('alert.apiKeyNotSet'));
      }
      const apiKey = useConfigStore.getState().config.deepLConfig.apiKey;
      const textChunks = splitByBytes(transRequest.text, MAX_BYTES);

      const promises = textChunks.map((chunk) =>
        getTranslate({ ...transRequest, text: chunk }, apiKey),
      );
      const results = await Promise.allSettled(promises);

      const mergedText = results
        .map((r) => (r.status === 'fulfilled' ? r.value.text : ''))
        .join('');
      const totalBilled = results
        .filter((r) => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value.billedCharacters || 0), 0);

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount === textChunks.length) {
        const firstError = results.find((r) => r.status === 'rejected');
        let message = t('alert.translateError');
        if (
          firstError &&
          firstError.status === 'rejected' &&
          firstError.reason instanceof Error
        ) {
          message = firstError.reason.message;
        }
        throw new Error(message);
      }
      if (failedCount > 0) {
        // 일부 실패는 성공한 것만 반환 + 경고
        alert(t('alert.someTranslateFailed', { count: failedCount }));
      }
      const firstResult = results.find((r) => r.status === 'fulfilled');
      const detectedSourceLang =
        firstResult?.status === 'fulfilled'
          ? firstResult.value.detectedSourceLang
          : 'en';
      return {
        text: mergedText,
        billedCharacters: totalBilled,
        detectedSourceLang,
      };
    },
    onSuccess: (data) => {
      setResult(data.text);
      setTransRequest({ ...transRequest, sourceLang: data.detectedSourceLang });
      setBilledCharacters(data.billedCharacters);
    },
    onError: (error) => {
      alert(error.message);
      setResult('');
      setBilledCharacters(0);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setTransRequest({ ...transRequest, [e.target.name]: e.target.value });
  };

  const handleClickSwap = () => {
    const prevSourceLang = transRequest.sourceLang;
    const prevTargetLang = transRequest.targetLang;
    const prevText = transRequest.text;
    const prevResult = result;

    const { newSource, newTarget } = swapLangCode(
      prevSourceLang,
      prevTargetLang,
    );

    setTransRequest({
      ...transRequest,
      sourceLang: newSource,
      targetLang: newTarget,
      text: prevResult, // 번역 결과를 입력란으로
    });
    setResult(prevText); // 입력값을 결과란으로
  };

  function splitByBytes(str: string, maxBytes: number): string[] {
    const encoder = new TextEncoder();
    const result: string[] = [];
    let chunk = '';
    let chunkBytes = 0;

    for (const char of str) {
      const charBytes = encoder.encode(char).length;
      if (chunkBytes + charBytes > maxBytes) {
        result.push(chunk);
        chunk = '';
        chunkBytes = 0;
      }
      chunk += char;
      chunkBytes += charBytes;
    }
    if (chunk) result.push(chunk);
    return result;
  }

  return (
    <div className="mt-2">
      <div className="col">
        <AdvancedSettings />
      </div>
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
          onClickSwap={() => handleClickSwap()}
        />
      </div>
      <div className="sm:grid sm:grid-cols-2 gap-2 mt-2">
        <ContentTextarea
          placeholder={t('placeholder.text')}
          isTranslating={isTranslating}
          value={transRequest.text}
          onChange={handleChange}
          footer={
            <>
              <div className="text-sm text-muted-foreground">
                {transRequest.text.length}
                {billedCharacters > 0 && (
                  <span>
                    {' '}
                    /{' '}
                    {t('billedCharacters', {
                      count: billedCharacters.toString(),
                    })}
                  </span>
                )}
              </div>
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
                onClick={() => {
                  // 유효성 검사
                  if (transRequest.text.length === 0) {
                    alert(t('alert.inputEmpty'));
                    return;
                  }

                  if (transRequest.targetLang === transRequest.sourceLang) {
                    alert(t('alert.sameLanguage'));
                    return;
                  }

                  translate(transRequest);
                }}
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
          footer={
            <>
              <div className="text-sm text-muted-foreground">
                {result.length}
              </div>
              <CopyButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result);
                    alert(t('alert.copySuccess'));
                  } catch (error) {
                    alert(t('alert.copyError'));
                    console.error(error);
                  }
                }}
              />
            </>
          }
        />
      </div>
    </div>
  );
};

const TranslatorMain = () => {
  return (
    <TextTranslateProvider>
      <TranslatorMainContent />
    </TextTranslateProvider>
  );
};

export default TranslatorMain;
