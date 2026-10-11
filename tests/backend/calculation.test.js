import { ontarioAdjustments, ontarioHealthPremium } from '../../backend/ontario-2026.js';
import { saltDeduction2026 } from '../../backend/tax-rules-2026.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, normalizeInput } from '../../backend/tax.js';
test('RRSP claims require deduction room and separate contribution confirmation',()=>{
  const input={country:'ca',subRegion:'ON',wages:100000,rrspContrib:1000};
  assert.throws(()=>calculate(input),/deduction limit/);
  assert.throws(()=>calculate({...input,rrspDeductionLimit:999,rrspClaimConfirmed:true}),/cannot exceed/);
  assert.throws(()=>calculate({...input,rrspDeductionLimit:1000}),/contribution receipts/);
  const result=calculate({...input,rrspDeductionLimit:1000,rrspClaimConfirmed:true});
  assert.equal(result.appliedDeductions.rrsp,1000);
  assert.equal(result.taxable,97873);
  assert.equal(calculate({country:'ca',wages:100000,rrspDeductionLimit:0}).appliedDeductions.rrsp,0);
  for(const rrspDeductionLimit of [-1,Infinity,'1000'])assert.throws(()=>normalizeInput({...input,rrspDeductionLimit}),/deduction limit/);
  assert.throws(()=>normalizeInput({...input,rrspDeductionLimit:1000,rrspClaimConfirmed:'true'}),/confirmation/);
});
test('unsupported deduction and Canadian self-employment claims fail explicitly',()=>{
  assert.throws(()=>calculate({country:'ca',selfEmployment:1}),/CPP coordination/);
  assert.throws(()=>calculate({retirementContrib:1}),/IRA and HSA/);
  assert.throws(()=>calculate({hsaContrib:1}),/IRA and HSA/);
  assert.equal(calculate({wages:100000}).estimated,13170);
});
test('US ordinary self-employment applies IRS net-earnings threshold and guards additional Medicare',()=>{
  assert.equal(calculate({selfEmployment:433.13}).payroll,0);
  assert.equal(calculate({selfEmployment:433.14}).payroll,61.20);
  assert.throws(()=>calculate({selfEmployment:220000}),/Additional Medicare/);
  assert.throws(()=>calculate({selfEmployment:140000,filingStatus:'married_separate'}),/Additional Medicare/);
  assert.throws(()=>calculate({selfEmployment:280000,filingStatus:'married_joint'}),/Additional Medicare/);
  assert.equal(calculate({selfEmployment:100000}).payroll,14129.55);
  assert.throws(()=>calculate({charitableDonations:1,standardDeduction:false}),/Charitable donation/);
  assert.throws(()=>calculate({charitableDonations:1}),/Charitable donation/);
});

test('modeled marginal income tax includes surtax and deduction phase-outs', () => {
  assert.equal(calculate({country:'ca',subRegion:'ON',wages:100000}).marginal,31.48);
  assert.equal(calculate({country:'ca',subRegion:'ON',wages:0}).marginal,0);
  assert.equal(calculate({wages:100000}).marginal,22);
  assert.equal(calculate({wages:510000,standardDeduction:false,propertyTax:50000}).marginal,45.5);
});

test('calculation is deterministic and explicitly versioned', () => {
  const input = { country: 'ca', subRegion: 'NS', wages: 65000 };
  assert.deepEqual(calculate(input), calculate(input));
  assert.equal(calculate(input).taxYear, 2026);
  assert.throws(() => calculate({ taxYear: 2025 }), /tax year/);
});
test('IRS 2026 standard deductions, ordinary brackets and SALT limits',()=>{
  for(const [filingStatus,deduction] of [['single',16100],['married_separate',16100],['married_joint',32200],['head',24150]]){
    assert.equal(calculate({filingStatus,wages:100000}).deductions,deduction);
  }
  assert.equal(calculate({wages:100000}).federal,13170);
  assert.equal(saltDeduction2026(50000,505000,'single'),40400);
  assert.equal(saltDeduction2026(50000,515000,'single'),37400);
  assert.equal(saltDeduction2026(50000,1000000,'single'),10000);
  assert.equal(saltDeduction2026(50000,252500,'married_separate'),20200);
  assert.equal(saltDeduction2026(50000,262500,'married_separate'),18700);
  assert.equal(saltDeduction2026(50000,1000000,'married_separate'),5000);
  assert.equal(calculate({wages:100000,standardDeduction:false,propertyTax:30000}).deductions,30000);
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
