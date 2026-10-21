import {test,expect} from '@playwright/test';
test('les fenêtres produit et panier retiennent le focus puis le rendent au déclencheur',async({page})=>{
 await page.goto('/');const trigger=page.locator('article.product').first().getByRole('button',{name:'Découvrir la pièce'});await trigger.click();
 for(let i=0;i<35;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]'))).toBe(true)}
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 const cart=page.getByRole('button',{name:'Ouvrir le panier'});await cart.click();
 for(let i=0;i<8;i++){await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]'))).toBe(true)}
 await page.keyboard.press('Escape');await expect(cart).toBeFocused();await expect(page.locator('main')).not.toHaveAttribute('inert','');
});
