import { ontarioAdjustments } from './ontario-2026.js';
import {
   roundMoney, settlement 
} from './calculation-contract.js';

const progressive=(income,brackets)=>{
  let tax=0,prev=0;
  for(const[cap,rate]of brackets){
    tax+=Math.max(Math.min(income,cap)-prev,0)*rate;
    if(income<=cap)break;
    prev=cap
  }return Math.max(tax,0)
};
import {
   saltDeduction2026, usBrackets, usStd, caFederal, caProv, provBPA, usRegions, caRegions 
} from './tax-rules-2026.js';


function federalBPA(income){
  if(income<=181440)return 16452;
  if(income>=258482)return 14829;
  return 16452-(income-181440)/(258482-181440)*(16452-14829)
}
function caPayroll(wages,prov){
  if(wages<=0||prov==='QC')return{
    cpp:0,baseCpp:0,enhancedCpp:0,cpp2:0,ei:0,total:0,supported:prov!=='QC'
  };
  const cpp1=Math.min(Math.max(wages-3500,0),71100)*.0595;
  const cpp2=Math.min(Math.max(wages-74600,0),10400)*.04;
  const ei=Math.min(wages,68900)*.0163;
  return{
    cpp:cpp1+cpp2,baseCpp:Math.min(Math.max(wages-3500,0),71100)*.0495,enhancedCpp:Math.min(Math.max(wages-3500,0),71100)*.01+cpp2,cpp2,ei,total:cpp1+cpp2+ei,supported:true
  }
}
function caFederalTax(taxable,wages,payroll){
  let tax=progressive(taxable,caFederal);
  const bpa=federalBPA(taxable);
  const cea=Math.min(wages,1501);
  tax-=bpa*.14;
  tax-=cea*.14;
  tax-=(payroll.baseCpp+payroll.ei)*.14;
  return Math.max(tax,0)
}
function caProvinceTax(taxable,prov,payroll){
  if(!prov||!caProv[prov])return 0;
  let tax=progressive(taxable,caProv[prov]);
  if(provBPA[prov])tax-=provBPA[prov]*caProv[prov][0][1];
  tax-=(payroll.baseCpp+payroll.ei)*caProv[prov][0][1];
  const basic=Math.max(tax,0);
  return prov==='ON'?ontarioAdjustments(basic,taxable).total:basic;
}
function usSeTax(se){
  if(se<=0)return 0;
  const net=se*.9235;
  if(net<400)return 0;
  return Math.min(net,184500)*.124+net*.029
}
function completeness(items){
  const ok=items.filter(x=>x[0]).length,total=items.length;
  return total?Math.round(ok/total*100):0
}
export const numericFields = ["wages", "interest", "selfEmployment", "rentalIncome", "retirement", "otherIncome", "dividends", "capitalGains", "mortgageInterest", "propertyTax", "charitableDonations", "medicalExpenses", "retirementContrib", "hsaContrib", "rrspContrib", "grossReceipts", "returnsAllowances", "otherBusinessIncome", "beginningInventory", "purchases", "laborCosts", "endingInventory", "advertising", "vehicleExpenses", "officeExpenses", "rentLease", "utilities", "insurance", "professionalFees", "employeeWages", "repairs", "travel", "depreciation", "businessInterest", "otherExpenses", "homeOffice", "rrspWhatIf", "eligibleEmploymentDues"];

