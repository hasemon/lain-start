<?php

namespace App\Concerns;

use App\Models\User;
use Spatie\Permission\Models\Role;

trait ProvidesAccessOptions
{
    /**
     * Roles the given user may assign. Only a Super Admin sees the Super Admin role.
     *
     * @return list<array{name: string, is_super_admin: bool}>
     */
    protected function roleOptions(User $actor): array
    {
        $superAdminRole = config('permissions.super_admin_role');

        return Role::query()
            ->where('guard_name', config('permissions.guard'))
            ->orderBy('name')
            ->pluck('name')
            ->reject(fn (string $name): bool => $name === $superAdminRole && ! $actor->isSuperAdmin())
            ->map(fn (string $name): array => ['name' => $name, 'is_super_admin' => $name === $superAdminRole])
            ->values()
            ->all();
    }

    /**
     * Permission groups from config/permissions.php, shaped for the checkbox picker.
     *
     * @return list<array{key: string, label: string, permissions: list<array{name: string, label: string}>}>
     */
    protected function permissionGroups(): array
    {
        /** @var array<string, array{label: string, permissions: array<string, string>}> $groups */
        $groups = config('permissions.groups');

        return collect($groups)
            ->map(fn (array $group, string $key): array => [
                'key' => $key,
                'label' => $group['label'],
                'permissions' => collect($group['permissions'])
                    ->map(fn (string $label, string $name): array => ['name' => $name, 'label' => $label])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }
}
