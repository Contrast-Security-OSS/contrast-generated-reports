#!/bin/bash
# Fetch library data using Contrast MCP tools and save to JSON file

APP_ID="${1:-f1df5e87-5088-42a3-be76-5bdd4457cbb3}"

echo "Fetching library data for app: $APP_ID"

# Use claude to call the MCP tool and save the output
# This will use the MCP tools that we know work correctly

cat > /tmp/fetch_libraries.txt <<'EOF'
Please use the mcp__contrastmcp-eval-cargo-cats__list_application_libraries tool to fetch ALL libraries for app ID {APP_ID} (set pageSize to 100 to get as many as possible in one call). Save the raw JSON response to a file called library_data.json in the current directory.
EOF

sed "s/{APP_ID}/$APP_ID/g" /tmp/fetch_libraries.txt

echo ""
echo "Library data would be saved to: library_data.json"
echo "Then update library_security.html to load from this file instead of making API calls"
