/**
 * LibrarySecurityController - Business logic for library security
 * Handles risk calculations, filtering, and data transformations
 */

import { BaseController } from './BaseController.js';

export class LibrarySecurityController extends BaseController {
  /**
   * Calculate statistics from library data
   * @param {Array} libraries - Array of library objects
   * @returns {Object} Statistics object
   */
  calculateStats(libraries) {
    const stats = {
      total: libraries.length,
      withCVEs: 0,
      totalCVEs: 0,
      criticalVulns: 0,
      grades: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      avgAge: 0,
      totalAge: 0
    };

    libraries.forEach(lib => {
      // Count libraries with CVEs
      if (lib.total_vulnerabilities > 0) {
        stats.withCVEs++;
        stats.totalCVEs += lib.total_vulnerabilities;
      }

      // Count critical vulnerabilities
      if (lib.vulnerabilities) {
        lib.vulnerabilities.forEach(vuln => {
          if (vuln.severityCode === 'CRITICAL') {
            stats.criticalVulns++;
          }
        });
      }

      // Count grades
      if (lib.grade) {
        stats.grades[lib.grade] = (stats.grades[lib.grade] || 0) + 1;
      }

      // Calculate age
      if (lib.latest_release_date && lib.release_date) {
        const ageMs = lib.latest_release_date - lib.release_date;
        const ageMonths = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30));
        stats.totalAge += ageMonths;
      }
    });

    stats.avgAge = stats.total > 0 ? Math.floor(stats.totalAge / stats.total) : 0;
    return stats;
  }

  /**
   * Calculate risk score for a library
   * @param {Object} lib - Library object
   * @returns {number} Risk score (0-100)
   */
  calculateRisk(lib) {
    let risk = 0;

    // CVE severity weight
    if (lib.vulnerabilities) {
      lib.vulnerabilities.forEach(vuln => {
        if (vuln.severityCode === 'CRITICAL') risk += 25;
        else if (vuln.severityCode === 'HIGH') risk += 10;
        else if (vuln.severityCode === 'MEDIUM') risk += 5;
        else risk += 2;
      });
    }

    // Age weight
    if (lib.latest_release_date && lib.release_date) {
      const ageMs = lib.latest_release_date - lib.release_date;
      const ageMonths = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30));
      risk += Math.min(ageMonths * 0.5, 30);
    }

    // Grade weight
    const gradeWeight = { F: 15, D: 10, C: 5, B: 2, A: 0 };
    risk += gradeWeight[lib.grade] || 0;

    return Math.min(Math.floor(risk), 100);
  }

  /**
   * Count vulnerabilities by severity
   * @param {Array} vulns - Array of vulnerability objects
   * @returns {Object} Counts by severity
   */
  countVulnsBySeverity(vulns) {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NOTE: 0 };

    if (vulns) {
      vulns.forEach(vuln => {
        const severity = vuln.severityCode || 'NOTE';
        counts[severity] = (counts[severity] || 0) + 1;
      });
    }

    return counts;
  }

  /**
   * Filter libraries with critical vulnerabilities
   * @param {Array} libraries - Array of library objects
   * @returns {Array} Filtered libraries
   */
  filterByCritical(libraries) {
    return this.filter(libraries, lib => {
      if (!lib.vulnerabilities) return false;
      return lib.vulnerabilities.some(v => v.severityCode === 'CRITICAL');
    });
  }

  /**
   * Filter libraries by grade
   * @param {Array} libraries - Array of library objects
   * @param {string|Array} grade - Grade(s) to filter by
   * @returns {Array} Filtered libraries
   */
  filterByGrade(libraries, grade) {
    const grades = Array.isArray(grade) ? grade : [grade];
    return this.filter(libraries, lib => grades.includes(lib.grade));
  }

  /**
   * Sort libraries by risk score (highest first)
   * @param {Array} libraries - Array of library objects
   * @returns {Array} Sorted libraries
   */
  sortByRisk(libraries) {
    // Add risk scores
    const withRisk = libraries.map(lib => ({
      ...lib,
      risk: this.calculateRisk(lib)
    }));

    // Sort by risk descending
    return this.sortBy(withRisk, 'risk', 'desc');
  }

  /**
   * Calculate library age in months
   * @param {Object} lib - Library object
   * @returns {number} Age in months
   */
  calculateLibraryAge(lib) {
    if (!lib.latest_release_date || !lib.release_date) {
      return 0;
    }

    const ageMs = lib.latest_release_date - lib.release_date;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30));
  }

  /**
   * Enrich libraries with calculated fields
   * @param {Array} libraries - Array of library objects
   * @returns {Array} Enriched libraries
   */
  enrichLibraries(libraries) {
    return this.transform(libraries, lib => ({
      ...lib,
      risk: this.calculateRisk(lib),
      age_months: this.calculateLibraryAge(lib),
      vuln_counts: this.countVulnsBySeverity(lib.vulnerabilities),
      has_critical: lib.vulnerabilities?.some(v => v.severityCode === 'CRITICAL') || false
    }));
  }
}
