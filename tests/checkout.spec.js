import {test,expect} from '@playwright/test';
import {submitCheckout} from './checkoutHelpers';
async function addProduct(page){await page.goto('/');await page.locator('article.product').first().getByRole('button',{name:'Découvrir la pièce'}).click();await page.getByRole('dialog').getByRole('button',{name:'M',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Ajouter au panier'}).click();return page.getByRole('dialog',{name:'Mon panier'})}
test('coordonnées obligatoires : aucun WhatsApp si nom, téléphone ou ville manque',async({page})=>{
 const cart=await addProduct(page);await page.evaluate(()=>{window.__opened=false;window.open=()=>{window.__opened=true}});
 await cart.getByRole('button',{name:'Confirmer sur WhatsApp'}).click();expect(await page.evaluate(()=>window.__opened)).toBe(false);expect(await cart.getByLabel('Nom complet').evaluate(el=>el.validity.valueMissing)).toBe(true);
 await cart.getByLabel('Nom complet').fill('Sara');await cart.getByRole('button',{name:'Confirmer sur WhatsApp'}).click();expect(await cart.getByLabel('Numéro de téléphone').evaluate(el=>el.validity.valueMissing)).toBe(true);
 await cart.getByLabel('Numéro de téléphone').fill('0612345678');await cart.getByRole('button',{name:'Confirmer sur WhatsApp'}).click();expect(await cart.getByLabel('Ville').evaluate(el=>el.validity.valueMissing)).toBe(true);expect(await page.evaluate(()=>window.__opened)).toBe(false);
});
test('validation téléphone et espaces puis transmission du client et du panier',async({page})=>{
 const cart=await addProduct(page);await cart.getByLabel('Nom complet').fill('  ');await cart.getByLabel('Numéro de téléphone').fill('abc');await cart.getByLabel('Ville').fill('Rabat');await cart.getByRole('button',{name:'Confirmer sur WhatsApp'}).click();await expect(cart.getByRole('alert')).toContainText('Renseigne ton nom');
 await cart.getByLabel('Nom complet').fill('Sara');await cart.getByRole('button',{name:'Confirmer sur WhatsApp'}).click();await expect(cart.getByRole('alert')).toContainText('numéro valide');
 const url=await submitCheckout(page,cart,{name:'  Sara Alaoui  ',phone:'+212 6 12 34 56 78',city:'  الرباط  '});expect(url.pathname).toBe('/212617571113');const text=url.searchParams.get('text');expect(text).toContain('Client : Sara Alaoui');expect(text).toContain('Téléphone : +212 6 12 34 56 78');expect(text).toContain('Ville : الرباط');expect(text).toContain('Taille : M');expect(text).toContain('Total :');expect(text).toContain('Paiement : en espèces à la livraison');
 expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('Sara Alaoui');
});
test('commande rapide ne contourne pas les coordonnées et le formulaire reste accessible sur mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.locator('article.product').first().getByRole('button',{name:'Découvrir la pièce'}).click();await page.getByRole('dialog').getByRole('button',{name:'L',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Commander sur WhatsApp'}).click();const cart=page.getByRole('dialog',{name:'Mon panier'});await expect(cart.getByLabel('Nom complet')).toBeVisible();await cart.getByLabel('Ville').scrollIntoViewIfNeeded();await expect(cart.getByRole('button',{name:'Confirmer sur WhatsApp'})).toBeVisible();await cart.locator('summary').filter({hasText:'Paiement à la livraison'}).click();await expect(cart.getByRole('heading',{name:'Paiement à la livraison'})).toBeVisible();expect(await cart.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});

test('message WhatsApp court : produits regroupés puis coordonnées en bas',async({page})=>{
 const cart=await addProduct(page);await cart.getByRole('button',{name:'Continuer mes achats'}).click();
 await page.locator('article.product').nth(1).getByRole('button',{name:'Découvrir la pièce'}).click();await page.getByRole('dialog').getByRole('button',{name:'L',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Marron',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Augmenter la quantité'}).click();await page.getByRole('dialog').getByRole('button',{name:'Ajouter au panier'}).click();
 const url=await submitCheckout(page,cart,{name:'Sara Alaoui',phone:'0612345678',city:'Rabat'}),text=url.searchParams.get('text');
 expect(text).toMatch(/^\*Commande TAMNI\*\n\n1\. T-shirt oversize — Palestine — Heritage\nTaille : M · Couleur : Noir · Quantité : 1\n\n2\. Hoodie oversize — Darwish — Poésie libre\nTaille : L · Couleur : Marron · Quantité : 2\n\nTotal :/);
 expect(text).toMatch(/\n\n\*Coordonnées\*\nClient : Sara Alaoui\nTéléphone : 0612345678\nVille : Rabat$/);
 expect(text).not.toMatch(/hors livraison|frais|supplément/i);expect(text).not.toContain('Voir chaque article');expect(text).not.toContain('Prix unitaire');expect(text.match(/Taille :/g)).toHaveLength(2);expect(text.match(/Client :/g)).toHaveLength(1);expect(text.length).toBeLessThan(550);
});
