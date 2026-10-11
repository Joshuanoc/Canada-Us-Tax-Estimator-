# Canadian opportunity source audit

Reviewed 2026-10-11. Target tax year: 2026. All 35 catalog entries have a category, general screening conditions, required evidence, limits, provincial scope and official CRA source links. This is a general-condition audit, not completed verification of 2026 filing rules or every provincial program. Automatic catalog application remains disabled. The engine separately supports two limited calculations: the 2026 Canada employment amount and an explicitly confirmed qualifying employment-dues deduction. Screening does not apply either amount again.

## Findings and release limits

- CRA line pages reviewed commonly describe **2025 returns**, even where page details show 2026. Those amounts must not silently become 2026 constants.
- GST/HST credit was renamed **Canada Groceries and Essentials Benefit from July 2026**. Its identifier is preserved for compatibility, and its display name and payment-period notes are corrected.
- Professional licensing fees are not a universal employee deduction: CRA excludes licences from line 21200; annual self-employed business licences can qualify separately.
- Provincial child benefits and refundable provincial credits are umbrella categories. A named program and jurisdiction must be selected before eligibility can be established.
- CCB/CGEB are separate payments, not tax-return refunds. Pension splitting and HBP are planning programs, not standalone extra credits.
- No entry is automatically calculation-enabled merely because it has a source. `calculationSupport` documents limited existing engine support for CEA and confirmed dues; the remaining 33 entries need year-specific verification and tested implementation. Provincial schedules and special filing interactions remain release gates.
- The guided workflow may show potentially eligible from self-reported applicability, ineligible from an explicit user exclusion, and insufficient information for unknown answers. It must not certify legal eligibility from broad life-situation answers.

## Questionnaire decision scope

The catalog contains 70 item-specific questions. A negative answer excludes an opportunity only where `necessary: true` identifies a general prerequisite. Supporting-document gaps, program selection and historical capital-loss exceptions use non-decisive questions. Alternative conditions remain in a single OR question. All affirmative responses yield only potential eligibility; annual amounts and complex interactions still require review.

## Entry-by-entry review

### Canada Employment Amount

**Classification:** non refundable credit  
**2026 verification:** CEA ceiling and rate verified in CRA T4127 Table 8.2 and K4 formula; limited Canadian employment-model calculation implemented. Broader eligibility is not certified.

**Screening conditions:** Employment income reported on line 10100 or 10400; self-employment income alone does not qualify.

**Required information:** Employment slips; employment income; tax residency dates.

**Limits and interactions:** CRA T4127 verifies the 2026 claim base ceiling of $1,501 and 14% federal rate. The engine credits 14% of min(wages, $1,501), with a non-refundable federal tax floor. Special filing cases remain outside the limited model.

**Calculation support:** `wages`; automatic inclusion in supported Canadian employment estimates only, with no duplicate questionnaire application.

**2026 amount source:** [CRA T4127 Table 8.2 and K4 formula](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html).

**Provincial differences:** Federal opportunity; any separate provincial counterpart requires province-specific review. Quebec administers its own provincial return.

**Official sources:**

- [Line 31260 – Canada employment amount](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31260-canada-employment-amount.html)

### Union and professional dues

**Classification:** deduction  
**Verification:** General non-indexed CRA line 21200 rule reviewed; limited confirmed-input calculation implemented. No fixed indexed annual ceiling applies.

**Screening conditions:** Qualifying annual union dues or legally recognized professional membership dues paid for employment; employer-paid dues must be included in income.

**Required information:** T4 box 44; receipts; professional membership requirements; employer reimbursements.

**Limits and interactions:** Initiation fees, licences and special assessments are excluded from annual dues; do not duplicate a T4 amount and receipt.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Calculation support:** `eligibleEmploymentDues` plus `employmentDuesConfirmed: true` in Canadian personal mode. Combined dues deducted once and exposed as `appliedDeductions.employmentDues`. Attestation does not verify receipts or eligibility; questionnaire responses do not supply amounts.

