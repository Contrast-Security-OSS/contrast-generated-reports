# Testing Guide

## Overview

This project uses **Vitest** as the testing framework with **MSW (Mock Service Worker)** for API mocking. The testing infrastructure is designed to support Test-Driven Development (TDD) for the MVC refactor.

## Testing Stack

- **Vitest** - Fast, modern testing framework with ESM support
- **jsdom** - Browser-like DOM environment for Node.js
- **MSW** - API mocking with service workers
- **@testing-library/dom** - DOM testing utilities

## Directory Structure

```
contrast-generated-reports/
├── src/
│   ├── models/         # Model classes (API interactions)
│   ├── controllers/    # Controller classes (data transformation)
│   └── views/          # View classes (DOM manipulation)
├── tests/
│   ├── setup.js        # Global test setup
│   ├── example.test.js # Example tests demonstrating patterns
│   ├── mocks/
│   │   ├── server.js   # MSW server setup
│   │   └── handlers.js # Mock API handlers
│   ├── models/         # Model tests
│   ├── controllers/    # Controller tests
│   ├── views/          # View tests
│   └── integration/    # Integration tests
└── vitest.config.js    # Vitest configuration
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for TDD)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test-Driven Development (TDD) Workflow

### Red-Green-Refactor Cycle

1. **Red** - Write a failing test first
2. **Green** - Write minimal code to make it pass
3. **Refactor** - Improve code quality while keeping tests green

### Example TDD Flow

```javascript
// Step 1: RED - Write failing test
describe('LibrarySecurityModel', () => {
  it('should fetch libraries for an app', async () => {
    const model = new LibrarySecurityModel();
    const libraries = await model.fetchLibraries('app-123');

    expect(libraries).toBeInstanceOf(Array);
    expect(libraries.length).toBeGreaterThan(0);
  });
});

// Step 2: GREEN - Write minimal implementation
export class LibrarySecurityModel extends BaseModel {
  async fetchLibraries(appId) {
    const response = await this.fetch(
      `${this.baseUrl}/applications/${appId}/libraries`
    );
    return response.libraries;
  }
}

// Step 3: REFACTOR - Improve with error handling
export class LibrarySecurityModel extends BaseModel {
  async fetchLibraries(appId) {
    try {
      const response = await this.fetch(
        `${this.baseUrl}/applications/${appId}/libraries`
      );

      if (!response.success) {
        throw new Error('Failed to fetch libraries');
      }

      return response.libraries || [];
    } catch (error) {
      this.handleError('fetchLibraries', error);
      return [];
    }
  }
}
```

## Writing Tests

### Model Tests

Model tests verify API interactions. Use MSW to mock API responses.

```javascript
// tests/models/LibrarySecurityModel.test.js
import { describe, it, expect } from 'vitest';
import { LibrarySecurityModel } from '@/models/LibrarySecurityModel.js';

describe('LibrarySecurityModel', () => {
  it('should fetch libraries from API', async () => {
    const model = new LibrarySecurityModel();
    const libraries = await model.fetchLibraries('test-app-123');

    expect(libraries).toBeInstanceOf(Array);
    expect(libraries[0]).toHaveProperty('file_name');
    expect(libraries[0]).toHaveProperty('file_version');
  });

  it('should handle API errors gracefully', async () => {
    const model = new LibrarySecurityModel();
    const libraries = await model.fetchLibraries('error-app');

    expect(libraries).toEqual([]);
  });
});
```

### Controller Tests

Controller tests verify data transformation logic. No API calls needed.

```javascript
// tests/controllers/LibrarySecurityController.test.js
import { describe, it, expect } from 'vitest';
import { LibrarySecurityController } from '@/controllers/LibrarySecurityController.js';

describe('LibrarySecurityController', () => {
  it('should calculate risk scores', () => {
    const controller = new LibrarySecurityController();
    const libraries = [
      { file_name: 'log4j-core-2.14.1.jar', total_vulnerabilities: 3, grade: 'F' }
    ];

    const result = controller.calculateRiskScores(libraries);

    expect(result[0].risk_score).toBeGreaterThan(0);
    expect(result[0].risk_level).toBe('CRITICAL');
  });

  it('should filter libraries by vulnerability count', () => {
    const controller = new LibrarySecurityController();
    const libraries = [
      { file_name: 'safe.jar', total_vulnerabilities: 0 },
      { file_name: 'vulnerable.jar', total_vulnerabilities: 5 }
    ];

    const filtered = controller.filterVulnerable(libraries);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].file_name).toBe('vulnerable.jar');
  });
});
```

### View Tests

View tests verify DOM manipulation and rendering.

```javascript
// tests/views/LibrarySecurityView.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { LibrarySecurityView } from '@/views/LibrarySecurityView.js';

