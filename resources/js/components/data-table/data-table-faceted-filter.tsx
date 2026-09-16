import { Check, PlusCircle } from 'lucide-react';
import { useDataTableContext } from '@/components/data-table/data-table-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type FacetOption = {
    label: string;
    value: string;
};

type DataTableFacetedFilterProps = {
    title: string;
    filterKey: string;
    options: readonly FacetOption[];
};

/**
 * Multi-select filter sent as a comma-separated Spatie filter (`filter[role]=a,b`).
 */
export function DataTableFacetedFilter({
    title,
    filterKey,
    options,
}: DataTableFacetedFilterProps) {
    const { query, setFilter } = useDataTableContext();
    const selected = (query.filters[filterKey] ?? '')
        .split(',')
        .filter((value) => value !== '');

    const toggle = (value: string) => {
        const next = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];

        setFilter(filterKey, next.length > 0 ? next.join(',') : null);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <PlusCircle />
                    {title}
                    {selected.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                        >
                            {selected.length === 1
                                ? selected[0]
                                : `${selected.length} selected`}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.length === 0 && (
                    <p className="text-muted-foreground px-2 py-1.5 text-sm">
                        No options
                    </p>
                )}
                {options.map((option) => {
                    const isSelected = selected.includes(option.value);

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={(event) => {
                                event.preventDefault();
                                toggle(option.value);
                            }}
                        >
                            <span
                                className={cn(
                                    'border-primary flex size-4 items-center justify-center rounded-sm border',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'opacity-50 [&_svg]:invisible',
                                )}
                            >
                                <Check className="size-3" />
                            </span>
                            {option.label}
                        </DropdownMenuItem>
                    );
                })}
                {selected.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => setFilter(filterKey, null)}
                        >
                            Clear filter
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
