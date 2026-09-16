import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useDataTableContext } from '@/components/data-table/data-table-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DataTableColumnHeaderProps = {
    title: string;
    /** Server sort key (Spatie Query Builder allowed sort). Omit for a plain header. */
    sortKey?: string;
    className?: string;
};

/**
 * Sortable header. Reads sort state from the URL-backed table state, cycling
 * ascending → descending → default.
 */
export function DataTableColumnHeader({
    title,
    sortKey,
    className,
}: DataTableColumnHeaderProps) {
    const { query, setSort } = useDataTableContext();

    if (!sortKey) {
        return <span className={className}>{title}</span>;
    }

    const direction =
        query.sort === sortKey
            ? 'asc'
            : query.sort === `-${sortKey}`
              ? 'desc'
              : null;

    const nextSort =
        direction === null
            ? sortKey
            : direction === 'asc'
              ? `-${sortKey}`
              : null;

    const Icon =
        direction === 'asc'
            ? ArrowUp
            : direction === 'desc'
              ? ArrowDown
              : ChevronsUpDown;

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn('data-[state=open]:bg-accent -ml-3 h-8', className)}
            onClick={() => setSort(nextSort)}
            aria-label={`Sort by ${title}`}
        >
            <span>{title}</span>
            <Icon
                className={cn(
                    'size-3.5',
                    direction === null && 'text-muted-foreground',
                )}
            />
        </Button>
    );
}
