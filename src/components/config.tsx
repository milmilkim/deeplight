import { useEffect, useState } from 'react';
import { Eye, EyeOff, RefreshCcw, Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useConfigStore } from '../stores/configStore';
import axios from 'axios';
import { Usage } from 'deepl-node';
import { useQuery } from '@tanstack/react-query';
import { Progress } from './ui/progress';
import { useTranslation } from 'react-i18next';

const Config = () => {
  const [open, setOpen] = useState(false);
  const { config, saveConfig } = useConfigStore();
  const [tempConfig, setTempConfig] = useState(config);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const { t } = useTranslation();

  const handleSave = async () => {
    await saveConfig(tempConfig);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempConfig({ ...tempConfig, apiKey: e.target.value });
  };

  const getUsage = async () => {
    const { data } = await axios.get<Usage>('/api/usage', {
      headers: {
        'x-api-key': tempConfig.apiKey,
      },
    });
    return data;
  };

  const {
    data: usage,
    isFetching: isLoadingUsage,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['usage'],
    queryFn: () => getUsage(),
    enabled: !!tempConfig.apiKey,
  });

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
              <Label htmlFor="api-key">{t('config.apiKey')}</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type={apiKeyVisible ? 'text' : 'password'}
                  id="api-key"
                  placeholder={t('config.apiKey')}
                  value={tempConfig.apiKey}
                  onChange={handleChange}
                  name="apiKey"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setApiKeyVisible((prev) => !prev);
                  }}
                >
                  {apiKeyVisible ? <Eye /> : <EyeOff />}
                </Button>
              </div>
            </div>

            <div className="my-4">
              <Label>{t('config.apiKeyUsage')}</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchUsage()}
                >
                  <RefreshCcw />
                </Button>
                {isLoadingUsage ? (
                  'loading'
                ) : (
                  <div className="flex flex-col gap-2">
                    <div>
                      {usage?.character?.count.toLocaleString('ko-KR') || 0} /{' '}
                      {usage?.character?.limit.toLocaleString('ko-KR') || 0}
                    </div>
                    <Progress value={33} max={usage?.character?.limit} />
                  </div>
                )}
              </div>
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
