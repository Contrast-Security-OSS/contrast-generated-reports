# ConfigLoader API Documentation

## Overview

`ConfigLoader` is a utility class for loading Contrast Security API credentials from a `.creds` file. It provides a secure way to manage credentials without hardcoding them in source files.

## Features

- ✅ Load credentials from `.creds` file
- ✅ Fallback to `window.CONTRAST_CONFIG`
- ✅ Graceful error handling
- ✅ Support for multiple credential formats
- ✅ Browser-compatible

## Quick Start

### Step 1: Create .creds File

Create a `.creds` file in your project root:

```bash
# .creds file - Never commit this to version control
CONTRAST_URL=https://app.contrastsecurity.com/Contrast
ORG_ID=your-org-id-here
USERNAME=your-email@example.com
API_KEY=your-api-key-here
SERVICE_KEY=your-service-key-here
APP_ID=your-app-id-here
```

### Step 2: Add to .gitignore

**IMPORTANT:** Always add `.creds` to `.gitignore` to prevent committing credentials:

```bash
echo ".creds" >> .gitignore
```

### Step 3: Use ConfigLoader in Your Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Dashboard</title>
</head>
<body>
    <div id="app">Loading...</div>

    <script type="module">
        import { ConfigLoader } from './src/utils/ConfigLoader.js';
        import { MyModel } from './src/models/MyModel.js';
        import { MyController } from './src/controllers/MyController.js';
        import { MyView } from './src/views/MyView.js';

        async function init() {
            // Load configuration from .creds file
            await ConfigLoader.init();

            // Now initialize your MVC components
            const model = new MyModel();
            const controller = new MyController(model);
            const view = new MyView();

            // Fetch and display data
            const data = await model.fetchData();
            controller.processData(data);
            view.render(data);
        }

        init().catch(console.error);
    </script>
</body>
</html>
```

## Methods

### init(credsPath)

Initialize configuration by loading from `.creds` file or falling back to defaults.

```javascript
await ConfigLoader.init();
```

**Parameters:**
- `credsPath` (string, optional) - Path to .creds file (default: '/.creds')

**Returns:** Promise<Object> - Configuration object

**Behavior:**
1. If `window.CONTRAST_CONFIG` exists, use it
2. Otherwise, try to load from `.creds` file
3. If loading fails, fall back to default configuration
4. Sets `window.CONTRAST_CONFIG` for use by ApiClient

**Example:**
```javascript
// Load from default path (/.creds)
await ConfigLoader.init();

// Load from custom path
await ConfigLoader.init('/config/.creds');
```

### loadFromCredsFile(credsPath)

Load credentials from a `.creds` file.

```javascript
const config = await ConfigLoader.loadFromCredsFile('/.creds');
```

**Parameters:**
- `credsPath` (string, optional) - Path to .creds file (default: '/.creds')

**Returns:** Promise<Object|null> - Configuration object or null if loading fails

**Example:**
```javascript
const config = await ConfigLoader.loadFromCredsFile();

if (config) {
    console.log('Loaded:', config.orgId);
} else {
    console.log('Failed to load .creds');
}
```

### parseCredsFile(content)

Parse .creds file content into configuration object.

```javascript
const config = ConfigLoader.parseCredsFile(fileContent);
```

**Parameters:**
- `content` (string) - Content of .creds file

**Returns:** Object - Parsed configuration

**Example:**
```javascript
const content = `CONTRAST_URL=https://app.contrastsecurity.com/Contrast
ORG_ID=my-org-id
USERNAME=user@example.com
API_KEY=my-api-key
SERVICE_KEY=my-service-key`;

const config = ConfigLoader.parseCredsFile(content);

console.log(config.orgId);      // 'my-org-id'
console.log(config.username);   // 'user@example.com'
```

### getConfig()

Get current configuration from `window.CONTRAST_CONFIG`.

```javascript
const config = ConfigLoader.getConfig();
```

**Returns:** Object|null - Current configuration or null

**Example:**
```javascript
await ConfigLoader.init();

const config = ConfigLoader.getConfig();
console.log('Org ID:', config.orgId);
console.log('Base URL:', config.baseUrl);
```

### setConfig(config)

Set configuration manually (bypasses .creds loading).

```javascript
ConfigLoader.setConfig({
    orgId: 'manual-org',
    apiKey: 'manual-key',
    baseUrl: 'https://app.contrastsecurity.com/Contrast/api/ng'
});
```

**Parameters:**
- `config` (Object) - Configuration object

**Example:**
```javascript
// Set config manually (useful for testing)
ConfigLoader.setConfig({
    orgId: 'test-org-123',
    username: 'test@example.com',
    apiKey: 'test-key',
    serviceKey: 'test-service-key',
    baseUrl: 'https://test.contrastsecurity.com/Contrast/api/ng'
});
```

## Configuration Format

### .creds File Format

```bash
# Comments start with #
# Blank lines are ignored

# Contrast Security URL (will be converted to baseUrl)
CONTRAST_URL=https://app.contrastsecurity.com/Contrast

# Organization ID
ORG_ID=545a3bce-97c5-4732-af38-1ac459087b0a

# User credentials
USERNAME=your-email@example.com

# API credentials
API_KEY=your-api-key-here
SERVICE_KEY=your-service-key-here

# Optional: Default application ID
APP_ID=your-app-id-here

