<?php

namespace App\Actions\User;

use App\Data\User\UserData;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateUserAction
{
    public function execute(User $user, UserData $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $superAdminRole = config('permissions.super_admin_role');

            if ($user->isSuperAdmin()
                && ! in_array($superAdminRole, $data->roles, true)
                && User::role($superAdminRole)->lockForUpdate()->count() === 1) {
                throw ValidationException::withMessages([
                    'roles' => __('The last Super Admin cannot lose the Super Admin role.'),
                ]);
            }

            $oldRoles = $user->getRoleNames()->all();
            $oldPermissions = $user->getDirectPermissions()->pluck('name')->all();

            $user->fill([
                'name' => $data->name,
                'email' => $data->email,
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            if ($data->password !== null) {
                $user->password = $data->password;
            }

            $changedAttributes = array_keys($user->getDirty());

            $user->save();
            $user->syncRoles($data->roles);
            $user->syncPermissions($data->permissions);

            activity()
                ->performedOn($user)
                ->event('updated')
                ->withProperties([
                    'attributes' => array_values(array_diff($changedAttributes, ['password'])),
                    'password_changed' => in_array('password', $changedAttributes, true),
                    'old' => ['roles' => $oldRoles, 'permissions' => $oldPermissions],
                    'new' => ['roles' => $data->roles, 'permissions' => $data->permissions],
                ])
                ->log('User updated');

            return $user;
        });
    }
}
