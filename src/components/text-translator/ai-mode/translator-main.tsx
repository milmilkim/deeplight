import PSelect from '@/components/p-select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import CopyButton from '../copy-button';
import ContentTextarea from '../content-textarea';

const TranslatorMain = () => {
  const t = useTranslations('textTranslate');

  return (
    <div className="w-full">
      <div className="sm:grid sm:grid-cols-2 gap-2 mt-2">
        <ContentTextarea
          placeholder={t('placeholder.text')}
          footer={
            <>
              <CopyButton
                onClick={async () => {
                  try {
                    // await navigator.clipboard.writeText('TEMP');
                    alert(t('alert.copySuccess'));
                  } catch (error) {
                    alert(t('alert.copyError'));
                    console.error(error);
                  }
                }}
              />
              <Button>{t('button.translate')}</Button>
            </>
          }
        />
        <ContentTextarea />
      </div>
    </div>
  );
};

export default TranslatorMain;
