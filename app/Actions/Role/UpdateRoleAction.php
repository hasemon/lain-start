<?php

namespace App\Actions\Role;

use App\Data\Role\RoleData;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UpdateRoleAction
{
    public function execute(Role $role, RoleData $data): Role
    {
        if ($role->name === config('permissions.super_admin_role')) {
            throw ValidationException::withMessages([
                'name' => __('The Super Admin role cannot be changed.'),
            ]);
        }

        return DB::transaction(function () use ($role, $data): Role {
            $oldName = $role->name;
            $oldPermissions = $role->permissions->pluck('name')->all();

            $role->update(['name' => $data->name]);
            $role->syncPermissions($data->permissions);

            activity()
                ->performedOn($role)
                ->event('updated')
                ->withProperties([
                    'old' => ['name' => $oldName, 'permissions' => $oldPermissions],
                    'new' => ['name' => $data->name, 'permissions' => $data->permissions],
                ])
                ->log('Role updated');

            return $role;
        });
    }
}
