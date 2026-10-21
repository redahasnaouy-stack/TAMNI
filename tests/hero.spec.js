import {test,expect} from '@playwright/test';
test('hero cinéma, liens utiles et préférence de mouvement réduit',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const hero=page.getByRole('region',{name:'Laisse ton empreinte.'});
 await expect(hero).toBeVisible();
 await expect(hero.getByRole('link',{name:'Découvrir la collection'})).toBeVisible();
 expect(await page.locator('.cinema-glow').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.screenshot({path:'/tmp/tamni-cinema-desktop.png'});
 await hero.getByRole('link',{name:'Découvrir la collection'}).click();await expect(page).toHaveURL(/#collection$/);
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(hero.getByRole('link',{name:'Créer ma pièce'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'/tmp/tamni-cinema-mobile.png'});
});
