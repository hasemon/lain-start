<?php

use App\Http\Controllers\Api\RoleController as RoleApiController;
use App\Http\Controllers\Api\UserController as UserApiController;
use App\Http\Controllers\Role\RoleController;
use App\Http\Controllers\User\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('users', [UserController::class, 'index'])->can('viewAny', User::class)->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');

    Route::get('roles', [RoleController::class, 'index'])->can('viewAny', Role::class)->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');

    Route::prefix('api')->name('api.')->group(function () {
        Route::get('users', [UserApiController::class, 'index'])->name('users.index');
        Route::delete('users/{user}', [UserApiController::class, 'destroy'])->name('users.destroy');

        Route::get('roles', [RoleApiController::class, 'index'])->name('roles.index');
        Route::delete('roles/{role}', [RoleApiController::class, 'destroy'])->name('roles.destroy');
    });
});
