<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_super_admin' => $this->isSuperAdmin(),
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('name')->values()),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => ! ($request->user()?->is($this->resource) ?? false)
                    && ($request->user()?->can('delete', $this->resource) ?? false),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
