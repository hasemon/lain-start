<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Super Admin Role
    |--------------------------------------------------------------------------
    |
    | Users with this role pass every Gate / Policy check through Gate::before.
    | The role is never given explicit permissions. The first user who
    | registers is assigned this role automatically.
    |
    */

    'super_admin_role' => 'Super Admin',

    /*
    |--------------------------------------------------------------------------
    | Guard
    |--------------------------------------------------------------------------
    */

    'guard' => 'web',

    /*
    |--------------------------------------------------------------------------
    | Permission Groups
    |--------------------------------------------------------------------------
    |
    | Single source of truth for every permission in the application. Seed
    | them with `php artisan db:seed --class=PermissionSeeder`. Keys are the
    | permission names ({resource}.{ability}); values are human labels used
    | by the role & permission management screens.
    |
    */

    'groups' => [

        'users' => [
            'label' => 'Users',
            'permissions' => [
                'users.view' => 'View users',
                'users.create' => 'Create users',
                'users.update' => 'Update users',
                'users.delete' => 'Delete users',
            ],
        ],

        'roles' => [
            'label' => 'Roles & Permissions',
            'permissions' => [
                'roles.view' => 'View roles',
                'roles.manage' => 'Manage roles and permissions',
            ],
        ],

        'activity' => [
            'label' => 'Audit Log',
            'permissions' => [
                'activity.view' => 'View audit log',
            ],
        ],

        'settings' => [
            'label' => 'Settings',
            'permissions' => [
                'settings.manage' => 'Manage system settings',
            ],
        ],

        'organization' => [
            'label' => 'Organization',
            'permissions' => [
                'organization.view' => 'View organization structure',
                'organization.manage' => 'Manage organization structure',
            ],
        ],

        'employees' => [
            'label' => 'Employees',
            'permissions' => [
                'employees.view' => 'View employees',
                'employees.create' => 'Create employees',
                'employees.update' => 'Update employees',
                'employees.delete' => 'Delete employees',
                'employees.documents.view' => 'View employee documents',
                'employees.documents.manage' => 'Manage employee documents',
                'employees.salary.view' => 'View employee salary',
                'employees.salary.manage' => 'Manage employee salary',
            ],
        ],

        'attendance' => [
            'label' => 'Attendance',
            'permissions' => [
                'attendance.view' => 'View attendance',
                'attendance.manage' => 'Manage attendance',
                'attendance.adjust' => 'Adjust attendance',
            ],
        ],

        'shifts' => [
            'label' => 'Shifts',
            'permissions' => [
                'shifts.view' => 'View shifts',
                'shifts.manage' => 'Manage shifts',
            ],
        ],

        'leave' => [
            'label' => 'Leave',
            'permissions' => [
                'leave.view' => 'View leave',
                'leave.request' => 'Request leave',
                'leave.approve' => 'Approve leave',
                'leave.manage' => 'Manage leave',
            ],
        ],

        'payroll' => [
            'label' => 'Payroll',
            'permissions' => [
                'payroll.view' => 'View payroll',
                'payroll.generate' => 'Generate payroll',
                'payroll.review' => 'Review payroll',
                'payroll.approve' => 'Approve payroll',
                'payroll.finalize' => 'Finalize payroll',
            ],
        ],

        'recruitment' => [
            'label' => 'Recruitment',
            'permissions' => [
                'recruitment.view' => 'View recruitment',
                'recruitment.manage' => 'Manage recruitment',
            ],
        ],

        'performance' => [
            'label' => 'Performance',
            'permissions' => [
                'performance.view' => 'View performance',
                'performance.manage' => 'Manage performance',
            ],
        ],

    ],

];