**Official sources:**

- [Annual union, professional or like dues](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21200-annual-union-professional-like-dues.html)

### Professional licensing fees

**Classification:** deduction  
**2026 verification:** employee claim not established; calculation disabled.

**Screening conditions:** Not a standalone universal employee deduction: employee licences are excluded from line 21200; self-employed annual business licence fees may qualify as business expenses.

**Required information:** Employee or self-employed status; licence type; legal requirement; receipts; business purpose.

**Limits and interactions:** Do not combine licences with qualifying annual professional membership dues or count the same expense twice. Employee licensing eligibility remains unresolved.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Annual union, professional or like dues](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21200-annual-union-professional-like-dues.html)
- [Business expenses](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses.html)

### Canada Training Credit

**Classification:** refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Canadian resident throughout the year; age 26 through 65 at year end; positive training credit limit; qualifying tuition or examination fees; file a return.

**Required information:** Date of birth; residency dates; latest CRA training credit limit; tuition certificate; qualifying fees.

**Limits and interactions:** Reviewed CRA rule: lesser of available training credit limit and 50% of qualifying fees; annual accrual conditions and 2026 forms need review.

**Provincial differences:** Federal opportunity; any separate provincial counterpart requires province-specific review. Quebec administers its own provincial return.

**Official sources:**

- [Canada training credit : Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-45350-canada-training-credit.html)

### Student loan interest

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Borrower legally responsible for a qualifying government student or apprentice loan; interest actually paid and not already claimed.

**Required information:** Loan legislation and lender; interest statement; payment years; unused carryforwards.

**Limits and interactions:** Current year or preceding five years; private, consolidated and renegotiated loans do not qualify; oldest unused interest first. No duplicate claim.

**Provincial differences:** Provincial student-loan credits may apply; Quebec has separate rules and forms.

**Official sources:**

- [Line 31900 – Interest paid on your student loans](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31900-interest-paid-on-your-student-loans.html)

### Tuition credits

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Eligible tuition supported by an institution certificate or official tax receipt; institution and course must meet CRA requirements.

**Required information:** T2202 or applicable TL11 certificate; eligible fees; carried-forward balance; training credit claim.

**Limits and interactions:** Federal education and textbook credits ended in 2017. Tuition transfer, carryforward and training-credit interactions require Schedule 11 review.

**Provincial differences:** Current provincial tuition eligibility and retained carryforwards vary by province; never assume all provinces provide a current credit.

**Official sources:**

- [Line 32300 – Your federal tuition amount](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-32300-your-tuition-education-textbook-amounts.html)

### Employment expenses

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Employment expense category must qualify; contract generally requires employee to pay costs; exclude personal commuting and reimbursed expenses unless applicable reimbursement is taxable.

**Required information:** Employment type; employer requirements; T2200 where required; T777; receipts; reimbursements.

**Limits and interactions:** Not every employment expense is deductible. Category-specific vehicle, home-office, tools and legal-fee exceptions require further review.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Line 22900 – Other employment expenses](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22900-other-employment-expenses.html)

### Moving expenses

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Move for qualifying work or business, or eligible full-time studies; new home must be at least 40 kilometres closer to the new work or school location by the shortest public route.

**Required information:** Old and new addresses; route distances; move date; new-location income; receipts; reimbursement; student status.

**Limits and interactions:** Deduction restricted to qualifying income at the new location; reimbursements reduce claim. Student deduction applies to eligible taxable scholarship and similar income; unused amounts may carry forward.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Moving expenses](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html)

### Spouse or common-law partner amount

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Financially supported a spouse or common-law partner; partner net income below the applicable amount; special separation and non-resident conditions apply.

**Required information:** Marital dates; support evidence; partner net world income in CAD; residency; infirmity.

**Limits and interactions:** Only one spouse may claim for the year; income reduces claim; support-payment interaction and annual indexed thresholds require review.

**Provincial differences:** Provincial spouse amounts differ; Quebec return separately reviewed.

**Official sources:**

