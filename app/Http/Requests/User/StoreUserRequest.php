<?php

namespace App\Http\Requests\User;

use App\Concerns\PasswordValidationRules;
use App\Concerns\PreventsPrivilegeEscalation;
use App\Concerns\ProfileValidationRules;
use App\Data\User\UserData;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    use PasswordValidationRules, PreventsPrivilegeEscalation, ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'roles' => $this->input('roles', []),
            'permissions' => $this->input('permissions', []),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'roles' => ['array'],
            'roles.*' => ['string', 'distinct', Rule::exists('roles', 'name')->where('guard_name', config('permissions.guard'))],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'distinct', Rule::exists('permissions', 'name')->where('guard_name', config('permissions.guard'))],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            fn (Validator $validator) => $this->validateGrantableAccess(
                $validator,
                $this->user(),
                $this->input('roles', []),
                $this->input('permissions', []),
            ),
        ];
    }

    public function toData(): UserData
    {
        return UserData::from([
            ...$this->safe()->only(['name', 'email', 'password', 'roles', 'permissions']),
        ]);
    }
}
