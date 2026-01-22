#!/usr/bin/env python3
"""
Simple HTTP server with CORS proxy for Contrast Security API
Usage: python3 server.py
Then open http://localhost:8000/library_security.html in your browser
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.parse
import json
import base64
from pathlib import Path

PORT = 9999

# Read credentials from .creds file
# Try multiple locations for .creds file
CREDS_LOCATIONS = [
    Path(__file__).parent / '.creds',  # Same directory as server.py
    Path(__file__).parent.parent / 'test-pull' / 'contrast-generated-reports' / '.creds',
    Path(__file__).parent.parent / 'CSR-Helpful-Scripts' / '.creds'
]

def find_creds_file():
    for loc in CREDS_LOCATIONS:
        if loc.exists():
            return loc
    return None

CREDS_FILE = find_creds_file()

def load_credentials():
    """Load Contrast credentials from .creds file"""
    creds = {}
    if CREDS_FILE.exists():
        with open(CREDS_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    creds[key] = value
    return creds

class ContrastProxyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, API-Key')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Check if this is a proxy request to Contrast API
        if self.path.startswith('/api/contrast/'):
            self.proxy_contrast_api()
        else:
            # Serve static files
            SimpleHTTPRequestHandler.do_GET(self)

    def proxy_contrast_api(self):
        """Proxy requests to Contrast Security API"""
        try:
            creds = load_credentials()

            if not creds:
                self.send_error(500, "Could not load credentials from .creds file")
                return

            # Extract the API path (remove /api/contrast/ prefix)
            api_path = self.path[len('/api/contrast/'):]

            # Build the full Contrast API URL
            contrast_url = creds.get('CONTRAST_URL', 'https://eval.contrastsecurity.com/Contrast')
            full_url = f"{contrast_url}/{api_path}"

            print(f"Proxying request to: {full_url}")

            # Create authorization header
            auth_string = f"{creds['USERNAME']}:{creds['SERVICE_KEY']}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

            # Make request to Contrast API
            # Contrast uses Authorization header WITHOUT "Basic" prefix
            headers = {
                'Authorization': auth_base64,
                'API-Key': creds['API_KEY'],
                'Accept': 'application/json'
            }

            req = urllib.request.Request(full_url, headers=headers)

            with urllib.request.urlopen(req) as response:
                data = response.read()

                # Send response back to client
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
                print(f"Successfully proxied {len(data)} bytes")

        except Exception as e:
            error_msg = f"Proxy error: {str(e)}"
            print(error_msg)
            self.send_error(500, error_msg)

    def log_message(self, format, *args):
        """Override to add custom logging"""
        print(f"{self.address_string()} - {format % args}")

if __name__ == '__main__':
    creds = load_credentials()
    if not creds:
        print(f"Warning: Could not load credentials from {CREDS_FILE}")
        print("Make sure the .creds file exists with CONTRAST_URL, USERNAME, API_KEY, and SERVICE_KEY")
    else:
        print(f"Loaded credentials from {CREDS_FILE}")
        print(f"  - URL: {creds.get('CONTRAST_URL')}")
        print(f"  - Org ID: {creds.get('ORG_ID')}")
        print(f"  - App ID: {creds.get('APP_ID')}")

    httpd = HTTPServer(("", PORT), ContrastProxyHandler)
    print(f"\nServer running at http://localhost:{PORT}")
    print(f"Open http://localhost:{PORT}/library_security.html in your browser")
    print("Press Ctrl+C to stop\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.shutdown()
