import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { RoleForm } from '@/components/roles/role-form';
import { index } from '@/routes/roles';
import type { ManagedRole, PermissionGroup } from '@/types';

type EditRoleProps = {
    role: ManagedRole;
    permissionGroups: PermissionGroup[];
};

export default function EditRole({ role, permissionGroups }: EditRoleProps) {
    return (
        <>
            <Head title={`Edit ${role.name}`} />
            <div className="flex w-full flex-1 flex-col gap-4 p-4">
                <Heading
                    title={`Edit role: ${role.name}`}
                    description="Changes apply to every user with this role."
                />
                <RoleForm role={role} permissionGroups={permissionGroups} />
            </div>
        </>
    );
}

EditRole.layout = {
    breadcrumbs: [
        { title: 'Roles', href: index() },
        { title: 'Edit role', href: index() },
    ],
};