- [Spouse or common-law partner amount - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30300-spouse-common-law-partner-amount.html)

### Childcare expenses

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Child care paid to allow qualifying work, business, research or study; eligible child and provider; generally lower-income supporting person claims, with specified exceptions.

**Required information:** Child ages; provider receipts and identifier; both partners incomes; purpose; weeks; disability; reimbursements.

**Limits and interactions:** Age/disability annual caps, earned-income limits and higher-income-claimant exceptions require T778; no unverified 2026 limit used.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Child care expenses](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21400-child-care-expenses.html)

### Eligible dependant amount

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Single, separated, divorced or widowed at a qualifying time; maintained a home and supported an eligible relative living there; relationship and age or impairment conditions apply.

**Required information:** Marital status; dependant relationship, age and net income; home support; shared custody; support obligations; competing claims.

**Limits and interactions:** One claim per household; no duplicate claimant; spouse and support-payment restrictions apply; annual income thresholds require review.

**Provincial differences:** Provincial eligible-dependant amounts vary; Quebec rules separate.

**Official sources:**

- [Amount for an eligible dependant - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30400-amount-eligible-dependant.html)

### Caregiver credits

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Supported a qualifying relative dependent because of a mental or physical infirmity; age and relationship determine which caregiver amount applies.

**Required information:** Relationship; dependant age and net income; support evidence; medical statement or DTC approval when applicable.

**Limits and interactions:** Separate rules for children under 18, spouses and adult relatives; coordinate Schedule 5 claims and avoid double counting. Indexed 2026 amounts unverified.

**Provincial differences:** Provincial caregiver counterparts and thresholds vary; Quebec separate.

**Official sources:**

- [Canada caregiver amount for spouse or common-law partner, or eligible dependant age 18 or older - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30425-caregiver-spouse-dependant.html)
- [Canada caregiver amount for other infirm dependants age 18 or older - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30450-caregiver-infirm-dependant.html)
- [Canada caregiver amount for infirm children under 18 years of age - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30499-30500-canada-caregiver-infirm-children-under-18-years.html)

### Canada Child Benefit

**Classification:** government benefit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Live with a child under 18 and be primarily responsible for care; Canadian tax residency and qualifying status of applicant or spouse required; foster-child exclusions apply.

**Required information:** Child age; custody percentage; primary caregiver; residency; immigration status; both partners prior-year incomes.

**Limits and interactions:** Payment period July to June uses prior-year adjusted family net income; shared custody affects amount. This is a separate monthly benefit, not an income-tax refund.

**Provincial differences:** CRA may combine related provincial child benefits; program eligibility and amounts vary.

**Official sources:**

- [CCB eligibility](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/who-apply.html)

### Provincial child benefits

**Classification:** government benefit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Eligibility must be checked for the named provincial or territorial program; residence, children and family income commonly relevant.

**Required information:** Province; named program; child ages; family income; custody; residency dates.

**Limits and interactions:** Umbrella category, not one claim. No eligibility or amount established until a specific program and payment period are selected.

**Provincial differences:** Availability, income thresholds, administration and payment schedules differ by province; Quebec benefits require separate authority.

**Official sources:**

- [Provincial and territorial programs](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs.html)
- [CCB eligibility](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/who-apply.html)

### RRSP contributions

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Eligible RRSP contributions with available CRA deduction limit; contribution receipt and timing must qualify; repayments designated to HBP or LLP are not deductible.

**Required information:** CRA deduction limit; unused contributions; receipts and dates; HBP/LLP repayment designations.

**Limits and interactions:** Use personal deduction limit, not only a national maximum. First-60-day timing and excess-contribution rules need review.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [RRSP deduction](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-20800-rrsp-deduction.html)

### FHSA contributions

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Qualifying FHSA contributions within participation room; opening eligibility and account history verified; RRSP-to-FHSA transfers are not deductible.

**Required information:** Account opening date; first-home eligibility; CRA participation room; contributions; transfers; previous deductions.

