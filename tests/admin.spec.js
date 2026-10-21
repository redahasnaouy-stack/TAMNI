import {test,expect} from '@playwright/test';
import {submitCheckout} from './checkoutHelpers';
import {mockGithub,login} from './adminHelpers';
import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('public/catalog.json','utf8'));
test('prix initiaux, sous-total et prix transmis à WhatsApp',async({page})=>{
 await page.goto('/');const cards=page.locator('article.product');
 for(let i=0;i<catalog.length;i++){expect(catalog[i].price).toBeGreaterThanOrEqual(90);expect(catalog[i].price).toBeLessThanOrEqual(120);await expect(cards.nth(i).locator('.product-price')).toContainText(`${catalog[i].price} DH`)}
 await cards.first().getByRole('button',{name:'Découvrir la pièce'}).click();
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'M',exact:true}).click();await dialog.getByRole('button',{name:'Augmenter la quantité'}).click();
 await dialog.getByRole('button',{name:'Ajouter au panier'}).click();const cart=page.getByRole('dialog',{name:'Mon panier'});await expect(page.locator('.cart-subtotal')).toContainText(`${catalog[0].price*2} DH`);
 const url=await submitCheckout(page,cart);expect(url.searchParams.get('text')).toContain(`Sous-total : ${catalog[0].price*2} DH`);
});
test('accès admin refusé sans accès GitHub',async({page})=>{
 await mockGithub(page,{denied:true});await login(page,{products:false});await expect(page.getByRole('alert')).toContainText('Accès refusé');await expect(page.getByRole('button',{name:'Publier les modifications'})).toHaveCount(0);
});
test('édition, ajout photo, suppression et publication atomique sans conserver le jeton',async({page})=>{
 const api=await mockGithub(page);await login(page);
 const first=page.locator('.admin-products article').first();await first.getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('99');await page.getByRole('button',{name:'Enregistrer et publier'}).click();
 await expect(page.locator('.admin-products article').first()).toContainText('99 DH');
 await page.getByRole('button',{name:'Ajouter un produit',exact:true}).click();await page.getByLabel('Nom du produit').fill('TAMNI Studio');await page.getByLabel('Prix (DH)').fill('105');
 await page.locator('input[type=file]').setInputFiles({name:'design.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aoccAAAAASUVORK5CYII=','base64')});
 await expect(page.locator('.admin-photo')).toHaveAttribute('src',/^data:image\/png;base64,/);
 await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.locator('.admin-products article')).toHaveCount(6);
 page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Supprimer Angel — After dark'}).click();await expect(page.locator('.admin-products article')).toHaveCount(5);
 await page.getByRole('button',{name:'Publier les modifications',exact:true}).click();await expect(page.getByRole('status')).toContainText('Enregistré et publié');
 expect(api.committed()).toBe(true);expect(api.saved().find(p=>p.id==='palestine-tee').price).toBe(99);expect(api.saved().find(p=>p.name==='TAMNI Studio').price).toBe(105);expect(api.saved().some(p=>p.id==='angel')).toBe(false);
 expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('test-only-not-a-real-token');
 // A subsequent visitor reads the newly published catalogue.
 await page.route('**/catalog.json',route=>route.fulfill({json:api.saved()}));await page.getByRole('button',{name:'العودة للمتجر',exact:false}).click();await expect(page.getByRole('button',{name:'TAMNI Studio',exact:true})).toBeVisible();await expect(page.locator('article.product').first().locator('.product-price')).toContainText('99 DH');
});
test('une modification concurrente bloque la publication sans écraser le catalogue',async({page})=>{
 const api=await mockGithub(page,{conflict:true});await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('98');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('alert')).toContainText('modifié ailleurs');await expect(page.getByLabel('Prix (DH)')).toHaveValue('98');expect(api.committed()).toBe(false);expect(api.saved()).toBe(null);
});

test('enregistrer seul persiste après reconnexion et reste visible par un autre visiteur',async({page})=>{
 const api=await mockGithub(page);await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();
 await page.getByLabel('Prix (DH)').fill('101');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('status')).toContainText('Enregistré et publié');expect(api.committed()).toBe(true);
 await page.reload();await page.getByLabel('Jeton d’accès GitHub').fill('test-only-not-a-real-token');await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('button',{name:/^المنتجات/}).click();await expect(page.locator('.admin-products article').first()).toContainText('101 DH');
 await page.route('**/catalog.json',route=>route.fulfill({json:api.saved()}));await page.getByRole('button',{name:'العودة للمتجر',exact:false}).click();await expect(page.locator('article.product').first().locator('.product-price')).toContainText('101 DH');
});
test('échec de publication : conserver la saisie sans afficher de faux succès',async({page})=>{
 const api=await mockGithub(page,{denyWrite:true});await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('107');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('alert')).toContainText('Accès refusé');await expect(page.getByLabel('Prix (DH)')).toHaveValue('107');await expect(page.getByRole('status')).toHaveCount(0);expect(api.committed()).toBe(false);
});

test('branche avancée pendant la sauvegarde : réessayer sans forcer ni écraser le catalogue',async({page})=>{
 const api=await mockGithub(page,{branchRace:true});await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('102');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('status')).toContainText('Enregistré et publié');expect(api.patchAttempts()).toBe(2);expect(api.saved()[0].price).toBe(102);
});
test('erreur 422 : afficher le vrai refus de GitHub et conserver le formulaire',async({page})=>{
 const api=await mockGithub(page,{validationError:true});await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('103');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('alert')).toContainText('Example validation detail');await expect(page.getByRole('alert')).not.toContainText('Le dépôt a changé');await expect(page.getByLabel('Prix (DH)')).toHaveValue('103');expect(api.patchAttempts()).toBe(0);
});
