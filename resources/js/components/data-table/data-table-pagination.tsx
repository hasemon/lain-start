import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { useDataTableContext } from '@/components/data-table/data-table-context';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PER_PAGE_OPTIONS } from '@/hooks/use-data-table-state';
import type { PaginationMeta } from '@/types';

export function DataTablePagination({
    meta,
}: {
    meta: PaginationMeta | undefined;
}) {
    const { query, setPage, setPerPage } = useDataTableContext();
    const lastPage = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? query.page;

    return (
        <div className="flex flex-col-reverse items-center justify-between gap-3 px-1 sm:flex-row">
            <p className="text-muted-foreground text-sm">
                {meta && meta.total > 0
                    ? `Showing ${meta.from}–${meta.to} of ${meta.total}`
                    : 'No results'}
            </p>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Rows per page</span>
                    <Select
                        value={String(query.perPage)}
                        onValueChange={(value) => setPerPage(Number(value))}
                    >
                        <SelectTrigger
                            size="sm"
                            className="w-18"
                            aria-label="Rows per page"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {PER_PAGE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <span className="text-sm whitespace-nowrap">
                    Page {currentPage} of {lastPage}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 sm:inline-flex"
                        onClick={() => setPage(1)}
                        disabled={currentPage <= 1}
                        aria-label="First page"
                    >
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= lastPage}
                        aria-label="Next page"
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 sm:inline-flex"
                        onClick={() => setPage(lastPage)}
                        disabled={currentPage >= lastPage}
                        aria-label="Last page"
                    >
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
