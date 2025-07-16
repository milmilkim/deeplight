import { AxiosError } from 'axios';
import * as deepl from 'deepl-node';

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

export async function POST(req: Request) {
  console.log('translate');
  const apiKey =
    req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const body = (await req.json()) as TranslateRequest;
  console.log(body);

  const deeplClient = new deepl.DeepLClient(apiKey);

  try {
    const response = await deeplClient.translateText(
      body.text,
      body.sourceLang as deepl.SourceLanguageCode,
      body.targetLang as deepl.TargetLanguageCode,
    );

    return Response.json(response.text);
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const message =
        err.response?.data?.message || err.message || 'Unknown error';
      return new Response(message, { status: err.response?.status || 500 });
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}
