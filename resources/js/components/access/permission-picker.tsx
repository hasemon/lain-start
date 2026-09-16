import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PermissionGroup } from '@/types';

type PermissionPickerProps = {
    groups: PermissionGroup[];
    /** Form field name; each checked permission is submitted as `name[]`. */
    name: string;
    defaultValue?: string[];
    error?: string;
    disabled?: boolean;
    /** Show every permission as granted and locked (e.g. Super Admin). Nothing is submitted. */
    grantsAll?: boolean;
    grantsAllMessage?: string;
};

/**
 * Checkbox grid of permissions from config/permissions.php, grouped by module,
 * with a "select all" per group.
 */
export function PermissionPicker({
    groups,
    name,
    defaultValue = [],
    error,
    disabled = false,
    grantsAll = false,
    grantsAllMessage = 'This access already includes every permission.',
}: PermissionPickerProps) {
    const [selected, setSelected] = useState<Set<string>>(
        () => new Set(defaultValue),
    );

    const toggle = (permission: string, checked: boolean) => {
        setSelected((current) => {
            const next = new Set(current);

            if (checked) {
                next.add(permission);
            } else {
                next.delete(permission);
            }

            return next;
        });
    };

    const toggleGroup = (group: PermissionGroup, checked: boolean) => {
        setSelected((current) => {
            const next = new Set(current);

            for (const permission of group.permissions) {
                if (checked) {
                    next.add(permission.name);
                } else {
                    next.delete(permission.name);
                }
            }

            return next;
        });
    };

    const isChecked = (permission: string): boolean =>
        grantsAll || selected.has(permission);
    const isLocked = disabled || grantsAll;

    return (
        <div className="space-y-3">
            {grantsAll && (
                <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
                    {grantsAllMessage}
                </p>
            )}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {groups.map((group) => {
                    const checkedCount = group.permissions.filter(
                        (permission) => isChecked(permission.name),
                    ).length;
                    const groupState =
                        checkedCount === 0
                            ? false
                            : checkedCount === group.permissions.length
                              ? true
                              : 'indeterminate';

                    return (
                        <fieldset
                            key={group.key}
                            className="rounded-md border p-3"
                        >
                            <legend className="sr-only">{group.label}</legend>
                            <div className="mb-2 flex items-center gap-2 border-b pb-2">
                                <Checkbox
                                    id={`${name}-group-${group.key}`}
                                    checked={groupState}
                                    disabled={isLocked}
                                    onCheckedChange={(checked) =>
                                        toggleGroup(group, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={`${name}-group-${group.key}`}
                                    className="font-medium"
                                >
                                    {group.label}
                                </Label>
                                <span className="text-muted-foreground ml-auto text-xs">
                                    {checkedCount}/{group.permissions.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {group.permissions.map((permission) => {
                                    const id = `${name}-${permission.name}`;

                                    return (
                                        <div
                                            key={permission.name}
                                            className="flex items-start gap-2"
                                        >
                                            <Checkbox
                                                id={id}
                                                name={
                                                    grantsAll
                                                        ? undefined
                                                        : `${name}[]`
                                                }
                                                value={permission.name}
                                                checked={isChecked(
                                                    permission.name,
                                                )}
                                                disabled={isLocked}
                                                onCheckedChange={(checked) =>
                                                    toggle(
                                                        permission.name,
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={id}
                                                className="leading-tight font-normal"
                                            >
                                                <span>{permission.label}</span>
                                                <span className="text-muted-foreground sr-only sm:not-sr-only sm:ml-1 sm:text-xs">
                                                    {permission.name}
                                                </span>
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </fieldset>
                    );
                })}
            </div>
            <InputError message={error} />
        </div>
    );
}
