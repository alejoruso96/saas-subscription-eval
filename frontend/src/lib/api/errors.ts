export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
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
