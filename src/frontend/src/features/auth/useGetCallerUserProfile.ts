/**
 * React Query hook to fetch the current user's profile.
 * Implements proper loading states to prevent profile setup modal flash.
 */

import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { UserProfile } from '../../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
