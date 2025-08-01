import { ChevronsUpDown, Wrench } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Button } from '../ui/button';
import PSelect from '../p-select';
import { useTextTranslate } from '@/contexts/text-translate-context';
import { Formality, ModelType, SentenceSplittingMode } from 'deepl-node';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';

const AdvancedSettings = () => {
  const { transRequest, setTransRequest } = useTextTranslate();
  const t = useTranslations('textTranslate');
  return (
    <Collapsible>
      <div className="flex items-center gap-4 px-4">
        <h4 className="text-sm font-semibold flex items-center">
          {' '}
          <Wrench className="w-4 mr-1" />
          {t('advancedSettings')}
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-2">
          <div className="flex">
            <Label className="mr-2">{t('label.modelType')}</Label>
            <PSelect
              value={transRequest.modelType || ''}
              placeholder={t('label.modelType')}
              onChange={(value) => {
                setTransRequest({
                  ...transRequest,
                  modelType: value as ModelType,
                });
              }}
              options={[
                { label: 'latency_optimized', value: 'latency_optimized' },
                { label: 'quality_optimized', value: 'quality_optimized' },
                {
                  label: 'prefer_quality_optimized',
                  value: 'prefer_quality_optimized',
                },
              ]}
            />
          </div>
          <div className="flex">
            <Label className="mr-2">formality</Label>
            <PSelect
              value={transRequest.modelType || ''}
              onChange={(value) => {
                setTransRequest({
                  ...transRequest,
                  modelType: value as ModelType,
                });
              }}
              options={
                [
                  { label: 'less', value: 'less' },
                  { label: 'more', value: 'more' },
                  {
                    label: 'default',
                    value: 'default',
                  },
                  {
                    label: 'prefer_less',
                    value: 'prefer_less',
                  },
                  {
                    label: 'prefer_more',
                    value: 'prefer_more',
                  },
                ] as { label: string; value: Formality }[]
              }
              placeholder="formality"
            />
          </div>
          <div className="flex">
            <Label className="mr-2">splitSentences</Label>
            <PSelect
              className='mb-2'
              value={transRequest.splitSentences || ''}
              onChange={(value) => {
                setTransRequest({
                  ...transRequest,
                  splitSentences: value as SentenceSplittingMode,
                });
              }}
              options={
                [
                  { label: 'on', value: 'on' },
                  { label: 'off', value: 'off' },
                  { label: 'nonewlines', value: 'nonewlines' },
                ] as { label: string; value: SentenceSplittingMode }[]
              }
              placeholder="splitSentences"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedSettings;
