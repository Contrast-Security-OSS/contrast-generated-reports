# BaseController API Documentation

## Overview

`BaseController` is the base class for all Controller classes in the MVC architecture. It provides reusable utilities for data transformation, validation, merging, and error handling.

## Features

- ✅ Data transformation utilities (map, filter, sort, group)
- ✅ Data validation methods
- ✅ Data merging for multi-source data
- ✅ Error handling patterns
- ✅ Comprehensive utility functions
- ✅ Full test coverage (25 tests passing)

## Quick Start

```javascript
import { BaseController } from './src/controllers/BaseController.js';

export class LibraryController extends BaseController {
  processLibraries(libraries) {
    // Filter high-risk libraries
    const highRisk = this.filter(libraries, lib => lib.grade === 'F');

    // Sort by vulnerability count
    const sorted = this.sortBy(highRisk, 'vulnCount', 'desc');

    // Group by language
    const grouped = this.groupBy(sorted, 'language');

    return grouped;
  }
}
```

## Data Transformation Methods

### transform(data, mapper)
Transform array using a mapper function.

### filter(data, predicate)
Filter array based on predicate.

### sortBy(data, property, order)
Sort array by property (asc/desc).

### groupBy(data, property)
Group array by property value.

### sum(data, property)
Sum numeric values in array.

### average(data, property)
Calculate average of numeric values.

### min(data, property) / max(data, property)
Find minimum or maximum value.

## Data Validation Methods

### validateRequired(data, requiredFields)
Validate required fields exist.
**Returns:** `{ valid: boolean, missing: Array }`

### Type Checking
- `isString(value)`, `isNumber(value)`, `isBoolean(value)`, `isArray(value)`

### inRange(value, min, max)
Check if number is within range.

### matches(value, pattern)
Check if string matches regex pattern.

## Data Merging Methods

### merge(obj1, obj2)
Shallow merge two objects.

### deepMerge(obj1, obj2)
Deep merge two objects (recursive).

### mergeArrays(arr1, arr2, key)
Merge arrays of objects by key.

### join(leftArray, rightArray, leftKey, rightKey)
SQL-style join of two arrays.

## Error Handling

### safeTransform(data, transformer)
Transform with error handling.
**Returns:** `{ successful: Array, failed: Array }`

### withDefaults(data, defaults)
Apply default values to object.

### sanitize(data)
Remove null/undefined values from object.

## Utility Methods

### isEmpty(data)
Check if array is empty.

### unique(data)
Get unique values from array.

### flatten(data)
Flatten nested arrays.

### pick(data, properties)
Pick specific properties from object.

### omit(data, properties)
Omit specific properties from object.

## Example: Custom Controller

```javascript
import { BaseController } from './src/controllers/BaseController.js';

export class VulnerabilityController extends BaseController {
  /**
   * Process vulnerability data from API
   */
  processVulnerabilities(vulnerabilities, filters = {}) {
    // Validate input
    const validation = this.validateRequired(filters, ['severity']);
    if (!validation.valid) {
      throw new Error(`Missing required filters: ${validation.missing.join(', ')}`);
    }

    // Apply defaults
    const options = this.withDefaults(filters, {
      severity: 'HIGH',
      status: 'Open',
      limit: 100
    });

    // Filter by severity
    let filtered = this.filter(vulnerabilities, vuln =>
      vuln.severity === options.severity &&
      vuln.status === options.status
    );

    // Sort by discovery date
    filtered = this.sortBy(filtered, 'firstSeen', 'desc');

    // Apply limit
    filtered = filtered.slice(0, options.limit);

    // Group by application
    const grouped = this.groupBy(filtered, 'applicationName');

    // Calculate statistics
    const stats = {
      total: filtered.length,
      byApplication: Object.keys(grouped).reduce((acc, app) => {
        acc[app] = {
          count: grouped[app].length,
          avgSeverity: this.average(grouped[app], 'severityScore')
        };
        return acc;
      }, {})
    };

    return { vulnerabilities: filtered, stats };
  }

  /**
   * Merge vulnerability data from multiple sources
   */
  mergeVulnerabilityData(contrastData, scanData) {
    return this.mergeArrays(contrastData, scanData, 'vulnerabilityId');
  }

  /**
   * Transform with error handling
   */
  transformSafely(vulnerabilities) {
    return this.safeTransform(vulnerabilities, vuln => {
      // Transform that might throw
      return {
        id: vuln.id,
        title: vuln.title.toUpperCase(), // Might fail if title is undefined
        risk: this.calculateRisk(vuln)
      };
    });
  }

  calculateRisk(vuln) {
    if (!this.isNumber(vuln.cvssScore)) {
      throw new Error('Invalid CVSS score');
    }

    if (!this.inRange(vuln.cvssScore, 0, 10)) {
      throw new Error('CVSS score out of range');
    }

    return vuln.cvssScore * vuln.exploitability;
  }
}
```

## Testing Example

```javascript
import { describe, it, expect } from 'vitest';
import { VulnerabilityController } from '@/controllers/VulnerabilityController.js';

describe('VulnerabilityController', () => {
  it('should process vulnerabilities with filters', () => {
    const controller = new VulnerabilityController();
    const mockData = [
      { severity: 'HIGH', status: 'Open', firstSeen: '2024-01-01' },
      { severity: 'LOW', status: 'Open', firstSeen: '2024-01-02' }
    ];

    const result = controller.processVulnerabilities(mockData, {
      severity: 'HIGH'
    });

    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0].severity).toBe('HIGH');
  });
});
```

## Best Practices

1. **Extend BaseController** for all custom controllers
2. **Use validation methods** before processing data
3. **Use safeTransform** for error-prone operations
4. **Use withDefaults** to handle optional parameters
5. **Keep controllers stateless** - all methods are functional
6. **Test transformations** thoroughly with edge cases

## See Also

- [BaseModel Documentation](./BaseModel.md)
- [MVC Architecture Overview](../MVC_ARCHITECTURE.md)
- [Testing Guide](../TESTING.md)
