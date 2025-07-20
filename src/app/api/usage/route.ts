import * as deepl from 'deepl-node';

export async function GET(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const deeplClient = new deepl.DeepLClient(apiKey);

  try {
    const usage = await deeplClient.getUsage();
    return Response.json(usage);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(message);
    return new Response(message, { status: 500 });
  }
}
