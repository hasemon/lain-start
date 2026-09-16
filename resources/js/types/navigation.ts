import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** Show the item only if the user has this permission (or any of these). Super Admin sees everything. */
    permission?: string | readonly string[];
};

/**
 * A collapsible sidebar parent. It has no page of its own — activating it
 * reveals `items`. The group is hidden when every child is hidden.
 */
export type NavGroup = {
    title: string;
    icon?: LucideIcon | null;
    /** Show the group only if the user has this permission (or any of these). Super Admin sees everything. */
    permission?: string | readonly string[];
    items: NavItem[];
};

/** Anything the sidebar's main navigation can render: a link or a collapsible group. */
export type NavEntry = NavItem | NavGroup;
