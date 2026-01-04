import { AiTranslateRequest } from '@/types/api';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const body = (await req.json()) as AiTranslateRequest;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  try {
    const completion = await client.chat.completions.create({
      model: body.model,
      temperature: 0.2,
      reasoning_effort: 'low',
      max_completion_tokens: 4000,

      messages: [
        {
          role: 'system',
          content: `당신은 번역가입니다. 유저의 ${body.sourceLang} 언어 텍스트를 ${body.targetLang} 언어로 자연스럽게 번역해주세요.`,
        },
        {
          role: 'user',
          content: body.text,
        },
      ],
    });

    return Response.json(completion);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(message);
    return new Response(message, { status: 500 });
  }
}
