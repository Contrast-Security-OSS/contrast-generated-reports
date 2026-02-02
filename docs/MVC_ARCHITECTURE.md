# MVC Architecture Guide

## Overview

This project follows the **Model-View-Controller (MVC)** pattern to separate concerns and improve maintainability of the security dashboards. Each dashboard is refactored from a monolithic HTML file into three distinct layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    HTML Dashboard                        │
│  (Minimal structure, loads MVC components)              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │           Controller                   │
        │  (Orchestrates Model & View)          │
        │  - Initialize components               │
        │  - Handle user interactions            │
        │  - Coordinate data flow                │
        └───────────────────────────────────────┘
               │                        │
               │                        │
               ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐
    │     Model       │      │      View       │
    │  (API Layer)    │      │  (Display)      │
    │  - Fetch data   │      │  - Render UI    │
    │  - Handle auth  │      │  - DOM updates  │
    │  - Error retry  │      │  - User events  │
    └─────────────────┘      └─────────────────┘
           │                          │
           ▼                          │
    ┌─────────────────┐              │
    │  BaseModel      │              │
    │  - Credentials  │              │
    │  - Fetch logic  │              │
    │  - Error mgmt   │              │
    └─────────────────┘              │
                                     ▼
                              ┌─────────────────┐
                              │   DOM/Browser   │
                              └─────────────────┘
```

## MVC Components

### Model Layer (`src/models/`)

**Responsibility:** Data fetching and API interactions

**What Models Do:**
- Load credentials from `.creds` file
- Make API calls to Contrast Security
- Handle authentication
- Implement retry logic for failed requests
- Return raw or lightly transformed data
- Handle API errors gracefully

**What Models DON'T Do:**
- ❌ Transform data for display
- ❌ Manipulate DOM
- ❌ Handle user interactions
- ❌ Implement business logic

**Base Model:**
All models extend `BaseModel` which provides:
- Credential management
- Standardized fetch wrapper
- Error handling
- Retry logic
- Logging

**Example Model:**
```javascript
// src/models/LibrarySecurityModel.js
import { BaseModel } from './BaseModel.js';

export class LibrarySecurityModel extends BaseModel {
  /**
   * Fetch libraries for a specific application
   * @param {string} appId - Application ID
   * @returns {Promise<Array>} Array of library objects
   */
  async fetchLibraries(appId) {
    try {
      const url = `${this.baseUrl}/applications/${appId}/libraries`;
      const response = await this.fetch(url);

      if (!response.success) {
        throw new Error('API returned error');
      }

      return response.libraries || [];
    } catch (error) {
      this.handleError('fetchLibraries', error);
      return [];
    }
  }

  /**
   * Fetch vulnerability details
   * @param {string} appId - Application ID
   * @param {string} vulnId - Vulnerability ID
   * @returns {Promise<Object>} Vulnerability details
   */
  async fetchVulnerability(appId, vulnId) {
    const url = `${this.baseUrl}/traces/${appId}/trace/${vulnId}`;
    const response = await this.fetch(url);
    return response.trace;
  }
}
```

### Controller Layer (`src/controllers/`)

**Responsibility:** Business logic and data transformation

**What Controllers Do:**
- Transform API data for display
- Implement business logic (risk scores, calculations)
- Aggregate data from multiple sources
- Filter and sort data
- Format data for views
- Validate data

**What Controllers DON'T Do:**
- ❌ Make API calls
- ❌ Manipulate DOM directly
- ❌ Know about HTML structure
- ❌ Handle credentials

**Base Controller:**
All controllers extend `BaseController` which provides:
- Common transformation utilities
- Data validation methods
- Error handling patterns

**Example Controller:**
```javascript
// src/controllers/LibrarySecurityController.js
import { BaseController } from './BaseController.js';

