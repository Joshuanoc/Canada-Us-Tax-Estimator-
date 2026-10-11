# TaxMetric security review — 2026-10-11

## Scope and evidence

Reviewed tracked application, API, storage SQL, dependency lockfile and release configuration. This is a source review with mocked provider tests and local PostgreSQL (PGlite), not a certification of deployed infrastructure or historical secret exposure.

- `npm ci`: passed.
- Updated backend suite: 12 tests passed after API and schema fixes.
- `npx playwright test --list`: 18 desktop/mobile cases collected successfully; collection is not execution.
- `npm audit --audit-level=high`: all dependencies included; zero reported vulnerabilities on review date.
- Backend API tests: validate numeric inputs, recompute saved results, isolate guest owners, refresh sessions, reject cross-site mutations, reject malformed JSON/session cookies and oversized bodies.
- Local PostgreSQL tests: RLS ownership and anonymous denial; rerunning schema now removes legacy excessive authenticated privileges.
- Bounded tracked-file security scan added; private env files, generated private directories, private-key and selected credential patterns fail CI. Git history and all possible credential formats are outside its coverage.

## Confirmed fixes

1. Scenario POST with JSON `null` or arrays previously returned misleading service failures; now explicit HTTP 400. Malformed cookie encoding and request origins have explicit client errors.
2. Storage SQL previously granted SELECT/INSERT/DELETE without revoking existing authenticated privileges. It now revokes both anon/authenticated before granting required operations. Local regression test seeds UPDATE/TRUNCATE/REFERENCES/TRIGGER then confirms their removal. This file has not been applied to a live database.
3. Local saved-scenario HTML interpolation was identified and reported to UI owner; E2E injection regression added. Confirm final UI fix before release.
4. Existing GitHub workflow deployed automatically on main and exposed Vercel token to an entire deployment job. Replaced it with validation-only CI using read-only permissions, credential-free checkout, SHA-pinned actions, unit/integration/browser tests, build, dependency audit and tracked-file security checks.
5. Vercel repository configuration disables automatic Git deployment (`git.deploymentEnabled: false`), documented at https://vercel.com/docs/project-configuration/git-configuration. Source change does not prove live project enforcement. Header configuration adds MIME sniffing, framing, referrer and browser capability protections.

## Auth, privacy and deployment limitations

Standard mode remains free and works without cloud credentials. Optional cloud saves use Supabase anonymous identity with HttpOnly, SameSite=Strict cookies, Secure on production, validated user endpoint and owner-scoped API queries. RLS isolates rows in the local schema test. No service-role key is required. Live project grants, RLS, anonymous auth configuration and rate limits were not inspected.

Browser-local scenario storage is readable by scripts running on this origin and survives reloads. Cloud guest cookies provide possession-based access; clearing cookies can lose access. Do not describe this as an account-backed identity or end-to-end encryption. No paid service introduced.

Rate limiting for public calculations/anonymous account creation and bounded scenario retention must be configured and verified at host/provider level before enabling optional public cloud saves. An in-memory process limiter is not a verified distributed/serverless control. CSP requires coordination with the current inline scripts/styles and has not been enforced here.

GitHub branch-protection API denied integration access; enforcement is **unverified**, not claimed absent. Configure required `tests-build-security` status check on main and protected release environment; independently verify Vercel deployment checks or keep automatic deployment disabled. No production deploy or merge was performed.

## Browser test blocker

Desktop Chromium and Pixel 7 Chromium projects include failure screenshots, traces, HTML and JSON reports. Initial run could not launch any browser: executable absent. Installing bundled Chromium repeatedly returned empty/corrupt archives in the restricted execution network. These failures are environment blockers, not passing UI evidence. CI installs browsers and must pass before release. No assertion-level browser validation is claimed.
