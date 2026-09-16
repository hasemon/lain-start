<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteUserAction
{
    public function execute(User $actor, User $user): void
    {
        if ($actor->is($user)) {
            throw ValidationException::withMessages([
                'user' => __('You cannot delete your own account here.'),
            ]);
        }

        DB::transaction(function () use ($user): void {
            if ($user->isSuperAdmin()
                && User::role(config('permissions.super_admin_role'))->lockForUpdate()->count() === 1) {
                throw ValidationException::withMessages([
                    'user' => __('The last Super Admin cannot be deleted.'),
                ]);
            }

            activity()
                ->performedOn($user)
                ->event('deleted')
                ->withProperties([
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->all(),
                ])
                ->log('User deleted');

            $user->delete();
        });
    }
}
