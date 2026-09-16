export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_super_admin: boolean;
    roles?: string[];
    permissions?: string[];
    can: { update: boolean; delete: boolean };
    created_at: string | null;
};

export type ManagedRole = {
    id: number;
    name: string;
    is_super_admin: boolean;
    users_count?: number;
    permissions_count?: number;
    permissions?: string[];
    can: { update: boolean; delete: boolean };
    created_at: string | null;
};

export type RoleOption = {
    name: string;
    is_super_admin: boolean;
};

export type PermissionGroup = {
    key: string;
    label: string;
    permissions: { name: string; label: string }[];
};
