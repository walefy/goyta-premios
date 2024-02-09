import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    coverage: {
      exclude: ['src/interfaces', 'src/server.ts', 'tests']
    },
    globals: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});