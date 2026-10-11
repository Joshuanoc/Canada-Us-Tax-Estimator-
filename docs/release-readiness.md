# TaxMetric release readiness — 2026-10-11

**Decision: blocked for production release.** This branch delivers implemented, tested improvements, but does not complete every phase of the production assignment. No production merge or deployment was performed. Review PR: https://github.com/Joshuanoc/Canada-Us-Tax-Estimator-/pull/9.

## Requirement evidence

| Phase | Implemented | Remaining release work |
| --- | --- | --- |
| Tax rules | 35 classified CRA-referenced entries, conditions, evidence requirements, limits and provincial notes; 70 individual screening questions | Full 2026 annual and province-specific program validation is unresolved for 33 informational entries. Definitive eligible results are intentionally unavailable; positive answers mean potentially eligible. |
| Calculations | Shared deterministic year-versioned engine; input validation and cent rounding; verified employment dues, CPP deductions and federal/provincial payroll credits; Ontario adjustments; US 2026 brackets/standard deduction and SALT corrections; withholding separation | RRSP deduction-room validation, Canadian self-employment CPP, other provincial income-dependent credits/reductions, US deduction eligibility/AMT and state tax. Benefits and refundable credits are unmodeled, complete refunds are unknown. |
| UI | Guided one-opportunity workflow, search/categories, responsive controls, keyboard focus and reduced-motion support, supported versus informational labels, currency and withholding display, safe stored-data rendering | 98 desktop/mobile assertions passed in GitHub CI. Manual visual review and broader accessibility review remain pending. |
| QA | Unit, API, database policy, catalog screening, packaging and rate-limit tests; desktop/mobile Playwright suite; failure screenshots/traces/reports configured | Local browser execution blocked by absent Chromium; GitHub CI successfully ran all 98 cases. Failure screenshots/traces are configured; there were no assertion failures in that run. Numeric cases prove documented component arithmetic, not full CRA/IRS return certification. |
| Security/DevOps | Input/session hardening, legacy SQL grant revocation, CSP, owner-scoped storage, distributed limiter preserved from main, SHA-pinned validation CI, dependency and tracked-file scans, history-secret gate preserved | Live RLS/grants/configuration and distributed protection are unverified. GitHub branch-protection read denied by integration; required-check enforcement must be verified administratively. |
| Release | Logical commits published, main conflicts resolved while preserving newer protections, draft PR and this report | Resolve material blockers, get required checks passing on the exact release commit, complete infrastructure verification, then obtain release approval. |

## Local verification

On the integrated source corresponding to GitHub commit `ec3471b2d30f7fea4f263da26b9eecc1e5a6f659`:

- `npm run test:unit`: **129 passed, 0 failed** (22 backend/API/database/package/rate-limit tests and 107 catalog screening tests).
- `npm run build`: passed; packaged module dependency closure verified, server credentials/storage implementation excluded.
- `node scripts/security-check.mjs`: passed for 41 tracked files. This is a bounded pattern scan, not a full secret audit.
- `npm audit --audit-level=high`: zero reported vulnerabilities; dependency lockfile unchanged during implementation.
- `npx playwright test --list`: **98 desktop/mobile cases collected**. Collection is not execution.
- Local E2E attempts failed before assertions because the Playwright Chromium executable is missing; browser downloads returned corrupt/empty archives. GitHub CI resolved this environment blocker and passed all 98 browser assertions; manual visual validation is not claimed.

GitHub Actions run https://github.com/Joshuanoc/Canada-Us-Tax-Estimator-/actions/runs/38177897876 is the initial integrated-source CI run. It passed the full-history secret scan, 129 unit tests, 98 desktop/mobile browser tests, dependency audit, tracked-file scan and build. Evidence artifact: https://github.com/Joshuanoc/Canada-Us-Tax-Estimator-/actions/runs/38177897876/artifacts/11716856499 (seven-day retention). Any later commit requires its own required checks.

## Preserved free mode and release controls

Browser calculation and local saving require no account, paid API, subscription, or cloud AI. The optional pre-existing protected API/storage path requires separately configured services. When production request-protection configuration is missing, the frontend keeps free browser calculation instead of selecting a failing API.

CI has no publishing job. Repository Vercel configuration disables Git deployments; source configuration does not prove existing live-host enforcement. The draft PR must remain unmerged until documented blockers and required checks are resolved. SQL changes were verified locally and have not been applied to a live database.

## Follow-up order

1. Require the already configured checks on the exact release commit and complete manual visual/accessibility review; correct any new defects.
2. Verify the remaining annual/provincial rule scope and implement fact-based eligibility with evidence and tax-year boundaries. Keep unsupported amounts disabled.
3. Add RRSP room and unsupported deduction eligibility validation; complete or explicitly narrow advertised provincial and self-employment coverage.
4. Independently verify production protection, storage isolation, required-check enforcement and host release controls.

Detailed rule evidence: [catalog audit](canadian-tax-opportunities.md), [calculation model](calculation-model.md), [security review](security-review.md).
