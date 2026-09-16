<?php

namespace App\Actions\Role;

use App\Data\Role\RoleData;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class CreateRoleAction
{
    public function execute(RoleData $data): Role
    {
        return DB::transaction(function () use ($data): Role {
            /** @var Role $role */
            $role = Role::create([
                'name' => $data->name,
                'guard_name' => config('permissions.guard'),
            ]);

            $role->syncPermissions($data->permissions);

            activity()
                ->performedOn($role)
                ->event('created')
                ->withProperties(['permissions' => $data->permissions])
                ->log('Role created');

            return $role;
        });
    }
}
