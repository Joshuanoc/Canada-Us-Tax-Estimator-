import {test,expect} from '@playwright/test';
const amount=(page,id)=>page.locator('#'+id).innerText().then(t=>Number(t.replace(/[^\d.-]/g,'')));
test.beforeEach(async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Browser page crashed'));
 page.__errors=errors;await page.goto('/');await expect(page).toHaveTitle(/TaxMetric/);
});
test.afterEach(async({page})=>expect(page.__errors).toEqual([]));
test('US single wages uses progressive brackets and the standard deduction',async({page})=>{
 await page.locator('#wages').fill('100000');await page.locator('#calculateBtn').click();
 await expect(page.locator('#resultsPanel')).toBeVisible();
 expect(await amount(page,'taxableIncome')).toBe(83900);
 expect(await amount(page,'estimatedTax')).toBe(13170);
 expect(await amount(page,'afterTax')).toBe(86830);
 await expect(page.locator('#marginalRate')).toHaveText('22.0%');
 await expect(page.locator('#resultNote')).toContainText('State tax and employee FICA withholding are excluded');
});
test('zero income produces zero tax and cash flow',async({page})=>{
 await page.locator('#calculateBtn').click();expect(await amount(page,'estimatedTax')).toBe(0);expect(await amount(page,'afterTax')).toBe(0);
});
test('Canadian Ontario wages calculates income tax separately from CPP/EI and RRSP savings',async({page})=>{
 await page.locator('#country').selectOption('ca');await page.locator('#subRegion').selectOption('ON');
 await page.locator('#wages').fill('100000');await page.locator('#calculateBtn').click();
 // Independently calculated expectations for the repository's stated 2026 model, not a full tax-law certification.
 const federal=58523*.14+(100000-58523)*.205-16452*.14-1501*.14;
 const provincial=53891*.0505+(100000-53891)*.0915-12989*.0505;
 const payroll=71100*.0595+10400*.04+68900*.0163;
 expect(await amount(page,'estimatedTax')).toBe(Math.round(federal+provincial));
 expect(await amount(page,'payrollTax')).toBe(Math.round(payroll));
 expect(await amount(page,'afterTax')).toBe(Math.round(100000-federal-provincial-payroll));
 await expect(page.locator('#planningPanel')).toBeVisible();await page.locator('#rrspWhatIf').fill('1000');expect(await amount(page,'rrspSavings')).toBe(297);
});
test('negative income and unsupported dividend income are rejected',async({page})=>{
 await page.locator('#wages').fill('-1');await page.locator('#calculateBtn').click();await expect(page.locator('#errorBox')).toContainText('cannot be negative');
 await page.locator('#wages').fill('100000');await page.locator('#dividends').fill('100');await page.locator('#calculateBtn').click();
 await expect(page.locator('#errorBox')).toContainText('requires dedicated rules');await expect(page.locator('#resultsPanel')).toBeHidden();
});
test('corporate net income uses the federal corporate rate and rejects impossible returns',async({page})=>{
 await page.locator('#businessBtn').click();await page.locator('#businessType').selectOption('c_corp');
 await page.locator('#grossReceipts').fill('100000');await page.locator('#advertising').fill('10000');await page.locator('#calculateBtn').click();
 expect(await amount(page,'taxableIncome')).toBe(90000);expect(await amount(page,'estimatedTax')).toBe(18900);
 await page.locator('#returnsAllowances').fill('100001');await page.locator('#calculateBtn').click();await expect(page.locator('#errorBox')).toContainText('cannot exceed gross receipts');
});
test('saved calculations survive reload and can be deleted',async({page})=>{
 await page.locator('#wages').fill('100000');await page.locator('#calculateBtn').click();await page.locator('#saveBtn').click();
 await expect(page.locator('.saved-item')).toHaveCount(1);await page.reload();await expect(page.locator('.saved-item')).toHaveCount(1);
 await page.locator('[data-del]').click();await expect(page.locator('.saved-item')).toHaveCount(0);
});
