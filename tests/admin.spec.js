import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('public/catalog.json','utf8'));
async function mockGithub(page,{denied=false,conflict=false,denyWrite=false,branchRace=false,validationError=false}={}){
 let saved=null,committed=false,liveCatalog=structuredClone(catalog),patchAttempts=0;
 await page.route('https://api.github.com/repos/redahasnaouy-stack/TAMNI/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(denied||(denyWrite&&req.method()!=='GET'))return route.fulfill({status:403,json:{message:'Forbidden'}});
  if(path.includes('/contents/')){const exact=new URL(req.url()).searchParams.get('ref')!=='main';return route.fulfill({json:{sha:exact&&conflict?'changed':committed?'new-blob':'original',content:Buffer.from(JSON.stringify(liveCatalog)).toString('base64')}})}
  if(path.endsWith('/git/ref/heads/main'))return route.fulfill({json:{object:{sha:'head-original'}}});
  if(path.endsWith('/git/commits/head-original'))return route.fulfill({json:{tree:{sha:'tree-original'}}});
  if(path.endsWith('/git/blobs')){if(validationError)return route.fulfill({status:422,json:{message:'Validation Failed',errors:[{message:'Example validation detail'}]}});saved=JSON.parse(req.postDataJSON().content);return route.fulfill({json:{sha:'new-blob'}})}
  if(path.endsWith('/git/trees')){const body=req.postDataJSON();expect(body.base_tree).toBe('tree-original');expect(body.tree.map(x=>x.path)).toEqual(['public/catalog.json','docs/catalog.json']);return route.fulfill({json:{sha:'new-tree'}})}
  if(path.endsWith('/git/commits')){expect(req.postDataJSON().parents).toEqual(['head-original']);return route.fulfill({json:{sha:'new-commit'}})}
  if(path.endsWith('/git/refs/heads/main')){patchAttempts++;if(branchRace&&patchAttempts===1)return route.fulfill({status:422,json:{message:'Update is not a fast forward'}});expect(req.postDataJSON()).toEqual({sha:'new-commit',force:false});committed=true;liveCatalog=structuredClone(saved);return route.fulfill({json:{object:{sha:'new-commit'}}})}
  throw new Error(`Unexpected route ${path}`);
 });
 return {saved:()=>saved,committed:()=>committed,patchAttempts:()=>patchAttempts};
}
async function login(page){await page.goto('/#admin');await page.getByLabel('Jeton d’accès GitHub').fill('test-only-not-a-real-token');await page.getByRole('button',{name:'Se connecter',exact:true}).click()}
test('prix initiaux, sous-total et prix transmis à WhatsApp',async({page})=>{
 await page.goto('/');const cards=page.locator('article.product');
 for(let i=0;i<catalog.length;i++){expect(catalog[i].price).toBeGreaterThanOrEqual(90);expect(catalog[i].price).toBeLessThanOrEqual(120);await expect(cards.nth(i).locator('.product-price')).toContainText(`${catalog[i].price} DH`)}
 await cards.first().getByRole('button',{name:'Découvrir la pièce'}).click();
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'M',exact:true}).click();await dialog.getByRole('button',{name:'Augmenter la quantité'}).click();
 const url=new URL(await dialog.getByRole('link',{name:'Commander sur WhatsApp'}).getAttribute('href'));expect(url.searchParams.get('text')).toContain(`Sous-total : ${catalog[0].price*2} DH`);
 await dialog.getByRole('button',{name:'Ajouter au panier'}).click();await expect(page.locator('.cart-subtotal')).toContainText(`${catalog[0].price*2} DH`);
});
test('accès admin refusé sans accès GitHub',async({page})=>{
 await mockGithub(page,{denied:true});await login(page);await expect(page.getByRole('alert')).toContainText('Accès refusé');await expect(page.getByRole('button',{name:'Publier les modifications'})).toHaveCount(0);
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
 await page.route('**/catalog.json',route=>route.fulfill({json:api.saved()}));await page.getByRole('button',{name:'Boutique',exact:true}).click();await expect(page.getByRole('button',{name:'TAMNI Studio',exact:true})).toBeVisible();await expect(page.locator('article.product').first().locator('.product-price')).toContainText('99 DH');
});
test('une modification concurrente bloque la publication sans écraser le catalogue',async({page})=>{
 const api=await mockGithub(page,{conflict:true});await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();await page.getByLabel('Prix (DH)').fill('98');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('alert')).toContainText('modifié ailleurs');await expect(page.getByLabel('Prix (DH)')).toHaveValue('98');expect(api.committed()).toBe(false);expect(api.saved()).toBe(null);
});

test('enregistrer seul persiste après reconnexion et reste visible par un autre visiteur',async({page})=>{
 const api=await mockGithub(page);await login(page);await page.locator('.admin-products article').first().getByRole('button',{name:'Modifier',exact:true}).click();
 await page.getByLabel('Prix (DH)').fill('101');await page.getByRole('button',{name:'Enregistrer et publier'}).click();await expect(page.getByRole('status')).toContainText('Enregistré et publié');expect(api.committed()).toBe(true);
 await page.reload();await page.getByLabel('Jeton d’accès GitHub').fill('test-only-not-a-real-token');await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.locator('.admin-products article').first()).toContainText('101 DH');
 await page.route('**/catalog.json',route=>route.fulfill({json:api.saved()}));await page.getByRole('button',{name:'Boutique',exact:true}).click();await expect(page.locator('article.product').first().locator('.product-price')).toContainText('101 DH');
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
