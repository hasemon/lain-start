<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Seed every permission defined in config/permissions.php and the Super Admin role.
     *
     * Safe to run repeatedly: existing permissions are kept, missing ones are created.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('permissions.guard');

        foreach (self::permissionNames() as $permissionName) {
            Permission::findOrCreate($permissionName, $guard);
        }

        Role::findOrCreate(config('permissions.super_admin_role'), $guard);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @return list<string>
     */
    public static function permissionNames(): array
    {
        /** @var array<string, array{label: string, permissions: array<string, string>}> $groups */
        $groups = config('permissions.groups');

        return array_keys(Arr::collapse(array_column($groups, 'permissions')));
    }
}
