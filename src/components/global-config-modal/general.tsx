import { TranslatorConfig, AVAILABLE_MODELS } from '@/types/global-config';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import PSelect from '../p-select';
import OpenAI from 'openai';
import { sourceLanguages } from '@/config/languages';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GeneralProps {
  config: Partial<TranslatorConfig>;
  updateConfig: (updates: Partial<TranslatorConfig>) => void;
}

const General = ({ config, updateConfig }: GeneralProps) => {
  const tLang = useTranslations('lang');
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const handleChangeTemperature = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({
      temperature: Number(e.target.value),
    });
  };

  const handleToggleLanguage = (langCode: string) => {
    const currentLanguages = config.languages ?? ['ko', 'en'];
    const isSelected = currentLanguages.includes(langCode);

    const newLanguages = isSelected
      ? currentLanguages.filter((code) => code !== langCode)
      : [...currentLanguages, langCode];

    updateConfig({ languages: newLanguages });
  };

  const handleToggleModel = (modelId: string) => {
    const currentModels = config.enabledModels ?? [];
    const isSelected = currentModels.includes(modelId);

    const newModels = isSelected
      ? currentModels.filter((id) => id !== modelId)
      : [...currentModels, modelId];

    updateConfig({ enabledModels: newModels });
  };

  const selectedCount = (config.languages ?? ['ko', 'en']).length;
  const selectedModelsCount = (config.enabledModels ?? []).length;

  return (
    <div className="flex w-full flex-col">
      <div className=" text-lg font-bold">General</div>
      <div className="w-full max-w-sm items-center gap-3 mt-4">
        <Label htmlFor="temperature">temperature (default: 0.2)</Label>
        <Input
          value={config?.temperature ?? 0.2}
          className="mt-2"
          name="temperature"
          id="temperature"
          type="number"
          min="0.1"
          max="2"
          step="0.1"
          onChange={handleChangeTemperature}
        />

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <Label className="cursor-pointer">
              Languages ({selectedCount} selected)
            </Label>
            {isLanguagesOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isLanguagesOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto border rounded-md p-3">
              {sourceLanguages.map((lang) => {
                const isSelected = (config.languages ?? ['ko', 'en']).includes(
                  lang.code,
                );
                return (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang.code}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleLanguage(lang.code)}
                    />
                    <label
                      htmlFor={`lang-${lang.code}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {tLang(lang.code)}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between w-full text-left mb-2">
            <Label>Models ({selectedModelsCount} enabled)</Label>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = (config.enabledModels ?? []).includes(model.id);
              return (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggleModel(model.id)}
                  />
                  <label
                    htmlFor={`model-${model.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <span>{model.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {model.provider}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default General;