**Limits and interactions:** Annual/lifetime participation limits, unused room and carryforward restrictions need verification before calculation. Deduct only permitted contributions.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [FHSA deduction](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-20805-fhsa-deduction.html)

### Home Buyers' Amount

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Acquired qualifying Canadian home; first-time home ownership/occupancy test in current and prior four years, or qualifying disability exception; principal occupancy intended within one year.

**Required information:** Purchase date and registration; prior ownership and occupancy for both partners; disability status; intended occupancy.

**Limits and interactions:** Reviewed 2025 page permits a $10,000 claim base shared between eligible purchasers. This is not a $10,000 refund; 2026 amount/rate unverified.

**Provincial differences:** Federal opportunity; any separate provincial counterpart requires province-specific review. Quebec administers its own provincial return.

**Official sources:**

- [Line 31270 – Home buyers' amount](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31270-home-buyers-amount.html)

### Home Buyers' Plan

**Classification:** planning program  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Eligible RRSP withdrawal for buying/building qualifying home; written agreement, Canadian residency and first-time-buyer or applicable exception conditions apply.

**Required information:** Withdrawal dates; RRSP history; written purchase agreement; residence; prior ownership; outstanding HBP balance.

**Limits and interactions:** Withdrawals and subsequent repayments follow HBP rules; repayments are not a new deduction. Withdrawal and repayment-year limits must be reviewed for withdrawal date.

**Provincial differences:** Federal RRSP program; housing incentives provided by provinces are separate.

**Official sources:**

- [HBP participation](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan/participate-home-buyers-plan.html)

### Home accessibility expenses

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Qualifying individual aged 65 or older or DTC-eligible; qualifying enduring accessibility/safety renovation of eligible Canadian dwelling; eligible claimant relation/ownership conditions.

**Required information:** Age or DTC approval; ownership and occupants; renovation purpose; dated receipts; reimbursements; other claimants.

**Limits and interactions:** Reviewed 2025 limit is $20,000 eligible expenditure, shared limits apply; not a $20,000 refund. Verify 2026 amount/rate and interaction rules.

**Provincial differences:** Federal opportunity; any separate provincial counterpart requires province-specific review. Quebec administers its own provincial return.

**Official sources:**

- [Home accessibility expenses – Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31285-home-accessibility-expenses.html)

### Multigenerational Home Renovation Tax Credit

**Classification:** refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Completed qualifying renovation creates self-contained secondary unit for senior or DTC-eligible adult to live with qualifying relative; eligible dwelling and claimant conditions apply.

**Required information:** Completion date; unit facilities; ownership; age or DTC approval; relative; residency; invoices; expense sharing.

**Limits and interactions:** Reviewed 2025 page: expenditure cap $50,000 with 14.5% credit. Do not reuse 2025 rate for 2026. Lifetime renovation restrictions and duplicate expenses require review.

**Provincial differences:** Federal opportunity; any separate provincial counterpart requires province-specific review. Quebec administers its own provincial return.

**Official sources:**

- [Multigenerational home renovation tax credit (MHRTC) : Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-45355-mhrtc.html)

### Pension income amount

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Reported a CRA-eligible pension, superannuation or annuity type; eligibility depends on age and source or survivor circumstances.

**Required information:** Age; T4A/T4RIF and other pension slips; income source; survivor status; elected split pension.

**Limits and interactions:** CPP/QPP and OAS are not qualifying pension income for this credit. Reviewed rule caps federal claim base at $2,000; 2026 filing treatment requires review.

**Provincial differences:** Provincial pension amounts and age conditions can differ; Quebec separate.

**Official sources:**

- [Pension income amount - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31400-pension-income-amount.html)

### Pension income splitting

**Classification:** planning program  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Spouses or common-law partners meet residence and relationship requirements; eligible pension type; joint annual election T1032.

**Required information:** Both partners ages and residence; relationship dates; eligible pension; related withholding; signed election.

**Limits and interactions:** Up to 50% eligible pension allocated; recipient reports income and donor deducts it. Withholding must be allocated in same proportion. CPP/QPP sharing is a separate program.

**Provincial differences:** May affect federal and provincial tax and individual-income benefits; Quebec provincial election rules require review.

**Official sources:**

- [Pension income splitting](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/pension-income-splitting.html)

### Disability Tax Credit

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** CRA-approved DTC covering the claimed year; medical practitioner certification and approval required, not diagnosis alone.

**Required information:** T2201; CRA approval years; age; attendant-care or childcare expenses; unused transfer claim.

**Limits and interactions:** Indexed base and under-18 supplement; attendant-care and other claims can restrict amounts; 2026 annual amounts unverified.

**Provincial differences:** Provincial disability amounts differ; Quebec separate approval and return requirements may apply.

**Official sources:**

- [Line 31600 – Disability amount for self](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31600-disability-amount-self.html)

### Medical expenses

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Eligible expenses paid by taxpayer or partner for eligible persons in a 12-month period ending in tax year, not previously claimed; exclude reimbursement unless applicable taxable reimbursement exception.

**Required information:** Patient and relationship; dates; receipts; reimbursements; prescriptions or certification; net income.

**Limits and interactions:** Credit uses net-income and annual dollar thresholds; dependants have separate calculations. Verify allowed expense and practitioner by jurisdiction; 2026 thresholds unverified.

**Provincial differences:** Provincial credits/thresholds differ; authorized medical practitioners depend on jurisdiction.

**Official sources:**

- [Lines 33099 and 33199 – Eligible medical expenses you can claim on your tax return](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/lines-33099-33199-eligible-medical-expenses-you-claim-on-your-tax-return.html)

### Canada Groceries and Essentials Benefit (formerly GST/HST credit)

**Classification:** government benefit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** GST/HST credit renamed CGEB from July 2026; low/modest-income residents meeting age or family circumstances; CRA determines entitlement from filed return.

**Required information:** Residency; age; family status; prior-year adjusted family net income; payment period; newcomer information.

**Limits and interactions:** Quarterly benefit separate from tax refund; July-to-June entitlement uses prior-year return. Legacy GST/HST payments ended April 2026; June 2026 top-up has distinct entitlement rules.

**Provincial differences:** Related provincial/territorial benefit payments may be combined; separate program criteria.

**Official sources:**

- [GST/HST credit renamed July 2026](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/gst-hst-credit.html)
- [Canada Groceries and Essentials Benefit](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-groceries-essentials-benefit.html)

### Canada Workers Benefit

**Classification:** refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Working low-income Canadian resident throughout year; age 19 or older at year end or lives with spouse/partner or child; full-time-student and confinement exclusions apply.

**Required information:** Working income; adjusted net income for both partners; age; residency; study duration; dependant; disability; advances.

**Limits and interactions:** Basic and disability supplement amounts phase out; 2026 thresholds and advance reconciliation unverified. Do not add advance payments again as a refund.

**Provincial differences:** Calculation differs in certain provinces/territories; use applicable Schedule 6, including Quebec.

**Official sources:**

- [Canada workers benefit (CWB)](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-45300-canada-workers-benefit-cwb.html)

### Refundable provincial credits

**Classification:** refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Specific refundable provincial credit must be selected and tested against its local eligibility; residence and income alone do not establish eligibility.

**Required information:** Province; named credit; household income; rent/property taxes or other qualifying evidence; residence dates.

**Limits and interactions:** Umbrella category, not a single calculation. Province/year-specific amount and qualifying expenses remain unresolved.

**Provincial differences:** Each province/territory has different credit programs and schedules; Quebec administered separately.

**Official sources:**

- [Provincial and territorial tax and credits for individuals](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/provincial-territorial-tax-credits-individuals.html)

### Northern Residents Deductions

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Permanent residence in a prescribed northern or intermediate zone for at least six consecutive months; claim residency and travel components only when their separate conditions met.

**Required information:** Prescribed-zone address; residence dates; household claimants; travel receipts; employer travel benefits; lowest return airfare.

**Limits and interactions:** Zone A/B, dwelling and travel restrictions apply; use T2222 and documented annual rates. Six months alone does not establish the travel amount.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Line 25500 - Northern residents deductions](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-25500-northern-residents-deductions.html)

