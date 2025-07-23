export const sourceLanguages = [
  {
    name: 'arabic',
    code: 'ar',
  },
  {
    name: 'Bulgarian',
    code: 'bg',
  },
  {
    name: 'Czech',
    code: 'cs',
  },
  {
    name: 'Danish',
    code: 'da',
  },
  {
    name: 'German',
    code: 'de',
  },
  {
    name: 'Greek',
    code: 'el',
  },
  {
    name: 'English',
    code: 'en',
  },
  {
    name: 'Spanish',
    code: 'es',
  },
  {
    name: 'Estonian',
    code: 'et',
  },
  {
    name: 'Finnish',
    code: 'fi',
  },
  {
    name: 'French',
    code: 'fr',
  },
  {
    name: 'Hungarian',
    code: 'hu',
  },
  {
    name: 'Indonesian',
    code: 'id',
  },
  {
    name: 'Italian',
    code: 'it',
  },
  {
    name: 'Japanese',
    code: 'ja',
  },
  {
    name: 'Korean',
    code: 'ko',
  },
  {
    name: 'Lithuanian',
    code: 'lt',
  },
  {
    name: 'Latvian',
    code: 'lv',
  },
  {
    name: 'Norwegian',
    code: 'nb',
  },
  {
    name: 'Dutch',
    code: 'nl',
  },
  {
    name: 'Polish',
    code: 'pl',
  },
  {
    name: 'Portuguese',
    code: 'pt',
  },
  {
    name: 'Romanian',
    code: 'ro',
  },
  {
    name: 'Russian',
    code: 'ru',
  },
  {
    name: 'Slovak',
    code: 'sk',
  },
  {
    name: 'Slovenian',
    code: 'sl',
  },
  {
    name: 'Swedish',
    code: 'sv',
  },
  {
    name: 'Turkish',
    code: 'tr',
  },
  {
    name: 'Ukrainian',
    code: 'uk',
  },
  {
    name: 'Chinese',
    code: 'zh',
  },
];

export const targetLanguages = 
  [
    {
      name: 'Arabic',
      code: 'ar',
      supportsFormality: false,
    },
    {
      name: 'Bulgarian',
      code: 'bg',
      supportsFormality: false,
    },
    {
      name: 'Czech',
      code: 'cs',
      supportsFormality: false,
    },
    {
      name: 'Danish',
      code: 'da',
      supportsFormality: false,
    },
    {
      name: 'German',
      code: 'de',
      supportsFormality: true,
    },
    {
      name: 'Greek',
      code: 'el',
      supportsFormality: false,
    },
    {
      name: 'English (British)',
      code: 'en-GB',
      supportsFormality: false,
    },
    {
      name: 'English (American)',
      code: 'en-US',
      supportsFormality: false,
    },
    {
      name: 'Spanish',
      code: 'es',
      supportsFormality: true,
    },
    {
      name: 'Estonian',
      code: 'et',
      supportsFormality: false,
    },
    {
      name: 'Finnish',
      code: 'fi',
      supportsFormality: false,
    },
    {
      name: 'French',
      code: 'fr',
      supportsFormality: true,
    },
    {
      name: 'Hungarian',
      code: 'hu',
      supportsFormality: false,
    },
    {
      name: 'Indonesian',
      code: 'id',
      supportsFormality: false,
    },
    {
      name: 'Italian',
      code: 'it',
      supportsFormality: true,
    },
    {
      name: 'Japanese',
      code: 'ja',
      supportsFormality: true,
    },
    {
      name: 'Korean',
      code: 'ko',
      supportsFormality: false,
    },
    {
      name: 'Lithuanian',
      code: 'lt',
      supportsFormality: false,
    },
    {
      name: 'Latvian',
      code: 'lv',
      supportsFormality: false,
    },
    {
      name: 'Norwegian',
      code: 'nb',
      supportsFormality: false,
    },
    {
      name: 'Dutch',
      code: 'nl',
      supportsFormality: true,
    },
    {
      name: 'Polish',
      code: 'pl',
      supportsFormality: true,
    },
    {
      name: 'Portuguese (Brazilian)',
      code: 'pt-BR',
      supportsFormality: true,
    },
    {
      name: 'Portuguese (European)',
      code: 'pt-PT',
      supportsFormality: true,
    },
    {
      name: 'Romanian',
      code: 'ro',
      supportsFormality: false,
    },
    {
      name: 'Russian',
      code: 'ru',
      supportsFormality: true,
    },
    {
      name: 'Slovak',
      code: 'sk',
      supportsFormality: false,
    },
    {
      name: 'Slovenian',
      code: 'sl',
      supportsFormality: false,
    },
    {
      name: 'Swedish',
      code: 'sv',
      supportsFormality: false,
    },
    {
      name: 'Turkish',
      code: 'tr',
      supportsFormality: false,
    },
    {
      name: 'Ukrainian',
      code: 'uk',
      supportsFormality: false,
    },
    {
      name: 'Chinese (simplified)',
      code: 'zh-HANS',
      supportsFormality: false,
    },
    {
      name: 'Chinese (traditional)',
      code: 'zh-HANT',
      supportsFormality: false,
  },
];

export const LANGUAGES = {
  ...sourceLanguages,
  ...targetLanguages,
};

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
