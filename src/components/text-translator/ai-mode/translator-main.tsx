import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import CopyButton from '../copy-button';
import ContentTextarea from '../content-textarea';
import LanguageSelector from '../language-selector';
import ModelSelector from '../model-selector';
import PromptSelector from '../prompt-selector';
import {
  AiTextTranslateProvider,
  useAiTextTranslate,
} from '@/contexts/ai-text-translate-context';
import { swapLangCode } from '@/config/languages';
import { useTranslation } from './use-translation';

const TranslatorMainContent = () => {
  const t = useTranslations('textTranslate');

  const { transRequest, setTransRequest, result, setResult } =
    useAiTextTranslate();

  const { mutate: translate, isPending: isTranslating } = useTranslation({
    setResult,
  });

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
      <div className="md:grid md:grid-cols-2 gap-2 mt-2">
        <ContentTextarea
          name="text"
          isTranslating={isTranslating}
          value={transRequest.text}
          onChange={handleChange}
          placeholder={t('placeholder.text')}
          footer={
            <>
              <PromptSelector />
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
