import { useCallback, useEffect, useMemo, useState } from 'react';

export type DataTableFilters = Record<string, string>;

export type DataTableQueryState = {
    page: number;
    perPage: number;
    /** Spatie Query Builder sort, e.g. `name` or `-created_at`. */
    sort: string | null;
    filters: DataTableFilters;
};

export type DataTableStateOptions = {
    defaultPerPage?: number;
    defaultSort?: string | null;
    filterKeys: readonly string[];
};

export type DataTableStateControls = {
    query: DataTableQueryState;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setSort: (sort: string | null) => void;
    setFilter: (key: string, value: string | null) => void;
    resetFilters: () => void;
};

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

function readFromUrl(options: DataTableStateOptions): DataTableQueryState {
    const defaults: DataTableQueryState = {
        page: 1,
        perPage: options.defaultPerPage ?? 25,
        sort: options.defaultSort ?? null,
        filters: {},
    };

    if (typeof window === 'undefined') {
        return defaults;
    }

    const params = new URLSearchParams(window.location.search);
    const page = Number(params.get('page'));
    const perPage = Number(params.get('per_page'));
    const filters: DataTableFilters = {};

    for (const key of options.filterKeys) {
        const value = params.get(`filter[${key}]`);

        if (value) {
            filters[key] = value;
        }
    }

    return {
        page: Number.isInteger(page) && page > 0 ? page : defaults.page,
        perPage: (PER_PAGE_OPTIONS as readonly number[]).includes(perPage)
            ? perPage
            : defaults.perPage,
        sort: params.get('sort') ?? defaults.sort,
        filters,
    };
}

function writeToUrl(
    state: DataTableQueryState,
    options: DataTableStateOptions,
): void {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Collect first: deleting while iterating URLSearchParams skips entries.
    const existingKeys = Array.from(params.keys());

    for (const key of existingKeys) {
        if (
            ['page', 'per_page', 'sort'].includes(key) ||
            key.startsWith('filter[')
        ) {
            params.delete(key);
        }
    }

    if (state.page > 1) {
        params.set('page', String(state.page));
    }

    if (state.perPage !== (options.defaultPerPage ?? 25)) {
        params.set('per_page', String(state.perPage));
    }

    if (state.sort && state.sort !== (options.defaultSort ?? null)) {
        params.set('sort', state.sort);
    }

    for (const [key, value] of Object.entries(state.filters)) {
        params.set(`filter[${key}]`, value);
    }

    window.history.replaceState(window.history.state, '', url);
}

/**
 * Server-side table state (page, per page, sort, filters) kept in the URL so
 * refresh, back/forward and shared links keep the same view.
 *
 * Pass `options` as a module-level constant so it stays referentially stable.
 */
export function useDataTableState(
    options: DataTableStateOptions,
): DataTableStateControls {
    const [query, setQuery] = useState<DataTableQueryState>(() =>
        readFromUrl(options),
    );

    useEffect(() => {
        writeToUrl(query, options);
    }, [query, options]);

    const setPage = useCallback((page: number) => {
        setQuery((current) => ({ ...current, page: Math.max(1, page) }));
    }, []);

    const setPerPage = useCallback((perPage: number) => {
        setQuery((current) => ({ ...current, perPage, page: 1 }));
    }, []);

    const setSort = useCallback((sort: string | null) => {
        setQuery((current) => ({ ...current, sort, page: 1 }));
    }, []);

    const setFilter = useCallback((key: string, value: string | null) => {
        setQuery((current) => {
            const filters = { ...current.filters };

            if (value === null || value === '') {
                delete filters[key];
            } else {
                filters[key] = value;
            }

            return { ...current, filters, page: 1 };
        });
    }, []);

    const resetFilters = useCallback(() => {
        setQuery((current) => ({ ...current, filters: {}, page: 1 }));
    }, []);

    return useMemo(
        () => ({
            query,
            setPage,
            setPerPage,
            setSort,
            setFilter,
            resetFilters,
        }),
        [query, setPage, setPerPage, setSort, setFilter, resetFilters],
    );
}

/** Shapes table state into Spatie Query Builder parameters for a Wayfinder `query`. */
export function toQueryBuilderParams(query: DataTableQueryState) {
    return {
        page: query.page,
        per_page: query.perPage,
        sort: query.sort ?? undefined,
        filter:
            Object.keys(query.filters).length > 0 ? query.filters : undefined,
    };
}
