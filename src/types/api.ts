import { TranslateTextOptions } from "deepl-node";

export interface DeePLTranslateRequest extends TranslateTextOptions {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
}
