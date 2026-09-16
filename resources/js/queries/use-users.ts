import { keepPreviousData, useQuery } from '@tanstack/react-query';
import UserApiController from '@/actions/App/Http/Controllers/Api/UserController';
import { toQueryBuilderParams } from '@/hooks/use-data-table-state';
import type { DataTableQueryState } from '@/hooks/use-data-table-state';
import { apiRequest } from '@/lib/api/client';
import type { ManagedUser, PaginatedResponse } from '@/types';

export const usersQueryKey = ['users'] as const;

export function useUsers(query: DataTableQueryState) {
    return useQuery({
        queryKey: [...usersQueryKey, query],
        queryFn: ({ signal }) =>
            apiRequest<PaginatedResponse<ManagedUser>>(
                UserApiController.index({ query: toQueryBuilderParams(query) }),
                { signal },
            ),
        placeholderData: keepPreviousData,
    });
}
