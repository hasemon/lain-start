import { keepPreviousData, useQuery } from '@tanstack/react-query';
import RoleApiController from '@/actions/App/Http/Controllers/Api/RoleController';
import { toQueryBuilderParams } from '@/hooks/use-data-table-state';
import type { DataTableQueryState } from '@/hooks/use-data-table-state';
import { apiRequest } from '@/lib/api/client';
import type { ManagedRole, PaginatedResponse } from '@/types';

export const rolesQueryKey = ['roles'] as const;

export function useRoles(query: DataTableQueryState) {
    return useQuery({
        queryKey: [...rolesQueryKey, query],
        queryFn: ({ signal }) =>
            apiRequest<PaginatedResponse<ManagedRole>>(
                RoleApiController.index({ query: toQueryBuilderParams(query) }),
                { signal },
            ),
        placeholderData: keepPreviousData,
    });
}
