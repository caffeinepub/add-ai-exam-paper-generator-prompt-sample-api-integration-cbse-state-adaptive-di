/**
 * Configuration for generic LLM API integration.
 * Reads from environment variables and validates configuration.
 */

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  headers: Record<string, string>;
}

export interface LLMConfigValidation {
  isValid: boolean;
  config?: LLMConfig;
  error?: string;
}

/**
 * Validates and returns LLM configuration from environment variables.
 * Returns validation result with user-friendly error messages.
 */
export function validateLLMConfig(): LLMConfigValidation {
  const apiKey = import.meta.env.VITE_LLM_API_KEY?.trim();
  const baseUrl = import.meta.env.VITE_LLM_API_URL?.trim() || 'https://api.openai.com/v1';
  const model = import.meta.env.VITE_LLM_MODEL?.trim() || 'gpt-4';

  // Check if API key is configured
  if (!apiKey || apiKey === '') {
    return {
      isValid: false,
      error: 'LLM API is not configured. To enable AI features, please set the VITE_LLM_API_KEY environment variable. See LLM_DEMO_SETUP.md for instructions.'
    };
  }

  return {
    isValid: true,
    config: {
      baseUrl,
      apiKey,
      model,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  };
}

/**
 * Get LLM configuration from environment (legacy - use validateLLMConfig instead)
 * @deprecated Use validateLLMConfig for proper validation
 */
export function getLLMConfig(): LLMConfig {
  const validation = validateLLMConfig();
  if (!validation.isValid || !validation.config) {
    throw new Error(validation.error || 'LLM configuration is invalid');
  }
  return validation.config;
}

/**
 * Build the request payload for chat completion APIs
 */
export function buildLLMRequest(systemPrompt: string, userPrompt: string, config: LLMConfig) {
  return {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' } // Request JSON mode if supported
  };
}
