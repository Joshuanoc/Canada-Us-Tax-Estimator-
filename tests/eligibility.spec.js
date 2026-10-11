import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../data/ca-2026-opportunities.json',import.meta.url)));
test.beforeEach(async({page})=>{await page.goto('/');await page.locator('#country').selectOption('ca');await page.locator('#subRegion').selectOption('NS');});
test('guided review renders one opportunity, keeps calculator independent and remembers answers during navigation',async({page})=>{
 await expect(page.locator('#taxOpportunityList article')).toHaveCount(1);const questions=page.locator('#taxOpportunityList fieldset');const total=await questions.count();expect(total).toBeGreaterThan(0);
 for(let i=0;i<total;i++)await questions.nth(i).getByLabel('Yes',{exact:true}).check();
 await expect(page.locator('#taxOpportunityList [role=status]')).toHaveText('Potentially eligible');await expect(page.locator('#resultsPanel')).toBeHidden();
 await page.locator('#opportunityNext').click();await page.locator('#opportunityPrevious').click();await expect(questions.first().getByLabel('Yes',{exact:true})).toBeChecked();
 await page.locator('#eligibilityTaxYear').selectOption('');await expect(page.locator('#taxOpportunityList [role=status]')).toHaveText('Insufficient information');
});
for(const entry of catalog.entries){test(`guide exposes conditions and supporting information: ${entry.id}`,async({page})=>{await page.locator('#taxOpportunitySearch').fill(entry.name);await expect(page.locator(`#taxOpportunityList article[data-opportunity="${entry.id}"]`)).toBeVisible();await expect(page.locator('#taxOpportunityList [role=status]')).toHaveText('Insufficient information');await expect(page.locator('#taxOpportunityList fieldset').first()).toBeVisible();await page.locator('#taxOpportunityList summary').click();await expect(page.locator('#taxOpportunityList a').first()).toHaveAttribute('href',/^https:\/\/www\.canada\.ca\//);});}
test('mobile guide stays within viewport and keyboard controls are reachable',async({page})=>{await page.setViewportSize({width:375,height:812});await expect(page.locator('#taxOpportunityPanel')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.locator('#taxOpportunitySearch').focus();await page.keyboard.press('Tab');await expect(page.locator('#taxOpportunityGroup')).toBeFocused();});
