export async function submitCheckout(page,cart,values={name:'Amine Test',phone:'0612345678',city:'Casablanca'}){
 await cart.getByLabel('Nom complet').fill(values.name);await cart.getByLabel('Numéro de téléphone').fill(values.phone);await cart.getByLabel('Ville').fill(values.city);
 await page.evaluate(()=>{window.__checkoutURL=null;window.open=url=>{window.__checkoutURL=url}});await cart.getByRole('button',{name:'Confirmer sur WhatsApp',exact:true}).click();
 return new URL(await page.evaluate(()=>window.__checkoutURL));
}
