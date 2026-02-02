/**
 * ApiClient Tests
 * Tests for centralized Contrast API client
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@/utils/ApiClient.js';

describe('ApiClient', () => {
  let client;

  beforeEach(() => {
    client = new ApiClient();
  });

  describe('Initialization', () => {
    it('should create an ApiClient instance', () => {
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should load config from window.CONTRAST_CONFIG', () => {
      window.CONTRAST_CONFIG = {
        orgId: 'test-org',
        apiKey: 'test-key',
        serviceKey: 'test-service',
        username: 'test@example.com',
        baseUrl: 'https://test.contrastsecurity.com/Contrast/api/ng'
      };

      const newClient = new ApiClient();

      expect(newClient.config.orgId).toBe('test-org');
      expect(newClient.config.baseUrl).toBe('https://test.contrastsecurity.com/Contrast/api/ng');
    });

    it('should use default config if window.CONTRAST_CONFIG is missing', () => {
      delete window.CONTRAST_CONFIG;

      const newClient = new ApiClient();

      expect(newClient.config.orgId).toBeDefined();
      expect(newClient.config.baseUrl).toContain('contrastsecurity.com');
    });
  });

  describe('buildUrl', () => {
    it('should build full URL with org ID', () => {
      const url = client.buildUrl('/orgtraces/filter');

      expect(url).toContain(client.config.orgId);
      expect(url).toContain('/orgtraces/filter');
    });

    it('should handle URLs with query parameters', () => {
      const url = client.buildUrl('/orgtraces/filter?limit=10');

      expect(url).toContain('?limit=10');
    });

    it('should handle URLs already containing org ID', () => {
      const url = client.buildUrl(`/${client.config.orgId}/orgtraces/filter`);

      // Should not duplicate org ID
      const orgIdCount = (url.match(new RegExp(client.config.orgId, 'g')) || []).length;
      expect(orgIdCount).toBe(1);
    });
  });

  describe('buildHeaders', () => {
    it('should build authorization headers', () => {
      const headers = client.buildHeaders();

      expect(headers).toHaveProperty('Authorization');
      expect(headers).toHaveProperty('API-Key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should include custom headers', () => {
      const headers = client.buildHeaders({ 'X-Custom': 'value' });

      expect(headers['X-Custom']).toBe('value');
    });
  });

  describe('fetch', () => {
    it('should make successful API request', async () => {
      const response = await client.fetch('/orgtraces/filter?limit=10');

      expect(response.success).toBe(true);
      expect(response.traces).toBeDefined();
    });

    it('should handle API errors', async () => {
      const response = await client.fetch('/invalid-endpoint');

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should retry on network errors', async () => {
      // This will test the retry logic by hitting an endpoint that fails initially
      const response = await client.fetch('/test-error');

      // Should eventually return an error response after retries
      expect(response.success).toBe(false);
    });

    it('should handle timeout', async () => {
      const response = await client.fetch('/slow-endpoint', { timeout: 100 });

      expect(response.success).toBe(false);
    });
  });

  describe('get', () => {
    it('should make GET request', async () => {
      const response = await client.get('/orgtraces/filter', { limit: 10 });

      expect(response.success).toBe(true);
    });
  });

  describe('post', () => {
    it('should make POST request', async () => {
      const response = await client.post('/test-endpoint', { data: 'test' });

      expect(response).toBeDefined();
    });
  });

  describe('parseResponse', () => {
    it('should parse successful JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, traces: [] })
      };

      const result = await client.parseResponse(mockResponse);

      expect(result.success).toBe(true);
      expect(result.traces).toBeDefined();
    });

    it('should handle non-OK responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' })
      };

      const result = await client.parseResponse(mockResponse);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle JSON parse errors', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); }
      };

      const result = await client.parseResponse(mockResponse);

      expect(result.success).toBe(false);
    });
  });

  describe('retry logic', () => {
    it('should have configurable retry attempts', () => {
      const customClient = new ApiClient({ maxRetries: 5 });

      expect(customClient.maxRetries).toBe(5);
    });

    it('should have configurable retry delay', () => {
      const customClient = new ApiClient({ retryDelay: 2000 });

      expect(customClient.retryDelay).toBe(2000);
    });
  });

  describe('logging', () => {
    it('should support debug mode', () => {
      const debugClient = new ApiClient({ debug: true });

      expect(debugClient.debug).toBe(true);
    });
  });
});
