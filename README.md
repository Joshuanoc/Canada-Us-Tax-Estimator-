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
`npm run dev` serves it on port 5174. It needs no backend or application secrets.
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
