<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Role;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Public registration is only open until the first user (the Super Admin) exists.
     * After that, users are created by an administrator.
     */
    public static function registrationIsOpen(): bool
    {
        return User::query()->doesntExist();
    }

    /**
     * Validate and create the first user as Super Admin.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return Cache::lock('register-super-admin', 10)->block(5, function () use ($input): User {
            if (! self::registrationIsOpen()) {
                throw ValidationException::withMessages([
                    'email' => __('Registration is closed. Ask an administrator for an account.'),
                ]);
            }

            return DB::transaction(function () use ($input): User {
                $user = User::create([
                    'name' => $input['name'],
                    'email' => $input['email'],
                    'password' => $input['password'],
                ]);

                $user->assignRole(Role::findOrCreate(
                    config('permissions.super_admin_role'),
                    config('permissions.guard'),
                ));

                return $user;
            });
        });
    }
}
