/**
 * React Query mutation hook to create a new user profile.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Principal } from '@icp-sdk/core/principal';
import { MyUserRole } from '../../backend';

interface CreateUserProfileParams {
  principal: Principal;
  name: string;
  email: string;
  role: MyUserRole;
  schoolId: bigint | null;
  groupId: bigint | null;
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateUserProfileParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUserProfile(
        params.principal,
        params.name,
        params.email,
        params.role,
        params.schoolId,
        params.groupId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
