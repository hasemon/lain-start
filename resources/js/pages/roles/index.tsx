import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { DataTable, DataTableSearch } from '@/components/data-table';
import Heading from '@/components/heading';
import { getRoleColumns } from '@/components/roles/role-columns';
import { Button } from '@/components/ui/button';
import { useDataTableState } from '@/hooks/use-data-table-state';
import type { DataTableStateOptions } from '@/hooks/use-data-table-state';
import { useDeleteRole } from '@/mutations/use-delete-role';
import { useRoles } from '@/queries/use-roles';
import { create, index } from '@/routes/roles';
import type { ManagedRole } from '@/types';

const TABLE_OPTIONS: DataTableStateOptions = {
    defaultSort: 'name',
    filterKeys: ['search'],
};

export default function RolesIndex({ canCreate }: { canCreate: boolean }) {
    const tableState = useDataTableState(TABLE_OPTIONS);
    const roles = useRoles(tableState.query);
    const deleteRole = useDeleteRole();
    const [roleToDelete, setRoleToDelete] = useState<ManagedRole | null>(null);
    const columns = getRoleColumns({ onDelete: setRoleToDelete });

    return (
        <>
            <Head title="Roles" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Roles"
                        description="Group permissions into roles and assign them to users."
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                New role
                            </Link>
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={roles.data?.data}
                    meta={roles.data?.meta}
                    state={tableState}
                    getRowId={(role) => String(role.id)}
                    isLoading={roles.isPending}
                    isFetching={roles.isFetching}
                    error={roles.error}
                    onRetry={() => void roles.refetch()}
                    emptyTitle="No roles found"
                    toolbar={<DataTableSearch placeholder="Search roles…" />}
                />
            </div>

            <ConfirmDeleteDialog
                open={roleToDelete !== null}
                onOpenChange={(open) => !open && setRoleToDelete(null)}
                title={`Delete role "${roleToDelete?.name ?? ''}"?`}
                description="Only roles that no user has can be deleted. This cannot be undone."
                isPending={deleteRole.isPending}
                onConfirm={() => {
                    if (roleToDelete) {
                        deleteRole.mutate(roleToDelete, {
                            onSettled: () => setRoleToDelete(null),
                        });
                    }
                }}
            />
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [{ title: 'Roles', href: index() }],
};
