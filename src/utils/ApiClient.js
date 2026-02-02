/**
 * ApiClient - Centralized API client for Contrast Security API
 * Handles authentication, retries, error handling, and request formatting
 */

export class ApiClient {
  /**
   * Create API client instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Load config from window or use defaults
    this.config = window.CONTRAST_CONFIG || {
      orgId: '545a3bce-97c5-4732-af38-1ac459087b0a',
      apiKey: '16s58pRXBJrIYcn9hQO9v7g3kU4Jf02o',
      serviceKey: '0JWTRJY3994AMHTY',
      username: 'jason.easterday@contrastsecurity.com',
      baseUrl: 'https://eval.contrastsecurity.com/Contrast/api/ng'
    };

    // Client options
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.timeout = options.timeout || 30000;
    this.debug = options.debug || false;
  }

  /**
   * Build full URL with org ID
   * @param {string} endpoint - API endpoint
   * @returns {string} Full URL
   */
  buildUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // Check if endpoint already contains org ID
    if (cleanEndpoint.startsWith(this.config.orgId)) {
      return `${this.config.baseUrl}/${cleanEndpoint}`;
    }

    return `${this.config.baseUrl}/${this.config.orgId}/${cleanEndpoint}`;
  }

  /**
   * Build request headers with authentication
   * @param {Object} customHeaders - Additional headers
   * @returns {Object} Headers object
   */
  buildHeaders(customHeaders = {}) {
    const authHeader = btoa(`${this.config.username}:${this.config.serviceKey}`);

    return {
      'Authorization': authHeader,
      'API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
  }

  /**
   * Parse response from fetch
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Parsed response
   */
  async parseResponse(response) {
    try {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.messages?.join(', ') || errorData.message || response.statusText || 'Request failed',
          status: response.status
        };
      }

      const data = await response.json();
      return {
        success: true,
        status: response.status,
        ...data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 0
      };
    }
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async fetch(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options.headers);
    const timeout = options.timeout || this.timeout;

    let lastError;

    // maxRetries represents number of retry attempts, so total attempts = 1 + maxRetries
    const totalAttempts = 1 + this.maxRetries;

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      try {
        if (this.debug) {
          console.log(`[API Request] Attempt ${attempt}: ${url}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await this.parseResponse(response);

        // Log errors in debug mode
        if (!result.success && this.debug) {
          console.error(`[API Error] Status ${result.status}:`, result.error);
        }

        // Return immediately on success or HTTP errors (don't retry HTTP errors)
        if (result.success || result.status > 0) {
          return result;
        }

        // Only retry on network errors (status 0)
        lastError = result.error;
        if (attempt === totalAttempts) {
          return result;
        }

      } catch (error) {
        lastError = error.message;

        if (this.debug) {
          console.error(`[API Error] Attempt ${attempt}:`, error);
        }

        // Don't retry on abort (timeout)
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            status: 0
          };
        }

        // If last attempt, return error
        if (attempt === totalAttempts) {
          return {
            success: false,
            error: lastError,
            status: 0
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: lastError || 'Request failed after retries',
      status: 0
    };
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}, options = {}) {
    // Build query string
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.fetch(fullEndpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

/**
 * Create singleton instance for convenience
 */
export const apiClient = new ApiClient();
