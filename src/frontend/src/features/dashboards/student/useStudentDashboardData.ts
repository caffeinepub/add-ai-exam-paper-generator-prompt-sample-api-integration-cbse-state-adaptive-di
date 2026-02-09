/**
 * React Query hooks for fetching student dashboard data.
 */

import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { TutoringSession } from '../../../backend';

export function useStudentDashboardData(studentId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  const recentActivityQuery = useQuery<TutoringSession[]>({
    queryKey: ['studentProgress', studentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentProgress(studentId);
    },
    enabled: !!actor && !actorFetching && studentId > BigInt(0),
  });

  const weeklySummaryQuery = useQuery({
    queryKey: ['weeklyProgressSummary', studentId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeeklyProgressSummary(studentId);
    },
    enabled: !!actor && !actorFetching && studentId > BigInt(0),
  });

  return {
    recentActivity: recentActivityQuery.data,
    weeklySummary: weeklySummaryQuery.data,
    isLoading: recentActivityQuery.isLoading || weeklySummaryQuery.isLoading,
  };
}
