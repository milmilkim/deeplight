import PSelect from '../p-select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeftRight, ChevronsUpDown, Clipboard } from 'lucide-react';
import { Collapsible } from '../ui/collapsible';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import axios from 'axios';
import { useConfigStore } from '@/stores/configStore';
import { type TextResult } from 'deepl-node';
const CopyButton = ({ onClick }: { onClick: () => void }) => (
  <div className="sticky bottom-0">
    <Button variant={'ghost'} size={'icon'} onClick={onClick}>
      <Clipboard />
    </Button>
  </div>
);

interface TransRequest {
  sourceLang: string;
  targetLang: string;
  text: string;
}
const TranslatorMain = () => {
  const [transRequest, setTransRequest] = useState<TransRequest>({
    sourceLang: 'ko',
    targetLang: 'en-US',
    text: '',
  });

  const [result, setResult] = useState<string>('');
  const [billedCharacters, setBilledCharacters] = useState<number>(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setTransRequest({ ...transRequest, [e.target.name]: e.target.value });
  };

  const handleTranslate = async () => {
    const apiKey = useConfigStore.getState().config.apiKey;
    const { data } = await axios.post<TextResult>(
      'http://localhost:3000/api/translate',
      transRequest,
      {
        headers: {
          'x-api-key': apiKey,
        },
      },
    );

    setResult(data.text);
    setBilledCharacters(data.billedCharacters);
  };

  function getUtf8Bytes(str: string): number {
    return new TextEncoder().encode(str).length;
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const MAX_BYTES = 100 * 1024; // 128KiB = 131072 bytes
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="col">
        <Collapsible>
          <div className="flex items-center gap-4 px-4">
            <h4 className="text-sm font-semibold">세부 설정</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsUpDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <PSelect
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
            <input type="checkbox" />
            태그핸들링
            <input type="checkbox" />
            격식체
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="flex col-span-2 gap-1">
        <div className="flex-1 flex justify-end">
          <PSelect
            options={[
              { label: '한국어', value: 'ko' },
              { label: '영어', value: 'en' },
            ]}
            placeholder="Select an option"
            onChange={(value) => {
              console.log(value);
              setTransRequest({ ...transRequest, sourceLang: value });
            }}
            defaultValue={transRequest.sourceLang}
          />
        </div>
        <Button variant={'ghost'}>
          <ArrowLeftRight />
        </Button>
        <div className="flex-1">
          <PSelect
            options={[
              { label: '한국어', value: 'ko' },
              { label: '영어', value: 'en-US' },
            ]}
            onChange={(value) => {
              console.log(value);
              setTransRequest({ ...transRequest, targetLang: value });
            }}
            defaultValue={transRequest.targetLang}
            placeholder="Select an option"
          />
        </div>
      </div>
      <div className="h-full">
        <Textarea
          placeholder="번역할 내용을 입력하세요."
          className="h-full min-h-64"
          name="text"
          onChange={handleChange}
        />
        <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
          <div className="text-sm text-muted-foreground">
            {formatBytes(getUtf8Bytes(transRequest.text))} /{' '}
            {formatBytes(MAX_BYTES)}
          </div>
          <CopyButton
            onClick={async () => {
              await navigator.clipboard.writeText(transRequest.text);
            }}
          />
          <Button onClick={handleTranslate}>번역</Button>
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
