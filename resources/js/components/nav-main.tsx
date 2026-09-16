import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCan } from '@/hooks/use-can';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavEntry, NavGroup, NavItem } from '@/types';

function isNavGroup(entry: NavEntry): entry is NavGroup {
    return 'items' in entry;
}

function useIsActiveHref() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (href: NavItem['href']): boolean =>
        isCurrentUrl(href) || isCurrentOrParentUrl(`${toUrl(href)}/`);
}

/** Drops entries the user may not see, and groups left without any visible child. */
function useVisibleEntries(entries: NavEntry[]): NavEntry[] {
    const { canAny } = useCan();

    const isAllowed = (entry: NavEntry): boolean =>
        entry.permission === undefined || canAny(entry.permission);

    return entries.flatMap<NavEntry>((entry) => {
        if (!isAllowed(entry)) {
            return [];
        }

        if (!isNavGroup(entry)) {
            return [entry];
        }

        const items = entry.items.filter(isAllowed);

        return items.length > 0 ? [{ ...entry, items }] : [];
    });
}

function NavLinkItem({ item }: { item: NavItem }) {
    const isActiveHref = useIsActiveHref();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActiveHref(item.href)}
                tooltip={{ children: item.title }}
            >
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavGroupItem({ group }: { group: NavGroup }) {
    const isActiveHref = useIsActiveHref();
    const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
    const hasActiveChild = group.items.some((item) => isActiveHref(item.href));

    const [isOpen, setIsOpen] = useState(hasActiveChild);
    const [wasActive, setWasActive] = useState(hasActiveChild);

    if (hasActiveChild !== wasActive) {
        // Navigating into the group reveals it. Leaving it keeps whatever the
        // user last chose, so the menu does not collapse under them.
        setWasActive(hasActiveChild);

        if (hasActiveChild) {
            setIsOpen(true);
        }
    }

    const isIconMode = state === 'collapsed' && !isMobile;

    const handleOpenChange = (nextOpen: boolean) => {
        if (isIconMode) {
            // The submenu is hidden while the rail is collapsed, so toggling
            // here would leave the children unreachable. Expand instead.
            setSidebarOpen(true);
            setIsOpen(true);

            return;
        }

        setIsOpen(nextOpen);
    };

    return (
        <Collapsible
            asChild
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        // While the group is shut, carry the active child's
                        // highlight so the current page stays findable.
                        isActive={hasActiveChild && !isOpen}
                        tooltip={{ children: group.title }}
                    >
                        {group.icon && <group.icon />}
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={isActiveHref(item.href)}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function NavMain({
    items,
    label = 'Platform',
    className,
}: {
    items: NavEntry[];
    /** Pass `null` for a group that needs no heading of its own. */
    label?: string | null;
    className?: string;
}) {
    const visibleEntries = useVisibleEntries(items);

    if (visibleEntries.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className={cn('px-2 py-0', className)}>
            {label !== null && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {visibleEntries.map((entry) =>
                    isNavGroup(entry) ? (
                        <NavGroupItem key={entry.title} group={entry} />
                    ) : (
                        <NavLinkItem key={entry.title} item={entry} />
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
