/**
 * React Query mutation hook for generating exam papers.
 * Manages loading, error, and success states.
 */

import { useMutation } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { ExamRequest } from './examTypes';
import { generateExamPaperSample, type GenerateExamPaperResult } from './generateExamPaperSample';

export function useGenerateExamPaper() {
  const { actor } = useActor();

  return useMutation<GenerateExamPaperResult, Error, ExamRequest>({
    mutationFn: async (request: ExamRequest) => {
      if (!actor) {
        throw new Error('Backend actor not available');
      }
      return generateExamPaperSample(actor, request);
    },
  });
}