### Charitable donations

**Classification:** non refundable credit  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Gift to registered charity or other qualified donee with valid receipt; eligible gift amount reduced by advantage received.

**Required information:** Official receipts; donee status; donation date; advantage; carryforwards; gifts in kind; net/taxable income.

**Limits and interactions:** Income-based limits, special gifts and carryforwards require Schedule 9 review; annual credit rates and AMT implications not implemented.

**Provincial differences:** Provincial donation rates differ; Quebec separate.

**Official sources:**

- [Donations and gifts - Personal income tax](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-34900-donations-gifts.html)

### Investment loan interest

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Borrowed funds traceably used to earn investment income such as interest/dividends; interest paid; legal obligation and reasonableness conditions need review.

**Required information:** Loan agreement; interest statement; tracing of use; investment income purpose; registered-account status.

**Limits and interactions:** Registered-plan borrowing and capital-gains-only investments excluded; principal repayments not interest deductions; allocate mixed personal use.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Carrying charges and interest expenses](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html)

### Investment management fees

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Qualifying investment management or advice fees to earn investment income; exclude registered-account services and trading commissions.

**Required information:** Invoices; service type; account registration; business qualifications of adviser; reimbursement.

**Limits and interactions:** RRSP/RRIF/TFSA/FHSA and other listed registered accounts excluded; brokerage commissions affect capital gain/loss instead; no duplicate claim.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Carrying charges and interest expenses](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html)

