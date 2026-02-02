# Contrast Generated Reports

A collection of interactive security dashboards for visualizing Contrast Security data with clean MVC architecture and comprehensive test coverage.

## 🏗️ Architecture

All dashboards follow a clean **Model-View-Controller (MVC)** architecture pattern:

- **Models** (`src/models/`): Handle API data fetching and business data logic
- **Controllers** (`src/controllers/`): Implement business logic, calculations, and data transformations
- **Views** (`src/views/`): Pure DOM manipulation and rendering (no business logic)
- **Utils** (`src/utils/`): Shared utilities like ApiClient for centralized API interactions

### Benefits of MVC Refactoring

- **Separation of Concerns**: Clear boundaries between data, logic, and presentation
- **Testability**: Each layer independently tested with 362 comprehensive tests
- **Maintainability**: Easier to modify and extend without breaking other components
- **Reusability**: Shared components (ApiClient, BaseModel, BaseController) reduce duplication
- **Security**: No hardcoded credentials in HTML files

## 📊 Dashboards

### 1. Library Security Dashboard
**Files**: `library_security_mvc_simple.html`, `LibrarySecurityModel`, `LibrarySecurityController`, `LibrarySecurityView`

Displays third-party library security information:
- Security grades (A-F rating)
- Known CVEs and vulnerabilities
- Library age and outdated status
- Risk assessments and filtering

### 2. Route Coverage Dashboard
**Files**: `route_coverage_mvc_simple.html`, `RouteCoverageModel`, `RouteCoverageController`, `RouteCoverageView`

Visualizes API route testing coverage:
- Coverage percentages per microservice
- Tested vs untested routes
- Coverage gaps identification
- Service-level aggregation

### 3. PoC (Proof of Concept) Generator
**Files**: `poc_generator_mvc_simple.html`, `PocGeneratorModel`, `PocGeneratorController`, `PocGeneratorView`

Generates exploit proof-of-concepts for vulnerabilities:
- SQL Injection PoCs
- XSS payload generation
- Path Traversal exploits
- Command Injection examples
- Copy-to-clipboard functionality

### 4. SmartFix Vulnerability Guide
**Files**: `smartfix_guide_mvc_simple.html`, `SmartFixController`, `SmartFixView`

Provides automated vulnerability remediation guidance:
- Vulnerable code identification
- Secure code examples
- Fix recommendations
- Effort estimation (Low/Medium/High)

### 5. PR Security Gate Dashboard
**Files**: `pr_security_gate_mvc_simple.html`, `PRSecurityGateController`, `PRSecurityGateView`

Security evaluation for pull requests:
- Pass/Block/Warning determination
- Vulnerability severity analysis
- Risk score calculation
- Actionable recommendations

### 6. Compliance MTTR Dashboard
**Files**: `compliance_mttr_mvc_simple.html`, `ComplianceMTTRController`, `ComplianceMTTRView`

Tracks Mean Time To Remediation metrics:
- MTTR calculations by severity
- SLA compliance tracking
- Compliance scoring
- Trend analysis

### 7. Attack Response Playbook
**Files**: `attack_response_playbook_mvc_simple.html`, `AttackModel`, `AttackPlaybookController`, `AttackPlaybookView`

Incident response guidance for security attacks:
- Attack severity analysis
- Response plan generation
- Immediate actions checklist
- Containment, investigation, and remediation steps

### 8. Developer Security Training
**Files**: `developer_training_mvc_simple.html`, `TrainingModel`, `TrainingController`, `TrainingView`

Interactive security training dashboard:
- SQL Injection lessons
- Command Injection training
- XSS education
- Progress tracking
- Achievement badges

## 🚀 Getting Started

### Prerequisites

