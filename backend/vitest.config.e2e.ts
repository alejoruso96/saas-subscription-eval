import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'saas',
      DB_PASSWORD: 'saas',
      DB_NAME: 'saas_subscriptions_test',
    },
  },
});
