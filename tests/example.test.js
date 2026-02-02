/**
 * Example Test - Verifies testing infrastructure is working
 */

import { describe, it, expect } from 'vitest';

describe('Testing Infrastructure', () => {
  it('should run basic test', () => {
    expect(true).toBe(true);
  });

  it('should have access to global test utils', () => {
    expect(global.testUtils).toBeDefined();
    expect(typeof global.testUtils.wait).toBe('function');
    expect(typeof global.testUtils.mockFetchResponse).toBe('function');
    expect(typeof global.testUtils.mockFetchError).toBe('function');
  });

  it('should create mock fetch responses', async () => {
    const mockData = { success: true, data: 'test' };
    const response = await global.testUtils.mockFetchResponse(mockData);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual(mockData);
  });

  it('should create mock fetch errors', async () => {
    const errorPromise = global.testUtils.mockFetchError('Test error');

    await expect(errorPromise).rejects.toThrow('Test error');
  });

  it('should wait for async operations', async () => {
    const start = Date.now();
    await global.testUtils.wait(100);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});

describe('MSW Mock Server', () => {
  it('should intercept API requests', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const appId = 'test-app-123';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/applications/${appId}/libraries`;

    const response = await fetch(url);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.libraries).toBeDefined();
    expect(Array.isArray(data.libraries)).toBe(true);
    expect(data.libraries.length).toBeGreaterThan(0);
  });

  it('should return mock library data', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const appId = 'test-app-123';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/applications/${appId}/libraries`;

    const response = await fetch(url);
    const data = await response.json();

    // Verify mock data structure
    const library = data.libraries[0];
    expect(library).toHaveProperty('file_name');
    expect(library).toHaveProperty('file_version');
    expect(library).toHaveProperty('grade');
    expect(library).toHaveProperty('total_vulnerabilities');
  });

  it('should filter vulnerabilities by severity', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/orgtraces/filter?severities=CRITICAL`;

    const response = await fetch(url);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.traces).toBeDefined();

    // All traces should be CRITICAL
    data.traces.forEach(trace => {
      expect(trace.severity).toBe('CRITICAL');
    });
  });

  it('should return attacks data', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/attacks`;

    const response = await fetch(url);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.attacks).toBeDefined();
    expect(Array.isArray(data.attacks)).toBe(true);
  });

  it('should return route coverage data', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const appId = 'test-app-123';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/applications/${appId}/route/coverage`;

    const response = await fetch(url);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.routes).toBeDefined();
    expect(Array.isArray(data.routes)).toBe(true);

    // Verify route structure
    const route = data.routes[0];
    expect(route).toHaveProperty('signature');
    expect(route).toHaveProperty('status');
  });

  it('should simulate API errors', async () => {
    const orgId = '545a3bce-97c5-4732-af38-1ac459087b0a';
    const url = `https://eval.contrastsecurity.com/Contrast/api/ng/${orgId}/test-error`;

    const response = await fetch(url);
    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