describe('LibrarySecurityView', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="library-table"></div>';
  });

  it('should render library table', () => {
    const view = new LibrarySecurityView('#library-table');
    const libraries = [
      { file_name: 'test.jar', file_version: '1.0.0', grade: 'A' }
    ];

    view.render(libraries);

    const table = document.querySelector('#library-table table');
    expect(table).toBeTruthy();

    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });

  it('should display error message', () => {
    const view = new LibrarySecurityView('#library-table');

    view.showError('Failed to load libraries');

    const error = document.querySelector('.error-message');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to load libraries');
  });
});
```

### Integration Tests

Integration tests verify the complete flow from Model → Controller → View.

```javascript
// tests/integration/library-security.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { LibrarySecurityModel } from '@/models/LibrarySecurityModel.js';
import { LibrarySecurityController } from '@/controllers/LibrarySecurityController.js';
import { LibrarySecurityView } from '@/views/LibrarySecurityView.js';

describe('Library Security Dashboard Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('should load and display library data', async () => {
    const model = new LibrarySecurityModel();
    const controller = new LibrarySecurityController();
    const view = new LibrarySecurityView('#app');

    // Fetch data
    const rawData = await model.fetchLibraries('test-app-123');

    // Transform data
    const transformedData = controller.calculateRiskScores(rawData);

    // Render view
    view.render(transformedData);

    // Verify end-to-end
    const table = document.querySelector('#app table');
    expect(table).toBeTruthy();

    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
```

## Mock API Responses

MSW intercepts network requests and returns mock responses. Add handlers in `tests/mocks/handlers.js`.

```javascript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock libraries endpoint
  http.get('/Contrast/api/ng/:orgId/applications/:appId/libraries', ({ params }) => {
    return HttpResponse.json({
      success: true,
      libraries: [
        { file_name: 'example.jar', file_version: '1.0.0' }
      ]
    });
  }),

  // Mock error scenario
  http.get('/Contrast/api/ng/:orgId/test-error', () => {
    return HttpResponse.json(
      { success: false, messages: ['Error'] },
      { status: 500 }
    );
  })
];
```

## Test Utilities

Global test utilities are available via `global.testUtils`:

```javascript
// Wait for async operations
await global.testUtils.wait(100);

// Create mock fetch response
const response = await global.testUtils.mockFetchResponse({ data: 'test' });

// Create mock fetch error
const errorPromise = global.testUtils.mockFetchError('Network error');
```

## Coverage Requirements

Target coverage: **80%** for lines, functions, branches, and statements.

```bash
npm run test:coverage
```

Coverage thresholds are configured in `vitest.config.js`.

## Best Practices

### 1. Test One Thing Per Test
```javascript
// ✅ Good - Tests one specific behavior
it('should filter libraries by grade F', () => {
  const result = controller.filterByGrade(libraries, 'F');
  expect(result.every(lib => lib.grade === 'F')).toBe(true);
});

// ❌ Bad - Tests multiple things
it('should filter and sort libraries', () => {
  const result = controller.filterAndSort(libraries);
  expect(result.length).toBe(3);
  expect(result[0].grade).toBe('F');
  expect(result[2].grade).toBe('A');
});
```

### 2. Use Descriptive Test Names
```javascript
// ✅ Good
it('should return empty array when no libraries have vulnerabilities', () => {});

// ❌ Bad
it('should work', () => {});
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should calculate MTTR correctly', () => {
  // Arrange - Set up test data
  const vulns = [
    { first_seen: 1000, fixed: 5000 },
    { first_seen: 2000, fixed: 4000 }
  ];

  // Act - Execute the code under test
  const mttr = controller.calculateMTTR(vulns);

  // Assert - Verify the result
  expect(mttr).toBe(2500); // Average time to resolution
});
```

### 4. Clean Up After Tests
```javascript
afterEach(() => {
  // Reset DOM
  document.body.innerHTML = '';

  // Clear any timers
  vi.clearAllTimers();

  // Reset mocks
  vi.clearAllMocks();
});
```

### 5. Avoid Test Interdependence
```javascript
// ✅ Good - Each test is independent
describe('Counter', () => {
  it('should start at 0', () => {
    const counter = new Counter();
    expect(counter.value).toBe(0);
  });

  it('should increment', () => {
    const counter = new Counter();
    counter.increment();
    expect(counter.value).toBe(1);
  });
});

// ❌ Bad - Tests depend on each other
describe('Counter', () => {
  const counter = new Counter(); // Shared state!

  it('should start at 0', () => {
    expect(counter.value).toBe(0);
  });

  it('should increment', () => {
    counter.increment();
    expect(counter.value).toBe(1); // Fails if first test doesn't run
  });
});
```

## Debugging Tests

### Run specific test file
```bash
npx vitest run tests/models/LibrarySecurityModel.test.js
```

### Run specific test by name
```bash
npx vitest run -t "should fetch libraries"
```

### Debug with VSCode
Add breakpoints and use VSCode's debugging tools with the following launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Troubleshooting

### Tests timing out
Increase timeout in `vitest.config.js`:
```javascript
testTimeout: 10000, // 10 seconds
```

### MSW not intercepting requests
Ensure MSW server is started in `setupFiles`:
```javascript
beforeAll(() => {
  setupMockServer();
});
```

### DOM not available
Verify `environment: 'jsdom'` in `vitest.config.js`.

### Module resolution errors
Check path aliases in `vitest.config.js`:
```javascript
resolve: {
  alias: {
    '@': '/src',
    '@models': '/src/models'
  }
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
- [TDD Best Practices](https://testdriven.io/test-driven-development/)
