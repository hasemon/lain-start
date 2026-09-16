import { functionalUpdate, useTable } from '@tanstack/react-table';
import type {
    ColumnVisibilityState,
    PaginationState,
    RowData,
    SortingState,
    Updater,
} from '@tanstack/react-table';
import { Inbox, RotateCw } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { DataTableContext } from '@/components/data-table/data-table-context';
import { dataTableFeatures } from '@/components/data-table/data-table-features';
import type { DataTableColumns } from '@/components/data-table/data-table-features';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { DataTableStateControls } from '@/hooks/use-data-table-state';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types';

export type DataTableProps<TData extends RowData> = {
    columns: DataTableColumns<TData>;
    /** Rows of the current server page (pass the query result directly). */
    data: ReadonlyArray<TData> | undefined;
    meta: PaginationMeta | undefined;
    state: DataTableStateControls;
    getRowId: (row: TData) => string;
    isLoading: boolean;
    isFetching?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    /** Filters rendered on the left of the toolbar. */
    toolbar?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
};

const EMPTY_ROWS: ReadonlyArray<never> = [];

function toSortingState(sort: string | null): SortingState {
    if (!sort) {
        return [];
    }

    return sort.startsWith('-')
        ? [{ id: sort.slice(1), desc: true }]
        : [{ id: sort, desc: false }];
}

function toSortParam(sorting: SortingState): string | null {
    const [first] = sorting;

    return first ? `${first.desc ? '-' : ''}${first.id}` : null;
}

/**
 * Shared server-side table: TanStack Table v9 + TanStack Query + shadcn/ui.
 * It knows nothing about the domain — pass columns, the current page and the
 * URL-backed state from `useDataTableState`.
 */
export function DataTable<TData extends RowData>({
    columns,
    data,
    meta,
    state,
    getRowId,
    isLoading,
    isFetching = false,
    error,
    onRetry,
    toolbar,
    emptyTitle = 'No results',
    emptyDescription = 'Try a different search or clear the filters.',
}: DataTableProps<TData>) {
    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>({});
    const { query, setPage, setPerPage, setSort } = state;

    const pagination: PaginationState = {
        pageIndex: query.page - 1,
        pageSize: query.perPage,
    };

    const table = useTable({
        features: dataTableFeatures,
        columns,
        data: data ?? EMPTY_ROWS,
        getRowId: (row) => getRowId(row),
        manualPagination: true,
        manualSorting: true,
        rowCount: meta?.total ?? 0,
        state: {
            columnVisibility,
            pagination,
            sorting: toSortingState(query.sort),
        },
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater: Updater<PaginationState>) => {
            const next = functionalUpdate(updater, pagination);

            if (next.pageSize !== pagination.pageSize) {
                setPerPage(next.pageSize);
            } else {
                setPage(next.pageIndex + 1);
            }
        },
        onSortingChange: (updater: Updater<SortingState>) => {
            setSort(
                toSortParam(
                    functionalUpdate(updater, toSortingState(query.sort)),
                ),
            );
        },
    });

    const visibleColumnCount = Math.max(
        table.getVisibleLeafColumns().length,
        1,
    );
    const rows = table.getRowModel().rows;

    return (
        <DataTableContext value={state}>
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {toolbar}
                    <div className="ml-auto flex items-center gap-2">
                        {isFetching && !isLoading && (
                            <RotateCw
                                className="text-muted-foreground size-4 animate-spin"
                                aria-label="Refreshing"
                            />
                        )}
                        <DataTableViewOptions
                            columns={table.getAllLeafColumns()}
                        />
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Could not load data</AlertTitle>
                        <AlertDescription className="flex flex-wrap items-center gap-3">
                            <span>{error.message}</span>
                            {onRetry && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRetry}
                                >
                                    Try again
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <div
                    className={cn(
                        'rounded-md border transition-opacity',
                        isFetching && !isLoading && 'opacity-70',
                    )}
                >
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <table.FlexRender
                                                    header={header}
                                                />
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading &&
                                Array.from(
                                    { length: Math.min(query.perPage, 10) },
                                    (_, index) => (
                                        <TableRow key={`skeleton-${index}`}>
                                            {Array.from(
                                                { length: visibleColumnCount },
                                                (_, cellIndex) => (
                                                    <TableCell key={cellIndex}>
                                                        <Skeleton className="h-5 w-full max-w-40" />
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ),
                                )}

                            {!isLoading &&
                                rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                <table.FlexRender cell={cell} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}

                            {!isLoading && !error && rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumnCount}
                                        className="p-0"
                                    >
                                        <Empty className="py-10">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Inbox />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    {emptyTitle}
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    {emptyDescription}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DataTablePagination meta={meta} />
            </div>
        </DataTableContext>
    );
}
