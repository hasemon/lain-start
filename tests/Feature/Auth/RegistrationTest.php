<?php

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('the first registered user becomes the super admin', function () {
    $this->post(route('register.store'), [
        'name' => 'Owner',
        'email' => 'owner@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $owner = User::query()->where('email', 'owner@example.com')->firstOrFail();

    expect($owner->hasRole(config('permissions.super_admin_role')))->toBeTrue();
});

test('registration is closed once a user exists', function () {
    User::factory()->create();

    $this->get(route('register'))->assertRedirect(route('login'));

    $response = $this->post(route('register.store'), [
        'name' => 'Intruder',
        'email' => 'intruder@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
    expect(User::query()->where('email', 'intruder@example.com')->exists())->toBeFalse();
});
