import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import RoleApiController from '@/actions/App/Http/Controllers/Api/RoleController';
import { apiRequest } from '@/lib/api/client';
import { rolesQueryKey } from '@/queries/use-roles';
import type { ManagedRole } from '@/types';

export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (role: ManagedRole) =>
            apiRequest<void>(RoleApiController.destroy(String(role.id))),
        onSuccess: (_, role) => {
            toast.success(`Role "${role.name}" was deleted.`);

            return queryClient.invalidateQueries({ queryKey: rolesQueryKey });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