export class LibrarySecurityController extends BaseController {
  /**
   * Calculate risk scores for libraries
   * @param {Array} libraries - Raw library data from API
   * @returns {Array} Libraries with risk scores
   */
  calculateRiskScores(libraries) {
    return libraries.map(lib => {
      // Business logic for risk calculation
      const vulnScore = lib.total_vulnerabilities * 10;
      const gradeScore = this.gradeToScore(lib.grade);
      const ageScore = this.calculateAgeScore(lib.release_date);

      const risk_score = vulnScore + gradeScore + ageScore;
      const risk_level = this.scoreToLevel(risk_score);

      return {
        ...lib,
        risk_score,
        risk_level
      };
    });
  }

  /**
   * Filter libraries with vulnerabilities
   * @param {Array} libraries - Library data
   * @returns {Array} Libraries with vulnerabilities only
   */
  filterVulnerable(libraries) {
    return libraries.filter(lib => lib.total_vulnerabilities > 0);
  }

  /**
   * Sort libraries by risk score (highest first)
   * @param {Array} libraries - Library data
   * @returns {Array} Sorted libraries
   */
  sortByRisk(libraries) {
    return [...libraries].sort((a, b) => b.risk_score - a.risk_score);
  }

  // Private helper methods
  gradeToScore(grade) {
    const scores = { A: 0, B: 10, C: 20, D: 30, F: 50 };
    return scores[grade] || 0;
  }

  calculateAgeScore(releaseDate) {
    const ageInDays = (Date.now() - releaseDate) / (1000 * 60 * 60 * 24);
    return Math.floor(ageInDays / 365) * 5; // 5 points per year
  }

  scoreToLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 20) return 'MEDIUM';
    return 'LOW';
  }
}
```

### View Layer (`src/views/`)

**Responsibility:** DOM manipulation and rendering

**What Views Do:**
- Render data to DOM
- Update UI elements
- Handle user interactions (clicks, inputs)
- Show loading states
- Display error messages
- Manage UI state (filters, sorting)

**What Views DON'T Do:**
- ❌ Make API calls
- ❌ Transform data
- ❌ Implement business logic
- ❌ Know about data sources

**Example View:**
```javascript
// src/views/LibrarySecurityView.js
export class LibrarySecurityView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
  }

  /**
   * Render libraries as table
   * @param {Array} libraries - Transformed library data
   */
  render(libraries) {
    if (!libraries || libraries.length === 0) {
      this.showEmpty();
      return;
    }

    const html = `
      <table class="library-table">
        <thead>
          <tr>
            <th>Library</th>
            <th>Version</th>
            <th>Grade</th>
            <th>Vulnerabilities</th>
            <th>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          ${libraries.map(lib => this.renderRow(lib)).join('')}
        </tbody>
      </table>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render single library row
   * @param {Object} library - Library data
   * @returns {string} HTML string
   */
  renderRow(library) {
    const riskClass = library.risk_level.toLowerCase();

    return `
      <tr class="risk-${riskClass}">
        <td>${library.file_name}</td>
        <td>${library.file_version}</td>
        <td><span class="grade-${library.grade}">${library.grade}</span></td>
        <td>${library.total_vulnerabilities}</td>
        <td><span class="risk-badge ${riskClass}">${library.risk_level}</span></td>
      </tr>
    `;
  }

  /**
   * Show loading spinner
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading libraries...</p>
      </div>
    `;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <i class="icon-error"></i>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.container.innerHTML = `
      <div class="empty-state">
        <p>No libraries found</p>
      </div>
    `;
  }
}
```

## Wiring It All Together

### HTML Dashboard (Minimal)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Library Security Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <!-- View renders content here -->
  </div>

  <!-- Load MVC modules -->
  <script type="module">
    import { LibrarySecurityModel } from './src/models/LibrarySecurityModel.js';
    import { LibrarySecurityController } from './src/controllers/LibrarySecurityController.js';
    import { LibrarySecurityView } from './src/views/LibrarySecurityView.js';

    // Initialize MVC components
    const model = new LibrarySecurityModel();
    const controller = new LibrarySecurityController();
    const view = new LibrarySecurityView('#app');

    // Orchestrate the flow
    async function loadDashboard() {
      try {
        // Show loading state
        view.showLoading();

        // Fetch data (Model)
        const rawData = await model.fetchLibraries('app-123');

        // Transform data (Controller)
        const transformedData = controller.calculateRiskScores(rawData);
        const sortedData = controller.sortByRisk(transformedData);

        // Render UI (View)
        view.render(sortedData);
      } catch (error) {
        view.showError('Failed to load libraries');
      }
    }

    // Start the app
    loadDashboard();
  </script>
</body>
</html>
```

