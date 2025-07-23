import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from '@/locales/en/common.json';
import commonKo from '@/locales/ko/common.json';


i18n
  .use(LanguageDetector) // 사용자 언어 자동 감지
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // 폴백
    resources: {
      en: {
        common: commonEn,
      },
      ko: {
        common: commonKo,
      },
    },
    ns: ['enFront','common'], // 로드할 네임스페이스의 문자열 또는 배열
    defaultNS: 'common', // 기본값 : translation, 번역기능에 전달되지 않은 경우 사용되는 기본 네임스페이스
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
