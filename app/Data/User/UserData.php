<?php

namespace App\Data\User;

use Spatie\LaravelData\Data;

class UserData extends Data
{
    /**
     * @param  list<string>  $roles  Role names to sync.
     * @param  list<string>  $permissions  Extra (direct) permission names to sync.
     */
    public function __construct(
        public string $name,
        public string $email,
        public ?string $password,
        public array $roles,
        public array $permissions,
    ) {}
}