## Data Flow

### Complete Request Flow

```
1. User opens dashboard
   ↓
2. HTML loads MVC modules
   ↓
3. Initialize Model, Controller, View
   ↓
4. View shows loading state
   ↓
5. Model fetches data from API
   ↓
6. Model returns raw data
   ↓
7. Controller transforms data
   ↓
8. Controller applies business logic
   ↓
9. View renders transformed data
   ↓
10. User sees dashboard
```

### User Interaction Flow

```
1. User clicks "Filter by Critical"
   ↓
2. View captures click event
   ↓
3. View calls Controller.filterBySeverity('CRITICAL')
   ↓
4. Controller returns filtered data
   ↓
5. View re-renders with filtered data
```

## Creating a New Dashboard

Follow these steps to create a new dashboard using MVC:

### Step 1: Create Model

```javascript
// src/models/MyDashboardModel.js
import { BaseModel } from './BaseModel.js';

export class MyDashboardModel extends BaseModel {
  async fetchData() {
    const url = `${this.baseUrl}/my-endpoint`;
    const response = await this.fetch(url);
    return response.data;
  }
}
```

### Step 2: Create Controller

```javascript
// src/controllers/MyDashboardController.js
import { BaseController } from './BaseController.js';

export class MyDashboardController extends BaseController {
  transformData(rawData) {
    return rawData.map(item => ({
      ...item,
      computed_field: this.computeSomething(item)
    }));
  }

  computeSomething(item) {
    // Business logic here
    return item.value * 2;
  }
}
```

### Step 3: Create View

```javascript
// src/views/MyDashboardView.js
export class MyDashboardView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
  }

  render(data) {
    const html = data.map(item => `
      <div class="item">
        <h3>${item.name}</h3>
        <p>${item.computed_field}</p>
      </div>
    `).join('');

    this.container.innerHTML = html;
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Loading...</div>';
  }
}
```

### Step 4: Wire Together in HTML

```html
<script type="module">
  import { MyDashboardModel } from './src/models/MyDashboardModel.js';
  import { MyDashboardController } from './src/controllers/MyDashboardController.js';
  import { MyDashboardView } from './src/views/MyDashboardView.js';

  const model = new MyDashboardModel();
  const controller = new MyDashboardController();
  const view = new MyDashboardView('#app');

  async function init() {
    view.showLoading();
    const raw = await model.fetchData();
    const transformed = controller.transformData(raw);
    view.render(transformed);
  }

  init();
</script>
```

### Step 5: Write Tests

```javascript
// tests/models/MyDashboardModel.test.js
describe('MyDashboardModel', () => {
  it('should fetch data', async () => {
    const model = new MyDashboardModel();
    const data = await model.fetchData();
    expect(data).toBeDefined();
  });
});

// tests/controllers/MyDashboardController.test.js
describe('MyDashboardController', () => {
  it('should transform data', () => {
    const controller = new MyDashboardController();
    const result = controller.transformData([{ value: 5 }]);
    expect(result[0].computed_field).toBe(10);
  });
});

// tests/views/MyDashboardView.test.js
describe('MyDashboardView', () => {
  it('should render data', () => {
    const view = new MyDashboardView('#app');
    view.render([{ name: 'Test', computed_field: 10 }]);
    expect(document.querySelector('.item')).toBeTruthy();
  });
});
```

## Benefits of MVC Architecture

