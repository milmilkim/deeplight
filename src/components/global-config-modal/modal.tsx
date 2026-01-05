import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useConfigStore } from '../../stores/configStore';
import { useTranslations } from 'next-intl';
import DeepL from './deepl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Google from './google';
import OpenAi from './openai';
import { useConfigUpdater } from '@/hooks/useConfigUpdater';
import General from './general';

const Config = () => {
  const [open, setOpen] = useState(false);
  const { config, updateConfig } = useConfigStore();
  const [tempConfig, setTempConfig] = useState(config);

  const t = useTranslations('common');

  // Sync tempConfig when config changes or modal opens
  useEffect(() => {
    if (open) {
      setTempConfig(config);
    }
  }, [config, open]);

  const handleSave = () => {
    updateConfig(tempConfig);
    setOpen(false);
  };

  // 공통 훅으로 각 프로바이더별 updater 생성
  const updateOpenAIConfig = useConfigUpdater(
    setTempConfig,
    (draft) => draft.llmConfig.openAIConfig,
  );

  const updateGoogleConfig = useConfigUpdater(
    setTempConfig,
    (draft) => draft.llmConfig.googleConfig,
  );

  const updateDeepLConfig = useConfigUpdater(
    setTempConfig,
    (draft) => draft.deepLConfig,
  );

  const updateTranslatorConfig = useConfigUpdater(
    setTempConfig,
    (draft) => draft.translatorConfig,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col max-w-4xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="mb-4">{t('config.header')}</DialogTitle>
        </DialogHeader>
        <div className="flex w-full flex-col overflow-y-auto flex-1 min-h-0">
          <div className="w-full h-full">
            <Tabs defaultValue="general" className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
                <TabsTrigger value="openai">Open AI</TabsTrigger>
                {/* <TabsTrigger value="custom">Custom API</TabsTrigger> */}
                <TabsTrigger value="deepl">DeepL</TabsTrigger>
              </TabsList>
              <div className="mt-4 flex-1 h-full min-h-0">
                <TabsContent value="general">
                  <General
                    config={tempConfig.translatorConfig}
                    updateConfig={updateTranslatorConfig}
                  />
                </TabsContent>
                <TabsContent value="deepl">
                  <DeepL
                    config={tempConfig.deepLConfig}
                    updateConfig={updateDeepLConfig}
                  />
                </TabsContent>
                <TabsContent value="google">
                  <Google
                    config={tempConfig.llmConfig.googleConfig}
                    updateConfig={updateGoogleConfig}
                  />
                </TabsContent>
                <TabsContent value="openai">
                  <OpenAi
                    config={tempConfig.llmConfig.openAIConfig}
                    updateConfig={updateOpenAIConfig}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 mt-4">
          <DialogClose asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Config;
