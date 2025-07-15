import PSelect from '../p-select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeftRight, ChevronsUpDown, Clipboard } from 'lucide-react';
import { Collapsible } from '../ui/collapsible';
import { CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';

const CopyButton = () => (
  <div className="sticky bottom-0">
    <Button variant={'ghost'} size={'icon'}>
      <Clipboard />
    </Button>
  </div>
);

const TranslatorMain = () => (
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
          <input type="checkbox" />태그핸들링
          <input type="checkbox" />격식체
        </CollapsibleContent>
      </Collapsible>
    </div>
    <div className="flex col-span-2 gap-1">
      <div className="flex-1 flex justify-between">
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

        <PSelect
          options={[
            { label: '한국어', value: 'ko' },
            { label: '영어', value: 'en' },
          ]}
          placeholder="Select an option"
        />
      </div>
      <Button variant={'ghost'}>
        <ArrowLeftRight />
      </Button>
      <div className="flex-1">
        <PSelect
          options={[
            { label: '한국어', value: 'ko' },
            { label: '영어', value: 'en' },
          ]}
          placeholder="Select an option"
        />
      </div>
    </div>
    <div className="h-full">
      <Textarea
        placeholder="번역할 내용을 입력하세요."
        className="h-full min-h-64"
      />
      <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
        <CopyButton />
        <Button>번역</Button>
      </div>
    </div>
    <div className="h-full">
      <Textarea placeholder="" className="h-full min-h-64" />
      <div className="sticky bottom-0 mt-2 flex items-center gap-1 justify-end">
        <div className="text-sm text-muted-foreground">2000자</div>
        <CopyButton />
      </div>
    </div>
  </div>
);
export default TranslatorMain;
