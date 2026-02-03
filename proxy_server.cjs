// Simple CORS proxy for local development
// Run: node proxy_server.js

const http = require('http');
const https = require('https');

const PORT = 8081;
const TARGET = 'https://eval.contrastsecurity.com';

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, API-Key');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`Proxying: ${req.method} ${req.url}`);
  
  const options = {
    hostname: 'eval.contrastsecurity.com',
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'eval.contrastsecurity.com'
    }
  };
  
  const proxy = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  req.pipe(proxy);
  
  proxy.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error');
  });
});

server.listen(PORT, () => {
  console.log(`✓ CORS proxy running on http://localhost:${PORT}`);
  console.log(`  Proxying to: ${TARGET}`);
  console.log(`\nUpdate your baseUrl to: http://localhost:${PORT}/Contrast/api/ng`);
});
