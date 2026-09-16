import { Form, Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Role/RoleController';
import { fieldError } from '@/components/access/form-errors';
import { PermissionPicker } from '@/components/access/permission-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index } from '@/routes/roles';
import type { ManagedRole, PermissionGroup } from '@/types';

type RoleFormProps = {
    role?: ManagedRole;
    permissionGroups: PermissionGroup[];
};

export function RoleForm({ role, permissionGroups }: RoleFormProps) {
    const isEditing = role !== undefined;
    const formDefinition = isEditing
        ? RoleController.update.form(String(role.id))
        : RoleController.store.form();

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
                            <CardTitle>Role</CardTitle>
                            <CardDescription>
                                A role groups permissions so you can give them
                                to many users at once.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid max-w-md gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={role?.name}
                                    placeholder="e.g. HR Manager"
                                    required
                                    autoComplete="off"
                                />
                                <InputError message={errors.name} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Everyone with this role gets these permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PermissionPicker
                                groups={permissionGroups}
                                name="permissions"
                                defaultValue={role?.permissions}
                                error={fieldError(errors, 'permissions')}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            {isEditing ? 'Save changes' : 'Create role'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
