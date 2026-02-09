/**
 * Generates tutor responses using the configured LLM API.
 * Uses the same configuration pattern as the exam generator.
 */

import { validateLLMConfig, buildLLMRequest } from '../examGenerator/llmConfig';
import { TUTOR_SYSTEM_PROMPT } from './tutorSystemPrompt';
import { buildTutorUserPrompt } from './buildTutorUserPrompt';

interface TutorRequestParams {
  grade: number;
  subject: string;
  topic: string;
  question: string;
}

export async function generateTutorResponse(params: TutorRequestParams): Promise<string> {
  // Validate configuration before making request
  const configValidation = validateLLMConfig();
  if (!configValidation.isValid || !configValidation.config) {
    throw new Error(configValidation.error || 'LLM configuration is invalid');
  }

  const config = configValidation.config;
  const userPrompt = buildTutorUserPrompt(params);
  const requestBody = {
    ...buildLLMRequest(TUTOR_SYSTEM_PROMPT, userPrompt, config),
    response_format: undefined, // Remove JSON mode for natural text responses
  };

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`LLM API request failed with status ${response.status}. Please check your API configuration and try again.`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content received from LLM API');
    }

    return content.trim();
  } catch (error: any) {
    // Avoid logging sensitive request details
    const userMessage = error.message || 'Failed to generate tutor response. Please check your network connection and try again.';
    throw new Error(userMessage);
  }
}
