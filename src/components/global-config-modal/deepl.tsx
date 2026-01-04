import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslations } from 'next-intl';
import { GlobalConfig } from '@/types/global-config';
import { Button } from '../ui/button';
import { Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Usage } from 'deepl-node';
import { Progress } from '../ui/progress';

interface DeepLProps {
  updateTempConfig: (newConfig: Partial<GlobalConfig>) => void;
  tempConfig: GlobalConfig;
}

const DeepL = ({ updateTempConfig, tempConfig }: DeepLProps) => {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const t = useTranslations('common');

  const getUsage = async () => {
    const { data } = await axios.get<Usage>('/api/usage', {
      headers: {
        'x-api-key': tempConfig.deepLConfig.apiKey,
      },
    });
    return data;
  };

  const handleChangeApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTempConfig({
      deepLConfig: {
        apiKey: e.target.value,
      },
    });
  };

  const {
    data: usage,
    isFetching: isLoadingUsage,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['usage'],
    queryFn: () => getUsage(),
    enabled: !!tempConfig.deepLConfig.apiKey,
  });

  return (
    <div className="flex w-full flex-col">
      <div className=" text-lg font-bold">DeepL</div>
      <div className="w-full max-w-sm items-center gap-3 mt-4">
        <Label htmlFor="api-key">{t('config.apiKey')}</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            type={apiKeyVisible ? 'text' : 'password'}
            id="api-key"
            placeholder={t('config.apiKey')}
            value={tempConfig.deepLConfig.apiKey}
            onChange={handleChangeApiKey}
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
          <Button variant="outline" size="icon" onClick={() => refetchUsage()}>
            <RefreshCcw />
          </Button>
          {isLoadingUsage ? (
            'loading'
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div>
                {usage?.character?.count.toLocaleString('ko-KR') || 0} /{' '}
                {usage?.character?.limit.toLocaleString('ko-KR') || 0}
              </div>
              <Progress
                value={usage?.character?.count ?? 0}
                max={usage?.character?.limit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepL;
