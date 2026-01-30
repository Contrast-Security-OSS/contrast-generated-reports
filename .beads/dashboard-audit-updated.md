# Dashboard Audit Report - Updated with MVC Architecture

## Date: 2026-01-30 (Updated with MVC requirements)

## Project Overview

**Goal:** Refactor all 10 security dashboards from monolithic HTML files to proper MVC architecture with comprehensive testing.

**Current State:**
- All code is in monolithic HTML files
- 2 dashboards working (attack_map, vulnerability_dashboard)
- 8 dashboards need MVC refactoring and testing

**Target State:**
- Clean MVC architecture (Model-View-Controller)
- Model: API calls to Contrast Security APIs
- Controller: Data transformation and business logic
- View: Display layer only
- Full test coverage: Model tests, Controller tests, View tests, Integration tests

## Architecture

### MVC Pattern

```
src/
├── models/
│   ├── BaseModel.js              # Base class with .creds loading, fetch wrapper
│   ├── LibrarySecurityModel.js   # Library API calls
│   ├── RouteCoverageModel.js     # Route coverage API calls
│   └── ...                       # One model per dashboard
├── controllers/
│   ├── BaseController.js         # Base class with common transformations
│   ├── LibrarySecurityController.js  # Risk scoring, CVE merging
│   ├── RouteCoverageController.js    # Coverage calculations, aggregation
│   └── ...                       # One controller per dashboard
├── views/
│   ├── LibrarySecurityView.js    # Display logic only
│   ├── RouteCoverageView.js      # Display logic only
│   └── ...                       # One view per dashboard
tests/
├── models/                       # Model layer tests
├── controllers/                  # Controller layer tests
├── views/                        # View layer tests
└── integration/                  # End-to-end tests
```

### Testing Strategy

**Model Tests:**
- Verify API calls return correct data structure
- Test error handling (network failures, 404s, auth errors)
- Test retry logic
- Mock API responses for isolated testing

**Controller Tests:**
- Verify data transformations are correct
- Test business logic (risk calculations, aggregations)
- Test data merging from multiple sources
- Test edge cases (empty data, malformed data)

**View Tests:**
- Verify correct rendering from controller data
- Test UI interactions
- Test error display states
- Verify visual consistency maintained

**Integration Tests:**
- Test complete Model→Controller→View flow
- Test with real API endpoints (when available)
- Verify end-to-end functionality

## Infrastructure Requirements

### Testing Framework
- **Vitest**: Modern, fast testing framework for JavaScript
- **@testing-library/dom**: DOM testing utilities
- **jsdom**: Browser environment simulation
- **Mock Service Worker (MSW)**: API mocking

### Build Tools
- **Node.js + npm**: Package management
- **ES Modules**: Modern JavaScript module system

### Configuration Files
- `package.json`: Dependencies and scripts
- `vitest.config.js`: Test configuration
- `.creds`: Contrast API credentials (git-ignored)

## Dashboard Status

### P0 - Infrastructure (Must complete first)
1. **bd-mud** - Setup testing infrastructure and MVC directory structure
2. **bd-2hd** - Create base Model class for API interactions
3. **bd-pby** - Create base Controller class for data transformation

### P1 - First Refactors (Learn patterns)
4. **bd-23j** - Refactor library_security.html to MVC + tests
5. **bd-kin** - Refactor route_coverage.html to MVC + tests

### P2 - Remaining Dashboards (Apply patterns)
6. **bd-1no** - Refactor poc_generator.html to MVC + tests
7. **bd-hsq** - Refactor smartfix_guide.html to MVC + tests
8. **bd-2ys** - Refactor pr_security_gate.html to MVC + tests
9. **bd-1yp** - Refactor compliance_mttr.html to MVC + tests
10. **bd-30i** - Refactor attack_response_playbook.html to MVC + tests
11. **bd-3ek** - Refactor developer_training.html to MVC + tests

### P3 - Consolidation & Documentation
12. **bd-15a** - Consolidate common patterns into base classes
13. **bd-1za** - Comprehensive documentation

## APIs Used

Primary API: **api.contrastsecurity.com**

**Known Endpoints:**
- `/api/ng/{orgId}/orgtraces/filter` - Vulnerabilities (6 dashboards)
- `/api/ng/{orgId}/attacks` - Attacks (2 dashboards)
- `/api/ng/{orgId}/applications/{appId}/libraries` - Libraries (1 dashboard)
- `/api/ng/{orgId}/applications/{appId}/route/coverage` - Routes (1 dashboard)
- `/api/ng/{orgId}/traces/{appId}/trace/{vulnId}` - Vuln details (2 dashboards)

**Note:** May discover undocumented APIs during implementation.

## Credentials

`.creds` file format:
```
CONTRAST_URL=https://eval.contrastsecurity.com/Contrast
ORG_ID=...
USERNAME=...
API_KEY=...
SERVICE_KEY=...
APP_ID=...
```

## Dependency Chain

```
P0 Infrastructure
  ↓
P1 First 2 Refactors (library_security, route_coverage)
  ↓
P2 Remaining 6 Refactors (learn from P1 patterns)
  ↓
P3 Consolidation → Documentation
```

## Success Criteria

### For Each Dashboard Refactor:
- ✅ Model class created with API methods
- ✅ Controller class created with transformations
- ✅ View class created with display logic
- ✅ Unit tests written for Model (>80% coverage)
- ✅ Unit tests written for Controller (>80% coverage)
- ✅ View tests written for display logic
- ✅ Integration test passes end-to-end
- ✅ Dashboard looks identical to original
- ✅ All API calls work correctly
- ✅ Error handling works throughout stack

### For Overall Project:
- ✅ All 10 dashboards refactored to MVC
- ✅ Comprehensive test suite (>80% coverage)
- ✅ Base classes consolidate common patterns
- ✅ Documentation complete and accurate
- ✅ No regressions in functionality or appearance

## Risk Mitigation

**Risk: Breaking existing functionality**
- Mitigation: Visual regression testing, keep original HTML as reference

**Risk: API endpoints not documented**
- Mitigation: Explore and document as we go, use proxy server logging

**Risk: Performance degradation**
- Mitigation: Profile before/after, optimize API calls, implement caching

**Risk: Testing complexity**
- Mitigation: Start simple with P0 infrastructure, iterate based on learnings

## Next Steps

1. Start with **bd-mud** (infrastructure setup)
2. Then **bd-2hd** and **bd-pby** (base classes) in parallel
3. Refactor first dashboard (library_security) as proof of concept
4. Apply learnings to remaining dashboards
