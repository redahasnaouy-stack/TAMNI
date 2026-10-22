import {test,expect} from '@playwright/test';
import {catalog} from './adminHelpers';
test('discover opens three catalogues and each launches the selected products in a new tab',async({page})=>{
 await page.goto('/');await page.getByRole('link',{name:'Découvrir la collection',exact:true}).click();await expect(page.locator('#catalogues')).toBeInViewport();await expect(page.locator('.catalogue-card')).toHaveCount(3);
 for(const [name,type] of [['T-shirts','tshirts'],['Hoodies','hoodies'],['T-shirts & Hoodies','all']]){
  const link=page.getByRole('link',{name:`Ouvrir le catalogue ${name}`,exact:true});await expect(link).toHaveAttribute('target','_blank');const opened=page.waitForEvent('popup');await link.click();const tab=await opened;await tab.waitForLoadState();await expect(tab).toHaveURL(new RegExp(`tab=${type}#collection$`));await expect(tab.locator('article.product')).toHaveCount(catalog.filter(p=>p.active!==false&&(type==='all'||p.type===type)).length);await expect(tab.locator('#collection')).toBeInViewport();await tab.close();
 }
 await expect(page).toHaveURL(/#catalogues$/);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#catalogues').screenshot({path:'/tmp/tamni-catalogues-mobile.png'});
});
