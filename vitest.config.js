import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // Setup files to run before tests
    setupFiles: ['./tests/setup.js'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'server.py'
      ],
      // Target 80% coverage
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },

    // Test file patterns
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],

    // Exclude patterns
    exclude: ['node_modules', '.beads', '.claude', '.git'],

    // Test timeout (5 seconds)
    testTimeout: 5000,

    // Hook timeout (10 seconds)
    hookTimeout: 10000,
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
      '@models': '/src/models',
      '@controllers': '/src/controllers',
      '@views': '/src/views',
      '@tests': '/tests'
    }
  }
});
