// API Error types
export interface ApiErrorResponse {
    error: string;
    code?: number;
    status?: string;
    type?: string;
}

// Helper to check if value is ApiErrorResponse
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return (
        typeof value === 'object' &&
        value !== null &&
        'error' in value &&
        typeof (value as any).error === 'string'
    );
}
