import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { RoleForm } from '@/components/roles/role-form';
import { create, index } from '@/routes/roles';
import type { PermissionGroup } from '@/types';

export default function CreateRole({
    permissionGroups,
}: {
    permissionGroups: PermissionGroup[];
}) {
    return (
        <>
            <Head title="New role" />
            <div className="flex w-full flex-1 flex-col gap-4 p-4">
                <Heading
                    title="New role"
                    description="Name the role and choose its permissions."
                />
                <RoleForm permissionGroups={permissionGroups} />
            </div>
        </>
    );
}

CreateRole.layout = {
    breadcrumbs: [
        { title: 'Roles', href: index() },
        { title: 'New role', href: create() },
    ],
};
