export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function readApiError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    return extractErrorMessage(payload.error, fallback);
  }
  return extractErrorMessage(payload, fallback);
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (Array.isArray(error)) {
    const messages = error.map((item) => extractErrorMessage(item, '')).filter(Boolean);
    return messages.length > 0 ? messages.join(', ') : fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return extractErrorMessage(error.message, fallback);
  }
  return fallback;
}
