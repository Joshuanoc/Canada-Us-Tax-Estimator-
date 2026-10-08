import {test,expect} from '@playwright/test';
const amount=(page,id)=>page.locator('#'+id).innerText().then(t=>Number(t.replace(/[^\d.-]/g,'')));
async function submit(page){await page.locator('#calculateBtn').click();await expect(page.locator('#calculateBtn')).toBeEnabled();}
test.beforeEach(async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Browser page crashed'));
 page.__errors=errors;
 // Exercise asynchronous calculations with a slow network response.
 await page.route('**/api/calculate',async route=>{await new Promise(r=>setTimeout(r,150));await route.continue();});
 await page.goto('/');await expect(page).toHaveTitle(/TaxMetric/);
});
test.afterEach(async({page})=>expect(page.__errors).toEqual([]));
test('US single wages uses progressive brackets and the standard deduction',async({page})=>{
 await page.locator('#wages').fill('100000');await submit(page);
 await expect(page.locator('#resultsPanel')).toBeVisible();
 expect(await amount(page,'taxableIncome')).toBe(83900);
 expect(await amount(page,'estimatedTax')).toBe(13170);
 expect(await amount(page,'afterTax')).toBe(86830);
 await expect(page.locator('#marginalRate')).toHaveText('22.0%');
 await expect(page.locator('#resultNote')).toContainText('State tax and employee FICA withholding are excluded');
});
test('zero income produces zero tax and cash flow',async({page})=>{
 await submit(page);expect(await amount(page,'estimatedTax')).toBe(0);expect(await amount(page,'afterTax')).toBe(0);
});
test('Canadian Ontario wages calculates income tax separately from CPP/EI and RRSP savings',async({page})=>{
 await page.locator('#country').selectOption('ca');await page.locator('#subRegion').selectOption('ON');
 await page.locator('#wages').fill('100000');await submit(page);
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
 await page.locator('#wages').fill('-1');await submit(page);await expect(page.locator('#errorBox')).toContainText('cannot be negative');
 await page.locator('#wages').fill('100000');await page.locator('#dividends').fill('100');await submit(page);
 await expect(page.locator('#errorBox')).toContainText('requires dedicated rules');await expect(page.locator('#resultsPanel')).toBeHidden();
});
test('corporate net income uses the federal corporate rate and rejects impossible returns',async({page})=>{
 await page.locator('#businessBtn').click();await page.locator('#businessType').selectOption('c_corp');
 await page.locator('#grossReceipts').fill('100000');await page.locator('#advertising').fill('10000');await submit(page);
 expect(await amount(page,'taxableIncome')).toBe(90000);expect(await amount(page,'estimatedTax')).toBe(18900);
 await page.locator('#returnsAllowances').fill('100001');await submit(page);await expect(page.locator('#errorBox')).toContainText('cannot exceed gross receipts');
});
test('saved calculations survive reload and can be deleted',async({page})=>{
 await page.locator('#wages').fill('100000');await submit(page);await page.locator('#saveBtn').click();
 await expect(page.locator('.saved-item')).toHaveCount(1);await page.reload();await expect(page.locator('.saved-item')).toHaveCount(1);
 await page.locator('[data-del]').click();await expect(page.locator('.saved-item')).toHaveCount(0);
});

test('backend deployment uses the calculation API without a login',async({page})=>{
 await expect(page.locator('#cloudStatus')).toContainText('Calculations run on the server');
 await page.locator('#wages').fill('100000');const response=page.waitForResponse(r=>r.url().includes('/api/calculate')&&r.request().method()==='POST');
 await submit(page);expect((await response).status()).toBe(200);expect(await amount(page,'estimatedTax')).toBe(13170);
 await expect(page.getByRole('button',{name:/sign in|log in/i})).toHaveCount(0);
});

test('guest cloud UI saves, loads and deletes scenarios without rendering a name as HTML',async({page})=>{
 let rows=[];
 await page.route('**/api/health',route=>route.fulfill({json:{status:'ok',storageConfigured:true}}));
 await page.route('**/api/scenarios*',async route=>{
  const req=route.request();if(req.method()==='POST'){
   const data=req.postDataJSON();const result=await page.evaluate(()=>({...lastResult}));
   rows=[{id:'test-id',name:'<img src=x onerror=alert(1)>',input:data.input,result,created_at:new Date().toISOString()}];
   return route.fulfill({status:201,json:{scenario:rows[0]}});
  }
  if(req.method()==='DELETE'){rows=[];return route.fulfill({json:{deleted:true}});}
  return route.fulfill({json:{scenarios:rows}});
 });
 await page.reload();await expect(page.locator('#cloudStatus')).toContainText('no login is needed');
 await page.locator('#wages').fill('100000');await submit(page);await expect(page.locator('#estimatedTax')).toContainText('13,170');await page.locator('#saveBtn').click();
 await expect(page.locator('.saved-item')).toHaveCount(1);await expect(page.locator('.saved-item img')).toHaveCount(0);
 await page.locator('#wages').fill('1');await page.getByRole('button',{name:'Load',exact:true}).click();await expect(page.locator('#wages')).toHaveValue('100000');
 await page.locator('[data-del]').click();await expect(page.locator('.saved-item')).toHaveCount(0);
});
