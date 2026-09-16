<?php

namespace App\Http\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * One search box across a fixed list of columns (`filter[search]=...`).
 *
 * @implements Filter<Model>
 */
class SearchFilter implements Filter
{
    /**
     * @param  list<string>  $columns
     */
    public function __construct(private array $columns) {}

    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $term = trim(is_array($value) ? implode(',', $value) : (string) $value);

        if ($term === '') {
            return;
        }

        $escaped = '%'.addcslashes($term, '%_\\').'%';

        $query->where(function (Builder $query) use ($escaped): void {
            foreach ($this->columns as $column) {
                $query->orWhere($column, 'like', $escaped);
            }
        });
    }
}
