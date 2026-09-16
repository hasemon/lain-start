<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Permission\Models\Role;

/**
 * @mixin Role
 */
class RoleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isSuperAdminRole = $this->name === config('permissions.super_admin_role');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_super_admin' => $isSuperAdminRole,
            'users_count' => $this->whenCounted('users'),
            'permissions_count' => $this->whenCounted('permissions'),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('name')->values()),
            'can' => [
                'update' => ! $isSuperAdminRole && ($request->user()?->can('update', $this->resource) ?? false),
                'delete' => ! $isSuperAdminRole && ($request->user()?->can('delete', $this->resource) ?? false),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
