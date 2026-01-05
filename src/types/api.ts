import { TranslateTextOptions } from 'deepl-node';
import OpenAI from 'openai';

export interface DeepLTranslateRequest extends TranslateTextOptions {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
}

export interface AiTranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  model: string;
  temperature?: number;
  reasoning_effort?: OpenAI.ReasoningEffort;
  serviceTier?: 'auto' | 'flex';
  systemPrompt?: string;
  baseUrl?: string;
}
