<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole(config('permissions.super_admin_role'));
});

test('users without permission cannot open role management', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('roles.index'))
        ->assertForbidden();
});

test('super admin creates a role with permissions', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('roles.store'), [
            'name' => 'HR Manager',
            'permissions' => ['employees.view', 'leave.approve'],
        ])
        ->assertRedirect(route('roles.index'));

    $role = Role::findByName('HR Manager', 'web');

    expect($role->permissions->pluck('name')->sort()->values()->all())->toBe(['employees.view', 'leave.approve']);
});

test('super admin updates a role name and permissions', function () {
    $role = Role::findOrCreate('Team Lead', 'web');
    $role->givePermissionTo('attendance.view');

    $this->actingAs($this->superAdmin)
        ->get(route('roles.edit', $role))
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/edit')
            ->where('role.name', 'Team Lead')
            ->where('role.permissions', ['attendance.view']));

    $this->actingAs($this->superAdmin)
        ->put(route('roles.update', $role), [
            'name' => 'Department Lead',
            'permissions' => ['leave.approve'],
        ])
        ->assertRedirect(route('roles.index'));

    $role->refresh();

    expect($role->name)->toBe('Department Lead')
        ->and($role->permissions->pluck('name')->all())->toBe(['leave.approve']);
});

test('the super admin role cannot be edited, renamed to or deleted', function () {
    $superAdminRole = Role::findByName(config('permissions.super_admin_role'), 'web');
    $other = Role::findOrCreate('Other', 'web');

    $this->actingAs($this->superAdmin)
        ->get(route('roles.edit', $superAdminRole))
        ->assertRedirect(route('roles.index'));

    $this->actingAs($this->superAdmin)
        ->put(route('roles.update', $superAdminRole), ['name' => 'Renamed'])
        ->assertSessionHasErrors('name');

    $this->actingAs($this->superAdmin)
        ->put(route('roles.update', $other), ['name' => config('permissions.super_admin_role')])
        ->assertSessionHasErrors('name');

    $this->actingAs($this->superAdmin)
        ->deleteJson(route('api.roles.destroy', $superAdminRole))
        ->assertUnprocessable();

    expect(Role::query()->where('name', config('permissions.super_admin_role'))->exists())->toBeTrue();
});

test('a role assigned to users cannot be deleted', function () {
    $assigned = Role::findOrCreate('Assigned', 'web');
    User::factory()->create()->assignRole($assigned);
    $unused = Role::findOrCreate('Unused', 'web');

    $this->actingAs($this->superAdmin)
        ->deleteJson(route('api.roles.destroy', $assigned))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role');

    $this->actingAs($this->superAdmin)
        ->deleteJson(route('api.roles.destroy', $unused))
        ->assertNoContent();

    expect(Role::query()->where('name', 'Unused')->exists())->toBeFalse();
});

test('a role manager cannot put permissions they do not have into a role', function () {
    $manager = User::factory()->create();
    $manager->givePermissionTo(['roles.view', 'roles.manage', 'leave.view']);

    $this->actingAs($manager)
        ->post(route('roles.store'), [
            'name' => 'Sneaky',
            'permissions' => ['leave.view', 'payroll.finalize'],
        ])
        ->assertSessionHasErrors('permissions');

    expect(Role::query()->where('name', 'Sneaky')->exists())->toBeFalse();
});

test('the roles api lists roles with counts', function () {
    $role = Role::findOrCreate('Team Lead', 'web');
    $role->givePermissionTo(['attendance.view', 'leave.approve']);
    User::factory()->create()->assignRole($role);

    $this->actingAs($this->superAdmin)
        ->getJson(route('api.roles.index', ['filter' => ['search' => 'team']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Team Lead')
        ->assertJsonPath('data.0.users_count', 1)
        ->assertJsonPath('data.0.permissions_count', 2)
        ->assertJsonPath('data.0.can.delete', true);
});
