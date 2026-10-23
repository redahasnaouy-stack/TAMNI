import {test,expect} from '@playwright/test';
import {catalog} from './adminHelpers';
test('SHOP NOW opens a separate category page and categories open in the same tab',async({page,context})=>{
 await page.goto('/');await page.locator('.cinema-primary').click();await expect(page).toHaveURL(/view=catalogues/);await expect(page.locator('.catalogue-card')).toHaveCount(3);await expect(page.locator('.catalogue-copy h3')).toHaveText(['SHOP ALL','T-SHIRTS','HOODIES']);
 for(const [name,type] of [['T-SHIRTS','tshirts'],['HOODIES','hoodies'],['SHOP ALL','all']]){await page.getByRole('link',{name:`Ouvrir le catalogue ${name}`,exact:true}).click();await expect(page).toHaveURL(new RegExp(`tab=${type}#collection$`));await expect(page.locator('article.product')).toHaveCount(catalog.filter(p=>p.active!==false&&(type==='all'||p.type===type)).length);await expect(page.locator('.category-bar')).toBeVisible();expect(context.pages()).toHaveLength(1);await page.goBack();await expect(page).toHaveURL(/view=catalogues/)}
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
