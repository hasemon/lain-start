<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

test('super admin passes every gate check without explicit permissions', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole(config('permissions.super_admin_role'));

    expect($superAdmin->can('payroll.finalize'))->toBeTrue()
        ->and($superAdmin->can('an-ability-that-is-not-defined'))->toBeTrue();
});

test('a user without permissions is denied', function () {
    $user = User::factory()->create();

    expect($user->can('employees.view'))->toBeFalse();
});

test('a user is allowed through role permissions and extra direct permissions', function () {
    $role = Role::findOrCreate('HR Manager', 'web');
    $role->givePermissionTo('employees.view');

    $user = User::factory()->create();
    $user->assignRole($role);
    $user->givePermissionTo('payroll.view');

    expect($user->can('employees.view'))->toBeTrue()
        ->and($user->can('payroll.view'))->toBeTrue()
        ->and($user->can('payroll.finalize'))->toBeFalse();
});

test('permissions are shared with the frontend without leaking role relations', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('employees.view');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.isSuperAdmin', false)
            ->where('auth.permissions', ['employees.view'])
            ->missing('auth.user.roles')
            ->missing('auth.user.permissions'));
});

test('super admin flag is shared with the frontend', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole(config('permissions.super_admin_role'));

    $this->actingAs($superAdmin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.isSuperAdmin', true));
});
