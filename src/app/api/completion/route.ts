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
  console.log(body);
  console.log(apiKey);

  let endpoint = body.baseUrl ?? DEFAULT_CONFIG?.translatorConfig?.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/openai/';

  // Prepare System Prompt
  const promptTemplate = body.systemPrompt || '';
  const systemMessageContent = processSystemPrompt(promptTemplate, body.sourceLang, body.targetLang);

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
    const payload = {
      model: body.model ?? DEFAULT_CONFIG?.translatorConfig?.model ?? 'gemini-3-flash-preview',
      temperature: body.temperature ?? DEFAULT_CONFIG?.translatorConfig?.temperature ?? 0.2,
      ...(body.reasoning_effort ? { reasoning_effort: body.reasoning_effort } : {}),
      ...(body.serviceTier === 'flex' ? { service_tier: 'flex' } : {}),
      messages: messages,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        const parsedError = parseErrorResponse(errorJson);
        return Response.json(parsedError, { status: response.status });
      } catch {
        return Response.json(
          { error: errorText || response.statusText } as ApiErrorResponse,
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    console.error('Translation API Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message } as ApiErrorResponse, { status: 500 });
  }
}