### 1. Separation of Concerns
- Each layer has a single responsibility
- Easier to understand and maintain
- Changes isolated to specific layers

### 2. Testability
- Test each layer independently
- No need to mock DOM for model tests
- No need to mock API for view tests
- Controller tests are pure logic (fastest)

### 3. Reusability
- Models can be shared across dashboards
- Controllers can be reused for similar data
- Views can be swapped for different UIs

### 4. Maintainability
- Bug fixes affect only one layer
- New features don't ripple across codebase
- Refactoring is safer and easier

### 5. Parallel Development
- Different developers can work on different layers
- No merge conflicts between layers
- Clear interfaces between components

## Anti-Patterns to Avoid

### ❌ Model Knows About DOM
```javascript
// BAD
class BadModel {
  async fetchData() {
    const data = await fetch('/api/data');
    document.querySelector('#result').innerHTML = data; // NO!
  }
}
```

### ❌ View Makes API Calls
```javascript
// BAD
class BadView {
  async render() {
    const response = await fetch('/api/data'); // NO!
    this.container.innerHTML = response.html;
  }
}
```

### ❌ Controller Manipulates DOM
```javascript
// BAD
class BadController {
  processData(data) {
    const processed = data.map(x => x * 2);
    document.querySelector('#app').innerHTML = processed; // NO!
    return processed;
  }
}
```

### ❌ Tight Coupling
```javascript
// BAD - Controller knows too much about Model
class BadController {
  constructor() {
    this.model = new MyModel();
    this.apiKey = this.model.getApiKey(); // NO!
  }
}
```

## Best Practices

### ✅ Keep Layers Independent
```javascript
// GOOD - Pass data between layers
const data = await model.fetch();
const transformed = controller.transform(data);
view.render(transformed);
```

### ✅ Use Dependency Injection
```javascript
// GOOD - Inject dependencies
class Dashboard {
  constructor(model, controller, view) {
    this.model = model;
    this.controller = controller;
    this.view = view;
  }

  async load() {
    const data = await this.model.fetch();
    const transformed = this.controller.transform(data);
    this.view.render(transformed);
  }
}
```

### ✅ Return Data, Don't Mutate
```javascript
// GOOD - Return new objects
transformData(data) {
  return data.map(item => ({ ...item, new_field: value }));
}

// BAD - Mutate input
transformData(data) {
  data.forEach(item => item.new_field = value);
  return data;
}
```

### ✅ Use Pure Functions in Controllers
```javascript
// GOOD - Pure function, no side effects
calculateScore(value) {
  return value * 10;
}

// BAD - Side effects
calculateScore(value) {
  this.lastScore = value * 10; // Side effect
  console.log('Score:', this.lastScore); // Side effect
  return this.lastScore;
}
```

## Migrating Existing Dashboard

To migrate an existing monolithic dashboard to MVC:

1. **Extract API calls → Model**
   - Find all `fetch()` calls
   - Move to Model class methods
   - Remove credentials from HTML

2. **Extract business logic → Controller**
   - Find calculations and transformations
   - Move to Controller class methods
   - Keep logic pure (no side effects)

3. **Extract DOM manipulation → View**
   - Find all `document.querySelector()` and `innerHTML`
   - Move to View class methods
   - Keep rendering logic in View only

4. **Wire together in HTML**
   - Import Model, Controller, View
   - Initialize components
   - Orchestrate data flow

5. **Write tests**
   - Test each layer independently
   - Start with Model tests (easiest)
   - Add Controller tests (pure logic)
   - Add View tests (DOM assertions)
   - Add integration test (end-to-end)

## Conclusion

The MVC architecture provides a solid foundation for building maintainable, testable security dashboards. By separating concerns into Model, View, and Controller layers, we achieve:

- **Clarity** - Easy to understand where code belongs
- **Testability** - Each layer can be tested in isolation
- **Maintainability** - Changes are localized to specific layers
- **Scalability** - Easy to add new dashboards following the same pattern

Follow this guide when creating new dashboards or refactoring existing ones.
