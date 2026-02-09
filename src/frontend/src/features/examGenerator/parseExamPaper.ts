/**
 * Strict JSON parsing and validation for exam paper responses.
 * Provides user-friendly error messages for debugging.
 */

import type { ExamPaperResponse } from './examPaperTypes';
import { isValidExamPaperResponse } from './examPaperTypes';

export interface ParseResult {
  success: boolean;
  data?: ExamPaperResponse;
  error?: string;
  rawResponse?: string;
}

/**
 * Parse and validate LLM response as exam paper JSON
 */
export function parseExamPaper(responseText: string): ParseResult {
  // Store raw response for debugging
  const rawResponse = responseText;

  // Try to extract JSON if wrapped in markdown code blocks
  let jsonText = responseText.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    const match = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match) {
      jsonText = match[1].trim();
    }
  }

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawResponse
    };
  }

  // Validate structure
  if (!isValidExamPaperResponse(parsed)) {
    return {
      success: false,
      error: 'Response does not match expected exam paper schema. Check that all required fields are present and correctly typed.',
      rawResponse
    };
  }

  // Validate marks sum
  const totalMarks = parsed.examPaper.questions.reduce((sum, q) => sum + q.marks, 0);
  if (totalMarks !== parsed.examPaper.metadata.totalMarks) {
    return {
      success: false,
      error: `Marks validation failed: Questions sum to ${totalMarks} but metadata specifies ${parsed.examPaper.metadata.totalMarks}`,
      rawResponse
    };
  }

  return {
    success: true,
    data: parsed
  };
}
