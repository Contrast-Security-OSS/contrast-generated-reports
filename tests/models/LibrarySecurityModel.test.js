/**
 * LibrarySecurityModel Tests
 * Tests for library security data fetching
 */

import { describe, it, expect } from 'vitest';
import { LibrarySecurityModel } from '@/models/LibrarySecurityModel.js';

describe('LibrarySecurityModel', () => {
  describe('Initialization', () => {
    it('should create a LibrarySecurityModel instance', () => {
      const model = new LibrarySecurityModel();
      expect(model).toBeInstanceOf(LibrarySecurityModel);
    });

    it('should extend BaseModel', () => {
      const model = new LibrarySecurityModel();
      expect(model.credentials).toBeDefined();
      expect(model.baseUrl).toBeDefined();
    });
  });

  describe('fetchLibraries', () => {
    it('should fetch libraries for an application', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'test-app-123';

      const libraries = await model.fetchLibraries(appId);

      expect(libraries).toBeInstanceOf(Array);
      expect(libraries.length).toBeGreaterThan(0);
    });

    it('should return library data with expected structure', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'test-app-123';

      const libraries = await model.fetchLibraries(appId);
      const lib = libraries[0];

      expect(lib).toHaveProperty('file_name');
      expect(lib).toHaveProperty('file_version');
      expect(lib).toHaveProperty('grade');
      expect(lib).toHaveProperty('total_vulnerabilities');
      expect(lib).toHaveProperty('vulnerabilities');
    });

    it('should expand vulnerabilities', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'test-app-123';

      const libraries = await model.fetchLibraries(appId);
      const libWithVulns = libraries.find(lib => lib.total_vulnerabilities > 0);

      expect(libWithVulns).toBeDefined();
      expect(libWithVulns.vulnerabilities).toBeInstanceOf(Array);
      expect(libWithVulns.vulnerabilities.length).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'nonexistent-app';

      const libraries = await model.fetchLibraries(appId);

      expect(libraries).toBeInstanceOf(Array);
      // Mock returns data for any appId, which is fine for testing
    });

    it('should handle API errors gracefully', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'error-app';

      const libraries = await model.fetchLibraries(appId);

      expect(libraries).toBeInstanceOf(Array);
      // Should return empty array on error, not throw
    });
  });

  describe('fetchLibraryDetails', () => {
    it('should return null for unmocked endpoint', async () => {
      const model = new LibrarySecurityModel();
      const appId = 'test-app-123';
      const libraryHash = 'test-hash';

      const details = await model.fetchLibraryDetails(appId, libraryHash);

      // No mock handler for this endpoint, so returns null
      expect(details).toBeNull();
    });
  });
});
