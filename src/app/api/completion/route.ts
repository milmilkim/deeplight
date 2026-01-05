import { AiTranslateRequest } from '@/types/api';
import { DEFAULT_CONFIG } from '@/types/global-config';
import { ApiErrorResponse } from '@/types/api-error';
import OpenAI from 'openai';

// Helper to parse error response from Gemini or OpenAI
function parseErrorResponse(rawJson: any): ApiErrorResponse {
  let errorMessage = 'API request failed';
  let errorCode: number | undefined;
  let errorStatus: string | undefined;

  // Gemini format: [{ "error": { "code": 400, "message": "...", "status": "INVALID_ARGUMENT" } }]
  if (Array.isArray(rawJson) && rawJson.length > 0 && rawJson[0]?.error) {
    const geminiError = rawJson[0].error;
    errorMessage = geminiError.message || errorMessage;
    errorCode = geminiError.code;
    errorStatus = geminiError.status;
  }
  // OpenAI format: { "error": { "message": "...", "code": "..." } }
  else if (rawJson.error) {
    errorMessage = rawJson.error.message || rawJson.error || errorMessage;
    errorCode = rawJson.error.code;
    errorStatus = rawJson.error.type || rawJson.error.status;
  }
  // Simple message
  else if (rawJson.message) {
    errorMessage = rawJson.message;
  }

  return {
    error: errorMessage,
    code: errorCode,
    status: errorStatus
  };
}

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return Response.json(
      { error: 'Missing API key' } as ApiErrorResponse,
      { status: 400 }
    );
  }

  const body = (await req.json()) as AiTranslateRequest;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: body.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/openai/',
    timeout: 15 * 60 * 1000, // 15 minutes timeout
  });

  try {
    const completion = await client.chat.completions.create({
      model: body.model ?? DEFAULT_CONFIG?.translatorConfig?.model ?? 'gemini-3-flash-preview',
      temperature: body.temperature ?? DEFAULT_CONFIG?.translatorConfig?.temperature ?? 0.2,
      reasoning_effort: body.reasoning_effort ?? 'low',
      ...(body.serviceTier === 'flex' ? { service_tier: 'flex' } : {}),

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
    }, { timeout: 15 * 60 * 1000 });

    return Response.json(completion);
  } catch (err) {
    console.error('Translation API Error:', err);

    // Handle OpenAI API errors
    if (err instanceof OpenAI.APIError) {
      // If body is missing (gzip issue), try raw fetch to get actual error
      if (err.message.includes('no body')) {
        try {
          const baseUrl = body.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/openai/';
          const rawResponse = await fetch(`${baseUrl}chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: body.model ?? DEFAULT_CONFIG?.translatorConfig?.model ?? 'gemini-3-flash-preview',
              temperature: body.temperature ?? DEFAULT_CONFIG?.translatorConfig?.temperature ?? 0.2,
              reasoning_effort: body.reasoning_effort ?? 'low',
              ...(body.serviceTier === 'flex' ? { service_tier: 'flex' } : {}),
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
            }),
          });

          const rawText = await rawResponse.text();

          try {
            const rawJson = JSON.parse(rawText);
            const parsedError = parseErrorResponse(rawJson);
            return Response.json(parsedError, { status: err.status || 400 });
          } catch {
            return Response.json(
              { error: rawText || err.message } as ApiErrorResponse,
              { status: err.status || 400 }
            );
          }
        } catch (fetchErr) {
          console.error('Raw fetch also failed:', fetchErr);
        }
      }

      // Try to extract error from OpenAI.APIError object
      let errorMessage = err.message || 'API request failed';
      if (err.error && typeof err.error === 'object') {
        const errorObj = err.error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error?.message) {
          errorMessage = errorObj.error.message;
        }
      }

      return Response.json(
        {
          error: errorMessage,
          code: err.code,
          status: err.type
        } as ApiErrorResponse,
        { status: err.status || 500 }
      );
    }

    // Handle other errors
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json(
      { error: message } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
