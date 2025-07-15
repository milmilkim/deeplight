import axios from 'axios';
import { AxiosError } from 'axios';

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const body = (await req.json()) as TranslateRequest;

  const form = new URLSearchParams({
    text: body.text,
    target_lang: body.targetLang,
    ...(body.sourceLang ? { source_lang: body.sourceLang } : {}),
    tag_handling: 'html',
    model_type: 'latency_optimized',
  });

  try {
    const response = await axios.post('https://api-free.deepl.com/v2/translate', form.toString(), {
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return Response.json(response.data);
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      return new Response(message, { status: err.response?.status || 500 });
    }
    // 일반 Error 처리
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}
