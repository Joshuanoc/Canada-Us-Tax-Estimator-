# Security Policy

## Reporting a vulnerability

Do not publish credentials, exploit details, personal data, or other sensitive security information in a public issue.

If GitHub Private Vulnerability Reporting is available in the repository's Security tab, use that private channel. Otherwise, contact the repository owner privately through GitHub before sharing sensitive technical details.

Include the affected component, impact, reproduction steps, and a minimal proof of concept when safe to do so. Never include real secrets or production data.

## Secrets

Never commit passwords, API keys, access tokens, private keys, connection strings, or `.env` files containing real credentials. Use GitHub repository/environment secrets for CI/CD credentials and rotate any credential immediately if it is accidentally committed.

## Supported code

Security fixes are applied to the default branch unless additional supported versions are documented.


## Release security controls

Dependency versions and lockfiles are committed. CI installs with `npm ci --ignore-scripts`, blocks high/critical npm advisories, and runs Gitleaks before building for Pages. Actions are pinned to commit SHAs. Secret findings must be reviewed and affected credentials revoked, not merely deleted from the current tree.

Vercel response headers include CSP, anti-framing, MIME sniffing protection, referrer/permissions policies and HSTS. Pages receives a meta CSP but cannot apply the Vercel response-header configuration. Verify actual production headers before release.

Repository workflows alone cannot enforce GitHub branch protections or Vercel Git deployment checks; configure required checks in the hosting/repository settings. No claim is made that live database policies, secret history or deployment settings have passed until their checks complete.

## Required API rate-limit configuration before merging/releasing

Set UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and a random RATE_LIMIT_SECRET of at least 32 characters in server-side Vercel environment settings. Never prefix secrets with frontend/public variable names. Redis uses atomic counters shared by instances. Limits: 60 calculations/minute/IP; 60 scenario requests/minute/IP; 20 save attempts/hour/IP; 100 save attempts/day/guest owner. Raw IPs are HMAC-hashed before storage, and counters expire.

Production fails closed with 503 when protection is unconfigured or unavailable; throttled requests return 429 and Retry-After. Local development uses bounded in-memory counters. On Vercel only its trusted IP header is used. Other hosts use socket IPs; a proxy-aware identity adapter is required before deployment behind another proxy.

These API limits do not protect direct Supabase anonymous signup/Data API requests. Verify provider-side abuse protection and live RLS separately. The daily save request limit is not a total stored-row quota. Existing SQL ownership policies and guest sessions remain unchanged.

Local saved rows and calculation assumptions render as text. Inline application JavaScript was moved to app.js so CSP can reject inline scripts without breaking calculations.
