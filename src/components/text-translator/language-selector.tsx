import { useTranslations } from 'next-intl';
import PSelect from '../p-select';
import {
  sourceLanguages,
  targetLanguages,
} from '@/config/languages';
import { Option } from '@/components/p-select';
import { Button } from '../ui/button';
import { ArrowLeftRight } from 'lucide-react';

interface LanguageSelectorProps {
  onSourceLanguageChange?: (value: string) => void;
  onTargetLanguageChange?: (value: string) => void;
  sourceLanguageValue?: string;
  targetLanguageValue?: string;
  onClickSwap?: () => void;
  isTranslating?: boolean;
}

const LanguageSelector = ({
  onSourceLanguageChange,
  sourceLanguageValue,
  targetLanguageValue,
  isTranslating,
  onClickSwap,
  onTargetLanguageChange
}: LanguageSelectorProps) => {
  const t = useTranslations('textTranslate');
  const tLang = useTranslations('lang');

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

  return (
    <>
      <div className="flex-1 flex justify-end">
        <PSelect
          className="w-full sm:w-[180px]"
          options={sourceLanguageOptions}
          placeholder={t('autoDetect')}
          onChange={(value) => {
            onSourceLanguageChange && onSourceLanguageChange(value);
          }}
          value={sourceLanguageValue}
          disalbed={isTranslating}
        />
      </div>
      <Button variant={'ghost'} onClick={() => onClickSwap && onClickSwap()}>
        <ArrowLeftRight />
      </Button>
      <div className="flex-1">
        <PSelect
          className="w-full sm:w-[180px]"
          options={targetLanguageOptions}
          onChange={(value) => {
            onTargetLanguageChange && onTargetLanguageChange(value)
          }}
          value={targetLanguageValue}
          disalbed={isTranslating}
          placeholder={t('placeholder.targetLanguage')}
        />
      </div>
    </>
  );
};

export default LanguageSelector;