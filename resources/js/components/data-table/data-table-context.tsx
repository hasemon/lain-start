import { createContext, useContext } from 'react';
import type { DataTableStateControls } from '@/hooks/use-data-table-state';

export const DataTableContext = createContext<DataTableStateControls | null>(
    null,
);

export function useDataTableContext(): DataTableStateControls {
    const context = useContext(DataTableContext);

    if (!context) {
        throw new Error(
            'DataTable components must be rendered inside <DataTable>.',
        );
    }

    return context;
}
