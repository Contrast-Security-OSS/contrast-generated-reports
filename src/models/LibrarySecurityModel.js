/**
 * LibrarySecurityModel - Model for library security data
 * Handles API calls to fetch library and vulnerability data
 */

import { BaseModel } from './BaseModel.js';

export class LibrarySecurityModel extends BaseModel {
  /**
   * Fetch libraries for a specific application
   * @param {string} appId - Application ID
   * @param {Object} options - Query options
   * @param {string} options.expand - Expansion parameters (default: 'vulns')
   * @param {string} options.quickFilter - Quick filter option (default: 'ALL')
   * @returns {Promise<Array>} Array of library objects
   */
  async fetchLibraries(appId, options = {}) {
    const expand = options.expand || 'vulns';
    const quickFilter = options.quickFilter || 'ALL';

    try {
      const url = `${this.baseUrl}/applications/${appId}/libraries?expand=${expand}&quickFilter=${quickFilter}`;
      const response = await this.fetch(url);

      // Handle error responses
      if (!response.success) {
        this.handleError('fetchLibraries', new Error(response.error));
        return [];
      }

      return response.libraries || [];
    } catch (error) {
      this.handleError('fetchLibraries', error);
      return [];
    }
  }

  /**
   * Fetch detailed information for a specific library
   * @param {string} appId - Application ID
   * @param {string} libraryHash - Library hash identifier
   * @returns {Promise<Object>} Library details
   */
  async fetchLibraryDetails(appId, libraryHash) {
    try {
      const url = `${this.baseUrl}/applications/${appId}/libraries/${libraryHash}`;
      const response = await this.fetch(url);

      if (!response.success) {
        this.handleError('fetchLibraryDetails', new Error(response.error));
        return null;
      }

      return response.library || null;
    } catch (error) {
      this.handleError('fetchLibraryDetails', error);
      return null;
    }
  }

  /**
   * Fetch CVE details for libraries
   * @param {string} cveId - CVE identifier
   * @returns {Promise<Object>} CVE details
   */
  async fetchCVEDetails(cveId) {
    try {
      const url = `${this.baseUrl}/cve/${cveId}`;
      const response = await this.fetch(url);

      if (!response.success) {
        this.handleError('fetchCVEDetails', new Error(response.error));
        return null;
      }

      return response.cve || null;
    } catch (error) {
      this.handleError('fetchCVEDetails', error);
      return null;
    }
  }
}
