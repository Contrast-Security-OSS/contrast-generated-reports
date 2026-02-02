/**
 * Mock Service Worker Server
 * Sets up MSW for Node.js testing environment
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

// Create MSW server with handlers
export const server = setupServer(...handlers);

// Start server before all tests
export function setupMockServer() {
  server.listen({
    onUnhandledRequest: 'warn' // Warn about unhandled requests
  });
}

// Reset handlers between tests
export function resetMockServer() {
  server.resetHandlers();
}

// Close server after all tests
export function teardownMockServer() {
  server.close();
}

// Export server for custom handler manipulation in tests
export default server;
