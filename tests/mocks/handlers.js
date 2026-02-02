/**
 * Mock Service Worker (MSW) Handlers
 * Intercepts API requests during testing and returns mock responses
 */

import { http, HttpResponse } from 'msw';

// Base URL for Contrast API
const CONTRAST_API_BASE = 'https://eval.contrastsecurity.com/Contrast/api/ng';
const ORG_ID = '545a3bce-97c5-4732-af38-1ac459087b0a';

// Mock data for testing
export const mockLibraries = {
  success: true,
  messages: [],
  libraries: [
    {
      file_name: 'spring-core-5.3.20.jar',
      file_version: '5.3.20',
      grade: 'A',
      total_vulnerabilities: 0,
      release_date: 1650000000000,
      latest_version: '5.3.23',
      latest_release_date: 1660000000000,
      vulnerabilities: []
    },
    {
      file_name: 'log4j-core-2.14.1.jar',
      file_version: '2.14.1',
      grade: 'F',
      total_vulnerabilities: 3,
      release_date: 1610000000000,
      latest_version: '2.20.0',
      latest_release_date: 1680000000000,
      vulnerabilities: [
        {
          name: 'CVE-2021-44228',
          description: 'Apache Log4j2 JNDI features do not protect against attacker controlled LDAP',
          severity: 'CRITICAL'
        },
        {
          name: 'CVE-2021-45046',
          description: 'Apache Log4j2 Thread Context Lookup Pattern vulnerable',
          severity: 'HIGH'
        },
        {
          name: 'CVE-2021-45105',
          description: 'Apache Log4j2 does not protect from uncontrolled recursion',
          severity: 'MEDIUM'
        }
      ]
    }
  ]
};

export const mockVulnerabilities = {
  success: true,
  messages: [],
  traces: [
    {
      uuid: 'VULN-001',
      title: 'SQL Injection in UserController',
      severity: 'CRITICAL',
      status: 'Reported',
      first_time_seen: 1700000000000,
      last_time_seen: 1705000000000,
      application: {
        name: 'cargo-cats-dataservice',
        app_id: 'app-001'
      }
    },
    {
      uuid: 'VULN-002',
      title: 'XSS in CommentForm',
      severity: 'HIGH',
      status: 'Confirmed',
      first_time_seen: 1699000000000,
      last_time_seen: 1704000000000,
      application: {
        name: 'cargo-cats-frontgateservice',
        app_id: 'app-002'
      }
    }
  ]
};

export const mockAttacks = {
  success: true,
  messages: [],
  attacks: [
    {
      uuid: 'ATK-001',
      source: '10.1.3.116',
      status: 'EXPLOITED',
      start_time: 1700000000000,
      end_time: 1700001000000,
      rules: ['sql-injection', 'command-injection'],
      applications: [
        {
          name: 'cargo-cats-webhookservice',
          severity: 'CRITICAL'
        }
      ]
    }
  ]
};

export const mockRouteCoverage = {
  success: true,
  messages: [],
  routes: [
    {
      signature: 'GET /api/users',
      status: 'EXERCISED',
      observations: 42
    },
    {
      signature: 'POST /api/users',
      status: 'DISCOVERED',
      observations: 0
    },
    {
      signature: 'GET /api/users/{id}',
      status: 'EXERCISED',
      observations: 15
    }
  ]
};

// Request handlers for MSW
export const handlers = [
  // Libraries API
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/applications/:appId/libraries`, ({ params }) => {
    return HttpResponse.json(mockLibraries);
  }),

  // Vulnerabilities (org-level)
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/orgtraces/filter`, ({ request }) => {
    const url = new URL(request.url);
    const severities = url.searchParams.get('severities');

    // Filter by severity if provided
    let filteredTraces = mockVulnerabilities.traces;
    if (severities) {
      const severityList = severities.split(',');
      filteredTraces = mockVulnerabilities.traces.filter(t =>
        severityList.includes(t.severity)
      );
    }

    return HttpResponse.json({
      ...mockVulnerabilities,
      traces: filteredTraces
    });
  }),

  // Vulnerability details
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/traces/:appId/trace/:vulnId`, ({ params }) => {
    const vuln = mockVulnerabilities.traces.find(v => v.uuid === params.vulnId);
    if (!vuln) {
      return HttpResponse.json(
        { success: false, messages: ['Vulnerability not found'] },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      trace: {
        ...vuln,
        evidence: 'SELECT * FROM users WHERE id = ' + request.getParameter("id"),
        recommendation: 'Use parameterized queries',
        severity_description: 'Critical vulnerabilities require immediate attention'
      }
    });
  }),

  // Attacks API
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/attacks`, ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '50';

    return HttpResponse.json(mockAttacks);
  }),

  // Route Coverage API
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/applications/:appId/route/coverage`, ({ params }) => {
    return HttpResponse.json(mockRouteCoverage);
  }),

  // Error simulation for testing error handling
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/test-error`, () => {
    return HttpResponse.json(
      { success: false, messages: ['Simulated API error'] },
      { status: 500 }
    );
  }),

  // Network error simulation
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/test-network-error`, () => {
    return HttpResponse.error();
  }),

  // 401 Unauthorized
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/unauthorized`, () => {
    return HttpResponse.json(
      { success: false, messages: ['Unauthorized'] },
      { status: 401 }
    );
  }),

  // 404 Not Found
  http.get(`${CONTRAST_API_BASE}/${ORG_ID}/nonexistent`, () => {
    return HttpResponse.json(
      { success: false, messages: ['Resource not found'] },
      { status: 404 }
    );
  })
];
