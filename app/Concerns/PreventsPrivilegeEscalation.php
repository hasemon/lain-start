<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Validator;
use Spatie\Permission\Models\Role;

/**
 * Form Request helper: a user who is not a Super Admin may only hand out
 * roles and permissions they already hold themselves.
 */
trait PreventsPrivilegeEscalation
{
    /**
     * @param  list<string>  $roleNames
     * @param  list<string>  $permissionNames
     */
    protected function validateGrantableAccess(Validator $validator, User $actor, array $roleNames = [], array $permissionNames = []): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        $actorPermissions = $actor->getAllPermissions()->pluck('name');

        if (in_array(config('permissions.super_admin_role'), $roleNames, true)) {
            $validator->errors()->add('roles', __('Only a Super Admin can assign the Super Admin role.'));
        }

        $rolePermissions = Role::query()
            ->whereIn('name', $roleNames)
            ->with('permissions:id,name')
            ->get()
            ->flatMap(fn (Role $role) => $role->permissions->pluck('name'));

        if ($rolePermissions->diff($actorPermissions)->isNotEmpty()) {
            $validator->errors()->add('roles', __('You cannot assign a role that has permissions you do not have.'));
        }

        if (collect($permissionNames)->diff($actorPermissions)->isNotEmpty()) {
            $validator->errors()->add('permissions', __('You cannot grant permissions you do not have.'));
        }
    }
}
