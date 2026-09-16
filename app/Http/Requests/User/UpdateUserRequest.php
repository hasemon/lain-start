<?php

namespace App\Http\Requests\User;

use App\Concerns\PreventsPrivilegeEscalation;
use App\Concerns\ProfileValidationRules;
use App\Data\User\UserData;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    use PreventsPrivilegeEscalation, ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()->can('update', $this->managedUser());
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
            ...$this->profileRules($this->managedUser()->id),
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
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

    public function managedUser(): User
    {
        /** @var User $user */
        $user = $this->route('user');

        return $user;
    }

    public function toData(): UserData
    {
        return UserData::from([
            'password' => null,
            ...$this->safe()->only(['name', 'email', 'password', 'roles', 'permissions']),
        ]);
    }
}
