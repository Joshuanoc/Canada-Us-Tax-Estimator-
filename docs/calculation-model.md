# Calculation model and evidence

The canonical browser/server engine is `backend/tax.js`; `tax-rules-2026.js`
isolates the supported year's table and `calculation-contract.js` owns monetary
rounding and partial settlement. Personal and business paths are separately named.
Only 2026 is accepted. Calculations have no clock dependency. Amounts are rounded
to cents at result boundaries, with unrounded bracket arithmetic.

## Verified incremental change

Canadian employment dues use one combined, nonduplicated user-confirmed amount.
CRA line 21200 permits qualifying annual employment-related dues and excludes
initiation fees, licences, special assessments and pension charges. No questionnaire
answer applies a deduction automatically. See
https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21200-annual-union-professional-like-dues.html
(reviewed 2026-10-11). The confirmation is attestation, not document verification.

## Rates and limitations

CRA annual 2026 rates are published at
https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html.
The January payroll publication below contains conflicting Manitoba thresholds
(47,000/100,000); the annual page dated June 25, 2026 lists 47,564/101,200.
The engine retains the annual thresholds. Payroll formulas are not a complete
annual-return calculation:
https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html

Canadian CPP enhanced deductions, CPP/EI tax credits, Ontario health premium and
surtax, income-dependent provincial credits, and self-employed CPP remain missing.
Payroll assumes full-year pensionable and insurable employment with one employer.
RRSP is an entered deductible claim, with deduction-room eligibility not validated.
US tables and deductions are preserved baseline estimates, not newly certified by
this change. Mixed wages/self-employment is refused because Social Security cap
coordination is missing. Other US deduction eligibility and state taxes are incomplete.

Unknown state tax, refundable credits, benefit payments and complete refunds are
`null`. A supplied withholding value can produce a *modeled income-tax settlement*,
never a complete tax-return refund. Corporate outputs cover baseline federal tax
only, and pass-through outputs omit owner taxes.

## Evidence

Backend tests cover deterministic repeatability, unsupported years, nonfinite and
negative inputs, penny boundaries, withholding absent/present, US SE separation,
mixed US payroll refusal, employment-dues confirmation and deduction arithmetic,
and baseline Canadian/US/corporate regression checks. These checks establish
software behavior; they do not certify a complete tax return. Missing items above
remain production-release blockers for any claim of complete tax calculation.
