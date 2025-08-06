import PSelect from '../p-select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeftRight, Clipboard, X } from 'lucide-react';
import axios from 'axios';
import { useConfigStore } from '@/stores/configStore';
import { SourceLanguageCode, type TextResult } from 'deepl-node';
import { useMutation } from '@tanstack/react-query';
import { Option } from '@/components/p-select';
import {
  sourceLanguages,
  swapLangCode,
  targetLanguages,
} from '@/config/languages';
import { TranslateRequest } from '@/types/api';
import {
  useTextTranslate,
  TextTranslateProvider,
} from '@/contexts/text-translate-context';
import AdvancedSettings from './advanced-settings';
import { useTranslations } from 'next-intl';
import { Close } from '@radix-ui/react-dialog';

const MAX_BYTES = 100 * 1024;

const CopyButton = ({ onClick }: { onClick: () => void }) => (
  <div className="sticky bottom-0">
    <Button variant={'ghost'} size={'icon'} onClick={onClick}>
      <Clipboard />
    </Button>
  </div>
);

const getTranslate = async (transRequest: TranslateRequest, apiKey: string) => {
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
  const tLang = useTranslations('lang');

  const { mutate: translate, isPending: isTranslating } = useMutation<
    {
      text: string;
      billedCharacters: number;
      detectedSourceLang: SourceLanguageCode;
    },
    Error,
    TranslateRequest
  >({
    mutationFn: async (transRequest: TranslateRequest) => {
      if (!config.apiKey) {
        throw new Error(t('alert.apiKeyNotSet'));
      }
      const apiKey = useConfigStore.getState().config.apiKey;
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

  const sourceLanguageOptions: Option[] = [
    ...(sourceLanguages
      ?.map((lang) => ({
        label: tLang(lang.code),
        value: lang.code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || []),
  ];

  const targetLanguageOptions: Option[] =
    targetLanguages
      ?.map((lang) => ({
        label: tLang(lang.code),
        value: lang.code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setTransRequest({ ...transRequest, [e.target.name]: e.target.value });
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
        <div className="flex-1 flex justify-end">
          <PSelect
            className="w-full sm:w-[180px]"
            options={sourceLanguageOptions}
            placeholder={t('autoDetect')}
            onChange={(value) => {
              setTransRequest({ ...transRequest, sourceLang: value });
            }}
            value={transRequest.sourceLang}
            disalbed={isTranslating}
          />
        </div>
        <Button
          variant={'ghost'}
          onClick={() => {
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
          }}
        >
          <ArrowLeftRight />
        </Button>
        <div className="flex-1">
          <PSelect
            className="w-full sm:w-[180px]"
            options={targetLanguageOptions}
            onChange={(value) => {
              setTransRequest({ ...transRequest, targetLang: value });
            }}
            value={transRequest.targetLang}
            disalbed={isTranslating}
            placeholder={t('placeholder.targetLanguage')}
          />
        </div>
      </div>
      <div className="sm:grid sm:grid-cols-2 gap-2 mt-2">
        <div className="h-full relative">
          <Textarea
            placeholder={t('placeholder.text')}
            className="h-full min-h-64"
            name="text"
            disabled={isTranslating}
            value={transRequest.text}
            onChange={handleChange}
          />
          {transRequest.text.length > 0 && (
          <div className="absolute top-0 right-0 mr-1 mt-1">
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => {
                setTransRequest({ ...transRequest, text: '' });
                setResult('');
                setBilledCharacters(0);
              }}
            >
                <X />
              </Button>
            </div>
          )}
          <div className="sticky bottom-0 py-2 flex items-center gap-1 justify-end">
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
          </div>
        </div>
        <div className="h-full">
          <Textarea
            placeholder=""
            value={result}
            readOnly
            className="h-full min-h-64"
          />
          <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
            <div className="text-sm text-muted-foreground">{result.length}</div>
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
          </div>
        </div>
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
