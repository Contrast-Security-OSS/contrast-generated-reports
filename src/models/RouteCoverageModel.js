/**
 * RouteCoverageModel - Model for route coverage data
 * Handles API calls to fetch route coverage for applications
 */

import { BaseModel } from './BaseModel.js';

export class RouteCoverageModel extends BaseModel {
  /**
   * Fetch route coverage for a specific application
   * @param {string} appId - Application ID
   * @returns {Promise<Object>} Route coverage data
   */
  async fetchRouteCoverage(appId) {
    try {
      const url = `${this.baseUrl}/applications/${appId}/route/coverage`;
      console.log(`[RouteCoverageModel] Fetching route coverage for app: ${appId}`);
      const response = await this.fetch(url);

      // Handle error responses
      if (!response.success) {
        console.error(`[RouteCoverageModel] API error for ${appId}:`, response.error, `(Status: ${response.status})`);
        this.handleError('fetchRouteCoverage', new Error(response.error));
        return { routes: [], success: false, error: response.error };
      }

      console.log(`[RouteCoverageModel] Successfully loaded ${response.routes?.length || 0} routes for app ${appId}`);
      return {
        routes: response.routes || [],
        success: true
      };
    } catch (error) {
      console.error(`[RouteCoverageModel] Exception fetching ${appId}:`, error);
      this.handleError('fetchRouteCoverage', error);
      return { routes: [], success: false, error: error.message };
    }
  }

  /**
   * Fetch route coverage for multiple applications
   * @param {Array<string>} appIds - Array of application IDs
   * @returns {Promise<Array>} Array of coverage data with appId
   */
  async fetchMultipleApps(appIds) {
    if (!appIds || appIds.length === 0) {
      return [];
    }

    const results = [];

    for (const appId of appIds) {
      try {
        const coverage = await this.fetchRouteCoverage(appId);

        if (coverage.success) {
          results.push({
            appId,
            ...coverage
          });
        }
      } catch (error) {
        this.handleError('fetchMultipleApps', error);
        // Continue with other apps even if one fails
      }
    }

    return results;
  }

  /**
   * Fetch route coverage with app metadata
   * @param {Array<Object>} apps - Array of app objects with appId and name
   * @returns {Promise<Array>} Array of coverage data with app metadata
   */
  async fetchWithMetadata(apps) {
    if (!apps || apps.length === 0) {
      return [];
    }

    const results = [];

    for (const app of apps) {
      try {
        const coverage = await this.fetchRouteCoverage(app.appId);

        if (coverage.success) {
          results.push({
            ...app,
            ...coverage
          });
        } else {
          console.warn(`[RouteCoverageModel] Failed to fetch coverage for ${app.appName}:`, coverage.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`[RouteCoverageModel] Error fetching ${app.appName}:`, error);
        this.handleError('fetchWithMetadata', error);
        // Continue with other apps
      }
    }

    if (results.length === 0) {
      console.error('[RouteCoverageModel] No route coverage data loaded for any application. Check API credentials and permissions.');
    }

    return results;
  }
}
