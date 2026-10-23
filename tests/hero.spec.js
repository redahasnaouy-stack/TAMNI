import {test,expect} from '@playwright/test';
test('Arabic TAMNI hero, SHOP NOW and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const hero=page.getByRole('region',{name:'تامني'});await expect(hero).toBeVisible();await expect(hero.getByRole('link',{name:'SHOP NOW',exact:true})).toBeVisible();expect(await page.locator('.cinema-glow').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.screenshot({path:'/tmp/tamni-cinema-new.png'});await hero.getByRole('link',{name:'SHOP NOW',exact:true}).click();await expect(page).toHaveURL(/view=catalogues/);await page.setViewportSize({width:390,height:844});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
