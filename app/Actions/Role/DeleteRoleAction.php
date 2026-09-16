<?php

namespace App\Actions\Role;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class DeleteRoleAction
{
    public function execute(Role $role): void
    {
        if ($role->name === config('permissions.super_admin_role')) {
            throw ValidationException::withMessages([
                'role' => __('The Super Admin role cannot be deleted.'),
            ]);
        }

        $assignedUsers = $role->users()->count();

        if ($assignedUsers > 0) {
            throw ValidationException::withMessages([
                'role' => trans_choice(
                    'This role is assigned to :count user. Remove it from that user first.|This role is assigned to :count users. Remove it from those users first.',
                    $assignedUsers,
                ),
            ]);
        }

        DB::transaction(function () use ($role): void {
            activity()
                ->performedOn($role)
                ->event('deleted')
                ->withProperties([
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->all(),
                ])
                ->log('Role deleted');

            $role->delete();
        });
    }
}
