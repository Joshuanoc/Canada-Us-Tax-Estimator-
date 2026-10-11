# TaxMetric

Free Canadian and US ordinary-income tax scenario estimates, with a guided Canadian opportunity review. Standard mode runs in the browser without an account, paid API, or cloud credentials. Optional same-origin API calculations and guest scenario storage are separate capabilities.

This is a limited ordinary-income estimate and informational screening tool. It is **not a complete tax filing system**. Read [release readiness](docs/release-readiness.md), [calculation scope](docs/calculation-model.md), [Canadian catalog audit](docs/canadian-tax-opportunities.md), and [security evidence](docs/security-review.md).

## Run and verify

Use Node.js 24:

```bash
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
npm run dev
```

The development server uses port 5175. `npm run build` publishes an explicit static asset allowlist into `dist`; browser and API calculations share `backend/tax.js`. GitHub Pages can serve standard mode; it cannot host the API. Vercel can host `api/` functions alongside the static package.

The catalog has 35 classified entries and individual screening questions. Screening answers never apply tax deductions. Positive answers establish potential eligibility; fully verified eligibility decisions and unresolved annual/provincial program rules remain release work. Calculated employment dues require a separate user confirmation and are counted once. Positive RRSP claims require an entered CRA deduction limit and separate confirmation; claims exceeding the limit fail.

Withholding is optional. Its balance comparison covers modeled taxes only, and is not a complete refund calculation. Unknown state taxes, refundable credits and benefit payments are explicitly unmodeled.

## Optional guest storage

Optional cloud saving is off by default. After live security verification, explicitly set `TAXMETRIC_CLOUD_STORAGE_ENABLED=true`. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the hosting environment, enable anonymous sign-ins, and review/apply `database/001_scenarios.sql` to the intended project. No service-role key is needed. Source SQL and local policy tests do not establish that a live project's permissions match.

Production API request protection also requires the existing distributed limiter configuration in `.env.example`; secrets must be set only in host settings. Missing protection keeps the UI in browser mode. Guest identity is kept in HttpOnly cookies. Scenarios are owner-scoped and protected by row policies. Clearing cookies loses access; no account recovery or device synchronization is provided. Without storage configuration, standard mode remains available and saves stay in browser-local storage.

Endpoints are `POST /api/calculate`, `GET/POST /api/scenarios`, `DELETE /api/scenarios?id=<uuid>`, and `GET /api/health`. Health reports configuration presence, not live storage readiness. Calculation and save inputs are validated; stored results are recalculated on the server.

## Release gates

GitHub Actions runs tests, build, dependency audit and a bounded tracked-file security scan. Failed browser tests retain reports, screenshots and traces. Main publishes the tested static package only after security and validation pass, and only when the Pages source is GitHub Actions. Repository Vercel configuration disables automatic Git deployments; existing host enforcement still needs independent verification.

Before release, require `tests-build-security` on the protected main branch, verify host deployment gates, resolve documented critical tax defects, pass desktop/mobile browser assertions, and verify optional live storage isolation and abuse controls. The user authorized merge and production preparation. Verify actual release and host status; do not describe unfinished tax coverage as complete.
