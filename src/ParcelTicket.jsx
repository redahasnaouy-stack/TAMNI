import React from 'react';
import {createPortal} from 'react-dom';
import qrcode from 'qrcode-generator';
import {formatPrice} from './catalogStore';
import './parcel-ticket.css';

const website='https://www.tamnii.com/';
const qr=qrcode(0,'M');qr.addData(website);qr.make();
const qrSize=qr.getModuleCount();
const qrPath=Array.from({length:qrSize},(_,y)=>Array.from({length:qrSize},(_,x)=>qr.isDark(y,x)?`M${x+4},${y+4}h1v1h-1z`:'').join('')).join('');
function Ticket({order}){
 const paid=order.payment==='paid';
 const amount=paid?0:order.total;
 const date=new Date(order.createdAt).toLocaleDateString('fr-MA',{timeZone:'Africa/Casablanca'});
 return <article className="parcel-ticket" dir="ltr">
  <div className="parcel-ticket-brand">
   <div className="parcel-ticket-wordmark"><strong>TAMNI</strong><small>CUSTOM CLOTHING</small></div>
   <a className="parcel-ticket-qr" href={website} aria-label="QR : ouvrir le site TAMNI"><svg viewBox={`0 0 ${qrSize+8} ${qrSize+8}`} role="img" aria-label="QR du site TAMNI" shapeRendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d={qrPath} fill="#000"/></svg></a>
   <div className="parcel-ticket-reference"><b>{order.reference}</b><time dateTime={order.createdAt}>{date}</time></div>
  </div>
  <div className="parcel-ticket-columns">
   <section className="parcel-ticket-recipient" dir="rtl"><h2 className="parcel-ticket-bar">الزبون / CLIENT</h2><strong className="parcel-ticket-customer-name">{order.customer.name}</strong><b className="parcel-ticket-phone" dir="ltr">{order.customer.phone}</b><span className="parcel-ticket-city">{order.customer.city}</span><div className="parcel-ticket-sender"><b>TAMNI · 0617571113</b><span>www.tamnii.com</span></div></section>
   <section className="parcel-ticket-order"><h2 className="parcel-ticket-bar">المنتجات / ARTICLES</h2><ul className="parcel-ticket-items">{order.items.map((item,i)=><li key={i}><strong>{item.name}</strong><span><bdi>{item.size}</bdi> · <bdi>{item.color}</bdi> · Qté : {item.quantity}{item.embroidery?' · تطريز':''}</span>{item.embroidery&&item.text&&<small>{item.text}</small>}</li>)}</ul>
    <div className="parcel-ticket-payment"><span>{paid?'المبلغ المتبقي':order.payment==='refunded'?'المبلغ للمراجعة':'المبلغ للاستخلاص'}<small>{paid?'PAYÉ':order.payment==='refunded'?'REMBOURSÉ':'À ENCAISSER · CASH'}</small></span><strong>{formatPrice(amount)}</strong></div>

   </section>
  </div>
 </article>
}
export default function ParcelTicket({order}){return <><div className="parcel-ticket-preview"><p>معاينة بطاقة الطرد · 10 × 6 سم</p><Ticket order={order}/><small>فالطباعة اختار مقاس 100 × 60 مم وÉchelle 100 %، وحيد En-têtes et pieds de page.</small></div>{createPortal(<div className="parcel-print-root" aria-hidden="true"><Ticket order={order}/></div>,document.body)}</>}
