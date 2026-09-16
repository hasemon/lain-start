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
import { edit } from '@/routes/users';
import type { ManagedUser } from '@/types';

const helper = createDataTableColumnHelper<ManagedUser>();

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
});

export function getUserColumns({
    onDelete,
}: {
    onDelete: (user: ManagedUser) => void;
}) {
    return helper.columns([
        helper.accessor('name', {
            header: () => <DataTableColumnHeader title="Name" sortKey="name" />,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-muted-foreground text-xs sm:hidden">
                        {row.original.email}
                    </span>
                </div>
            ),
            enableHiding: false,
        }),
        helper.accessor('email', {
            header: () => (
                <DataTableColumnHeader title="Email" sortKey="email" />
            ),
            meta: { label: 'Email' },
        }),
        helper.accessor('roles', {
            header: () => <DataTableColumnHeader title="Roles" />,
            cell: ({ row }) => {
                const roles = row.original.roles ?? [];

                if (roles.length === 0) {
                    return (
                        <span className="text-muted-foreground text-sm">
                            No role
                        </span>
                    );
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                            <Badge key={role} variant="secondary">
                                {role}
                            </Badge>
                        ))}
                    </div>
                );
            },
            meta: { label: 'Roles' },
        }),
        helper.accessor('created_at', {
            header: () => (
                <DataTableColumnHeader title="Created" sortKey="created_at" />
            ),
            cell: ({ getValue }) => {
                const value = getValue();

                return value ? dateFormatter.format(new Date(value)) : '—';
            },
            meta: { label: 'Created' },
        }),
        helper.display({
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const user = row.original;

                if (!user.can.update && !user.can.delete) {
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
                                    aria-label={`Actions for ${user.name}`}
                                >
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {user.can.update && (
                                    <DropdownMenuItem asChild>
                                        <Link href={edit(user.id)}>
                                            <Pencil />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user.can.delete && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => onDelete(user)}
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