- Python 3.7+ (for local server)
- Node.js 18+ (for testing)
- Contrast Security account with API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd contrast-generated-reports
   ```

2. Install test dependencies:
   ```bash
   npm install
   ```

### Running Dashboards

Due to CORS restrictions, use the provided Python server to access the Contrast API:

```bash
python3 server.py
```

Then open your browser and navigate to any dashboard:
- `http://localhost:8000/library_security_mvc_simple.html`
- `http://localhost:8000/route_coverage_mvc_simple.html`
- `http://localhost:8000/poc_generator_mvc_simple.html`
- `http://localhost:8000/smartfix_guide_mvc_simple.html`
- `http://localhost:8000/pr_security_gate_mvc_simple.html`
- `http://localhost:8000/compliance_mttr_mvc_simple.html`
- `http://localhost:8000/attack_response_playbook_mvc_simple.html`
- `http://localhost:8000/developer_training_mvc_simple.html`

### Configuration

Credentials are configured via `window.CONTRAST_CONFIG` in each HTML file:

```javascript
window.CONTRAST_CONFIG = {
    orgId: 'your-org-id',
    apiKey: 'your-api-key',
    serviceKey: 'your-service-key',
    username: 'your-email@example.com',
    baseUrl: 'https://eval.contrastsecurity.com/Contrast/api/ng'
};
```

**Note**: These credentials are **NOT** committed to the repository. Each dashboard loads them at runtime.

## 🧪 Testing

### Running Tests

Run all tests (362 tests across 25 test files):
```bash
npm test
```

Run specific test file:
```bash
npm test -- BaseModel.test.js
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Test Structure

- **Model Tests** (`tests/models/`): API interaction, data fetching, error handling
- **Controller Tests** (`tests/controllers/`): Business logic, calculations, data transformations
- **View Tests** (`tests/views/`): DOM manipulation, rendering, user interactions
- **Utils Tests** (`tests/utils/`): Shared utilities like ApiClient

### Test Technologies

- **Vitest**: Fast unit testing framework
- **jsdom**: Browser-like environment for DOM testing
- **MSW (Mock Service Worker)**: API mocking for realistic testing

## 📁 Project Structure

```
contrast-generated-reports/
├── src/
│   ├── models/              # Data layer
│   │   ├── BaseModel.js     # Base class for all models
│   │   ├── AttackModel.js
│   │   ├── LibrarySecurityModel.js
│   │   ├── PocGeneratorModel.js
│   │   ├── RouteCoverageModel.js
│   │   └── TrainingModel.js
│   ├── controllers/         # Business logic layer
│   │   ├── BaseController.js
│   │   ├── AttackPlaybookController.js
│   │   ├── ComplianceMTTRController.js
│   │   ├── LibrarySecurityController.js
│   │   ├── PocGeneratorController.js
│   │   ├── PRSecurityGateController.js
│   │   ├── RouteCoverageController.js
│   │   ├── SmartFixController.js
│   │   └── TrainingController.js
│   ├── views/               # Presentation layer
│   │   ├── AttackPlaybookView.js
│   │   ├── ComplianceMTTRView.js
│   │   ├── LibrarySecurityView.js
│   │   ├── PocGeneratorView.js
│   │   ├── PRSecurityGateView.js
│   │   ├── RouteCoverageView.js
│   │   ├── SmartFixView.js
│   │   └── TrainingView.js
│   └── utils/               # Shared utilities
│       └── ApiClient.js     # Centralized API client
├── tests/                   # Test files (mirrors src/ structure)
│   ├── models/
│   ├── controllers/
│   ├── views/
│   ├── utils/
│   ├── mocks/
│   │   ├── handlers.js      # MSW request handlers
│   │   └── server.js        # MSW server setup
│   └── setup.js             # Test environment configuration
├── *.html                   # Dashboard HTML files (MVC implementations)
├── server.py                # Python CORS proxy server
├── package.json             # Node.js dependencies
├── vitest.config.js         # Test configuration
└── README.md                # This file
```

## 🔧 API Client

All models use the centralized `ApiClient` for consistent API interactions:

### Features
- **Authentication**: Automatic Authorization and API-Key headers
- **Retry Logic**: Configurable retries with exponential backoff
- **Timeout Handling**: Abort requests after timeout
- **Error Parsing**: Consistent error response format
- **Debug Logging**: Optional request/response logging

### Usage Example

```javascript
import { ApiClient } from './src/utils/ApiClient.js';

const client = new ApiClient({
    maxRetries: 3,      // Number of retry attempts
    retryDelay: 1000,   // Base delay between retries (ms)
    timeout: 30000,     // Request timeout (ms)
    debug: false        // Enable debug logging
});

