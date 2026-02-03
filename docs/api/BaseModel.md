# BaseModel API Documentation

## Overview

`BaseModel` is the base class for all Model classes in the MVC architecture. It provides common functionality for API interactions with the Contrast Security API.

## Features

- ✅ Credential loading from `.creds` file
- ✅ Fetch wrapper with error handling
- ✅ Automatic retry logic for failed API calls
- ✅ Logging and debugging capabilities
- ✅ Comprehensive test coverage

## Usage

### Basic Usage

```javascript
import { BaseModel } from './src/models/BaseModel.js';

// Create a model instance
const model = new BaseModel();

// Make an API call
const response = await model.fetch('applications');
```

### Creating Custom Models

```javascript
import { BaseModel } from './src/models/BaseModel.js';

export class MyCustomModel extends BaseModel {
  /**
   * Fetch custom data
   */
  async fetchCustomData(appId) {
    try {
      const url = `${this.baseUrl}/applications/${appId}/custom-endpoint`;
      const response = await this.fetch(url);

      if (!response.success) {
        this.handleError('fetchCustomData', new Error(response.error));
        return [];
      }

      return response.data || [];
    } catch (error) {
      this.handleError('fetchCustomData', error);
      return [];
    }
  }
}
```

## Configuration

### Option 1: Using ConfigLoader (Recommended)

The `ConfigLoader` utility can load credentials from the `.creds` file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Dashboard</title>
</head>
<body>
    <script type="module">
        import { ConfigLoader } from './src/utils/ConfigLoader.js';
        import { MyCustomModel } from './src/models/MyCustomModel.js';

        // Initialize configuration from .creds file
        await ConfigLoader.init();

        // Now use your models
        const model = new MyCustomModel();
        const data = await model.fetchCustomData('app-123');
    </script>
</body>
</html>
```

### Option 2: Manual Configuration

You can also set configuration manually:

```javascript
window.CONTRAST_CONFIG = {
    orgId: 'your-org-id',
    apiKey: 'your-api-key',
    serviceKey: 'your-service-key',
    username: 'your-username',
    baseUrl: 'https://app.contrastsecurity.com/Contrast/api/ng'
};
```

### Option 3: Using .creds File

Create a `.creds` file in your project root:

```bash
# .creds file - Never commit this to version control
CONTRAST_URL=https://app.contrastsecurity.com/Contrast
ORG_ID=your-org-id
USERNAME=your-username
API_KEY=your-api-key
SERVICE_KEY=your-service-key
APP_ID=your-app-id
```

**Important:** Add `.creds` to `.gitignore` to prevent committing credentials!

## Constructor Options

```javascript
const model = new BaseModel({
    maxRetries: 3,        // Number of retry attempts (default: 3)
    retryDelay: 1000,     // Delay between retries in ms (default: 1000)
    timeout: 30000,       // Request timeout in ms (default: 30000)
    debug: false          // Enable debug logging (default: false)
});
```

## Instance Properties

- `apiClient` - Instance of ApiClient for making requests
- `credentials` - Loaded credentials object
- `baseUrl` - Base URL for API requests (includes org ID)
- `maxRetries` - Maximum number of retry attempts
- `timeout` - Request timeout in milliseconds
- `debug` - Debug logging flag
- `retryDelay` - Delay between retry attempts

## Methods

### fetch(url, options)

Make an HTTP request with automatic retry logic and error handling.

```javascript
const response = await model.fetch('applications/app-123/libraries');
```

**Parameters:**
- `url` (string) - API endpoint URL (relative to baseUrl or absolute)
- `options` (Object) - Fetch options (headers, method, body, etc.)

**Returns:** Promise<Object> - Response object with `success`, `status`, and data

**Response Format:**
```javascript
{
    success: true,      // Boolean indicating success
    status: 200,        // HTTP status code
    data: [...],        // Response data
    // ... other response fields
}
```

**Error Response:**
```javascript
{
    success: false,
    error: 'Error message',
    status: 500
}
```

### loadCredentials()

Load credentials (delegated to ApiClient).

```javascript
const creds = model.loadCredentials();
```

**Returns:** Object - Credentials object

### formatError(error, status)

Format error into consistent structure (for backward compatibility).

```javascript
const errorResponse = model.formatError(new Error('Something failed'), 500);
```

**Parameters:**
- `error` (Error|string) - Error object or message
- `status` (number) - HTTP status code

**Returns:** Object - Formatted error response

### getAuthHeader()

Get Base64 encoded authorization header value.

```javascript
const authHeader = model.getAuthHeader();
```

**Returns:** string - Base64 encoded auth header

### handleError(methodName, error)

Handle errors (can be overridden by subclasses).

```javascript
model.handleError('fetchLibraries', new Error('API failed'));
```

**Parameters:**
- `methodName` (string) - Name of the method where error occurred
- `error` (Error) - Error object

**Usage:** Override in subclasses for custom error handling:

```javascript
handleError(methodName, error) {
    super.handleError(methodName, error);

    // Custom error handling
    this.sendErrorToAnalytics(methodName, error);
}
```

## Retry Logic

BaseModel automatically retries failed requests:

- **Network errors**: Retried up to `maxRetries` times
- **HTTP errors** (4xx, 5xx): NOT retried (fail immediately)
- **Timeout errors**: NOT retried (fail immediately)

**Retry Behavior:**
- Exponential backoff: `retryDelay * attempt`
- First attempt: immediate
- Second attempt: after `retryDelay * 1`ms
- Third attempt: after `retryDelay * 2`ms
- etc.

## Error Handling

All methods return structured responses instead of throwing errors:

```javascript
const response = await model.fetch('nonexistent-endpoint');

if (!response.success) {
    console.error('Error:', response.error);
    console.error('Status:', response.status);
}
```

## Debug Logging

Enable debug mode to see detailed API logs:

```javascript
const model = new BaseModel({ debug: true });

// Logs:
// [API Request] Attempt 1: https://...
// [API Error] Status 500: Internal Server Error
```

## Best Practices

1. **Always check `response.success`** before accessing data
2. **Use `handleError()`** for consistent error logging
3. **Override `handleError()`** for custom error handling per model
4. **Enable `debug: true`** during development for troubleshooting
5. **Never hardcode credentials** - use ConfigLoader or window.CONTRAST_CONFIG
6. **Add `.creds` to `.gitignore`** to prevent credential leaks

## Testing

Example test for a custom model:

```javascript
import { describe, it, expect } from 'vitest';
import { MyCustomModel } from '@/models/MyCustomModel.js';

describe('MyCustomModel', () => {
    it('should fetch custom data', async () => {
        const model = new MyCustomModel();
        const response = await model.fetchCustomData('test-app-123');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
        const model = new MyCustomModel();
        const response = await model.fetchCustomData('invalid-id');

        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
    });
});
```

## See Also

- [ApiClient Documentation](./ApiClient.md)
- [ConfigLoader Documentation](./ConfigLoader.md)
- [MVC Architecture Overview](../architecture.md)
- [Testing Guide](../testing.md)
