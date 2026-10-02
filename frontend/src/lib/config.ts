export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiMode = process.env.NEXT_PUBLIC_API_MODE === 'mock' ? 'mock' : 'live';

export const usagePollMs = 15_000;
