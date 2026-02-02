/**
 * Test Setup File
 * Runs before all tests to configure the testing environment
 */

import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { setupMockServer, resetMockServer, teardownMockServer } from './mocks/server.js';

// Setup MSW server before all tests
beforeAll(() => {
  setupMockServer();
});

// Reset handlers after each test and cleanup DOM
afterEach(() => {
  resetMockServer();
  // Clear the document body after each test
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});

// Cleanup MSW server after all tests
afterAll(() => {
  teardownMockServer();
});

// Add custom matchers if needed
// expect.extend({ ... });

// Mock environment variables if needed
process.env.NODE_ENV = 'test';

// Global test utilities can be added here
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create mock fetch responses
  mockFetchResponse: (data, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  },

  // Helper to create mock fetch error
  mockFetchError: (message = 'Network error') => {
    return Promise.reject(new Error(message));
  }
};

console.log('✓ Test environment configured');
