import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslations } from 'next-intl';
import { GoogleProviderConfig } from '@/types/global-config';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import PSelect from '../p-select';
import OpenAI from 'openai';

interface GoogleProps {
  config: GoogleProviderConfig;
  updateConfig: (updates: Partial<GoogleProviderConfig>) => void;
}

const Google = ({ config, updateConfig }: GoogleProps) => {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const t = useTranslations('common');

  const handleChangeApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ apiKey: e.target.value });
  };

  return (
    <div className="flex w-full flex-col">
      <div className=" text-lg font-bold">Google</div>
      <div className="w-full max-w-sm items-center gap-3 mt-4">
        <Label htmlFor="api-key">{t('config.apiKey')}</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            type={apiKeyVisible ? 'text' : 'password'}
            id="api-key"
            placeholder={t('config.apiKey')}
            value={config.apiKey ?? ''}
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

        <Label htmlFor="reasoning_effort" className="mt-4 block">
          reasoning effort (default: low)
        </Label>
        <PSelect
          value={config.modelOptions?.reasoning_effort ?? 'auto'}
          onChange={(v) =>
            updateConfig({
              modelOptions: {
                ...config.modelOptions,
                reasoning_effort: v === 'auto' ? undefined : (v as OpenAI.ReasoningEffort),
              },
            })
          }
          className="mt-2"
          name="reasoning_effort"
          options={[
            { label: 'Auto', value: 'auto' },
            { label: 'none', value: 'none' },
            { label: 'low', value: 'low' },
            { label: 'medium', value: 'medium' },
            { label: 'high', value: 'high' },
          ]}
        />
      </div>
    </div>
  );
};

export default Google;
