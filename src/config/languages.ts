export const LANGUAGES = [
  // 소스 언어
  {
    code: 'ar',
    label: '아랍어',
  },
  {
    code: 'bg',
    label: '불가리아어',
  },
  {
    code: 'cs',
    label: '체코어',
  },
  {
    code: 'da',
    label: '덴마크어',
  },
  {
    code: 'de',
    label: '독일어',
  },
  {
    code: 'el',
    label: '그리스어',
  },
  {
    code: 'en',
    label: '영어',
  },
  {
    code: 'es',
    label: '스페인어',
  },
  {
    code: 'et',
    label: '에스토니아어',
  },
  {
    code: 'fi',
    label: '핀란드어',
  },
  {
    code: 'fr',
    label: '프랑스어',
  },
  {
    code: 'hu',
    label: '헝가리어',
  },
  {
    code: 'id',
    label: '인도네시아어',
  },
  {
    code: 'it',
    label: '이탈리아어',
  },
  {
    code: 'ja',
    label: '일본어',
  },
  {
    code: 'ko',
    label: '한국어',
  },
  {
    code: 'lt',
    label: '리투아니아어',
  },
  {
    code: 'lv',
    label: '라트비아어',
  },
  {
    code: 'nb',
    label: '노르웨이어',
  },
  {
    code: 'nl',
    label: '네덜란드어',
  },
  {
    code: 'pl',
    label: '폴란드어',
  },
  {
    code: 'pt',
    label: '포르투갈어',
  },
  {
    code: 'ro',
    label: '루마니아어',
  },
  {
    code: 'ru',
    label: '러시아어',
  },
  {
    code: 'sk',
    label: '슬로바키아어',
  },
  {
    code: 'sl',
    label: '슬로베니아어',
  },
  {
    code: 'sv',
    label: '스웨덴어',
  },
  {
    code: 'tr',
    label: '터키어',
  },
  {
    code: 'uk',
    label: '우크라이나어',
  },
  {
    code: 'zh',
    label: '중국어',
  },
  {
    code: 'en-GB',
    label: '영어(영국)',
  },
  {
    code: 'en-US',
    label: '영어(미국)',
  },
  {
    code: 'pt-BR',
    label: '포르투갈어(브라질)',
  },
  {
    code: 'pt-PT',
    label: '포르투갈어(유럽)',
  },
  {
    code: 'zh-HANS',
    label: '중국어(간체)',
  },
  {
    code: 'zh-HANT',
    label: '중국어(번체)',
  },
];

export const SWAP_MAP: Record<string, string> = {
  // source → target
  en: 'en-US',
  'en-US': 'en',
  'en-GB': 'en',
  pt: 'pt-BR',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  zh: 'zh-HANS',
  'zh-HANS': 'zh',
  'zh-HANT': 'zh',
};

export function swapLangCode(source: string, target: string) {
  return {
    newSource: SWAP_MAP[target] || target,
    newTarget: SWAP_MAP[source] || source,
  };
}

export function getLabelByCode(code: string) {
  const lang = LANGUAGES.find((l) => l.code === code);
  return lang ? lang.label : code;
}
