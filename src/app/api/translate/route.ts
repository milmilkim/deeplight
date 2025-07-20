import { TranslateRequest } from '@/types/api';
import * as deepl from 'deepl-node';

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const body = (await req.json()) as TranslateRequest;
  console.log(body);

  const deeplClient = new deepl.DeepLClient(apiKey);

  try {
    const response = await deeplClient.translateText(
      body.text,
      (body.sourceLang as deepl.SourceLanguageCode) || null,
      body.targetLang as deepl.TargetLanguageCode,
      {
        context: body.context,
        modelType: (body.modelType as deepl.ModelType) || undefined,
        formality: (body.formality as deepl.Formality) || undefined,
        splitSentences: (body.splitSentences as deepl.SentenceSplittingMode) || undefined,
        preserveFormatting: body.preserveFormatting || undefined,
        tagHandling: (body.tagHandling as deepl.TranslateTextOptions['tagHandling']) || undefined,
        outlineDetection: body.outlineDetection || undefined,
        splittingTags: body.splittingTags || undefined,
        nonSplittingTags: body.nonSplittingTags || undefined,
      },
    );

    return Response.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(message);
    return new Response(message, { status: 500 });
  }
}
