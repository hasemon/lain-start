import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import UserApiController from '@/actions/App/Http/Controllers/Api/UserController';
import { apiRequest } from '@/lib/api/client';
import { usersQueryKey } from '@/queries/use-users';
import type { ManagedUser } from '@/types';

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: ManagedUser) =>
            apiRequest<void>(UserApiController.destroy(user.id)),
        onSuccess: (_, user) => {
            toast.success(`${user.name} was deleted.`);

            return queryClient.invalidateQueries({ queryKey: usersQueryKey });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
