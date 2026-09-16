<?php

namespace App\Actions\User;

use App\Data\User\UserData;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateUserAction
{
    public function execute(UserData $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => $data->name,
                'email' => $data->email,
                'password' => $data->password,
            ]);

            $user->syncRoles($data->roles);
            $user->syncPermissions($data->permissions);

            activity()
                ->performedOn($user)
                ->event('created')
                ->withProperties([
                    'roles' => $data->roles,
                    'permissions' => $data->permissions,
                ])
                ->log('User created');

            return $user;
        });
    }
}
