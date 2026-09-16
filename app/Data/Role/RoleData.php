<?php

namespace App\Data\Role;

use Spatie\LaravelData\Data;

class RoleData extends Data
{
    /**
     * @param  list<string>  $permissions  Permission names to sync.
     */
    public function __construct(
        public string $name,
        public array $permissions,
    ) {}
}
