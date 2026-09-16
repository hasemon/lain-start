<?php

namespace App\Http\Requests\Role;

use App\Concerns\PreventsPrivilegeEscalation;
use App\Data\Role\RoleData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Spatie\Permission\Models\Role;

class StoreRoleRequest extends FormRequest
{
    use PreventsPrivilegeEscalation;

    public function authorize(): bool
    {
        return $this->user()->can('create', Role::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['permissions' => $this->input('permissions', [])]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:100',
                Rule::unique('roles', 'name')->where('guard_name', config('permissions.guard')),
                Rule::notIn([config('permissions.super_admin_role')]),
            ],
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
                permissionNames: $this->input('permissions', []),
            ),
        ];
    }

    public function toData(): RoleData
    {
        return RoleData::from($this->safe()->only(['name', 'permissions']));
    }
}