// GET request
const response = await client.get('/orgtraces/filter', { limit: 10 });

// POST request
const result = await client.post('/applications', { name: 'My App' });
```

## 📚 API Endpoints Used

The dashboards interact with the following Contrast Security API endpoints:

- **Libraries**: `GET /api/ng/{orgId}/applications/{appId}/libraries`
- **Vulnerabilities**: `GET /api/ng/{orgId}/orgtraces/filter`
- **Routes**: `GET /api/ng/{orgId}/applications/{appId}/routes`
- **Attacks**: `GET /api/ng/{orgId}/attacks`
- **Applications**: `GET /api/ng/{orgId}/applications`

## 🔒 Security Considerations

### No Hardcoded Credentials
- All dashboards load credentials from `window.CONTRAST_CONFIG`
- Credentials are **never** committed to the repository
- Server-side proxy (server.py) handles credential loading

### XSS Prevention
- All user input is escaped using `escapeHtml()` in views
- No `innerHTML` with unescaped user data
- Template literals properly escape variables

### API Security
- All requests include authentication headers
- HTTPS enforced for API communications
- CORS handled by proxy server

## 🐛 Troubleshooting

### CORS Errors
**Problem**: `Access to fetch blocked by CORS policy`

**Solution**: Use the Python proxy server (`python3 server.py`) instead of opening HTML files directly.

### No Data Loading
**Possible Causes:**
1. Incorrect credentials in `window.CONTRAST_CONFIG`
2. Network connectivity issues
3. API endpoint unavailable
4. Missing organization permissions

**Debug Steps:**
1. Check browser console for errors
2. Enable debug mode: `new ApiClient({ debug: true })`
3. Verify credentials with Contrast Security support
4. Test API access with curl

### Test Failures
**If tests fail:**
1. Run `npm install` to ensure dependencies are current
2. Check Node.js version (requires 18+)
3. Clear test cache: `rm -rf node_modules/.vitest`
4. Re-run tests: `npm test`

## 📈 Test Coverage

Current test coverage (362 tests):

- **Models**: 68 tests
- **Controllers**: 183 tests
- **Views**: 111 tests
- **Utils**: 20 tests (ApiClient)

Target: 80% coverage for lines, functions, branches, and statements.

## 🤝 Contributing

### Adding a New Dashboard

1. **Create Model** (`src/models/NewDashboardModel.js`):
   ```javascript
   import { BaseModel } from './BaseModel.js';

   export class NewDashboardModel extends BaseModel {
       async fetchData() {
           return this.fetch('/endpoint');
       }
   }
   ```

2. **Create Controller** (`src/controllers/NewDashboardController.js`):
   ```javascript
   import { BaseController } from './BaseController.js';

   export class NewDashboardController extends BaseController {
       processData(data) {
           // Business logic here
           return transformedData;
       }
   }
   ```

3. **Create View** (`src/views/NewDashboardView.js`):
   ```javascript
   export class NewDashboardView {
       render(data) {
           const container = document.getElementById('container');
           container.innerHTML = `...`;
       }
   }
   ```

4. **Create Tests**:
   - `tests/models/NewDashboardModel.test.js`
   - `tests/controllers/NewDashboardController.test.js`
   - `tests/views/NewDashboardView.test.js`

5. **Create Dashboard HTML** (`new_dashboard_mvc_simple.html`):
   ```html
   <script type="module">
       import { NewDashboardModel } from './src/models/NewDashboardModel.js';
       import { NewDashboardController } from './src/controllers/NewDashboardController.js';
       import { NewDashboardView } from './src/views/NewDashboardView.js';

       const model = new NewDashboardModel();
       const controller = new NewDashboardController();
       const view = new NewDashboardView();

       // Application logic...
   </script>
   ```

6. **Run Tests**: `npm test`

## 📝 License

[Add license information]

## 👥 Authors

[Add author information]

## 🔗 Resources

- [Contrast Security Documentation](https://docs.contrastsecurity.com/)
- [Contrast API Reference](https://api.contrastsecurity.com/)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [Vitest Documentation](https://vitest.dev/)