export function normalizeInput(raw){
  
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('A scenario object is required.');
  
 const {
    country='us',mode='personal',subRegion='',filingStatus='single',businessType='sole',standardDeduction=true
  }=raw;
  
 if(!['us','ca'].includes(country)||!['personal','business'].includes(mode))throw new Error('Invalid country or calculation mode.');
  
 if(subRegion&&!(country==='us'?usRegions:caRegions).includes(subRegion))throw new Error('Unsupported state or province.');
  
 if(!Object.hasOwn(usBrackets,filingStatus))throw new Error('Invalid filing status.');
  
 if(!(country==='us'?['sole','partnership','llc','s_corp','c_corp']:['sole','partnership','corp_general']).includes(businessType))throw new Error('Invalid business type.');
  
 if(typeof standardDeduction!=='boolean')throw new Error('Standard deduction must be a boolean.');
  
 if(raw.employmentDuesConfirmed!==undefined&&typeof raw.employmentDuesConfirmed!=='boolean')throw new Error('Employment dues confirmation must be a boolean.');
  
 const taxYear=raw.taxYear??2026;
  
 if(taxYear!==2026)throw new Error('Only tax year 2026 is supported.');
  
 const rrspDeductionLimit=raw.rrspDeductionLimit??null;
 if(rrspDeductionLimit!==null&&(typeof rrspDeductionLimit!=='number'||!Number.isFinite(rrspDeductionLimit)||rrspDeductionLimit<0||rrspDeductionLimit>1e9))throw new Error('RRSP deduction limit must be a finite nonnegative number at most 1 billion.');
 if(raw.rrspClaimConfirmed!==undefined&&typeof raw.rrspClaimConfirmed!=='boolean')throw new Error('RRSP claim confirmation must be a boolean.');
 const withholding=raw.withholding??null;
  
 if(withholding!==null&&(typeof withholding!=='number'||!Number.isFinite(withholding)||withholding<0||withholding>1e9))throw new Error('Withholding must be a finite nonnegative number at most 1 billion.');
  
 const input={
    country,mode,subRegion,filingStatus,businessType,standardDeduction,taxYear,withholding,rrspDeductionLimit,rrspClaimConfirmed:raw.rrspClaimConfirmed??false,employmentDuesConfirmed:raw.employmentDuesConfirmed??false
  };
  
 for(const field of numericFields){
    const n=raw[field]??0;
    if(typeof n==='number'&&n<0)throw new Error(`${field} cannot be negative.`);
    if(typeof n!=='number'||!Number.isFinite(n)||n>1e9)throw new Error(`${field} must be a finite nonnegative number at most 1 billion.`);
    input[field]=n;
    
  }
 if(country==='ca'&&mode==='personal'){
   if(input.selfEmployment>0)throw new Error('Canadian self-employment income requires CPP coordination not supported by this employment estimator.');
   if(input.rrspContrib>0){
     if(rrspDeductionLimit===null)throw new Error('Enter your available CRA RRSP deduction limit before claiming an RRSP deduction.');
     if(input.rrspContrib>rrspDeductionLimit)throw new Error('RRSP deduction claim cannot exceed your entered CRA deduction limit.');
     if(!input.rrspClaimConfirmed)throw new Error('Confirm that your RRSP deduction claim is supported by contribution receipts or available undeducted contributions.');
   }
 }
 if(country==='us'&&mode==='personal'){
   if(input.charitableDonations>0)throw new Error('Charitable donation calculations are not supported pending 2026 deduction-floor and eligibility rules. Use zero for this ordinary-income estimate.');
   const additionalMedicareThreshold=filingStatus==='married_joint'?250000:filingStatus==='married_separate'?125000:200000;
   if(input.selfEmployment*.9235>additionalMedicareThreshold)throw new Error('Self-employment earnings above the Additional Medicare threshold require rules not supported by this estimator.');
 }
 if(country==='us'&&mode==='personal'&&(input.retirementContrib>0||input.hsaContrib>0))throw new Error('Positive IRA and HSA deductions require eligibility and contribution-limit rules not yet supported. Use zero for this ordinary-income estimate.');
 if(country==='us'&&mode==='personal'&&input.wages>0&&input.selfEmployment>0)throw new Error('Mixed US wages and self-employment require Social Security wage-cap coordination, which is not supported.');
  
 if(input.eligibleEmploymentDues>0&&(country!=='ca'||mode!=='personal'||!input.employmentDuesConfirmed))throw new Error('Employment dues require Canadian personal mode and confirmation of eligible, nonduplicated employment dues.');
  
 if(mode==='personal'&&(input.dividends>0||input.capitalGains>0))throw new Error('Dividend and capital-gain taxation requires dedicated rules.');
  
 return input;
  

}
export function calculate(raw){
  
 const input=normalizeInput(raw),mode=input.mode;
  
 const val=id=>input[id]??0;
  
 const $=id=>({
    value:input[id],checked:input[id]
  });
  
 const makeResult=(total,deductions,taxable,federal,region,payroll,marginal,note,inc)=>{
    
  const estimated=Math.max(federal+region,0),after=total-estimated-payroll;
    
  return {
      country:input.country,subRegion:input.subRegion,mode,total,deductions,taxable,federal,regionTax:region,payroll,estimated,effective:total>0?estimated/total*100:0,marginal,after,monthly:after/12,note,inc,score:completeness(inc),taxYear:input.taxYear,modelVersion:'2026-v2-partial',rounding:'Nearest cent at result boundaries; brackets computed before rounding',assumptions:input.country==='ca'?['Full-year resident; ordinary income only','Payroll assumes one employer, full-year CPP eligibility and insurable employment','RRSP claim is confirmed against receipts or undeducted contributions and an entered CRA deduction limit']:['Ordinary income only; positive IRA/HSA deductions are not supported','SALT MAGI equals modeled AGI; no foreign-income exclusions or territory exclusions','Self-employment estimate does not coordinate Social Security cap with employment wages'],limitations:input.country==='ca'?['Ontario dependant tax-reduction supplements are not modeled','Provincial reductions and income-dependent personal credits are incomplete','Canadian self-employment CPP is not modeled']:['State income tax and employee FICA are not modeled','Itemized deduction limits and special 2026 deductions are incomplete'],scope:'Partial ordinary-income estimate; eligibility, provincial adjustments and credits are incomplete',withholding:input.withholding,refundableCredits:null,benefitPayments:null,estimatedRefund:null,estimatedBalanceDue:null,modeledSettlement:settlement(input.withholding,estimated),components:{
        federalIncomeTax:roundMoney(federal),provincialIncomeTax:input.country==='ca'&&input.subRegion?roundMoney(region):null,stateIncomeTax:null,payrollContributions:input.country==='ca'?roundMoney(payroll):null
      }
    };
    
 
  };
  
 const silent=true;
  
 function personalCalculation(){
    const c=$('country').value,w=val('wages'),se=val('selfEmployment'),total=w+val('interest')+se+val('rentalIncome')+val('retirement')+val('otherIncome');
    let deductions=0,federal=0,region=0,payroll=0,note='',inc=[],marginal=0;
    function personalUS(){
      const status=$('filingStatus').value;
      const setax=usSeTax(se);
      const adjustedIncome=Math.max(0,total-val('retirementContrib')-val('hsaContrib')-setax/2);
      if($('standardDeduction').checked)deductions=usStd[status];
      else deductions=val('mortgageInterest')+saltDeduction2026(val('propertyTax'),adjustedIncome,status)+val('charitableDonations')+Math.max(val('medicalExpenses')-adjustedIncome*.075,0);
      deductions+=val('retirementContrib')+val('hsaContrib');
      deductions+=setax/2;
      const taxable=Math.max(total-deductions,0);
      federal=progressive(taxable,usBrackets[status]);
      payroll=setax;
      const increment=.01;
      const nextAdjustedIncome=Math.max(0,total+increment-val('retirementContrib')-val('hsaContrib')-setax/2);
      const nextItemized=val('mortgageInterest')+saltDeduction2026(val('propertyTax'),nextAdjustedIncome,status)+val('charitableDonations')+Math.max(val('medicalExpenses')-nextAdjustedIncome*.075,0);
      const nextDeductions=($('standardDeduction').checked?usStd[status]:nextItemized)+val('retirementContrib')+val('hsaContrib')+setax/2;
      marginal=roundMoney((progressive(Math.max(total+increment-nextDeductions,0),usBrackets[status])-federal)/increment*100);
      note='Federal ordinary-income tax. Self-employment tax is reported separately as a payroll contribution. State tax and employee FICA withholding are excluded.';
      inc=[[true,'2026 federal brackets'],[true,'2026 standard/itemized deduction'],[true,'Self-employment tax when applicable'],[false,'State income tax'],[false,'Employee FICA withholding'],[false,'Capital gains / qualified dividends'],[false,'2026 special deduction eligibility (tips, overtime, seniors, auto interest)']];
      const result=makeResult(total,deductions,taxable,federal,region,payroll,marginal,note,inc,silent);
      result.payrollComponents={
        selfEmploymentTax:roundMoney(setax),employeeFica:null
      };
      result.components.payrollContributions=roundMoney(setax);
      return finalize(result);
    }
    function personalCA(){
      const p=caPayroll(w,$('subRegion').value);
      deductions=val('rrspContrib')+val('eligibleEmploymentDues')+p.enhancedCpp;
      const taxable=Math.max(total-deductions,0),prov=$('subRegion').value;
      federal=caFederalTax(taxable,w,p);
      region=caProvinceTax(taxable,prov,p);
      payroll=p.total;
      // Next-cent modeled income-tax rate includes credit phase-outs, surtax
      // and premiums. Employment/payroll facts stay fixed for this comparison.
      const increment=.01;
      const nextTaxable=Math.max(total+increment-deductions,0);
      marginal=roundMoney((caFederalTax(nextTaxable,w,p)+caProvinceTax(nextTaxable,prov,p)-federal-region)/increment*100);
      note='Federal/provincial bracket tax includes the federal basic personal credit, Canada Employment Amount, and selected provincial BPA credits where available. CPP/EI are shown as cash-flow deductions, not income tax.';
      inc=[[true,'2026 federal brackets'],[true,'Federal basic personal credit'],[true,'Canada Employment Amount'],[true,'RRSP deduction'],[!!prov,'Province/territory selected'],[!!provBPA[prov],provBPA[prov]?`${prov} basic personal credit`:'Province-specific BPA not modeled'],[p.supported,'CPP/CPP2 + EI payroll contribution'],[false,'CPP coordination for mixed employment + self-employment'],[false,'Many other federal/provincial credits & surtaxes'],[false,'Capital gains / dividend gross-up rules']];
      const result=makeResult(total,deductions,taxable,federal,region,payroll,marginal,note,inc,silent);
      result.payrollComponents={
        cpp:roundMoney(p.cpp),baseCpp:roundMoney(p.baseCpp),enhancedCppDeduction:roundMoney(p.enhancedCpp),cpp2:roundMoney(p.cpp2),ei:roundMoney(p.ei),selfEmploymentCpp:se>0?null:0
      };
      result.appliedDeductions={rrsp:roundMoney(val('rrspContrib')),employmentDues:roundMoney(val('eligibleEmploymentDues')),enhancedCpp:roundMoney(p.enhancedCpp)};
      result.provincialPayrollCredit=prov?roundMoney((p.baseCpp+p.ei)*caProv[prov][0][1]):null;
      result.federalPayrollCredit=roundMoney((p.baseCpp+p.ei)*.14);
      return finalize(result);
    }
    return c==='us'?personalUS():personalCA();
  }
 function businessCalculation(){
    const gross=val('grossReceipts'),returns=val('returnsAllowances');
    if(returns>gross){
      throw new Error('Returns & allowances cannot exceed gross receipts.')
    }const avail=val('beginningInventory')+val('purchases')+val('laborCosts');
    if(val('endingInventory')>avail){
      throw new Error('Ending inventory cannot exceed beginning inventory + purchases + direct labor.')
    }const cogs=avail-val('endingInventory'),ids=['advertising','vehicleExpenses','officeExpenses','rentLease','utilities','insurance','professionalFees','employeeWages','repairs','travel','depreciation','businessInterest','otherExpenses','homeOffice'],expenses=ids.reduce((s,id)=>s+val(id),0),revenue=gross-returns+val('otherBusinessIncome'),net=revenue-cogs-expenses,c=$('country').value,t=$('businessType').value;
    let federal=0,note='',inc=[];
    if(c==='us'&&t==='c_corp'){
      federal=Math.max(net,0)*.21;
      note='US C-corporation federal income tax only.';
      inc=[[true,'21% federal C-corp rate'],[false,'State corporate tax'],[false,'Corporate credits/special provisions']]
    }else if(c==='ca'&&t==='corp_general'){
      federal=Math.max(net,0)*.15;
      note='Canadian general federal corporate tax only.';
      inc=[[true,'15% general federal corporate rate'],[false,'Provincial corporate tax'],[false,'Small-business deduction eligibility']]
    }else{
      note='Pass-through entity: net business income shown; owner-level tax not included here.';
      inc=[[true,'Revenue, COGS and entered expenses'],[false,'Owner-level personal tax'],[false,'Entity-specific special rules']]
    }return finalize(makeResult(revenue,cogs+expenses,Math.max(net,0),federal,0,0,0,note,inc,silent))
  }
 return mode==='personal'?personalCalculation():businessCalculation();
  

}

function finalize(result){
  for(const key of ['total','deductions','taxable','federal','regionTax','payroll','estimated','after','monthly'])result[key]=roundMoney(result[key]);
  return result;
  
}
