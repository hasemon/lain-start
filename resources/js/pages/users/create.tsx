import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { UserForm } from '@/components/users/user-form';
import { create, index } from '@/routes/users';
import type { PermissionGroup, RoleOption } from '@/types';

type CreateUserProps = {
    roleOptions: RoleOption[];
    permissionGroups: PermissionGroup[];
};

export default function CreateUser({
    roleOptions,
    permissionGroups,
}: CreateUserProps) {
    return (
        <>
            <Head title="New user" />
            <div className="flex w-full flex-1 flex-col gap-4 p-4">
                <Heading
                    title="New user"
                    description="Create an account and choose what this person can access."
                />
                <UserForm
                    roleOptions={roleOptions}
                    permissionGroups={permissionGroups}
                />
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'New user', href: create() },
    ],
};
