import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { UserForm } from '@/components/users/user-form';
import { index } from '@/routes/users';
import type { ManagedUser, PermissionGroup, RoleOption } from '@/types';

type EditUserProps = {
    user: ManagedUser;
    roleOptions: RoleOption[];
    permissionGroups: PermissionGroup[];
};

export default function EditUser({
    user,
    roleOptions,
    permissionGroups,
}: EditUserProps) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <div className="flex w-full flex-1 flex-col gap-4 p-4">
                <Heading title={`Edit ${user.name}`} description={user.email} />
                <UserForm
                    user={user}
                    roleOptions={roleOptions}
                    permissionGroups={permissionGroups}
                />
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Edit user', href: index() },
    ],
};
