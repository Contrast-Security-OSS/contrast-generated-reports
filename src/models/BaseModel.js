/**
 * BaseModel - Base class for all Model classes
 * Provides common functionality for API interactions:
 * - Credential management
 * - HTTP fetch wrapper with authentication
 * - Retry logic for failed requests
 * - Error handling
 * - Logging and debugging
 */

export class BaseModel {
  /**
   * Create a BaseModel instance
   * @param {Object} options - Configuration options
   * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
   * @param {number} options.timeout - Request timeout in milliseconds (default: 30000)
   * @param {boolean} options.debug - Enable debug logging (default: false)
   * @param {number} options.retryDelay - Base retry delay in ms (default: 1000, use lower for testing)
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.timeout = options.timeout ?? 30000;
    this.debug = options.debug ?? false;
    this.retryDelay = options.retryDelay ?? 1000;

    // Load credentials on initialization
    this.credentials = this.loadCredentials();

    // Construct base URL
    this.baseUrl = `${this.credentials.baseUrl}/${this.credentials.orgId}`;
  }

  /**
   * Load credentials from .creds file or use mock credentials for testing
   * @returns {Object} Credentials object
   */
  loadCredentials() {
    // In browser environment, credentials come from inline config
    // For testing, use mock credentials from MSW
    if (typeof window !== 'undefined' && window.CONTRAST_CONFIG) {
      return window.CONTRAST_CONFIG;
    }

    // For Node.js testing environment, provide mock credentials
    // Real credential loading happens in the browser via inline script
    return {
      orgId: '545a3bce-97c5-4732-af38-1ac459087b0a',
      apiKey: 'mock-api-key',
      serviceKey: 'mock-service-key',
      username: 'mock-user@example.com',
      baseUrl: 'https://eval.contrastsecurity.com/Contrast/api/ng'
    };
  }

  /**
   * Make an API request with authentication, retries, and error handling
   * @param {string} url - The URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async fetch(url, options = {}) {
    const headers = {
      'Authorization': this.getAuthHeader(),
      'API-Key': this.credentials.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const fetchOptions = {
      ...options,
      headers,
      signal: this.createTimeoutSignal()
    };

    return this.fetchWithRetry(url, fetchOptions, 0);
  }

  /**
   * Fetch with retry logic
   * @param {string} url - The URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} attemptNumber - Current attempt number
   * @returns {Promise<Object>} Response data
   */
  async fetchWithRetry(url, options, attemptNumber) {
    try {
      if (this.debug) {
        console.log(`[API Request] Attempt ${attemptNumber + 1}: ${url}`);
      }

      const response = await fetch(url, options);

      // Check if response is ok
      if (!response.ok) {
        const error = await this.parseErrorResponse(response);

        if (this.debug) {
          console.error(`[API Error] Status ${response.status}:`, error);
        }

        // Don't retry HTTP errors (4xx, 5xx), only network issues
        // HTTP errors have explicit responses from the server
        return this.formatError(error, response.status);
      }

      // Parse successful response
      const data = await response.json();

      if (this.debug) {
        console.log(`[API Success] ${url}:`, data);
      }

      return data;

    } catch (error) {
      if (this.debug) {
        console.error(`[API Network Error] ${url}:`, error.message);
      }

      // Retry on network errors if we haven't exceeded max retries
      if (attemptNumber < this.maxRetries) {
        await this.sleep(this.getRetryDelay(attemptNumber));
        return this.fetchWithRetry(url, options, attemptNumber + 1);
      }

      return this.formatError(error, 0);
    }
  }

  /**
   * Parse error response from API
   * @param {Response} response - Fetch response
   * @returns {Promise<string>} Error message
   */
  async parseErrorResponse(response) {
    try {
      const data = await response.json();
      return data.messages?.join(', ') || data.message || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }

  /**
   * Format error into consistent structure
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
   * Get authorization header value
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
   * Create AbortSignal for timeout
   * @returns {AbortSignal} Abort signal
   */
  createTimeoutSignal() {
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.timeout);
      return controller.signal;
    }
    return undefined;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param {number} attemptNumber - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay(attemptNumber) {
    // Exponential backoff: baseDelay, baseDelay*2, baseDelay*4, ...
    return this.retryDelay * Math.pow(2, attemptNumber);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
