import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDataTableContext } from '@/components/data-table/data-table-context';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';

type DataTableSearchProps = {
    placeholder?: string;
    filterKey?: string;
    debounceMs?: number;
};

export function DataTableSearch({
    placeholder = 'Search…',
    filterKey = 'search',
    debounceMs = 300,
}: DataTableSearchProps) {
    const { query, setFilter } = useDataTableContext();
    const appliedValue = query.filters[filterKey] ?? '';
    const [value, setValue] = useState(appliedValue);
    const [lastAppliedValue, setLastAppliedValue] = useState(appliedValue);

    if (appliedValue !== lastAppliedValue) {
        // Filters were changed elsewhere (e.g. "Reset"): follow them.
        setLastAppliedValue(appliedValue);
        setValue(appliedValue);
    }

    /**
     * Reads `value` when it fires rather than when it is scheduled, so the
     * trailing call always applies the latest keystroke. Bailing out when the
     * term is already applied makes a pending edit harmless after an external
     * reset, and avoids a redundant refetch when typing returns to the applied
     * term.
     */
    const applySearch = useDebouncedCallback(() => {
        const nextValue = value.trim();

        if (nextValue === appliedValue) {
            return;
        }

        setFilter(filterKey, nextValue || null);
    }, debounceMs);

    const clearSearch = () => {
        applySearch.cancel();
        setValue('');

        // Nothing is applied yet when clearing a term still inside the debounce
        // window, and setting the filter again would refetch for no reason.
        if (appliedValue !== '') {
            setFilter(filterKey, null);
        }
    };

    return (
        <InputGroup className="h-8 w-full sm:w-64">
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupInput
                value={value}
                onChange={(event) => {
                    setValue(event.target.value);
                    applySearch();
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        applySearch.flush();
                    }

                    if (event.key === 'Escape' && value !== '') {
                        event.preventDefault();
                        clearSearch();
                    }
                }}
                placeholder={placeholder}
                aria-label={placeholder}
            />
            {value !== '' && (
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Clear search"
                        onClick={clearSearch}
                    >
                        <X />
                    </InputGroupButton>
                </InputGroupAddon>
            )}
        </InputGroup>
    );
}
