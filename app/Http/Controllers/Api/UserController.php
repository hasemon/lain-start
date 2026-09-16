<?php

namespace App\Http\Controllers\Api;

use App\Actions\User\DeleteUserAction;
use App\Http\Controllers\Controller;
use App\Http\Filters\SearchFilter;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        $users = QueryBuilder::for(User::query()->with('roles'))
            ->allowedFilters(
                AllowedFilter::custom('search', new SearchFilter(['name', 'email'])),
                AllowedFilter::callback('role', fn ($query, mixed $value) => $query->role((array) $value)),
            )
            ->allowedSorts('name', 'email', 'created_at')
            ->defaultSort('-created_at')
            ->paginate(min(max($request->integer('per_page', 25), 5), 100))
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function destroy(Request $request, User $user, DeleteUserAction $deleteUser): Response
    {
        Gate::authorize('delete', $user);

        $deleteUser->execute($request->user(), $user);

        return response()->noContent();
    }
}
