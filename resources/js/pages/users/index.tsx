import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
    DataTable,
    DataTableFacetedFilter,
    DataTableSearch,
} from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { getUserColumns } from '@/components/users/user-columns';
import { useDataTableState } from '@/hooks/use-data-table-state';
import type { DataTableStateOptions } from '@/hooks/use-data-table-state';
import { useDeleteUser } from '@/mutations/use-delete-user';
import { useUsers } from '@/queries/use-users';
import { create, index } from '@/routes/users';
import type { ManagedUser, RoleOption } from '@/types';

const TABLE_OPTIONS: DataTableStateOptions = {
    defaultSort: '-created_at',
    filterKeys: ['search', 'role'],
};

type UsersIndexProps = {
    roleOptions: RoleOption[];
    canCreate: boolean;
};

export default function UsersIndex({
    roleOptions,
    canCreate,
}: UsersIndexProps) {
    const tableState = useDataTableState(TABLE_OPTIONS);
    const users = useUsers(tableState.query);
    const deleteUser = useDeleteUser();
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
    const columns = getUserColumns({ onDelete: setUserToDelete });

    return (
        <>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Users"
                        description="People who can sign in, and the roles and permissions they have."
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New user
                            </Link>
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={users.data?.data}
                    meta={users.data?.meta}
                    state={tableState}
                    getRowId={(user) => String(user.id)}
                    isLoading={users.isPending}
                    isFetching={users.isFetching}
                    error={users.error}
                    onRetry={() => void users.refetch()}
                    emptyTitle="No users found"
                    toolbar={
                        <>
                            <DataTableSearch placeholder="Search name or email…" />
                            <DataTableFacetedFilter
                                title="Role"
                                filterKey="role"
                                options={roleOptions.map((role) => ({
                                    label: role.name,
                                    value: role.name,
                                }))}
                            />
                        </>
                    }
                />
            </div>

            <ConfirmDeleteDialog
                open={userToDelete !== null}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                title={`Delete ${userToDelete?.name ?? 'user'}?`}
                description="They will lose access immediately. This cannot be undone."
                isPending={deleteUser.isPending}
                onConfirm={() => {
                    if (userToDelete) {
                        deleteUser.mutate(userToDelete, {
                            onSettled: () => setUserToDelete(null),
                        });
                    }
                }}
            />
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
