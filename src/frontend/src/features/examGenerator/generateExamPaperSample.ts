/**
 * Sample integration that demonstrates calling an LLM API to generate exam papers.
 * This module orchestrates: prompt building → LLM API call → parse response.
 */

import type { backendInterface } from '../../backend';
import type { ExamRequest } from './examTypes';
import { validateLLMConfig, buildLLMRequest } from './llmConfig';
import { parseExamPaper, type ParseResult } from './parseExamPaper';
import EXAM_GENERATOR_SYSTEM_PROMPT from './examSystemPrompt';
import { buildUserPrompt } from './buildUserPrompt';
import { Board } from './examTypes';

export interface GenerateExamPaperResult {
  success: boolean;
  data?: ParseResult['data'];
  error?: string;
  rawResponse?: string;
}

/**
 * Generate an exam paper by building prompts and calling the configured LLM API.
 */
export async function generateExamPaperSample(
  actor: backendInterface,
  request: ExamRequest
): Promise<GenerateExamPaperResult> {
  try {
    // Step 1: Validate LLM configuration
    const configValidation = validateLLMConfig();
    if (!configValidation.isValid || !configValidation.config) {
      return {
        success: false,
        error: configValidation.error || 'LLM configuration is invalid'
      };
    }

    const config = configValidation.config;

    // Step 2: Build prompts
    const systemPrompt = EXAM_GENERATOR_SYSTEM_PROMPT;
    
    const userPrompt = buildUserPrompt({
      board: request.board,
      grade: Number(request.grade),
      subject: request.subject,
      chapters: request.syllabusScope.chapters,
      topics: request.syllabusScope.topics,
      duration: Number(request.duration),
      totalMarks: Number(request.totalMarks),
      difficultyTarget: request.difficultyTarget,
    });

    // Step 3: Build and send request to LLM API
    const requestBody = buildLLMRequest(systemPrompt, userPrompt, config);
    
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return {
        success: false,
        error: `LLM API request failed with status ${response.status}. Please check your API configuration and try again.`
      };
    }

    const responseData = await response.json();
    
    // Extract content from response (OpenAI format)
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: 'No content received from LLM API',
        rawResponse: JSON.stringify(responseData)
      };
    }

    // Step 4: Parse and validate the exam paper
    const parseResult = parseExamPaper(content);
    
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error,
        rawResponse: parseResult.rawResponse
      };
    }

    return {
      success: true,
      data: parseResult.data
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to generate exam paper. Please check your network connection and try again.`
    };
  }
}
