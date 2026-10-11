# TaxMetric security review — 2026-10-11

## Scope and evidence

Reviewed tracked application, API, storage SQL, dependency lockfile and release configuration. This is a source review with mocked provider tests and local PostgreSQL (PGlite), not a certification of deployed infrastructure or historical secret exposure.

- `npm ci`: passed.
- Merged backend suite: 22 tests passed after API/schema fixes, shared limiter restoration, configuration-health fallback and package dependency checks.
- `npx playwright test --list`: 98 desktop/mobile cases collected successfully; collection is not execution.
- `npm audit --audit-level=high`: all dependencies included; zero reported vulnerabilities on review date.
- Backend API tests: validate numeric inputs, recompute saved results, isolate guest owners, refresh sessions, reject cross-site mutations, reject malformed JSON/session cookies and oversized bodies.
- Local PostgreSQL tests: RLS ownership and anonymous denial; rerunning schema now removes legacy excessive authenticated privileges.
- Bounded tracked-file security scan added; private env files, generated private directories, private-key and selected credential patterns fail CI. This bounded scan does not cover all credential formats. The reusable security workflow now also scans complete Git history with Gitleaks; that CI scan passed on integrated GitHub commit ec3471b2d30f7fea4f263da26b9eecc1e5a6f659.

## Confirmed fixes

1. Scenario POST with JSON `null` or arrays previously returned misleading service failures; now explicit HTTP 400. Malformed cookie encoding and request origins have explicit client errors.
2. Storage SQL previously granted SELECT/INSERT/DELETE without revoking existing authenticated privileges. It now revokes both anon/authenticated before granting required operations. Local regression test seeds UPDATE/TRUNCATE/REFERENCES/TRIGGER then confirms their removal. This file has not been applied to a live database.
3. Local saved-scenario HTML interpolation was identified and reported to UI owner; Safe DOM rendering implemented; both local-storage and cloud-name injection browser regressions passed in GitHub CI.
4. Existing GitHub workflow deployed automatically on main and exposed Vercel token to an entire deployment job. Replaced it with validation-only CI using read-only permissions, credential-free checkout, updated SHA-pinned actions, unit/integration/browser tests, build, dependency audit, tracked-file security checks and the existing reusable history secret scan.
5. Vercel repository configuration disables automatic Git deployment (`git.deploymentEnabled: false`), documented at https://vercel.com/docs/project-configuration/git-configuration. Source change does not prove live project enforcement. Header configuration preserves Content-Security-Policy with script-src self, HSTS, MIME sniffing, framing, referrer and browser capability protections. The development server uses the same headers; application JavaScript is extracted to app.js.

## Auth, privacy and deployment limitations

Standard mode remains free and works without cloud credentials. Optional cloud saves use Supabase anonymous identity with HttpOnly, SameSite=Strict cookies, Secure on production, validated user endpoint and owner-scoped API queries. RLS isolates rows in the local schema test. No service-role key is required. Live project grants, RLS, anonymous auth configuration and rate limits were not inspected.

Browser-local scenario storage is readable by scripts running on this origin and survives reloads. Cloud guest cookies provide possession-based access; clearing cookies can lose access. Do not describe this as an account-backed identity or end-to-end encryption. No paid service introduced.

The newer main branch distributed rate limiter is preserved: shared Redis atomic counters, HMAC identity keys and production fail-closed behavior when Redis credentials or the 32-character rate-limit secret are unavailable. API fixtures intentionally inject a no-op limiter; separate limiter tests exercise limiting and configuration failures. Live Redis/provider configuration remains unverified. Health reports server calculation availability false when production protection is unconfigured so the free standard calculator retains its browser engine; this is configuration screening, not a live Redis availability check. Bounded scenario retention must be verified before enabling cloud saves. Local process counters are development-only. CSP is preserved and local serving now applies it; CSP browser enforcement passed desktop/mobile E2E assertions in GitHub CI.

GitHub branch-protection API denied integration access; enforcement is **unverified**, not claimed absent. Configure required `tests-build-security` status check on main and protected release environment; independently verify Vercel deployment checks or keep automatic deployment disabled. No production deployment or merge into main was performed.

## Browser test blocker

Desktop Chromium and Pixel 7 Chromium projects include failure screenshots, traces, HTML and JSON reports. Initial run could not launch any browser: executable absent. Installing bundled Chromium repeatedly returned empty/corrupt archives in the restricted execution network. These failures are environment blockers, not passing UI evidence. GitHub CI run 38177897876 installed Chromium and passed all 98 desktop/mobile cases on integrated commit ec3471b2d30f7fea4f263da26b9eecc1e5a6f659. This resolves the local environment blocker for automated browser evidence; manual visual review is still pending.
