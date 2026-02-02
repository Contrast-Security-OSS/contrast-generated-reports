# Documentation

## Overview

This directory contains comprehensive documentation for the Contrast Generated Reports project.

## Documentation Files

### [MVC_ARCHITECTURE.md](./MVC_ARCHITECTURE.md)
Complete guide to the Model-View-Controller architecture used in this project.

**Topics covered:**
- Architecture overview and diagram
- Model layer responsibilities and examples
- Controller layer responsibilities and examples
- View layer responsibilities and examples
- Data flow and component interaction
- Creating new dashboards
- Best practices and anti-patterns
- Migration guide for existing dashboards

**Read this first** if you're:
- Adding a new dashboard
- Refactoring an existing dashboard
- Understanding the project structure
- Contributing to the codebase

### [TESTING.md](./TESTING.md)
Comprehensive testing guide with TDD workflow and examples.

**Topics covered:**
- Testing stack (Vitest, MSW, jsdom)
- Test-Driven Development (TDD) workflow
- Writing Model, Controller, and View tests
- Integration testing
- Mock API configuration
- Test utilities and helpers
- Coverage requirements (80% target)
- Best practices and debugging

**Read this** if you're:
- Writing tests for new features
- Following TDD practices
- Debugging test failures
- Setting up mock API responses
- Understanding coverage requirements

## Quick Start

### For New Contributors

1. **Read MVC_ARCHITECTURE.md** to understand the project structure
2. **Read TESTING.md** to understand the testing approach
3. **Run the tests** to verify your environment: `npm test`
4. **Follow TDD** when implementing new features

### For Adding a New Dashboard

1. **Read the "Creating a New Dashboard" section** in MVC_ARCHITECTURE.md
2. **Follow the 5-step process:**
   - Create Model (API interactions)
   - Create Controller (business logic)
   - Create View (rendering)
   - Wire together in HTML
   - Write tests (Model → Controller → View → Integration)

3. **Follow TDD workflow:**
   - Write failing test (Red)
   - Write minimal implementation (Green)
   - Refactor for quality (Refactor)

### For Refactoring Existing Dashboards

1. **Read the "Migrating Existing Dashboard" section** in MVC_ARCHITECTURE.md
2. **Follow the migration steps:**
   - Extract API calls → Model
   - Extract business logic → Controller
   - Extract DOM manipulation → View
   - Wire components together
   - Write comprehensive tests

3. **Maintain visual parity** - Dashboard should look identical after refactor
4. **Achieve 80% test coverage** before marking refactor complete

## Project Structure

```
contrast-generated-reports/
├── docs/                    # Documentation (this folder)
│   ├── README.md           # This file
│   ├── MVC_ARCHITECTURE.md # Architecture guide
│   └── TESTING.md          # Testing guide
├── src/                    # Source code
│   ├── models/            # Model classes (API layer)
│   ├── controllers/       # Controller classes (business logic)
│   └── views/             # View classes (rendering)
├── tests/                 # Test files
│   ├── models/           # Model tests
│   ├── controllers/      # Controller tests
│   ├── views/            # View tests
│   ├── integration/      # Integration tests
│   └── mocks/            # MSW mock server
├── *.html                # Dashboard HTML files
├── package.json          # Dependencies and scripts
├── vitest.config.js      # Test configuration
└── .creds                # API credentials (not in git)
```

## Key Concepts

### MVC Pattern
- **Model** - Handles data fetching and API interactions
- **View** - Handles rendering and DOM manipulation
- **Controller** - Handles business logic and data transformation

### Test-Driven Development (TDD)
1. **Red** - Write failing test
2. **Green** - Write minimal code to pass
3. **Refactor** - Improve code quality

### Testing Layers
- **Unit Tests** - Test individual functions in isolation
- **Integration Tests** - Test complete flows (Model → Controller → View)
- **Mock APIs** - Use MSW to simulate Contrast Security API

## Testing Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (for TDD)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Development Workflow

### 1. Pick a Task
Choose from the bead list (see `.beads/issues.jsonl`) or create a new feature.

### 2. Follow TDD
- Write test first (Red)
- Implement feature (Green)
- Refactor (Refactor)

### 3. Run Quality Checks
```bash
# Tests must pass
npm test

# Coverage must be ≥80%
npm run test:coverage
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: Add library security risk scoring

- Implemented LibrarySecurityModel
- Implemented LibrarySecurityController with risk scoring
- Implemented LibrarySecurityView
- All tests passing with 85% coverage
"
```

## API Credentials

The project requires Contrast Security API credentials in a `.creds` file:

```bash
# .creds format
{
  "orgId": "your-org-id",
  "apiKey": "your-api-key",
  "serviceKey": "your-service-key",
  "username": "your-username",
  "baseUrl": "https://eval.contrastsecurity.com/Contrast/api/ng"
}
```

**Note:** The `.creds` file is excluded from git for security.

## Troubleshooting

### Tests not running?
```bash
# Reinstall dependencies
npm install

# Check Node.js version (requires Node 18+)
node --version
```

### API mocks not working?
Check that MSW server is properly configured in `tests/setup.js`.

### Import errors?
Verify path aliases in `vitest.config.js`:
```javascript
resolve: {
  alias: {
    '@': '/src',
    '@models': '/src/models',
    '@controllers': '/src/controllers',
    '@views': '/src/views'
  }
}
```

## Contributing

1. **Read the documentation** (this folder)
2. **Follow the MVC pattern** (see MVC_ARCHITECTURE.md)
3. **Write tests first** (see TESTING.md)
4. **Maintain 80% coverage**
5. **Keep commits clean and descriptive**

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [MVC Pattern Explained](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [Test-Driven Development](https://testdriven.io/test-driven-development/)

## Questions?

If you have questions about:
- **Architecture** - Refer to MVC_ARCHITECTURE.md
- **Testing** - Refer to TESTING.md
- **Setup** - Check main README.md in project root
- **API** - Check Contrast Security API documentation

## License

See main LICENSE file in project root.
