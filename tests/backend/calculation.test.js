import { ontarioAdjustments, ontarioHealthPremium } from '../../backend/ontario-2026.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, normalizeInput } from '../../backend/tax.js';

test('calculation is deterministic and explicitly versioned', () => {
  const input = { country: 'ca', subRegion: 'NS', wages: 65000 };
  assert.deepEqual(calculate(input), calculate(input));
  assert.equal(calculate(input).taxYear, 2026);
  assert.throws(() => calculate({ taxYear: 2025 }), /tax year/);
});
test('US self-employment tax is separated from federal ordinary income tax', () => {
  assert.throws(() => calculate({ wages: 50000, selfEmployment: 50000 }), /coordination/);
  const r = calculate({ selfEmployment: 100000 });
  const se = 100000 * .9235 * (.124 + .029);
  assert.equal(r.payroll, Math.round(se * 100) / 100);
  assert.equal(r.payrollComponents.selfEmploymentTax, r.payroll);
  assert.equal(r.estimated, r.federal);
  assert.equal(r.after, Math.round((100000 - r.federal - r.payroll) * 100) / 100);
});
test('unknown taxes and benefits remain unknown; refund requires more than withholding', () => {
  const r = calculate({ wages: 100000 });
  assert.equal(r.components.stateIncomeTax, null);
  assert.equal(r.refundableCredits, null);
  assert.equal(r.benefitPayments, null);
  assert.equal(r.modeledSettlement, null);
  const paid = calculate({ wages: 100000, withholding: 15000 });
  assert.equal(paid.estimatedRefund, null);
  assert.equal(paid.modeledSettlement.refund, 1830);
  assert.equal(calculate({ wages: 100000, withholding: 10000 }).modeledSettlement.balanceDue, 3170);
});
test('input boundaries reject nonfinite, negative and unsupported amounts', () => {
  for (const withholding of [-1, NaN, Infinity, '100', 1e9 + 1]) {
    assert.throws(() => normalizeInput({ withholding }), /Withholding/);
  }
  assert.equal(normalizeInput({ withholding: 0 }).withholding, 0);
  assert.equal(calculate({ wages: 0 }).estimated, 0);
  assert.equal(calculate({ wages: 28500 }).federal, 1240);
  assert.equal(calculate({ wages: 28500.01 }).federal, 1240);
});
test('eligible employment dues require explicit confirmation and reduce income once', () => {
  const baseline = { country: 'ca', subRegion: 'NS', wages: 65000 };
  assert.throws(() => calculate({ ...baseline, eligibleEmploymentDues: 1000 }), /confirmation/);
  assert.throws(() => calculate({ eligibleEmploymentDues: 1000, employmentDuesConfirmed: true }), /Canadian/);
  const r = calculate({ ...baseline, eligibleEmploymentDues: 1000, employmentDuesConfirmed: true });
  assert.equal(r.appliedDeductions.employmentDues, 1000);
  assert.equal(r.taxable, 63385);
  assert.ok(r.estimated < calculate(baseline).estimated);
});
test('CRA 2026 full-year employment CPP/EI components, deductions and federal credits', () => {
  const r = calculate({ country: 'ca', subRegion: 'ON', wages: 100000 });
  assert.equal(r.payrollComponents.baseCpp, 3519.45);
  assert.equal(r.payrollComponents.cpp2, 416);
  assert.equal(r.payrollComponents.enhancedCppDeduction, 1127);
  assert.equal(r.payrollComponents.cpp, 4646.45);
  assert.equal(r.payrollComponents.ei, 1123.07);
  assert.equal(r.taxable, 98873);
  assert.equal(r.federalPayrollCredit, 649.95);
  // 8193.22 + 8271.75 - 2303.28 - 210.14 - 649.9528 = 13301.5972
  assert.equal(r.federal, 13301.60);
  const exempt = calculate({ country: 'ca', wages: 3500 });
  assert.equal(exempt.payrollComponents.cpp, 0);
  assert.equal(exempt.appliedDeductions.enhancedCpp, 0);
  const ympe = calculate({ country: 'ca', wages: 74600 });
  assert.equal(ympe.payrollComponents.cpp2, 0);
  assert.equal(ympe.appliedDeductions.enhancedCpp, 711);
  assert.equal(calculate({ country: 'ca', wages: 85000 }).payrollComponents.cpp2, 416);
  assert.equal(calculate({ country: 'ca', wages: 85000.01 }).payrollComponents.cpp2, 416);
});

test('Ontario 2026 surtax, premium and basic reduction boundaries',()=>{
 assert.equal(ontarioAdjustments(5818,100000).surtax,0);
 assert.equal(ontarioAdjustments(7446,100000).surtax,325.6);
 assert.equal(ontarioAdjustments(100,10000).total,0);
 for(const [income,premium] of [[20000,0],[25000,300],[36000,300],[38500,450],[48000,450],[48600,600],[72000,600],[72600,750],[200000,750],[200600,900]])assert.equal(ontarioHealthPremium(income),premium);
});