### Capital loss carryforwards

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Unused assessed net capital losses of earlier years applied against taxable capital gains, subject to historical loss rules.

**Required information:** CRA assessed loss balances by year; current taxable gains; inclusion rates; prior applications.

**Limits and interactions:** Normally offsets taxable capital gains only; carry back three years or forward indefinitely. Historical inclusion-rate adjustments and pre-1985 exceptions require review.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Line 25300 – Net capital losses of other years](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-25300-net-capital-losses-other-years.html)

### Business-use-of-home expenses

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Workspace is principal business place OR used exclusively to earn business income and regularly/continuously to meet clients; only reasonable business portion.

**Required information:** Self-employment details; workspace area and time; expenses; business income; carryforward; reimbursements.

**Limits and interactions:** Cannot create or increase a business loss; unused qualifying expenses may carry forward; personal share excluded.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Business-use-of-home expenses](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/report-business-income-expenses/completing-form-t2125/business-use-home-expenses.html)

### Self-employment vehicle expenses

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Self-employed vehicle use to earn business income; reasonable business portion documented; personal use excluded.

**Required information:** Business and total kilometre log; receipts; vehicle type; purchase/lease date; interest; reimbursements.

**Limits and interactions:** Separate vehicles and capital allowance from operating costs; passenger-vehicle interest/lease/capital ceilings and 2026 acquisition-year rules unresolved.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Motor vehicle expenses](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses/motor-vehicle-expenses.html)
- [Business expenses](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses.html)

### Business equipment and software

**Classification:** deduction  
**2026 verification:** 2026 amounts unverified; calculation disabled.

**Screening conditions:** Business purpose and ownership/use established; determine current operating expense versus depreciable capital property before claiming.

**Required information:** Asset or software description; purchase and available-for-use dates; business share; CCA class; assistance; prior UCC; subscriptions.

**Limits and interactions:** Equipment is not automatically fully deductible. Asset class, first-year measures, available-for-use and mixed-use rules need verification; no blanket 2026 expensing assumption.

**Provincial differences:** Federal income deduction generally feeds provincial taxable income; Quebec and multi-jurisdiction cases require separate review.

**Official sources:**

- [Capital cost allowance classes](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/report-business-income-expenses/claiming-capital-cost-allowance/classes.html)
- [Business expenses](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses.html)

