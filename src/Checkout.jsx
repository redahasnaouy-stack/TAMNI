import React,{useState,useRef} from 'react';
import {MessageCircle,CreditCard} from 'lucide-react';
import {formatPrice} from './catalogStore';
import {whatsappNumber} from './catalog';
import './checkout.css';
import {recordCheckout} from './managementApi';
export function DeliveryInfo({compact=false}){
 const content=<div><CreditCard size={21}/><h3>Paiement à la livraison</h3><p>Règle ta commande en espèces au moment de recevoir ton colis.</p></div>;
 return compact?<details className="checkout-delivery"><summary>Paiement à la livraison</summary><div>{content}</div></details>:<section id="livraison" className="delivery-section"><div><span className="eyebrow">EN TOUTE SIMPLICITÉ</span><h2>الدفع عند الاستلام</h2></div>{content}</section>
}
export function checkoutUrl(cart,customer,reference){
 const total=cart.reduce((n,x)=>n+x.product.price*x.quantity,0);
 const productLines=cart.map((x,i)=>[
  `${i+1}. ${x.product.label} — ${x.product.name}`,
  `Taille : ${x.size} · Couleur : ${x.color} · Quantité : ${x.quantity}`,
  ...(x.embroidery?[`Broderie demandée : ${x.text?.trim()||'À préciser'}`]:[])
 ].join('\n')).join('\n\n');
 const text=[
  `*Commande TAMNI*${reference?`\nRéf : ${reference}`:''}`,
  productLines,
  `Total : ${formatPrice(total)}\nPaiement : en espèces à la livraison`,
  `*Coordonnées*\nClient : ${customer.name.trim()}\nTéléphone : ${customer.phone.trim()}\nVille : ${customer.city.trim()}`
 ].join('\n\n');
 return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
export default function Checkout({cart,customer,setCustomer}){
 const [error,setError]=useState(''),[saving,setSaving]=useState(false);const form=useRef(),attempt=useRef({signature:'',id:''});
 async function submit(e){e.preventDefault();setError('');let invalid='';if(customer.name.trim().length<2)invalid='name';else if(!/^(?:0[5-7]\d{8}|00212[5-7]\d{8}|\+[1-9]\d{7,14})$/.test(customer.phone.replace(/[\s().-]/g,'')))invalid='phone';else if(customer.city.trim().length<2)invalid='city';if(invalid){setError(invalid==='phone'?'Entre un numéro valide, par exemple 0612345678 ou +212612345678.':'Renseigne ton nom et ta ville (au moins 2 caractères).');form.current.elements.namedItem(invalid)?.focus();return}if(!cart.length||saving)return;
 const signature=JSON.stringify({cart:cart.map(x=>[x.product.id,x.size,x.color,x.quantity,x.embroidery,x.text]),customer});if(attempt.current.signature!==signature)attempt.current={signature,id:crypto.randomUUID()};
 const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;setSaving(true);let reference;
 try{const result=await recordCheckout(cart,customer,attempt.current.id);reference=result.reference;if(result.total!==cart.reduce((n,x)=>n+x.product.price*x.quantity,0)){popup?.close();setError('Les prix ont changé. Actualise le catalogue avant de confirmer.');return}}catch{setError('Le suivi en ligne est indisponible. Confirme ton message WhatsApp ; notre équipe enregistrera la commande.')}finally{setSaving(false)}
 const url=checkoutUrl(cart,customer,reference);if(popup)popup.location.href=url;else window.location.assign(url)}
 function update(field,value){setCustomer(c=>({...c,[field]:value}));setError('')}
 return <form ref={form} className="checkout-form" onSubmit={submit}><div className="checkout-form-title"><h3>Tes coordonnées</h3><span>3 infos, et on s’occupe du reste.</span></div><label htmlFor="customer-name">Nom complet <span aria-hidden="true">*</span></label><input id="customer-name" name="name" autoComplete="name" required minLength={2} maxLength={80} value={customer.name} onChange={e=>update('name',e.target.value)} placeholder="Ton nom complet"/><label htmlFor="customer-phone">Numéro de téléphone <span aria-hidden="true">*</span></label><input id="customer-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} value={customer.phone} onChange={e=>update('phone',e.target.value)} placeholder="06 ou 07…"/><label htmlFor="customer-city">Ville <span aria-hidden="true">*</span></label><input id="customer-city" name="city" autoComplete="address-level2" required minLength={2} maxLength={80} value={customer.city} onChange={e=>update('city',e.target.value)} placeholder="Ta ville de livraison"/>{error&&<p className="checkout-error" role="alert">{error}</p>}<DeliveryInfo compact/><button type="submit" className="btn dark" disabled={saving}>{saving?"Préparation de la commande…":"Confirmer sur WhatsApp"} <MessageCircle size={18}/></button><p className="checkout-privacy">Tes coordonnées et ton panier sont enregistrés dans la gestion privée de TAMNI pour préparer la commande, puis inclus dans ton message WhatsApp. Ils ne sont pas publiés sur le site.</p></form>
}
