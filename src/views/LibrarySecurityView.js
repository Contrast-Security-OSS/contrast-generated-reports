/**
 * LibrarySecurityView - View for library security dashboard
 * Handles all DOM manipulation and rendering
 */

export class LibrarySecurityView {
  constructor() {
    // View has no state, all methods manipulate DOM directly
  }

  /**
   * Update statistics in the dashboard
   * @param {Object} stats - Statistics object
   */
  updateStats(stats) {
    this.updateElement('stats-total', stats.total);
    this.updateElement('stats-with-cves', stats.withCVEs);
    this.updateElement('stats-total-cves', stats.totalCVEs);
    this.updateElement('stats-critical', stats.criticalVulns);

    // Update grade distribution
    this.updateElement('grade-a', stats.grades.A || 0);
    this.updateElement('grade-b', stats.grades.B || 0);
    this.updateElement('grade-c', stats.grades.C || 0);
    this.updateElement('grade-d', stats.grades.D || 0);
    this.updateElement('grade-f', stats.grades.F || 0);
  }

  /**
   * Render high-risk library cards
   * @param {Array} libraries - Array of library objects
   */
  renderHighRiskLibraries(libraries) {
    const container = document.getElementById('high-risk-container');
    if (!container) return;

    if (libraries.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = libraries.map(lib => this.createLibraryCard(lib)).join('');
  }

  /**
   * Render library table
   * @param {Array} libraries - Array of library objects
   */
  renderLibraryTable(libraries) {
    const tbody = document.getElementById('library-table-body');
    if (!tbody) return;

    tbody.innerHTML = libraries.map(lib => this.createTableRow(lib)).join('');
  }

  /**
   * Create library card HTML
   * @param {Object} lib - Library object
   * @returns {string} HTML string
   */
  createLibraryCard(lib) {
    const vulnBadges = this.createVulnerabilityBadges(lib.vuln_counts);
    const firstVulns = (lib.vulnerabilities || []).slice(0, 3);
    const remaining = (lib.vulnerabilities || []).length - 3;

    return `
      <div class="risk-card" data-risk="${lib.risk}">
        <div class="risk-header">
          <div class="risk-header-left">
            <h3>${lib.file_name}</h3>
            <div class="version">Version ${lib.file_version}</div>
          </div>
          <div class="risk-header-right">
            <div class="grade-badge grade-${lib.grade.toLowerCase()}">${lib.grade}</div>
            <div class="risk-score">${lib.risk}% Risk</div>
          </div>
        </div>

        <div class="vulnerability-badges">
          ${vulnBadges}
        </div>

        <div class="cve-list">
          ${firstVulns.map(v => `
            <div class="cve-item">
              <div class="cve-id">${v.name}</div>
              <div class="cve-severity severity-${(v.severityCode || '').toLowerCase()}">${v.severityCode}</div>
            </div>
          `).join('')}
          ${remaining > 0 ? `<div class="cve-more">+ ${remaining} more CVEs</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create table row HTML
   * @param {Object} lib - Library object
   * @returns {string} HTML string
   */
  createTableRow(lib) {
    const vulnBadges = this.createVulnerabilityBadges(lib.vuln_counts);

    return `
      <tr data-grade="${lib.grade}" data-risk="${lib.risk}">
        <td>${lib.file_name}</td>
        <td>${lib.file_version}</td>
        <td><span class="grade-letter grade-${lib.grade.toLowerCase()}">${lib.grade}</span></td>
        <td>${vulnBadges}</td>
        <td>${lib.age_months} months</td>
        <td>
          <div class="risk-meter">
            <div class="risk-fill" style="width: ${lib.risk}%">${lib.risk}%</div>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Create vulnerability badges HTML
   * @param {Object} counts - Vulnerability counts by severity
   * @returns {string} HTML string
   */
  createVulnerabilityBadges(counts) {
    if (!counts) return '';

    const badges = [];
    if (counts.CRITICAL > 0) badges.push(`<span class="badge badge-critical">${counts.CRITICAL} CRITICAL</span>`);
    if (counts.HIGH > 0) badges.push(`<span class="badge badge-high">${counts.HIGH} HIGH</span>`);
    if (counts.MEDIUM > 0) badges.push(`<span class="badge badge-medium">${counts.MEDIUM} MEDIUM</span>`);
    if (counts.LOW > 0) badges.push(`<span class="badge badge-low">${counts.LOW} LOW</span>`);

    return badges.join(' ');
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'block';
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    } else {
      console.error(message);
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }

  /**
   * Update element text content
   * @param {string} id - Element ID
   * @param {*} value - Value to set
   */
  updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }
}
