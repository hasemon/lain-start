import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type PermissionCheck = string | readonly string[];

/**
 * Permission checks for UI only (hiding links / buttons).
 * The backend always enforces authorization; Super Admin passes every check.
 */
export function useCan() {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.isSuperAdmin;
    const permissions = auth.permissions;

    const can = useCallback(
        (permission: string): boolean =>
            isSuperAdmin || permissions.includes(permission),
        [isSuperAdmin, permissions],
    );

    const canAny = useCallback(
        (check: PermissionCheck): boolean =>
            typeof check === 'string'
                ? can(check)
                : check.length === 0 || check.some(can),
        [can],
    );

    const canAll = useCallback(
        (check: readonly string[]): boolean => check.every(can),
        [can],
    );

    return { can, canAny, canAll, isSuperAdmin };
}
