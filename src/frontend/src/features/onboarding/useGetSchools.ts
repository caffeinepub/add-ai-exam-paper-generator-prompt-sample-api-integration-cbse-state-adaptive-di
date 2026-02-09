/**
 * React Query hook to fetch available schools.
 */

import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { School } from '../../backend';

export function useGetSchools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSchools();
    },
    enabled: !!actor && !actorFetching,
  });
}
