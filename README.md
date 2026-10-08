# Canada-Us-Tax-Estimator-
This Canada–US Tax Estimator is designed to help users estimate and compare personal income tax obligations in Canada and the United States. The tool accounts for key tax factors such as income level, filing status, and standard deductions to generate approximate tax amounts for each country.  

## Development and regression tests

Use Node.js 24:

```bash
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
npm run dev
```

The application is static: `npm run build` packages only `index.html` into `dist`.
`npm run dev` serves it on port 5175. It needs no backend or application secrets.
If Chromium is already installed, run tests with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`.

The browser suite checks US and Canadian example calculations, validation errors,
corporate calculations, and saved calculation persistence. Expected amounts test
this application's stated model; they do not certify complete tax-law coverage.

## GitHub Actions and Pages

Pull requests to `main` run a frozen dependency install, Chromium browser tests,
and static-site packaging. Pushes to `main` and manual runs on `main` deploy only
if validation succeeds. Failed browser tests retain diagnostic reports and traces
for seven days. No private automation token is required.

In repository **Settings → Pages**, select **GitHub Actions** as the build source.
The intended site is `https://joshuanoc.github.io/Canada-Us-Tax-Estimator-/`.
To make validation mandatory before merging, add a branch rule for `main` requiring
the `validate` check; workflow configuration alone does not enforce branch protection.

## Backend deployment: Vercel + Supabase (no login)

The Vercel deployment serves the frontend and Node.js API on the same origin.
A Supabase anonymous guest session is created only on the first cloud save.
Session tokens stay in HttpOnly, SameSite cookies; the browser never receives
passwords or service-role credentials. Saved scenarios are private to that guest
through PostgreSQL row-level policies. Clearing cookies or switching browsers
loses access to that guest's scenarios; there is no account recovery or device sync.

Endpoints:

- `POST /api/calculate`: validated JSON input; server-calculated 2026-model result.
- `GET /api/scenarios`: list this guest's saved scenarios (up to the latest 100).
- `POST /api/scenarios`: `{ "name": "Scenario name", "input": { ... } }`;
  the server recalculates the result and chooses the owner.
- `DELETE /api/scenarios?id=<uuid>`: delete a scenario owned by this guest.
- `GET /api/health`: API availability and configuration presence. This does not
  certify external Supabase connectivity or that its migration has been applied.

### One-time service configuration

1. Create/select a Supabase project. Enable **anonymous sign-ins** under
   Authentication settings, then run `database/001_scenarios.sql` in its SQL editor.
2. Import this GitHub repository into Vercel. Its `vercel.json` packages the static
   frontend and `/api` server functions using Node 24.
3. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Vercel's environment settings
   (production and any preview environments that need storage). The project URL
   and publishable key are available in Supabase project settings. No Supabase
   service-role key is needed or used.
4. In GitHub repository settings, add the `VERCEL_TOKEN` Actions secret and
   `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` Actions variables for the Vercel project.
   The `deploy-backend` job runs only after all validation passes. Until those
   bindings exist, the job emits a setup notice and skips deployment commands.
5. Run the workflow manually on `main`, or push to `main`. Use the Vercel app URL
   for server calculations and private cloud saves. GitHub Pages remains a static
   preview with browser-local saving; it cannot host the API.

For local cloud integration, supply `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`
to `npm run dev` using your environment manager. Never commit values to source.
The standalone local server defaults to port 5175. With no storage configuration,
its calculation API still runs and the UI explicitly keeps saves browser-local.

`npm test` runs six backend/API/database tests and eight browser tests. Provider
responses in API tests and cloud-UI tests are test doubles. PostgreSQL row policy
isolation is exercised with PGlite using a test `auth.uid()` function; full live
Supabase integration still requires your configured project. These tests protect
model behavior, not complete tax-law compliance. The static preview and server
currently preserve the existing calculation model and should be kept in sync.

Readiness after configuration: calculate an example, save it, reload and load it,
then delete it. In a separate browser profile, confirm that the first profile's
saved scenario is inaccessible. Inspect the Vercel deployment result and storage
errors before calling cloud saving ready.
