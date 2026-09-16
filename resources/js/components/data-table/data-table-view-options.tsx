import type { Column, RowData } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import type { DataTableFeatures } from '@/components/data-table/data-table-features';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HideableColumn = {
    id: string;
    label: string;
    visible: boolean;
};

export function DataTableViewOptions<TData extends RowData>({
    columns,
}: {
    columns: Column<DataTableFeatures, TData>[];
}) {
    const hideable: HideableColumn[] = columns
        .filter((column) => column.getCanHide())
        .map((column) => ({
            id: column.id,
            label:
                typeof column.columnDef.meta?.label === 'string'
                    ? column.columnDef.meta.label
                    : column.id,
            visible: column.getIsVisible(),
        }));

    if (hideable.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-8">
                    <Settings2 />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideable.map((item) => (
                    <DropdownMenuCheckboxItem
                        key={item.id}
                        checked={item.visible}
                        onCheckedChange={(checked) =>
                            columns
                                .find((column) => column.id === item.id)
                                ?.toggleVisibility(checked)
                        }
                    >
                        {item.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
