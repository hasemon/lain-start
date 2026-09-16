<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole(config('permissions.super_admin_role'));
});

/**
 * @param  list<string>  $permissions
 */
function userWithPermissions(array $permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('guests and users without permission cannot open user management', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('users.index'))
        ->assertForbidden();

    $this->actingAs(User::factory()->create())
        ->getJson(route('api.users.index'))
        ->assertForbidden();
});

test('super admin can open the users pages', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->where('canCreate', true)
            ->has('roleOptions', 1));

    $this->actingAs($this->superAdmin)
        ->get(route('users.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/create')
            ->has('permissionGroups'));
});

test('super admin creates a user with roles and extra permissions', function () {
    $role = Role::findOrCreate('HR Manager', 'web');
    $role->givePermissionTo('employees.view');

    $this->actingAs($this->superAdmin)
        ->post(route('users.store'), [
            'name' => 'Rahim Uddin',
            'email' => 'rahim@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => ['HR Manager'],
            'permissions' => ['payroll.view'],
        ])
        ->assertRedirect(route('users.index'));

    $user = User::query()->where('email', 'rahim@example.com')->firstOrFail();

    expect($user->hasRole('HR Manager'))->toBeTrue()
        ->and($user->getDirectPermissions()->pluck('name')->all())->toBe(['payroll.view'])
        ->and($user->can('employees.view'))->toBeTrue()
        ->and($user->can('payroll.view'))->toBeTrue()
        ->and($user->can('payroll.finalize'))->toBeFalse()
        ->and(Activity::query()->where('subject_id', $user->id)->where('event', 'created')->exists())->toBeTrue();
});

test('super admin updates a user and can leave the password unchanged', function () {
    $user = User::factory()->create(['email' => 'old@example.com']);
    $user->givePermissionTo('leave.view');
    $originalPassword = $user->password;

    $this->actingAs($this->superAdmin)
        ->put(route('users.update', $user), [
            'name' => 'New Name',
            'email' => 'new@example.com',
            'password' => '',
            'password_confirmation' => '',
            'permissions' => ['attendance.view'],
        ])
        ->assertRedirect(route('users.index'));

    $user->refresh();

    expect($user->name)->toBe('New Name')
        ->and($user->email)->toBe('new@example.com')
        ->and($user->password)->toBe($originalPassword)
        ->and($user->getDirectPermissions()->pluck('name')->all())->toBe(['attendance.view'])
        ->and($user->getRoleNames()->all())->toBe([]);
});

test('a user manager cannot grant access they do not have', function () {
    $manager = userWithPermissions(['users.view', 'users.create']);
    Role::findOrCreate('Payroll Admin', 'web')->givePermissionTo('payroll.finalize');

    $this->actingAs($manager)
        ->post(route('users.store'), [
            'name' => 'Escalation',
            'email' => 'escalation@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => ['Payroll Admin', config('permissions.super_admin_role')],
            'permissions' => ['roles.manage'],
        ])
        ->assertSessionHasErrors(['roles', 'permissions']);

    expect(User::query()->where('email', 'escalation@example.com')->exists())->toBeFalse();
});

test('a user manager can grant access they already hold', function () {
    $manager = userWithPermissions(['users.view', 'users.create', 'employees.view']);

    $this->actingAs($manager)
        ->post(route('users.store'), [
            'name' => 'Allowed',
            'email' => 'allowed@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'permissions' => ['employees.view'],
        ])
        ->assertSessionHasNoErrors();

    expect(User::query()->where('email', 'allowed@example.com')->firstOrFail()->can('employees.view'))->toBeTrue();
});

test('only a super admin can edit a super admin', function () {
    $manager = userWithPermissions(['users.view', 'users.update']);

    $this->actingAs($manager)
        ->get(route('users.edit', $this->superAdmin))
        ->assertForbidden();

    $this->actingAs($manager)
        ->put(route('users.update', $this->superAdmin), [
            'name' => 'Hijacked',
            'email' => $this->superAdmin->email,
        ])
        ->assertForbidden();
});

test('the last super admin cannot lose the super admin role', function () {
    $this->actingAs($this->superAdmin)
        ->put(route('users.update', $this->superAdmin), [
            'name' => $this->superAdmin->name,
            'email' => $this->superAdmin->email,
            'roles' => [],
        ])
        ->assertSessionHasErrors('roles');

    expect($this->superAdmin->fresh()->isSuperAdmin())->toBeTrue();
});

test('deleting users respects self and last super admin protections', function () {
    $user = User::factory()->create();

    $this->actingAs($this->superAdmin)
        ->deleteJson(route('api.users.destroy', $this->superAdmin))
        ->assertUnprocessable();

    $this->actingAs($this->superAdmin)
        ->deleteJson(route('api.users.destroy', $user))
        ->assertNoContent();

    expect(User::query()->whereKey($user->id)->exists())->toBeFalse();
});

test('a user without delete permission cannot delete users', function () {
    $viewer = userWithPermissions(['users.view']);
    $user = User::factory()->create();

    $this->actingAs($viewer)
        ->deleteJson(route('api.users.destroy', $user))
        ->assertForbidden();
});

test('the users api searches, filters by role, sorts and paginates', function () {
    Role::findOrCreate('Team Lead', 'web');

    User::factory()->create(['name' => 'Alpha Search', 'email' => 'alpha@example.com'])->assignRole('Team Lead');
    User::factory()->create(['name' => 'Beta Search', 'email' => 'beta@example.com']);
    User::factory()->count(3)->create();

    $this->actingAs($this->superAdmin)
        ->getJson(route('api.users.index', ['filter' => ['search' => 'search'], 'sort' => 'name']))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.name', 'Alpha Search')
        ->assertJsonPath('data.1.name', 'Beta Search');

    $this->actingAs($this->superAdmin)
        ->getJson(route('api.users.index', ['filter' => ['role' => 'Team Lead']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.email', 'alpha@example.com')
        ->assertJsonPath('data.0.roles', ['Team Lead']);

    $this->actingAs($this->superAdmin)
        ->getJson(route('api.users.index', ['per_page' => 5, 'page' => 2]))
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.total', 6)
        ->assertJsonCount(1, 'data')
        ->assertJsonStructure(['data' => [['id', 'name', 'email', 'is_super_admin', 'roles', 'can' => ['update', 'delete']]]]);
});

test('the users api does not offer deleting your own account', function () {
    $this->actingAs($this->superAdmin)
        ->getJson(route('api.users.index', ['filter' => ['search' => $this->superAdmin->email]]))
        ->assertOk()
        ->assertJsonPath('data.0.id', $this->superAdmin->id)
        ->assertJsonPath('data.0.can.delete', false);
});
