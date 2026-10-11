import {test,expect} from '@playwright/test';
test('synthetic Canadian standard-mode release evidence',async({page},testInfo)=>{
 // Synthetic reference input only: no real taxpayer information.
 await page.route('**/api/health',route=>route.fulfill({json:{status:'ok',calculationApiAvailable:false,storageConfigured:false}}));
 await page.goto('/');await page.evaluate(()=>taxEngineReady);
 await page.locator('#country').selectOption('ca');await page.locator('#subRegion').selectOption('ON');
 await page.locator('#wages').fill('100000');await page.locator('#rrspDeductionLimit').fill('10000');await page.locator('#rrspClaimConfirmed').check();
 await page.locator('#calculateBtn').click();await expect(page.locator('#resultsPanel')).toBeVisible();
 await expect(page.locator('#modelAssumptions li').first()).toBeVisible();await expect(page.locator('#modelLimitations li').first()).toBeVisible();
 await expect(page.locator('#taxOpportunityList article')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const [label,locator] of [['calculation-result',page.locator('#resultsPanel')],['guided-review',page.locator('#taxOpportunityPanel')]]){
  const path=testInfo.outputPath(`${label}.png`);await locator.screenshot({path,animations:'disabled'});
  await testInfo.attach(label,{path,contentType:'image/png'});
 }
});
