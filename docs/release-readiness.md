# TaxMetric release decision — 2026-10-11

The free standard estimator has a reviewed merge candidate with production-safety guards. **The complete production assignment remains unfinished.** No complete-return, refund, benefit-payment or fully verified eligibility claim is made.

## Completed source changes

- All 35 CRA-referenced informational opportunities have classifications, conditions, evidence requirements, limits, provincial notes and 70 individual screening questions. Unverified annual rules remain informational and cannot apply deductions.
- Browser and API share deterministic, year-versioned calculations. Verified CPP deductions/credits, Ontario adjustments, US 2026 ordinary brackets/SALT rules and modeled marginal rates have reference tests.
- RRSP claims require a CRA deduction limit and contribution confirmation; the planner rejects claims exceeding room. This is user attestation, not CRA account verification.
- Unsupported Canadian personal self-employment, positive US IRA/HSA claims, positive charitable deductions and US earnings needing unimplemented Additional Medicare rules are rejected. Standard wage calculations and supported business mode remain available.
- Standard mode requires no account, paid API, subscription or cloud AI. Optional cloud storage defaults off and makes no provider calls until explicitly enabled. Production API protection remains fail-closed.
- CSP, safe saved-data rendering, owner isolation, legacy grant revocation, rate limiting and dependency/history-secret gates are tested. SQL was not applied to a live provider.
- Main-branch release workflow packages only the tested static asset allowlist and requires both security and validation jobs to pass before publishing.

## Verification

Latest local suite: **134 unit/API tests passed, 0 failed**; build passed. **104 desktop/mobile Playwright cases** include calculation, screening, RRSP room, unsupported-input, CSP/XSS and free-mode checks. Release evidence tests attach desktop/mobile result and questionnaire screenshots with synthetic inputs. Exact-commit CI, artifacts and review status are linked from PR https://github.com/Joshuanoc/Canada-Us-Tax-Estimator-/pull/9.

Earlier integrated commit bcd78b5e7e551ce1dbcf577310a7b35a39e3bf57 passed 130 unit tests and 98 desktop/mobile browser tests plus dependency audit, tracked-file scan, full-history Gitleaks and build in https://github.com/Joshuanoc/Canada-Us-Tax-Estimator-/actions/runs/38178324393. Later changes require their own checks; earlier evidence is not reused as a current passing result.

## Hosting configuration required

The connected Vercel account has no TaxMetric project. The existing repository publishes through GitHub Pages. Recent main activity included both the custom workflow and an independent Jekyll Pages build. To enforce one test-gated publication path, the repository administrator must set **Settings → Pages → Build and deployment → Source → GitHub Actions**. The new release job verifies this setting and fails closed if branch publishing remains configured. The GitHub connector cannot read or change this administrative Pages setting.

Vercel Git deployment remains disabled in repository configuration. GitHub required-check/branch protection administrative enforcement is unverified; the release job itself depends on passing security and validation. No live storage or Vercel release is claimed. Review actual Actions and Pages deployment outcomes before describing a new production release as successful.

## Remaining functionality and validation

Full 2026 annual/provincial program verification for 33 informational opportunities, definitive eligibility decisions, refundable credits, benefit payments, complete refunds and complete provincial/US tax coverage remain outside the implemented model. Additional income-dependent credits, resident/nonresident special cases, Canadian self-employment CPP and unsupported deductions need verified rules and reference cases. Cloud storage may be enabled only after live isolation, grants and protection are checked.

These limitations are disclosed in the application and unsupported claims fail explicitly. They remain unfinished requirements of the original full production assignment; passing software tests does not establish complete tax-law compliance.

Detailed references: [catalog audit](canadian-tax-opportunities.md), [calculation model](calculation-model.md), [security review](security-review.md).
