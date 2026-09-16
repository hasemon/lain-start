/** First error for a field or any of its array items (`roles`, `roles.0`, …). */
export function fieldError(
    errors: Partial<Record<string, string>>,
    field: string,
): string | undefined {
    if (errors[field]) {
        return errors[field];
    }

    const itemKey = Object.keys(errors).find((key) =>
        key.startsWith(`${field}.`),
    );

    return itemKey ? errors[itemKey] : undefined;
}
