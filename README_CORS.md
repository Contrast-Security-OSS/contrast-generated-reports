# Local Development Setup

## The CORS Issue

When opening dashboards as local HTML files, browsers block API calls to `eval.contrastsecurity.com` due to CORS (Cross-Origin Resource Sharing) policy.

**Error:** `Access to fetch...has been blocked by CORS policy`

## Solution: CORS Proxy

We provide a simple CORS proxy for local development.

### Setup (Quick Start)

```bash
# Terminal 1: Start CORS proxy
node proxy_server.cjs

# Terminal 2: Start web server  
python3 -m http.server 8000

# Open browser
# http://localhost:8000/route_coverage.html
```

### How It Works

```
Browser (localhost:8000)
    ↓
CORS Proxy (localhost:8081) ← adds CORS headers
    ↓
Contrast API (eval.contrastsecurity.com)
```

The proxy:
- ✅ Runs on `http://localhost:8081`
- ✅ Forwards requests to `https://eval.contrastsecurity.com`
- ✅ Adds `Access-Control-Allow-Origin: *` header
- ✅ Preserves authentication headers

### Files

- `proxy_server.cjs` - Node.js CORS proxy server
- `src/utils/ConfigLoader.js` - Uses proxy URL for local dev

### Production

**Don't use the CORS proxy in production!**

For production, either:
1. Host dashboards on same origin as Contrast (e.g., `eval.contrastsecurity.com/dashboards/`)
2. Create proper backend API that calls Contrast server-side
3. Use static data generation (fetch data via MCP, generate HTML)

### Troubleshooting

**Proxy not starting?**
```bash
# Check if port 8081 is in use
lsof -i :8081

# Kill existing process
pkill -f proxy_server.cjs

# Restart
node proxy_server.cjs
```

**Still seeing CORS errors?**
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check proxy is running: `curl http://localhost:8081/Contrast/api/ng/test`
- Check browser console for actual error

**401 Unauthorized?**
- Check credentials in `.creds` file
- Verify API key is valid in Contrast UI
- Check `ConfigLoader.js` fallback credentials match

