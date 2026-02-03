/**
 * ConfigLoader - Loads configuration from .creds file
 * Provides utilities to load credentials for local development
 */

export class ConfigLoader {
  /**
   * Load credentials from .creds file
   * In browser context, this requires the .creds file to be served
   * or embedded via build process.
   *
   * For development, credentials can be loaded via:
   * 1. Fetch .creds file (requires CORS/serving)
   * 2. Build-time embedding
   * 3. Manual window.CONTRAST_CONFIG setup
   *
   * @param {string} credsPath - Path to .creds file (default: '/.creds')
   * @returns {Promise<Object>} Configuration object
   */
  static async loadFromCredsFile(credsPath = '/.creds') {
    try {
      const response = await fetch(credsPath);
      if (!response.ok) {
        throw new Error(`Failed to load .creds file: ${response.statusText}`);
      }

      const text = await response.text();
      return this.parseCredsFile(text);
    } catch (error) {
      console.warn('[ConfigLoader] Could not load .creds file:', error.message);
      console.warn('[ConfigLoader] Falling back to window.CONTRAST_CONFIG or defaults');
      return null;
    }
  }

  /**
   * Parse .creds file content
   * @param {string} content - Content of .creds file
   * @returns {Object} Parsed configuration
   */
  static parseCredsFile(content) {
    const config = {
      baseUrl: null,
      orgId: null,
      username: null,
      apiKey: null,
      serviceKey: null,
      appId: null
    };

    const lines = content.split('\n');
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }

      // Parse KEY=VALUE format
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        const [, key, value] = match;
        const trimmedValue = value.trim();

        switch (key) {
          case 'CONTRAST_URL':
            // Extract base URL without /Contrast suffix
            config.baseUrl = trimmedValue.replace(/\/Contrast\/?$/, '') + '/Contrast/api/ng';
            break;
          case 'ORG_ID':
            config.orgId = trimmedValue;
            break;
          case 'USERNAME':
            config.username = trimmedValue;
            break;
          case 'API_KEY':
            config.apiKey = trimmedValue;
            break;
          case 'SERVICE_KEY':
            config.serviceKey = trimmedValue;
            break;
          case 'APP_ID':
            config.appId = trimmedValue;
            break;
        }
      }
    }

    return config;
  }

  /**
   * Initialize configuration
   * Tries to load from .creds file, falls back to window.CONTRAST_CONFIG
   * Sets up window.CONTRAST_CONFIG for use by ApiClient
   *
   * Usage in HTML:
   * <script type="module">
   *   import { ConfigLoader } from './src/utils/ConfigLoader.js';
   *   await ConfigLoader.init();
   *   // Now window.CONTRAST_CONFIG is available
   * </script>
   *
   * @param {string} credsPath - Path to .creds file
   * @returns {Promise<Object>} Configuration object
   */
  static async init(credsPath = '/.creds') {
    // If window.CONTRAST_CONFIG already exists, use it
    if (window.CONTRAST_CONFIG) {
      console.log('[ConfigLoader] Using existing window.CONTRAST_CONFIG');
      return window.CONTRAST_CONFIG;
    }

    // Try to load from .creds file
    const config = await this.loadFromCredsFile(credsPath);

    if (config && config.orgId && config.apiKey) {
      // Successfully loaded from .creds
      window.CONTRAST_CONFIG = config;
      console.log('[ConfigLoader] Loaded configuration from .creds file');
      return config;
    }

    // Fallback to default configuration (for testing/development)
    console.warn('[ConfigLoader] Using default configuration');
    window.CONTRAST_CONFIG = {
      orgId: '545a3bce-97c5-4732-af38-1ac459087b0a',
      apiKey: '16s58pRXBJrIYcn9hQO9v7g3kU4Jf02o',
      serviceKey: '0JWTRJY3994AMHTY',
      username: 'jason.easterday@contrastsecurity.com',
      baseUrl: 'https://eval.contrastsecurity.com/Contrast/api/ng'
    };

    return window.CONTRAST_CONFIG;
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  static getConfig() {
    return window.CONTRAST_CONFIG || null;
  }

  /**
   * Set configuration manually
   * @param {Object} config - Configuration object
   */
  static setConfig(config) {
    window.CONTRAST_CONFIG = config;
  }
}

/**
 * Auto-initialize on import (can be disabled by calling ConfigLoader.setConfig() first)
 */
if (typeof window !== 'undefined' && !window.CONTRAST_CONFIG_MANUAL) {
  // Don't auto-initialize, let applications call init() explicitly
  // This prevents async issues during module loading
}
