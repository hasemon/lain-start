<?php

namespace App\Http\Controllers\Api;

use App\Actions\Role\DeleteRoleAction;
use App\Http\Controllers\Controller;
use App\Http\Filters\SearchFilter;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class RoleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Role::class);

        $roles = QueryBuilder::for(
            Role::query()
                ->where('guard_name', config('permissions.guard'))
                ->withCount('users', 'permissions'),
        )
            ->allowedFilters(AllowedFilter::custom('search', new SearchFilter(['name'])))
            ->allowedSorts('name', 'users_count', 'permissions_count', 'created_at')
            ->defaultSort('name')
            ->paginate(min(max($request->integer('per_page', 25), 5), 100))
            ->withQueryString();

        return RoleResource::collection($roles);
    }

    public function destroy(Role $role, DeleteRoleAction $deleteRole): Response
    {
        Gate::authorize('delete', $role);

        $deleteRole->execute($role);

        return response()->noContent();
    }
}
