import PSelect from '../p-select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeftRight,
  ChevronsUpDown,
  Clipboard,
  Wrench,
} from 'lucide-react';
import { Collapsible } from '../ui/collapsible';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import axios from 'axios';
import { useConfigStore } from '@/stores/configStore';
import { ModelType, type TextResult } from 'deepl-node';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Option } from '@/components/p-select';
import { swapLangCode } from '@/config/languages';
import { getLabelByCode } from '@/config/languages';
import { TranslateRequest } from '@/types/api';

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
const TranslatorMain = () => {
  const [transRequest, setTransRequest] = useState<TranslateRequest>({
    sourceLang: 'en',
    targetLang: 'ko',
    text: '',
    model: undefined,
  });

  const { config } = useConfigStore();

  const { data: languages, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => getLanguages(config.apiKey),
    retry: false,
    enabled: !!config.apiKey,
  });

  const { mutate: translate } = useMutation({
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
      return { text: mergedText, billedCharacters: totalBilled };
    },
    onSuccess: (data) => {
      setResult(data.text);
      setBilledCharacters(data.billedCharacters);
    },
    onError: (error) => {
      alert(error.message);
      setResult('');
      setBilledCharacters(0);
    },
  });

  const sourceLanguageOptions: Option[] =
    languages?.sourceLanguages
      .map((lang) => ({
        label: getLabelByCode(lang.code),
        value: lang.code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];
  const targetLanguageOptions: Option[] =
    languages?.targetLanguages
      .map((lang) => ({
        label: getLabelByCode(lang.code),
        value: lang.code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const [result, setResult] = useState<string>('');
  const [billedCharacters, setBilledCharacters] = useState<number>(0);

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

  //   function getUtf8Bytes(str: string): number {
  //     return new TextEncoder().encode(str).length;
  //   }

  //   function formatBytes(bytes: number): string {
  //     if (bytes < 1024) return `${bytes} B`;
  //     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  //     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  //   }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="col">
        <Collapsible>
          <div className="flex items-center gap-4 px-4">
            <h4 className="text-sm font-semibold flex items-center">
              {' '}
              <Wrench className="w-4 mr-1" />
              세부 설정
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsUpDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <PSelect
              value={transRequest.model}
              onChange={(value) => {
                setTransRequest({ ...transRequest, model: value as ModelType });
              }}
              options={[
                { label: 'latency_optimized', value: 'latency_optimized' },
                { label: 'quality_optimized', value: 'quality_optimized' },
                {
                  label: 'prefer_quality_optimized',
                  value: 'prefer_quality_optimized',
                },
              ]}
              placeholder="모델 선택"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="flex col-span-2 gap-1">
        <div className="flex-1 flex justify-end">
          <PSelect
            options={sourceLanguageOptions}
            placeholder={`Select source language`}
            onChange={(value) => {
              setTransRequest({ ...transRequest, sourceLang: value });
            }}
            value={transRequest.sourceLang}
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
            placeholder={`Select target language`}
          />
        </div>
      </div>
      <div className="h-full">
        <Textarea
          placeholder="번역할 내용을 입력하세요."
          className="h-full min-h-64"
          name="text"
          value={transRequest.text}
          onChange={handleChange}
        />
        <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
          <div className="text-sm text-muted-foreground">
            {transRequest.text.length}
          </div>
          <CopyButton
            onClick={async () => {
              await navigator.clipboard.writeText(transRequest.text);
            }}
          />
          <Button onClick={() => translate(transRequest)}>번역</Button>
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
          <div className="text-sm text-muted-foreground">
            청구 문자 수: {billedCharacters}자
          </div>
          <CopyButton
            onClick={async () => {
              await navigator.clipboard.writeText(result);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default TranslatorMain;
