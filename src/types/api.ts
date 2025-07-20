import { TranslateTextOptions } from "deepl-node";

export interface TranslateRequest extends TranslateTextOptions {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
}
