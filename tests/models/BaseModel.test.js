/**
 * BaseModel Tests
 * Tests for the base Model class that all dashboard models extend
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseModel } from '@/models/BaseModel.js';

describe('BaseModel', () => {
  describe('Initialization', () => {
    it('should create a BaseModel instance', () => {
      const model = new BaseModel();
      expect(model).toBeInstanceOf(BaseModel);
    });

    it('should load credentials on initialization', () => {
      const model = new BaseModel();
      expect(model.credentials).toBeDefined();
      expect(model.credentials.orgId).toBeDefined();
      expect(model.credentials.apiKey).toBeDefined();
    });

    it('should construct base URL from credentials', () => {
      const model = new BaseModel();
      expect(model.baseUrl).toContain('Contrast/api/ng');
      expect(model.baseUrl).toContain(model.credentials.orgId);
    });
  });

  describe('Credential Loading', () => {
    it('should load credentials from .creds file', () => {
      const model = new BaseModel();
      const creds = model.credentials;

      expect(creds).toHaveProperty('orgId');
      expect(creds).toHaveProperty('apiKey');
      expect(creds).toHaveProperty('serviceKey');
      expect(creds).toHaveProperty('username');
    });

    it('should handle missing .creds file gracefully', () => {
      // Mock scenario where .creds file doesn't exist
      // Should use default mock credentials for testing
      const model = new BaseModel();
      expect(model.credentials).toBeDefined();
    });
  });

  describe('API Fetch Wrapper', () => {
    it('should make successful API call', async () => {
      const model = new BaseModel();
      const appId = 'test-app-123';
      const url = `${model.baseUrl}/applications/${appId}/libraries`;

      const response = await model.fetch(url);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });

    it('should include authorization headers', async () => {
      const model = new BaseModel();
      const fetchSpy = vi.spyOn(global, 'fetch');

      const url = `${model.baseUrl}/applications/test/libraries`;
      await model.fetch(url);

      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[0]).toBe(url);
      expect(callArgs[1].headers).toHaveProperty('Authorization');
      expect(callArgs[1].headers).toHaveProperty('API-Key', model.credentials.apiKey);
      expect(callArgs[1].headers).toHaveProperty('Content-Type', 'application/json');

      fetchSpy.mockRestore();
    });

    it('should handle API errors gracefully', async () => {
      const model = new BaseModel();
      const url = `${model.baseUrl}/test-error`;

      // Should not throw, should return error response
      const response = await model.fetch(url);

      expect(response).toBeDefined();
      expect(response.success).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      const model = new BaseModel({ retryDelay: 10 }); // Fast retries for testing
      const url = `${model.baseUrl}/test-network-error`;

      // Should not throw, should return error object
      const response = await model.fetch(url);

      expect(response).toBeDefined();
      expect(response.success).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests up to max retries', async () => {
      const model = new BaseModel({ maxRetries: 3, retryDelay: 10 }); // Fast retries for testing
      const fetchSpy = vi.spyOn(global, 'fetch');

      // Mock fetch to fail twice, succeed on third attempt
      let attemptCount = 0;
      fetchSpy.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] })
        });
      });

      const url = `${model.baseUrl}/applications/test/libraries`;
      const response = await model.fetch(url);

      expect(attemptCount).toBe(3);
      expect(response.success).toBe(true);

      fetchSpy.mockRestore();
    });

    it('should not retry successful requests', async () => {
      const model = new BaseModel({ maxRetries: 3 });
      const fetchSpy = vi.spyOn(global, 'fetch');

      const url = `${model.baseUrl}/applications/test-app-123/libraries`;
      await model.fetch(url);

      // Should only be called once for successful request
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    it('should give up after max retries exceeded', async () => {
      const model = new BaseModel({ maxRetries: 2, retryDelay: 10 }); // Fast retries for testing
      const fetchSpy = vi.spyOn(global, 'fetch');

      // Mock all requests to fail
      fetchSpy.mockRejectedValue(new Error('Network error'));

      const url = `${model.baseUrl}/applications/test/libraries`;
      const response = await model.fetch(url);

      // Should try initial + 2 retries = 3 total
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Network error');

      fetchSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      const model = new BaseModel();
      // Mock endpoint that returns 401 (add to MSW handlers)
      const url = `${model.baseUrl}/unauthorized`;

      const response = await model.fetch(url);

      expect(response.success).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should handle 404 Not Found', async () => {
      const model = new BaseModel();
      const url = `${model.baseUrl}/nonexistent`;

      const response = await model.fetch(url);

      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle 500 Server Error', async () => {
      const model = new BaseModel();
      const url = `${model.baseUrl}/test-error`;

      const response = await model.fetch(url);

      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should provide error details', async () => {
      const model = new BaseModel();
      const url = `${model.baseUrl}/test-error`;

      const response = await model.fetch(url);

      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(false);
    });
  });

  describe('Logging and Debugging', () => {
    it('should log API calls when debug enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const model = new BaseModel({ debug: true });

      const url = `${model.baseUrl}/applications/test-app-123/libraries`;
      await model.fetch(url);

      // Check that at least one call contains "API Request"
      const apiRequestCall = consoleSpy.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('API Request'))
      );
      expect(apiRequestCall).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should not log when debug disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const model = new BaseModel({ debug: false });

      const url = `${model.baseUrl}/applications/test-app-123/libraries`;
      await model.fetch(url);

      // Should not have logged API Request (only from setup.js)
      const apiRequestCall = consoleSpy.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('API Request'))
      );
      expect(apiRequestCall).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should log errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const model = new BaseModel({ debug: true });

      const url = `${model.baseUrl}/test-error`;
      await model.fetch(url);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Error'),
        expect.anything()
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Helper Methods', () => {
    it('should provide handleError method', () => {
      const model = new BaseModel();
      expect(typeof model.handleError).toBe('function');
    });

    it('should handle errors without throwing', () => {
      const model = new BaseModel();
      const error = new Error('Test error');

      expect(() => {
        model.handleError('testMethod', error);
      }).not.toThrow();
    });

    it('should format error responses consistently', () => {
      const model = new BaseModel();
      const error = new Error('Test error');

      const formattedError = model.formatError(error, 500);

      expect(formattedError).toHaveProperty('success', false);
      expect(formattedError).toHaveProperty('error');
      expect(formattedError).toHaveProperty('status');
    });
  });

  describe('Configuration Options', () => {
    it('should accept custom maxRetries', () => {
      const model = new BaseModel({ maxRetries: 5 });
      expect(model.maxRetries).toBe(5);
    });

    it('should accept custom timeout', () => {
      const model = new BaseModel({ timeout: 10000 });
      expect(model.timeout).toBe(10000);
    });

    it('should accept debug flag', () => {
      const model = new BaseModel({ debug: true });
      expect(model.debug).toBe(true);
    });

    it('should use default values when not provided', () => {
      const model = new BaseModel();
      expect(model.maxRetries).toBeGreaterThan(0);
      expect(model.timeout).toBeGreaterThan(0);
      expect(model.debug).toBeDefined();
    });
  });
});
