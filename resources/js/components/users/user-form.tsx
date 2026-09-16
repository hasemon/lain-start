import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/User/UserController';
import { fieldError } from '@/components/access/form-errors';
import { PermissionPicker } from '@/components/access/permission-picker';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index } from '@/routes/users';
import type { ManagedUser, PermissionGroup, RoleOption } from '@/types';

type UserFormProps = {
    user?: ManagedUser;
    roleOptions: RoleOption[];
    permissionGroups: PermissionGroup[];
};

export function UserForm({
    user,
    roleOptions,
    permissionGroups,
}: UserFormProps) {
    const isEditing = user !== undefined;
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
        () => new Set(user?.roles ?? []),
    );
    const hasSuperAdminRole = roleOptions.some(
        (role) => role.is_super_admin && selectedRoles.has(role.name),
    );

    const toggleRole = (roleName: string, checked: boolean) => {
        setSelectedRoles((current) => {
            const next = new Set(current);

            if (checked) {
                next.add(roleName);
            } else {
                next.delete(roleName);
            }

            return next;
        });
    };
    const formDefinition = isEditing
        ? UserController.update.form(user.id)
        : UserController.store.form();

    return (
        <Form
            {...formDefinition}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                {isEditing
                                    ? 'Leave the password empty to keep the current one.'
                                    : 'The user signs in with this email and password.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user?.name}
                                    required
                                    autoComplete="off"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    defaultValue={user?.email}
                                    required
                                    autoComplete="off"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {isEditing ? 'New password' : 'Password'}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required={!isEditing}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required={!isEditing}
                                    autoComplete="new-password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                The user gets every permission of the selected
                                roles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {roleOptions.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No roles yet. Create roles first, or grant
                                    extra permissions below.
                                </p>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                    {roleOptions.map((role) => (
                                        <div
                                            key={role.name}
                                            className="flex items-center gap-2 rounded-md border px-3 py-2"
                                        >
                                            <Checkbox
                                                id={`role-${role.name}`}
                                                name="roles[]"
                                                value={role.name}
                                                checked={selectedRoles.has(
                                                    role.name,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    toggleRole(
                                                        role.name,
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`role-${role.name}`}
                                                className="font-normal"
                                            >
                                                {role.name}
                                            </Label>
                                            {role.is_super_admin && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-auto"
                                                >
                                                    All access
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <InputError message={fieldError(errors, 'roles')} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Extra permissions</CardTitle>
                            <CardDescription>
                                Given to this user directly, on top of their
                                roles. Leave empty if the roles are enough.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PermissionPicker
                                groups={permissionGroups}
                                name="permissions"
                                defaultValue={user?.permissions}
                                error={fieldError(errors, 'permissions')}
                                grantsAll={hasSuperAdminRole}
                                grantsAllMessage="Super Admin already has every permission, including ones added later. Untick Super Admin to pick permissions one by one."
                            />
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            {isEditing ? 'Save changes' : 'Create user'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
