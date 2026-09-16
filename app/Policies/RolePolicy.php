<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * Super Admins bypass these checks through Gate::before.
 * Rules that must apply to Super Admins too live in the Role Actions.
 */
class RolePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('roles.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('roles.manage');
    }

    public function update(User $actor, Role $role): bool
    {
        return $actor->can('roles.manage');
    }

    public function delete(User $actor, Role $role): bool
    {
        return $actor->can('roles.manage');
    }
}
