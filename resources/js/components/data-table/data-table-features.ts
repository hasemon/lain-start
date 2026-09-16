import {
    columnVisibilityFeature,
    createColumnHelper,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
} from '@tanstack/react-table';
import type {
    CellData,
    RowData,
    TableFeatures,
    TableOptions,
} from '@tanstack/react-table';

/**
 * Feature set shared by every server-side DataTable. Sorting and pagination
 * run on the server (manual mode); the table renders the page it is given.
 */
export const dataTableFeatures = tableFeatures({
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumns<TData extends RowData> = TableOptions<
    DataTableFeatures,
    TData
>['columns'];

export function createDataTableColumnHelper<TData extends RowData>() {
    return createColumnHelper<DataTableFeatures, TData>();
}

declare module '@tanstack/react-table' {
    interface ColumnMeta<
        in out TFeatures extends TableFeatures,
        in out TData extends RowData,
        TValue extends CellData = CellData,
    > {
        /** Human label used by the column visibility menu. */
        label?: string;
    }
}
