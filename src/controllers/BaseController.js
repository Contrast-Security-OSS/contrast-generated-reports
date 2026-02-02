/**
 * BaseController - Base class for all Controller classes
 * Provides common functionality for data transformation and validation:
 * - Data transformation utilities (map, filter, sort, group)
 * - Data validation methods
 * - Data merging for multi-source data
 * - Error handling patterns
 * - Utility functions
 */

export class BaseController {
  constructor() {
    // Base controller has no state, all methods are functional
  }

  // ============================================================================
  // DATA TRANSFORMATION UTILITIES
  // ============================================================================

  /**
   * Transform array of objects using a mapper function
   * @param {Array} data - Array to transform
   * @param {Function} mapper - Transformation function
   * @returns {Array} Transformed array
   */
  transform(data, mapper) {
    if (!Array.isArray(data)) return [];
    return data.map(mapper);
  }

  /**
   * Filter array based on predicate
   * @param {Array} data - Array to filter
   * @param {Function} predicate - Filter function
   * @returns {Array} Filtered array
   */
  filter(data, predicate) {
    if (!Array.isArray(data)) return [];
    return data.filter(predicate);
  }

  /**
   * Sort array by property
   * @param {Array} data - Array to sort
   * @param {string} property - Property to sort by
   * @param {string} order - 'asc' or 'desc' (default: 'asc')
   * @returns {Array} Sorted array (new array, original unchanged)
   */
  sortBy(data, property, order = 'asc') {
    if (!Array.isArray(data)) return [];

    const sorted = [...data].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });

    return order === 'desc' ? sorted.reverse() : sorted;
  }

  /**
   * Group array by property
   * @param {Array} data - Array to group
   * @param {string} property - Property to group by
   * @returns {Object} Object with grouped arrays
   */
  groupBy(data, property) {
    if (!Array.isArray(data)) return {};

    return data.reduce((groups, item) => {
      const key = item[property];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Sum numeric values in array
   * @param {Array} data - Array of objects
   * @param {string} property - Property to sum
   * @returns {number} Sum
   */
  sum(data, property) {
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, item) => sum + (item[property] || 0), 0);
  }

  /**
   * Calculate average of numeric values
   * @param {Array} data - Array of objects
   * @param {string} property - Property to average
   * @returns {number} Average
   */
  average(data, property) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return this.sum(data, property) / data.length;
  }

  /**
   * Find minimum value
   * @param {Array} data - Array of objects
   * @param {string} property - Property to find min
   * @returns {number} Minimum value
   */
  min(data, property) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return Math.min(...data.map(item => item[property] || 0));
  }

  /**
   * Find maximum value
   * @param {Array} data - Array of objects
   * @param {string} property - Property to find max
   * @returns {number} Maximum value
   */
  max(data, property) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return Math.max(...data.map(item => item[property] || 0));
  }

  // ============================================================================
  // DATA VALIDATION
  // ============================================================================

  /**
   * Validate required fields in object
   * @param {Object} data - Object to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} { valid: boolean, missing: Array }
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !(field in data));
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Check if value is string
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isString(value) {
    return typeof value === 'string';
  }

  /**
   * Check if value is number
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Check if value is boolean
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isBoolean(value) {
    return typeof value === 'boolean';
  }

  /**
   * Check if value is array
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Check if value is in range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {boolean}
   */
  inRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * Check if value matches pattern
   * @param {string} value - Value to check
   * @param {RegExp} pattern - Regular expression pattern
   * @returns {boolean}
   */
  matches(value, pattern) {
    return pattern.test(value);
  }

  // ============================================================================
  // DATA MERGING
  // ============================================================================

  /**
   * Merge two objects (shallow merge)
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Merged object
   */
  merge(obj1, obj2) {
    return { ...obj1, ...obj2 };
  }

  /**
   * Deep merge two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Deep merged object
   */
  deepMerge(obj1, obj2) {
    const result = { ...obj1 };

    for (const key in obj2) {
      if (obj2[key] && typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
        result[key] = this.deepMerge(result[key] || {}, obj2[key]);
      } else {
        result[key] = obj2[key];
      }
    }

    return result;
  }

  /**
   * Merge arrays of objects by key
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} key - Key to merge on
   * @returns {Array} Merged array
   */
  mergeArrays(arr1, arr2, key) {
    const map = new Map();

    // Add all items from arr1
    arr1.forEach(item => {
      map.set(item[key], { ...item });
    });

    // Merge items from arr2
    arr2.forEach(item => {
      const existing = map.get(item[key]);
      if (existing) {
        map.set(item[key], { ...existing, ...item });
      } else {
        map.set(item[key], { ...item });
      }
    });

    return Array.from(map.values());
  }

  /**
   * Join two arrays by foreign key
   * @param {Array} leftArray - Left array (main data)
   * @param {Array} rightArray - Right array (data to join)
   * @param {string} leftKey - Key in left array
   * @param {string} rightKey - Key in right array
   * @returns {Array} Joined array
   */
  join(leftArray, rightArray, leftKey, rightKey) {
    const result = [];

    leftArray.forEach(leftItem => {
      const matches = rightArray.filter(rightItem =>
        rightItem[rightKey] === leftItem[leftKey]
      );

      matches.forEach(match => {
        result.push({ ...leftItem, ...match });
      });
    });

    return result;
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Transform with error handling
   * @param {Array} data - Array to transform
   * @param {Function} transformer - Transformation function
   * @returns {Object} { successful: Array, failed: Array }
   */
  safeTransform(data, transformer) {
    const successful = [];
    const failed = [];

    data.forEach((item, index) => {
      try {
        const result = transformer(item, index);
        successful.push(result);
      } catch (error) {
        failed.push({ item, index, error: error.message });
      }
    });

    return { successful, failed };
  }

  /**
   * Apply default values to object
   * @param {Object} data - Object to apply defaults to
   * @param {Object} defaults - Default values
   * @returns {Object} Object with defaults applied
   */
  withDefaults(data, defaults) {
    return { ...defaults, ...data };
  }

  /**
   * Remove null and undefined values from object
   * @param {Object} data - Object to sanitize
   * @returns {Object} Sanitized object
   */
  sanitize(data) {
    const result = {};

    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        result[key] = data[key];
      }
    }

    return result;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if array is empty
   * @param {Array} data - Array to check
   * @returns {boolean}
   */
  isEmpty(data) {
    return !data || (Array.isArray(data) && data.length === 0);
  }

  /**
   * Get unique values from array
   * @param {Array} data - Array
   * @returns {Array} Array with unique values
   */
  unique(data) {
    if (!Array.isArray(data)) return [];
    return [...new Set(data)];
  }

  /**
   * Flatten nested arrays
   * @param {Array} data - Array to flatten
   * @returns {Array} Flattened array
   */
  flatten(data) {
    if (!Array.isArray(data)) return [];
    return data.flat(Infinity);
  }

  /**
   * Pick specific properties from object
   * @param {Object} data - Source object
   * @param {Array} properties - Properties to pick
   * @returns {Object} Object with picked properties
   */
  pick(data, properties) {
    const result = {};
    properties.forEach(prop => {
      if (prop in data) {
        result[prop] = data[prop];
      }
    });
    return result;
  }

  /**
   * Omit specific properties from object
   * @param {Object} data - Source object
   * @param {Array} properties - Properties to omit
   * @returns {Object} Object without omitted properties
   */
  omit(data, properties) {
    const result = { ...data };
    properties.forEach(prop => {
      delete result[prop];
    });
    return result;
  }
}
