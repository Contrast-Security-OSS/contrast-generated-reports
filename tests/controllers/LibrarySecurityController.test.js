/**
 * LibrarySecurityController Tests
 * Tests for library security data transformation and business logic
 */

import { describe, it, expect } from 'vitest';
import { LibrarySecurityController } from '@/controllers/LibrarySecurityController.js';

describe('LibrarySecurityController', () => {
  const sampleLibraries = [
    {
      file_name: 'spring-core-5.3.20.jar',
      file_version: '5.3.20',
      grade: 'A',
      total_vulnerabilities: 0,
      release_date: 1650000000000,
      latest_version: '5.3.23',
      latest_release_date: 1660000000000,
      vulnerabilities: []
    },
    {
      file_name: 'log4j-core-2.14.1.jar',
      file_version: '2.14.1',
      grade: 'F',
      total_vulnerabilities: 3,
      release_date: 1610000000000,
      latest_version: '2.20.0',
      latest_release_date: 1680000000000,
      vulnerabilities: [
        { name: 'CVE-2021-44228', severity: 'CRITICAL', severityCode: 'CRITICAL' },
        { name: 'CVE-2021-45046', severity: 'HIGH', severityCode: 'HIGH' },
        { name: 'CVE-2021-45105', severity: 'MEDIUM', severityCode: 'MEDIUM' }
      ]
    }
  ];

  describe('Initialization', () => {
    it('should create a LibrarySecurityController instance', () => {
      const controller = new LibrarySecurityController();
      expect(controller).toBeInstanceOf(LibrarySecurityController);
    });
  });

  describe('calculateStats', () => {
    it('should calculate basic statistics', () => {
      const controller = new LibrarySecurityController();
      const stats = controller.calculateStats(sampleLibraries);

      expect(stats.total).toBe(2);
      expect(stats.withCVEs).toBe(1);
      expect(stats.totalCVEs).toBe(3);
      expect(stats.criticalVulns).toBe(1);
    });

    it('should calculate grade distribution', () => {
      const controller = new LibrarySecurityController();
      const stats = controller.calculateStats(sampleLibraries);

      expect(stats.grades.A).toBe(1);
      expect(stats.grades.F).toBe(1);
      expect(stats.grades.B).toBe(0);
    });

    it('should calculate average age', () => {
      const controller = new LibrarySecurityController();
      const stats = controller.calculateStats(sampleLibraries);

      expect(stats.avgAge).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      const controller = new LibrarySecurityController();
      const stats = controller.calculateStats([]);

      expect(stats.total).toBe(0);
      expect(stats.withCVEs).toBe(0);
      expect(stats.avgAge).toBe(0);
    });
  });

  describe('calculateRisk', () => {
    it('should calculate risk score based on vulnerabilities', () => {
      const controller = new LibrarySecurityController();
      const libWithVulns = sampleLibraries[1];

      const risk = controller.calculateRisk(libWithVulns);

      expect(risk).toBeGreaterThan(0);
      expect(risk).toBeLessThanOrEqual(100);
    });

    it('should give higher risk to CRITICAL vulnerabilities', () => {
      const controller = new LibrarySecurityController();
      const criticalLib = {
        grade: 'A',
        vulnerabilities: [{ severityCode: 'CRITICAL' }],
        release_date: Date.now(),
        latest_release_date: Date.now()
      };
      const lowLib = {
        grade: 'A',
        vulnerabilities: [{ severityCode: 'LOW' }],
        release_date: Date.now(),
        latest_release_date: Date.now()
      };

      const criticalRisk = controller.calculateRisk(criticalLib);
      const lowRisk = controller.calculateRisk(lowLib);

      expect(criticalRisk).toBeGreaterThan(lowRisk);
    });

    it('should factor in library age', () => {
      const controller = new LibrarySecurityController();
      const oldLib = {
        grade: 'A',
        vulnerabilities: [],
        release_date: 1000000000000, // Very old
        latest_release_date: Date.now()
      };

      const risk = controller.calculateRisk(oldLib);

      expect(risk).toBeGreaterThan(0);
    });

    it('should factor in library grade', () => {
      const controller = new LibrarySecurityController();
      const fGradeLib = {
        grade: 'F',
        vulnerabilities: [],
        release_date: Date.now(),
        latest_release_date: Date.now()
      };
      const aGradeLib = {
        grade: 'A',
        vulnerabilities: [],
        release_date: Date.now(),
        latest_release_date: Date.now()
      };

      const fRisk = controller.calculateRisk(fGradeLib);
      const aRisk = controller.calculateRisk(aGradeLib);

      expect(fRisk).toBeGreaterThan(aRisk);
    });

    it('should cap risk at 100', () => {
      const controller = new LibrarySecurityController();
      const veryRiskyLib = {
        grade: 'F',
        vulnerabilities: Array(20).fill({ severityCode: 'CRITICAL' }),
        release_date: 1000000000000,
        latest_release_date: Date.now()
      };

      const risk = controller.calculateRisk(veryRiskyLib);

      expect(risk).toBeLessThanOrEqual(100);
    });
  });

  describe('countVulnsBySeverity', () => {
    it('should count vulnerabilities by severity', () => {
      const controller = new LibrarySecurityController();
      const vulns = sampleLibraries[1].vulnerabilities;

      const counts = controller.countVulnsBySeverity(vulns);

      expect(counts.CRITICAL).toBe(1);
      expect(counts.HIGH).toBe(1);
      expect(counts.MEDIUM).toBe(1);
      expect(counts.LOW).toBe(0);
    });

    it('should handle empty vulnerabilities', () => {
      const controller = new LibrarySecurityController();

      const counts = controller.countVulnsBySeverity([]);

      expect(counts.CRITICAL).toBe(0);
      expect(counts.HIGH).toBe(0);
    });

    it('should handle null vulnerabilities', () => {
      const controller = new LibrarySecurityController();

      const counts = controller.countVulnsBySeverity(null);

      expect(counts).toBeDefined();
      expect(counts.CRITICAL).toBe(0);
    });
  });

  describe('filterByCritical', () => {
    it('should filter libraries with critical vulnerabilities', () => {
      const controller = new LibrarySecurityController();

      const result = controller.filterByCritical(sampleLibraries);

      expect(result).toHaveLength(1);
      expect(result[0].file_name).toBe('log4j-core-2.14.1.jar');
    });

    it('should return empty for no critical vulnerabilities', () => {
      const controller = new LibrarySecurityController();
      const safeLibs = [sampleLibraries[0]];

      const result = controller.filterByCritical(safeLibs);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterByGrade', () => {
    it('should filter libraries by grade', () => {
      const controller = new LibrarySecurityController();

      const fGrade = controller.filterByGrade(sampleLibraries, 'F');

      expect(fGrade).toHaveLength(1);
      expect(fGrade[0].grade).toBe('F');
    });

    it('should support multiple grades', () => {
      const controller = new LibrarySecurityController();

      const result = controller.filterByGrade(sampleLibraries, ['A', 'F']);

      expect(result).toHaveLength(2);
    });
  });

  describe('sortByRisk', () => {
    it('should sort libraries by risk score descending', () => {
      const controller = new LibrarySecurityController();

      const sorted = controller.sortByRisk(sampleLibraries);

      // log4j should be first (higher risk)
      expect(sorted[0].file_name).toBe('log4j-core-2.14.1.jar');
      expect(sorted[1].file_name).toBe('spring-core-5.3.20.jar');
    });

    it('should not mutate original array', () => {
      const controller = new LibrarySecurityController();
      const original = [...sampleLibraries];

      controller.sortByRisk(sampleLibraries);

      expect(sampleLibraries).toEqual(original);
    });
  });

  describe('calculateLibraryAge', () => {
    it('should calculate age in months', () => {
      const controller = new LibrarySecurityController();
      const lib = sampleLibraries[1];

      const age = controller.calculateLibraryAge(lib);

      expect(age).toBeGreaterThan(0);
    });

    it('should return 0 for missing dates', () => {
      const controller = new LibrarySecurityController();
      const lib = { file_name: 'test.jar' };

      const age = controller.calculateLibraryAge(lib);

      expect(age).toBe(0);
    });
  });
});
