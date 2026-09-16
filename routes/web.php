<?php

use App\Actions\Fortify\CreateNewUser;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome', [
    'canRegister' => fn (): bool => CreateNewUser::registrationIsOpen(),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

require __DIR__.'/access.php';
