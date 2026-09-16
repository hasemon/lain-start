import { login } from '@/routes';
import type { ValidationErrors } from '@/types';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type ApiRoute = {
    url: string;
    method: HttpMethod;
};

type RequestOptions = {
    body?: unknown;
    signal?: AbortSignal;
};

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }

    get isValidationError(): boolean {
        return this.status === 422;
    }
}

function readXsrfToken(): string | null {
    const match = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='));

    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function messageFromBody(
    body: unknown,
    fallback: string,
): {
    message: string;
    errors: ValidationErrors;
} {
    if (typeof body !== 'object' || body === null) {
        return { message: fallback, errors: {} };
    }

    const errors =
        'errors' in body && typeof body.errors === 'object' && body.errors
            ? (body.errors as ValidationErrors)
            : {};
    const firstError = Object.values(errors)[0]?.[0];
    const message =
        firstError ??
        ('message' in body && typeof body.message === 'string'
            ? body.message
            : fallback);

    return { message, errors };
}

/**
 * The single HTTP client for JSON endpoints (TanStack Query fetchers and mutations).
 * Pass a Wayfinder route definition, e.g. `apiRequest(UserApi.index({ query }))`.
 */
export async function apiRequest<TResponse>(
    route: ApiRoute,
    { body, signal }: RequestOptions = {},
): Promise<TResponse> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    const xsrfToken = readXsrfToken();

    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(route.url, {
        method: route.method.toUpperCase(),
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'same-origin',
        signal,
    });

    if (response.status === 401) {
        window.location.assign(login().url);
    }

    if (response.status === 419) {
        window.location.reload();
    }

    if (response.status === 204) {
        return undefined as TResponse;
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const fallback =
            response.status >= 500
                ? 'Something went wrong on the server. Please try again.'
                : response.status === 403
                  ? 'You are not allowed to do that.'
                  : 'The request could not be completed.';
        const { message, errors } = messageFromBody(payload, fallback);

        throw new ApiError(
            response.status >= 500 ? fallback : message,
            response.status,
            errors,
        );
    }

    return payload as TResponse;
}
