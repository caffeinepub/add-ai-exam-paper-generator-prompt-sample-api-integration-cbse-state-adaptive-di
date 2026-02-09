/**
 * React Query hooks for fetching parent dashboard data.
 */

import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { UserProfile, TutoringSession } from '../../../backend';

export function useParentDashboardData(parentId: bigint, selectedStudentId?: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  const linkedStudentsQuery = useQuery<UserProfile[]>({
    queryKey: ['linkedStudents', parentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentsByParent(parentId);
    },
    enabled: !!actor && !actorFetching && parentId > BigInt(0),
  });

  const studentProgressQuery = useQuery<TutoringSession[]>({
    queryKey: ['studentProgress', selectedStudentId?.toString()],
    queryFn: async () => {
      if (!actor || !selectedStudentId) return [];
      return actor.getStudentProgress(selectedStudentId);
    },
    enabled: !!actor && !actorFetching && !!selectedStudentId && selectedStudentId > BigInt(0),
  });

  const studentSummaryQuery = useQuery({
    queryKey: ['weeklyProgressSummary', selectedStudentId?.toString()],
    queryFn: async () => {
      if (!actor || !selectedStudentId) return null;
      return actor.getWeeklyProgressSummary(selectedStudentId);
    },
    enabled: !!actor && !actorFetching && !!selectedStudentId && selectedStudentId > BigInt(0),
  });

  return {
    linkedStudents: linkedStudentsQuery.data,
    isLoading: linkedStudentsQuery.isLoading,
    studentProgress: studentProgressQuery.data,
    studentSummary: studentSummaryQuery.data,
  };
}
