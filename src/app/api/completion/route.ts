import OpenAI from 'openai';
import { AiTranslateRequest } from '@/types/api';
import { DEFAULT_CONFIG } from '@/types/global-config';
import { ApiErrorResponse } from '@/types/api-error';
import { sourceLanguages, targetLanguages } from '../../../config/languages';

// Helper to get language name from code
function getLanguageName(code: string): string {
  const source = sourceLanguages.find((l) => l.code === code);
  if (source) return source.name;

  const target = targetLanguages.find((l) => l.code === code);
  if (target) return target.name;

  return code; // Fallback to code if not found
}

// Helper to replaced placeholders in prompt
function processSystemPrompt(promptTemplate: string, sourceLang: string, targetLang: string): string {
  const sourceName = getLanguageName(sourceLang);
  const targetName = getLanguageName(targetLang);

  return promptTemplate
    .replace(/{{source_lang}}/g, sourceName)
    .replace(/{{target_lang}}/g, targetName);
}

// Error parsing helper
function parseErrorResponse(errorBody: any): ApiErrorResponse {
  // Case 1: Gemini Array Format [{ error: { ... } }]
  if (Array.isArray(errorBody) && errorBody.length > 0) {
    const firstError = errorBody[0];
    if (firstError.error) {
      return {
        error: firstError.error.message || 'Unknown Gemini error',
        code: firstError.error.code,
        status: firstError.error.status
      };
    }
  }

  // Case 2: Standard OpenAI/HTTP Object Format { error: { ... } }
  if (errorBody?.error) {
    // If nested error object
    if (typeof errorBody.error === 'object') {
      return {
        error: errorBody.error.message || 'Unknown API error',
        code: errorBody.error.code,
        status: errorBody.error.status || errorBody.error.type
      };
    }
    // If error is just a string
    if (typeof errorBody.error === 'string') {
      return { error: errorBody.error };
    }
  }

  // Fallback
  return { error: 'Failed to parse error response' };
}

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Missing API key', { status: 400 });

  const body = (await req.json()) as AiTranslateRequest;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: body.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/openai/',
    timeout: 15 * 60 * 1000, // 15 minutes timeout
  });

  // Prepare System Prompt
  // Client is responsible for providing the full system prompt (main + fragments)
  const promptTemplate = body.systemPrompt || '';
  const systemMessageContent = processSystemPrompt(promptTemplate, body.sourceLang, body.targetLang);

  console.log(systemMessageContent)

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemMessageContent,
    },
    {
      role: 'user',
      content: body.text,
    },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: body.model ?? DEFAULT_CONFIG?.translatorConfig?.model ?? 'gemini-3-flash-preview',
      temperature: body.temperature ?? DEFAULT_CONFIG?.translatorConfig?.temperature ?? 0.2,
      reasoning_effort: body.reasoning_effort ?? 'low',
      ...(body.serviceTier === 'flex' ? { service_tier: 'flex' } : {}),
      messages: messages,
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
              messages: messages,
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

    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message } as ApiErrorResponse, { status: 500 });
  }
}
