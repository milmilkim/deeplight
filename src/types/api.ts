import { type ModelType } from "deepl-node";

export interface TranslateRequest {
  text: string;
  context?: string;
  sourceLang: string;
  targetLang: string;
  model?: ModelType;
}
