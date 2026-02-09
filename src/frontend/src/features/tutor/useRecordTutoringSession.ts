/**
 * React Query mutation hook to record a tutoring session.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';

interface RecordSessionParams {
  studentId: bigint;
  subject: string;
  topic: string;
  understandingScore: bigint;
  correctnessScore: bigint;
}

export function useRecordTutoringSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RecordSessionParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordTutoringSession(
        params.studentId,
        params.subject,
        params.topic,
        params.understandingScore,
        params.correctnessScore
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProgress'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgressSummary'] });
      toast.success('Session saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save session');
    },
  });
}
