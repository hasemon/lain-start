<?php

namespace App\Http\Controllers\Role;

use App\Actions\Role\CreateRoleAction;
use App\Actions\Role\UpdateRoleAction;
use App\Concerns\ProvidesAccessOptions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ProvidesAccessOptions;

    public function index(Request $request): Response
    {
        return Inertia::render('roles/index', [
            'canCreate' => $request->user()->can('create', Role::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(StoreRoleRequest $request, CreateRoleAction $createRole): RedirectResponse
    {
        $createRole->execute($request->toData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role created.')]);

        return to_route('roles.index');
    }

    public function edit(Request $request, Role $role): Response|RedirectResponse
    {
        Gate::authorize('update', $role);

        if ($role->name === config('permissions.super_admin_role')) {
            Inertia::flash('toast', ['type' => 'info', 'message' => __('The Super Admin role has every permission and cannot be edited.')]);

            return to_route('roles.index');
        }

        return Inertia::render('roles/edit', [
            'role' => RoleResource::make($role->load('permissions'))->resolve($request),
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role, UpdateRoleAction $updateRole): RedirectResponse
    {
        $updateRole->execute($role, $request->toData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role updated.')]);

        return to_route('roles.index');
    }
}
