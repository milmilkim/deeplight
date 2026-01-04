import OpenAI from 'openai';

const createGeminiTranslator = (key: string) => {
  const client = new OpenAI({
    apiKey: key,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  const translate = async (text: string, source: string, target: string) => {
    const completion = await client.chat.completions.create({
      model: 'gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: `당신은 번역가입니다. 유저의 ${source} 언어 텍스트를 ${target} 언어로 자연스럽게 번역해주세요.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    return completion.choices[0].message;
  };
  return { translate };
};

export { createGeminiTranslator };
