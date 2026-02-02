/**
 * LibrarySecurityView Tests
 * Tests for library security view rendering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LibrarySecurityView } from '@/views/LibrarySecurityView.js';

describe('LibrarySecurityView', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="stats-total">0</div>
      <div id="stats-with-cves">0</div>
      <div id="stats-total-cves">0</div>
      <div id="stats-critical">0</div>
      <div id="grade-a">0</div>
      <div id="grade-b">0</div>
      <div id="grade-c">0</div>
      <div id="grade-d">0</div>
      <div id="grade-f">0</div>
      <div id="high-risk-container"></div>
      <div id="library-table-body"></div>
    `;
  });

  describe('Initialization', () => {
    it('should create a LibrarySecurityView instance', () => {
      const view = new LibrarySecurityView();
      expect(view).toBeInstanceOf(LibrarySecurityView);
    });
  });

  describe('updateStats', () => {
    it('should update statistics in DOM', () => {
      const view = new LibrarySecurityView();
      const stats = {
        total: 127,
        withCVEs: 85,
        totalCVEs: 342,
        criticalVulns: 38,
        grades: { A: 20, B: 30, C: 25, D: 27, F: 25 }
      };

      view.updateStats(stats);

      expect(document.getElementById('stats-total').textContent).toBe('127');
      expect(document.getElementById('stats-with-cves').textContent).toBe('85');
      expect(document.getElementById('stats-total-cves').textContent).toBe('342');
      expect(document.getElementById('stats-critical').textContent).toBe('38');
    });

    it('should update grade distribution', () => {
      const view = new LibrarySecurityView();
      const stats = {
        total: 100,
        withCVEs: 0,
        totalCVEs: 0,
        criticalVulns: 0,
        grades: { A: 10, B: 20, C: 30, D: 25, F: 15 }
      };

      view.updateStats(stats);

      expect(document.getElementById('grade-a').textContent).toBe('10');
      expect(document.getElementById('grade-b').textContent).toBe('20');
      expect(document.getElementById('grade-c').textContent).toBe('30');
      expect(document.getElementById('grade-d').textContent).toBe('25');
      expect(document.getElementById('grade-f').textContent).toBe('15');
    });
  });

  describe('renderHighRiskLibraries', () => {
    it('should render high-risk library cards', () => {
      const view = new LibrarySecurityView();
      const libraries = [
        {
          file_name: 'log4j-core-2.14.1.jar',
          file_version: '2.14.1',
          grade: 'F',
          risk: 95,
          vulnerabilities: [
            { name: 'CVE-2021-44228', severityCode: 'CRITICAL' }
          ],
          vuln_counts: { CRITICAL: 1, HIGH: 2, MEDIUM: 0, LOW: 0 }
        }
      ];

      view.renderHighRiskLibraries(libraries);

      const container = document.getElementById('high-risk-container');
      expect(container.innerHTML).toContain('log4j-core-2.14.1.jar');
      expect(container.innerHTML).toContain('CVE-2021-44228');
    });

    it('should handle empty array', () => {
      const view = new LibrarySecurityView();

      view.renderHighRiskLibraries([]);

      const container = document.getElementById('high-risk-container');
      expect(container.innerHTML).toBe('');
    });
  });

  describe('renderLibraryTable', () => {
    it('should render library table rows', () => {
      const view = new LibrarySecurityView();
      const libraries = [
        {
          file_name: 'spring-core-5.3.20.jar',
          file_version: '5.3.20',
          grade: 'A',
          risk: 10,
          age_months: 12,
          vuln_counts: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
        }
      ];

      view.renderLibraryTable(libraries);

      const tbody = document.getElementById('library-table-body');
      expect(tbody.innerHTML).toContain('spring-core-5.3.20.jar');
      expect(tbody.innerHTML).toContain('5.3.20');
    });
  });

  describe('showLoading', () => {
    it('should show loading indicator', () => {
      document.body.innerHTML = '<div id="loading"></div>';
      const view = new LibrarySecurityView();

      view.showLoading();

      const loading = document.getElementById('loading');
      expect(loading.style.display).not.toBe('none');
    });
  });

  describe('showError', () => {
    it('should show error message', () => {
      document.body.innerHTML = '<div id="error-message"></div>';
      const view = new LibrarySecurityView();

      view.showError('Failed to load data');

      const error = document.getElementById('error-message');
      expect(error.textContent).toContain('Failed to load data');
    });
  });
});
