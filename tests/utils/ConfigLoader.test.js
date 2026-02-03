/**
 * ConfigLoader Tests
 * Tests for credential loading from .creds file
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigLoader } from '@/utils/ConfigLoader.js';

describe('ConfigLoader', () => {
  beforeEach(() => {
    // Clear window.CONTRAST_CONFIG before each test
    delete window.CONTRAST_CONFIG;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseCredsFile', () => {
    it('should parse valid .creds file content', () => {
      const content = `# .creds file - Never commit this to version control
CONTRAST_URL=https://eval.contrastsecurity.com/Contrast
ORG_ID=545a3bce-97c5-4732-af38-1ac459087b0a
USERNAME=jason.easterday@contrastsecurity.com
API_KEY=16s58pRXBJrIYcn9hQO9v7g3kU4Jf02o
SERVICE_KEY=0JWTRJY3994AMHTY
APP_ID=14c302ab-f99c-473e-a869-5171663dcab1`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.orgId).toBe('545a3bce-97c5-4732-af38-1ac459087b0a');
      expect(config.username).toBe('jason.easterday@contrastsecurity.com');
      expect(config.apiKey).toBe('16s58pRXBJrIYcn9hQO9v7g3kU4Jf02o');
      expect(config.serviceKey).toBe('0JWTRJY3994AMHTY');
      expect(config.appId).toBe('14c302ab-f99c-473e-a869-5171663dcab1');
      expect(config.baseUrl).toBe('https://eval.contrastsecurity.com/Contrast/api/ng');
    });

    it('should skip comments and empty lines', () => {
      const content = `# Comment line

# Another comment
ORG_ID=test-org
# Inline comment after value doesn't break parsing
USERNAME=test@example.com`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.orgId).toBe('test-org');
      expect(config.username).toBe('test@example.com');
    });

    it('should handle commented out values', () => {
      const content = `ORG_ID=active-org
# ORG_ID=commented-org`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.orgId).toBe('active-org');
    });

    it('should handle missing values', () => {
      const content = `ORG_ID=test-org`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.orgId).toBe('test-org');
      expect(config.username).toBeNull();
      expect(config.apiKey).toBeNull();
    });

    it('should normalize CONTRAST_URL to baseUrl format', () => {
      const content = `CONTRAST_URL=https://app.contrastsecurity.com/Contrast`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.baseUrl).toBe('https://app.contrastsecurity.com/Contrast/api/ng');
    });

    it('should handle CONTRAST_URL without /Contrast suffix', () => {
      const content = `CONTRAST_URL=https://app.contrastsecurity.com`;

      const config = ConfigLoader.parseCredsFile(content);

      expect(config.baseUrl).toBe('https://app.contrastsecurity.com/Contrast/api/ng');
    });
  });

  describe('loadFromCredsFile', () => {
    it('should load and parse .creds file successfully', async () => {
      const mockContent = `CONTRAST_URL=https://test.example.com/Contrast
ORG_ID=test-org-123
USERNAME=test@example.com
API_KEY=test-api-key
SERVICE_KEY=test-service-key`;

      // Mock fetch to return .creds content
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent)
      });

      const config = await ConfigLoader.loadFromCredsFile('/.creds');

      expect(config).toBeDefined();
      expect(config.orgId).toBe('test-org-123');
      expect(config.username).toBe('test@example.com');
      expect(config.apiKey).toBe('test-api-key');
    });

    it('should return null if .creds file not found', async () => {
      // Mock fetch to return 404
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = await ConfigLoader.loadFromCredsFile('/.creds');

      expect(config).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not load .creds file'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = await ConfigLoader.loadFromCredsFile('/.creds');

      expect(config).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('init', () => {
    it('should use existing window.CONTRAST_CONFIG if present', async () => {
      const existingConfig = {
        orgId: 'existing-org',
        apiKey: 'existing-key',
        baseUrl: 'https://existing.example.com/api'
      };
      window.CONTRAST_CONFIG = existingConfig;

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const config = await ConfigLoader.init();

      expect(config).toBe(existingConfig);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using existing window.CONTRAST_CONFIG')
      );

      consoleLogSpy.mockRestore();
    });

    it('should load from .creds file if window.CONTRAST_CONFIG not present', async () => {
      const mockContent = `CONTRAST_URL=https://test.example.com/Contrast
ORG_ID=loaded-org
USERNAME=loaded@example.com
API_KEY=loaded-key
SERVICE_KEY=loaded-service-key`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent)
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const config = await ConfigLoader.init();

      expect(config).toBeDefined();
      expect(config.orgId).toBe('loaded-org');
      expect(window.CONTRAST_CONFIG).toBe(config);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Loaded configuration from .creds file')
      );

      consoleLogSpy.mockRestore();
    });

    it('should fall back to default config if .creds loading fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = await ConfigLoader.init();

      expect(config).toBeDefined();
      expect(config.orgId).toBeDefined();
      expect(window.CONTRAST_CONFIG).toBe(config);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using default configuration')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should allow custom .creds path', async () => {
      const mockContent = `ORG_ID=custom-org`;

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent)
      });
      global.fetch = fetchSpy;

      await ConfigLoader.init('/custom/.creds');

      expect(fetchSpy).toHaveBeenCalledWith('/custom/.creds');
    });
  });

  describe('getConfig', () => {
    it('should return current config', () => {
      const testConfig = { orgId: 'test-org' };
      window.CONTRAST_CONFIG = testConfig;

      const config = ConfigLoader.getConfig();

      expect(config).toBe(testConfig);
    });

    it('should return null if no config set', () => {
      const config = ConfigLoader.getConfig();

      expect(config).toBeNull();
    });
  });

  describe('setConfig', () => {
    it('should set config manually', () => {
      const testConfig = {
        orgId: 'manual-org',
        apiKey: 'manual-key',
        baseUrl: 'https://manual.example.com/api'
      };

      ConfigLoader.setConfig(testConfig);

      expect(window.CONTRAST_CONFIG).toBe(testConfig);
    });

    it('should override existing config', () => {
      window.CONTRAST_CONFIG = { orgId: 'old-org' };

      const newConfig = { orgId: 'new-org' };
      ConfigLoader.setConfig(newConfig);

      expect(window.CONTRAST_CONFIG).toBe(newConfig);
      expect(window.CONTRAST_CONFIG.orgId).toBe('new-org');
    });
  });
});
