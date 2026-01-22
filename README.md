# Contrast Generated Reports

This project contains various security reports generated from Contrast Security data.

## Library Security Report

The Library Security Report displays real-time data from the Contrast Security API, showing:
- Library security grades
- Known CVEs and vulnerabilities
- Library age and outdated status
- Risk assessments

### Configuration

The report is configured to use credentials from `../CSR-Helpful-Scripts/.creds` file.

You can also modify the credentials directly in `library_security.html` by editing the `CONFIG` object at the top of the script section:

```javascript
const CONFIG = {
    contrastUrl: 'https://eval.contrastsecurity.com/Contrast',
    orgId: 'your-org-id',
    appId: 'your-app-id',
    apiKey: 'your-api-key',
    serviceKey: 'your-service-key',
    username: 'your-username'
};
```

### Usage

Due to CORS (Cross-Origin Resource Sharing) restrictions, you need to run a local web server to access the Contrast API from the browser.

#### Option 1: Using the Provided Python Server (Recommended)

1. Start the local server:
   ```bash
   cd /Users/jasoneasterday/Development/git/contrast-generated-reports
   python3 server.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/library_security.html
   ```

The Python server automatically:
- Reads credentials from `../CSR-Helpful-Scripts/.creds`
- Proxies requests to the Contrast API with proper authentication
- Handles CORS headers

#### Option 2: Using a Simple HTTP Server

If you prefer a simpler approach (but you'll need to handle CORS differently):

```bash
cd /Users/jasoneasterday/Development/git/contrast-generated-reports
python3 -m http.server 8000
```

Then open `http://localhost:8000/library_security.html` in your browser.

**Note:** This method may still have CORS issues as it doesn't proxy the API calls.

### Features

- **Real-time Data**: Fetches library data directly from Contrast API
- **Statistics Dashboard**: Shows total libraries, CVEs, and critical vulnerabilities
- **Grade Distribution**: Visual breakdown of library security grades
- **High-Risk Libraries**: Detailed cards for libraries with critical issues
- **Filtering**: Filter by critical severity, outdated libraries, or F-grade libraries
- **Risk Assessment**: Calculated risk scores based on vulnerabilities, age, and grade

### Troubleshooting

**CORS Errors:**
If you see CORS errors in the browser console, make sure you're using the Python proxy server (`python3 server.py`) instead of opening the HTML file directly.

**No Data Loading:**
- Check that your credentials in the `.creds` file are correct
- Verify that the `APP_ID` in the config matches your application
- Check the browser console for error messages
- Ensure you have network access to the Contrast API server

**API Authentication Errors:**
- Verify your API_KEY, SERVICE_KEY, and USERNAME in the `.creds` file
- Check that your account has permission to access the application's library data

### File Structure

```
contrast-generated-reports/
├── library_security.html    # Main library security report
├── server.py                # Python proxy server for API calls
├── README.md                # This file
└── [other report files]
```

### API Endpoints Used

- `GET /api/ng/{orgId}/applications/{appId}/libraries?expand=vulns&quickFilter=ALL`
  - Retrieves all libraries for an application with vulnerability details

### Data Structure

The report uses the following fields from the Contrast API response:

- `filename`: Library file name
- `version`: Library version
- `grade`: Security grade (A-F)
- `vulnerabilities`: Array of CVE objects
  - `name`: CVE identifier
  - `description`: Vulnerability description
  - `severityCode`: Severity level (CRITICAL, HIGH, MEDIUM, LOW)
- `totalVulnerabilities`: Count of total CVEs
- `releaseDate`: Library release date (epoch ms)
- `latestReleaseDate`: Latest available version release date (epoch ms)
- `latestVersion`: Latest available version
