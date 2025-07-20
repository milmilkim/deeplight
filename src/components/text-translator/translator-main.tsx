import PSelect from '../p-select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeftRight, Clipboard } from 'lucide-react';
import axios from 'axios';
import { useConfigStore } from '@/stores/configStore';
import { SourceLanguageCode, type TextResult } from 'deepl-node';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Option } from '@/components/p-select';
import { swapLangCode } from '@/config/languages';
import { getLabelByCode } from '@/config/languages';
import { TranslateRequest } from '@/types/api';
import {
  useTextTranslate,
  TextTranslateProvider,
} from '@/contexts/text-translate-context';
import AdvancedSettings from './advanced-settings';

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

const getLanguages = async (apiKey: string) => {
  const { data } = await axios.get<{
    sourceLanguages: { name: string; code: string }[];
    targetLanguages: { name: string; code: string }[];
  }>('/api/languages', {
    headers: {
      'x-api-key': apiKey,
    },
  });
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

  const { data: languages, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => getLanguages(config.apiKey),
    retry: false,
    enabled: !!config.apiKey,
  });

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
        let message = '번역 중 오류가 발생했습니다.';
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
        alert(`일부 문장 번역에 실패했습니다. (실패 ${failedCount}회)`);
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
    ...(languages?.sourceLanguages
      ?.map((lang) => ({
        label: getLabelByCode(lang.code),
        value: lang.code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || []),
  ];

  const targetLanguageOptions: Option[] =
    languages?.targetLanguages
      ?.map((lang) => ({
        label: getLabelByCode(lang.code),
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
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="col">
        <AdvancedSettings />
      </div>
      <div className="flex col-span-2 gap-1">
        <div className="flex-1 flex justify-end">
          <PSelect
            options={sourceLanguageOptions}
            placeholder={`자동 감지`}
            onChange={(value) => {
              setTransRequest({ ...transRequest, sourceLang: value });
            }}
            value={transRequest.sourceLang}
            disalbed={isTranslating || isLoadingLanguages}
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
            options={targetLanguageOptions}
            onChange={(value) => {
              setTransRequest({ ...transRequest, targetLang: value });
            }}
            value={transRequest.targetLang}
            disalbed={isTranslating || isLoadingLanguages}
            placeholder={`Select target language`}
          />
        </div>
      </div>
      <div className="h-full">
        <Textarea
          placeholder="번역할 내용을 입력하세요."
          className="h-full min-h-64"
          name="text"
          disabled={isTranslating}
          value={transRequest.text}
          onChange={handleChange}
        />
        <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
          <div className="text-sm text-muted-foreground">
            {transRequest.text.length}
            {billedCharacters > 0 && (
              <span> / 청구 문자 수: {billedCharacters}자</span>
            )}
          </div>
          <CopyButton
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(transRequest.text);
                alert('복사되었습니다.');
              } catch (error) {
                alert('복사에 실패했습니다.');
                console.error(error);
              }
            }}
          />
          <Button
            disabled={isTranslating}
            onClick={() => {
              // 유효성 검사
              if (transRequest.text.length === 0) {
                alert('번역할 내용을 입력하세요.');
                return;
              }

              if (transRequest.targetLang === transRequest.sourceLang) {
                alert('번역할 내용과 번역 대상 언어가 같습니다.');
                return;
              }

              translate(transRequest);
            }}
          >
            번역
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
                alert('복사되었습니다.');
              } catch (error) {
                alert('복사에 실패했습니다.');
                console.error(error);
              }
            }}
          />
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
