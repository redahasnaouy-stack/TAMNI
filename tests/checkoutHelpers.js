import {expect} from '@playwright/test';
export async function submitCheckout(page,cart,values={name:'Amine Test',phone:'0612345678',city:'Casablanca'}){
 await cart.getByLabel('Nom complet').fill(values.name);await cart.getByLabel('Numéro de téléphone').fill(values.phone);await cart.getByLabel('Ville').fill(values.city);
 await page.route('**/.netlify/functions/tamni-api?resource=orders',route=>route.fulfill({status:503,json:{error:'Unavailable in this fallback test'}}));
 await page.evaluate(()=>{window.__checkoutURL=null;window.open=()=>({opener:null,location:{set href(url){window.__checkoutURL=url}},close(){}})});await cart.getByRole('button',{name:'Confirmer sur WhatsApp',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__checkoutURL)).toMatch(/^https:\/\/wa.me/);
 return new URL(await page.evaluate(()=>window.__checkoutURL));
}
