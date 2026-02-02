/**
 * BaseModel - Base class for all Model classes
 * Provides common functionality for API interactions using ApiClient
 */

import { ApiClient } from '../utils/ApiClient.js';

export class BaseModel {
  /**
   * Create a BaseModel instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Create API client instance
    this.apiClient = new ApiClient(options);

    // Keep backward compatibility with existing properties
    this.maxRetries = this.apiClient.maxRetries;
    this.timeout = this.apiClient.timeout;
    this.debug = this.apiClient.debug;
    this.retryDelay = this.apiClient.retryDelay;
    this.credentials = this.apiClient.config;
    this.baseUrl = `${this.credentials.baseUrl}/${this.credentials.orgId}`;
  }

  /**
   * Load credentials (delegated to ApiClient)
   * @returns {Object} Credentials object
   */
  loadCredentials() {
    return this.apiClient.config;
  }

  /**
   * Fetch data from API with authentication and retry logic
   * Delegates to ApiClient for actual request handling
   * @param {string} url - The URL to fetch (relative to baseUrl or absolute)
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async fetch(url, options = {}) {
    // Strip base URL if already included
    const endpoint = url.replace(this.baseUrl, '').replace(/^\//, '');

    // Use ApiClient for the request
    return this.apiClient.fetch(endpoint, options);
  }

  /**
   * Format error into consistent structure (for backward compatibility)
   * @param {Error|string} error - Error object or message
   * @param {number} status - HTTP status code
   * @returns {Object} Formatted error response
   */
  formatError(error, status) {
    const errorMessage = error instanceof Error ? error.message : error;

    return {
      success: false,
      error: errorMessage,
      status: status,
      data: null
    };
  }

  /**
   * Get authorization header value (for backward compatibility)
   * @returns {string} Base64 encoded auth header
   */
  getAuthHeader() {
    const authString = `${this.credentials.username}:${this.credentials.serviceKey}`;
    if (typeof btoa !== 'undefined') {
      // Browser environment
      return btoa(authString);
    } else {
      // Node.js environment
      return Buffer.from(authString).toString('base64');
    }
  }

  /**
   * Handle errors (can be overridden by subclasses)
   * @param {string} methodName - Name of the method where error occurred
   * @param {Error} error - Error object
   */
  handleError(methodName, error) {
    if (this.debug) {
      console.error(`[BaseModel] Error in ${methodName}:`, error);
    }
    // Subclasses can override this for custom error handling
  }
}
