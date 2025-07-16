export interface TranslateRequest {
  text: string;
  context?: string;
  show_billed_characters?: boolean;
  sourceLang: string;
  targetLang: string;
}
