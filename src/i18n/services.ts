'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'i18n';

export async function getUserLocale() {
  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value;
  if (cookieLocale) return cookieLocale;

  // 헤더에서 언어 감지
  if (typeof window === 'undefined') {
    // 서버 환경: next/headers의 headers() 사용
    const { headers } = await import('next/headers');
    const acceptLanguage = (await headers()).get('accept-language');
    if (acceptLanguage) {
      // 예: 'ko,en-US;q=0.9,en;q=0.8'
      const lang = acceptLanguage.split(',')[0].split('-')[0];
      if (lang) return lang;
    }
  } else if (typeof navigator !== 'undefined') {
    // 클라이언트 환경: navigator.language 사용
    const lang = navigator.language?.split('-')[0];
    if (lang) return lang;
  }

  return 'en';
}

export async function setUserLocale(locale: string) {
  (await cookies()).set(COOKIE_NAME, locale);
}
