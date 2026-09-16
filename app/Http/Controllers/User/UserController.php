<?php

namespace App\Http\Controllers\User;

use App\Actions\User\CreateUserAction;
use App\Actions\User\UpdateUserAction;
use App\Concerns\ProvidesAccessOptions;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use ProvidesAccessOptions;

    public function index(Request $request): Response
    {
        return Inertia::render('users/index', [
            'roleOptions' => $this->roleOptions($request->user()),
            'canCreate' => $request->user()->can('create', User::class),
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('users/create', [
            'roleOptions' => $this->roleOptions($request->user()),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUserAction $createUser): RedirectResponse
    {
        $createUser->execute($request->toData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    public function edit(Request $request, User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => UserResource::make($user->load('roles', 'permissions'))->resolve($request),
            'roleOptions' => $this->roleOptions($request->user()),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUserAction $updateUser): RedirectResponse
    {
        $updateUser->execute($user, $request->toData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }
}
