import React,{useState,useRef} from 'react';
import {MessageCircle,CreditCard} from 'lucide-react';
import {formatPrice} from './catalogStore';
import {whatsappNumber} from './catalog';
import './checkout.css';
import {recordCheckout} from './managementApi';
import {useLocale,getDictionary} from './i18n';
import {productName} from './productCopy';
export function DeliveryInfo({compact=false}){
 const {t}=useLocale();
 const content=<div><CreditCard size={21}/><h3>{t('cash')}</h3><p>{t('cashDescription')}</p></div>;
 return compact?<details className="checkout-delivery"><summary>{t('cash')}</summary><div>{content}</div></details>:<section id="livraison" className="delivery-section"><div><span className="eyebrow">{t('simple')}</span><h2>{t('cash')}</h2></div>{content}</section>
}
export function checkoutUrl(cart,customer,reference,locale='fr'){
 const d=getDictionary(locale);const money=n=>`${Number(n).toLocaleString(locale==='ar'?'ar-MA':locale==='en'?'en-GB':'fr-MA',{maximumFractionDigits:2})} ${d.currency}`;const color=v=>d[({Noir:'black',Blanc:'white',Marron:'brown',Beige:'beige',Bordeaux:'burgundy','Vert olive':'olive'})[v]]||v;
 const total=cart.reduce((n,x)=>n+x.product.price*x.quantity,0);
 const productLines=cart.map((x,i)=>[
  `${i+1}. ${x.product.translations?.[locale]?.label||({tshirts:d.tee,hoodies:d.hoodie,caps:d.cap}[x.product.type]||x.product.label)} — ${productName(x.product,locale)}`,
  `${d.size} : ${x.size==='Unique'?d.unique:x.size} · ${d.color} : ${color(x.color)} · ${d.quantity} : ${x.quantity}`,
  ...(x.embroidery?[`${d.embroideryMessage} : ${x.text?.trim()||d.toSpecify}`]:[])
 ].join('\n')).join('\n\n');
 const text=[
  `*${d.orderMessage}*${reference?`\n${d.reference} : ${reference}`:''}`,
  productLines,
  `${d.total} : ${money(total)}\n${d.payment} : ${d.cashMessage}`,
  `*${d.coordinates}*\n${d.customerMessage} : ${customer.name.trim()}\n${locale==='fr'?'Téléphone':d.phone} : ${customer.phone.trim()}\n${d.city} : ${customer.city.trim()}`
 ].join('\n\n');
 return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
export default function Checkout({cart,customer,setCustomer}){
 const {t,locale}=useLocale();
 const [error,setError]=useState(''),[saving,setSaving]=useState(false);const form=useRef(),attempt=useRef({signature:'',id:''});
 async function submit(e){e.preventDefault();setError('');let invalid='';if(customer.name.trim().length<2)invalid='name';else if(!/^(?:0[5-7]\d{8}|00212[5-7]\d{8}|\+[1-9]\d{7,14})$/.test(customer.phone.replace(/[\s().-]/g,'')))invalid='phone';else if(customer.city.trim().length<2)invalid='city';if(invalid){setError(invalid==='phone'?t('phoneError'):t('customerError'));form.current.elements.namedItem(invalid)?.focus();return}if(!cart.length||saving)return;
 const signature=JSON.stringify({cart:cart.map(x=>[x.product.id,x.size,x.color,x.quantity,x.embroidery,x.text]),customer});if(attempt.current.signature!==signature)attempt.current={signature,id:crypto.randomUUID()};
 const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;setSaving(true);let reference;
 try{const result=await recordCheckout(cart,customer,attempt.current.id);reference=result.reference;if(result.total!==cart.reduce((n,x)=>n+x.product.price*x.quantity,0)){popup?.close();setError(t('priceChanged'));return}}catch{setError(t('trackingError'))}finally{setSaving(false)}
 const url=checkoutUrl(cart,customer,reference,locale);if(popup)popup.location.href=url;else window.location.assign(url)}
 function update(field,value){setCustomer(c=>({...c,[field]:value}));setError('')}
 return <form ref={form} className="checkout-form" onSubmit={submit}><div className="checkout-form-title"><h3>{t('coordinates')}</h3><span>{t('threeInfos')}</span></div><label htmlFor="customer-name">{t('fullName')} <span aria-hidden="true">*</span></label><input id="customer-name" name="name" autoComplete="name" required minLength={2} maxLength={80} value={customer.name} onChange={e=>update('name',e.target.value)} placeholder={t('namePlaceholder')}/><label htmlFor="customer-phone">{t('phone')} <span aria-hidden="true">*</span></label><input id="customer-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} value={customer.phone} onChange={e=>update('phone',e.target.value)} placeholder={t('phonePlaceholder')}/><label htmlFor="customer-city">{t('city')} <span aria-hidden="true">*</span></label><input id="customer-city" name="city" autoComplete="address-level2" required minLength={2} maxLength={80} value={customer.city} onChange={e=>update('city',e.target.value)} placeholder={t('cityPlaceholder')}/>{error&&<p className="checkout-error" role="alert">{error}</p>}<DeliveryInfo compact/><button type="submit" className="btn dark" disabled={saving}>{saving?t('preparing'):t('confirmWhatsapp')} <MessageCircle size={18}/></button><p className="checkout-privacy">{t('privacy')}</p></form>
}
