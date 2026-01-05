import { TranslateTextOptions } from 'deepl-node';
import { CompletionParameters } from './global-config';

export interface DeepLTranslateRequest extends TranslateTextOptions {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
}

export interface AiTranslateRequest extends CompletionParameters {
  text: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  baseUrl?: string;
}
