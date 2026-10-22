import {test,expect} from '@playwright/test';
import {catalog} from './adminHelpers';
test('catalogues open in the same tab and browser back returns to the three choices',async({page,context})=>{
 await page.goto('/');await page.getByRole('link',{name:'Découvrir la collection',exact:true}).click();await expect(page.locator('#catalogues')).toBeInViewport();await expect(page.locator('.catalogue-card')).toHaveCount(3);
 for(const [name,type] of [['T-shirts','tshirts'],['Hoodies','hoodies'],['T-shirts & Hoodies','all']]){
  const link=page.getByRole('link',{name:`Ouvrir le catalogue ${name}`,exact:true});await expect(link).not.toHaveAttribute('target','_blank');await link.click();await expect(page).toHaveURL(new RegExp(`tab=${type}#collection$`));await expect(page.locator('article.product')).toHaveCount(catalog.filter(p=>p.active!==false&&(type==='all'||p.type===type)).length);await expect(page.locator('#collection')).toBeInViewport();expect(context.pages()).toHaveLength(1);await page.goBack();await expect(page).toHaveURL(/#catalogues$/);await expect(page.locator('.catalogue-card')).toHaveCount(3);
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
