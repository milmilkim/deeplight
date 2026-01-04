import { TranslateTextOptions } from 'deepl-node';

export interface DeepLTranslateRequest extends TranslateTextOptions {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
}

export interface AiTranslateRequest {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  baseUrl: string;
}