# Commented out values are ignored
# ORG_ID=this-will-be-ignored
```

### Configuration Object

After loading, `window.CONTRAST_CONFIG` contains:

```javascript
{
    orgId: 'your-org-id',
    username: 'your-email@example.com',
    apiKey: 'your-api-key',
    serviceKey: 'your-service-key',
    baseUrl: 'https://app.contrastsecurity.com/Contrast/api/ng',
    appId: 'your-app-id'  // Optional
}
```

## Deployment Considerations

### Development

For local development, use `.creds` file:

1. Create `.creds` file with your credentials
2. Add `.creds` to `.gitignore`
3. Use `ConfigLoader.init()` in your dashboard

### Serving .creds File

To load `.creds` in browser, it must be accessible via HTTP:

**Option 1: Simple HTTP Server**
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Access: http://localhost:8000/your-dashboard.html
```

**Option 2: Configure Server**

Ensure your web server serves `.creds` file:

**Apache (.htaccess):**
```apache
# Allow .creds file to be served
<Files ".creds">
    Require all granted
</Files>
```

**Nginx:**
```nginx
location = /.creds {
    allow all;
}
```

### Production

For production deployments:

**Option 1: Environment Variables**
```javascript
// Build-time injection
window.CONTRAST_CONFIG = {
    orgId: process.env.CONTRAST_ORG_ID,
    apiKey: process.env.CONTRAST_API_KEY,
    // ...
};
```

**Option 2: Config Service**
```javascript
// Load from secure config endpoint
const response = await fetch('/api/config');
const config = await response.json();
ConfigLoader.setConfig(config);
```

**Option 3: Manual Configuration**
```html
<script>
    // Injected by server-side template
    window.CONTRAST_CONFIG = {
        orgId: '{{ CONTRAST_ORG_ID }}',
        apiKey: '{{ CONTRAST_API_KEY }}',
        // ...
    };
</script>
```

## Error Handling

ConfigLoader handles errors gracefully:

```javascript
// If .creds loading fails, falls back to defaults
await ConfigLoader.init();

// Always check if config loaded successfully
const config = ConfigLoader.getConfig();
if (!config) {
    console.error('Failed to load configuration');
}
```

**Console Warnings:**
- `[ConfigLoader] Could not load .creds file: <reason>`
- `[ConfigLoader] Falling back to window.CONTRAST_CONFIG or defaults`
- `[ConfigLoader] Using default configuration`

## Security Best Practices

1. **Never commit `.creds` file** - Always add to `.gitignore`
2. **Rotate credentials regularly** - Update .creds when credentials change
3. **Use environment-specific credentials** - Different .creds for dev/staging/prod
4. **Restrict file permissions** - `chmod 600 .creds` on Unix systems
5. **Use HTTPS in production** - Never send credentials over HTTP
6. **Don't log credentials** - ConfigLoader never logs sensitive values

## Testing

### Mocking Configuration

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigLoader } from '@/utils/ConfigLoader.js';

describe('My Dashboard', () => {
    beforeEach(() => {
        // Set test configuration
        ConfigLoader.setConfig({
            orgId: 'test-org',
            username: 'test@example.com',
            apiKey: 'test-key',
            serviceKey: 'test-service-key',
            baseUrl: 'https://test.contrastsecurity.com/Contrast/api/ng'
        });
    });

    it('should use test configuration', () => {
        const config = ConfigLoader.getConfig();
        expect(config.orgId).toBe('test-org');
    });
});
```

### Testing .creds Parsing

```javascript
import { ConfigLoader } from '@/utils/ConfigLoader.js';

const mockCredsContent = `CONTRAST_URL=https://test.example.com/Contrast
ORG_ID=test-org`;

const config = ConfigLoader.parseCredsFile(mockCredsContent);

expect(config.orgId).toBe('test-org');
expect(config.baseUrl).toBe('https://test.example.com/Contrast/api/ng');
```

## Migration from Hardcoded Credentials

### Before (Hardcoded)

```html
<script type="module">
    // ❌ DON'T DO THIS - hardcoded credentials
    window.CONTRAST_CONFIG = {
        orgId: '545a3bce-97c5-4732-af38-1ac459087b0a',
        apiKey: '16s58pRXBJrIYcn9hQO9v7g3kU4Jf02o',
        // ...
    };

    const model = new LibrarySecurityModel();
</script>
```

### After (Using ConfigLoader)

```html
<script type="module">
    import { ConfigLoader } from './src/utils/ConfigLoader.js';
    import { LibrarySecurityModel } from './src/models/LibrarySecurityModel.js';

    // ✅ Load from .creds file
    await ConfigLoader.init();

    const model = new LibrarySecurityModel();
</script>
```

## Troubleshooting

### .creds File Not Loading

**Problem:** `[ConfigLoader] Could not load .creds file: Failed to fetch`

**Solutions:**
1. Ensure `.creds` file exists in project root
2. Verify web server is serving `.creds` file
3. Check CORS settings if loading from different domain
4. Use absolute path: `await ConfigLoader.init('/path/to/.creds')`

### Using Default Configuration

**Problem:** `[ConfigLoader] Using default configuration`

**Cause:** `.creds` file not found or failed to load

**Solution:** Either fix `.creds` loading or manually set config:
```javascript
ConfigLoader.setConfig({ /* your config */ });
```

### CORS Errors

**Problem:** CORS error when fetching `.creds`

**Solution:** Configure server to allow `.creds` access or use same-origin serving

## See Also

- [BaseModel Documentation](./BaseModel.md)
- [ApiClient Documentation](./ApiClient.md)
- [Security Best Practices](../security.md)
- [Deployment Guide](../deployment.md)
