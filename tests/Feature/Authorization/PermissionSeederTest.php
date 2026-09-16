<?php

use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('it seeds every configured permission and the super admin role', function () {
    $this->seed(PermissionSeeder::class);

    $configured = PermissionSeeder::permissionNames();

    expect($configured)->toContain('employees.view', 'payroll.finalize', 'roles.manage')
        ->and(Permission::query()->whereIn('name', $configured)->count())->toBe(count($configured))
        ->and(Role::query()->where('name', config('permissions.super_admin_role'))->exists())->toBeTrue();
});

test('it can be run repeatedly without duplicating permissions', function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(PermissionSeeder::class);

    expect(Permission::query()->where('name', 'employees.view')->count())->toBe(1);
});
