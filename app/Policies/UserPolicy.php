<?php

namespace App\Policies;

use App\Models\User;

/**
 * Super Admins bypass these checks through Gate::before.
 * Rules that must apply to Super Admins too live in the User Actions.
 */
class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('users.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('users.create');
    }

    public function update(User $actor, User $user): bool
    {
        return $actor->can('users.update') && ! $user->isSuperAdmin();
    }

    public function delete(User $actor, User $user): bool
    {
        return $actor->can('users.delete')
            && ! $user->isSuperAdmin()
            && ! $actor->is($user);
    }
}
