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

  const { transRequest, setTransRequest, result, setResult, usage, setUsage } =
    useAiTextTranslate();

  const { mutate: translate, isPending: isTranslating } = useTranslation({
    setResult,
    setUsage,
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
              <div className="flex-1 min-w-2" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  {transRequest.text.length}
                </span>
                <CopyButton
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(transRequest.text);
                      // alert(t('alert.copySuccess'));
                    } catch (error) {
                      // alert(t('alert.copyError'));
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
              </div>
            </>
          }
        />
        <ContentTextarea
          isTranslating={isTranslating}
          value={result}
          readOnly
          footer={
            <>

              <div className="flex-1 min-w-2" />
              <div className="flex items-center gap-2">
                {usage && (
                  <div className="flex gap-2 text-[10px] text-muted-foreground mr-1">
                    <span>In: {usage.prompt_tokens}</span>
                    <span>Out: {usage.completion_tokens}</span>
                    {usage.total_tokens && <span>Total: {usage.total_tokens}</span>}
                  </div>
                )}
                <CopyButton
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result);
                      // alert(t('alert.copySuccess'));
                    } catch (error) {
                      // alert(t('alert.copyError'));
                      console.error(error);
                    }
                  }}
                />
              </div>
            </>
          }
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
