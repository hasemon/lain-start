import { Link } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
    createDataTableColumnHelper,
    DataTableColumnHeader,
} from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { edit } from '@/routes/roles';
import type { ManagedRole } from '@/types';

const helper = createDataTableColumnHelper<ManagedRole>();

export function getRoleColumns({
    onDelete,
}: {
    onDelete: (role: ManagedRole) => void;
}) {
    return helper.columns([
        helper.accessor('name', {
            header: () => <DataTableColumnHeader title="Name" sortKey="name" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.is_super_admin && (
                        <Badge variant="secondary">All access</Badge>
                    )}
                </div>
            ),
            enableHiding: false,
        }),
        helper.accessor('permissions_count', {
            header: () => (
                <DataTableColumnHeader
                    title="Permissions"
                    sortKey="permissions_count"
                />
            ),
            cell: ({ row }) =>
                row.original.is_super_admin ? (
                    <span className="text-muted-foreground text-sm">
                        Every permission
                    </span>
                ) : (
                    (row.original.permissions_count ?? 0)
                ),
            meta: { label: 'Permissions' },
        }),
        helper.accessor('users_count', {
            header: () => (
                <DataTableColumnHeader title="Users" sortKey="users_count" />
            ),
            cell: ({ getValue }) => getValue() ?? 0,
            meta: { label: 'Users' },
        }),
        helper.display({
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const role = row.original;

                if (!role.can.update && !role.can.delete) {
                    return null;
                }

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={`Actions for ${role.name}`}
                                >
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {role.can.update && (
                                    <DropdownMenuItem asChild>
                                        <Link href={edit(String(role.id))}>
                                            <Pencil />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {role.can.delete && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => onDelete(role)}
                                    >
                                        <Trash2 />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            enableHiding: false,
        }),
    ]);
}
