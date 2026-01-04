import { useEffect, useState } from 'react';
import { Eye, EyeOff, RefreshCcw, Settings } from 'lucide-react';
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
import { Label } from '../ui/label';
import { useConfigStore } from '../../stores/configStore';
import { useTranslations } from 'next-intl';
import DeepL from './deepl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Google from './google';
import { GlobalConfig } from '@/types/global-config';

const Config = () => {
  const [open, setOpen] = useState(false);
  const { config, updateConfig } = useConfigStore();
  const [tempConfig, setTempConfig] = useState(config);

  const t = useTranslations('common');

  const handleSave = async () => {
    updateConfig(tempConfig);
    setOpen(false);
  };

  const updateTempConfig = (newConfig: Partial<GlobalConfig>) => {
    setTempConfig({ ...tempConfig, ...newConfig });
  };

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">{t('config.header')}</DialogTitle>
          <div className="flex w-full flex-col">
            <div className="w-full max-w-sm items-center gap-3">
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="deepl">DeepL</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                  {/* <TabsTrigger value="openai">Open AI</TabsTrigger>
                  <TabsTrigger value="custom">Custom API</TabsTrigger> */}
                </TabsList>
                <div className="mt-1">
                  <TabsContent value="deepl">
                    <DeepL
                      updateTempConfig={updateTempConfig}
                      tempConfig={tempConfig}
                    />
                  </TabsContent>
                  <TabsContent value="google">
                    <Google
                      updateTempConfig={updateTempConfig}
                      tempConfig={tempConfig}
                    />
                  </TabsContent>
                  {/* <TabsContent value="openai">
                    <OpenAI />
                  </TabsContent>
                  <TabsContent value="custom">
                    <Custom />
                  </TabsContent> */}
                </div>
              </Tabs>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
              <Button onClick={handleSave}>{t('save')}</Button>
            </DialogFooter>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Config;
