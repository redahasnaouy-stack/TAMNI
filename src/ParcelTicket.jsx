import React from 'react';
import {createPortal} from 'react-dom';
import {formatPrice} from './catalogStore';
import './parcel-ticket.css';

function Ticket({order}){
 const paid=order.payment==='paid';
 const amount=paid?0:order.total;
 const date=new Date(order.createdAt).toLocaleDateString('fr-MA',{timeZone:'Africa/Casablanca'});
 return <article className="parcel-ticket" dir="rtl">
  <div className="parcel-ticket-brand"><strong dir="ltr">TAMNI</strong><span>بطاقة الطرد <small>COLIS / LIVRAISON</small></span></div>
  <div className="parcel-ticket-reference"><b dir="ltr">{order.reference}</b><time dateTime={order.createdAt} dir="ltr">{date}</time></div>
  <section className="parcel-ticket-recipient"><span className="parcel-ticket-caption">المرسل إليه / DESTINATAIRE</span><h2>{order.customer.name}</h2><div><b dir="ltr">{order.customer.phone}</b><strong>{order.customer.city}</strong></div></section>
  <table className="parcel-ticket-items"><thead><tr><th>المنتج / ARTICLE</th><th>الكمية</th></tr></thead><tbody>{order.items.map((item,i)=><tr key={i}><td><strong>{item.name}</strong><span><bdi>{item.size}</bdi> · <bdi>{item.color}</bdi>{item.embroidery?' · تطريز':''}</span>{item.embroidery&&item.text&&<small>{item.text}</small>}</td><td>{item.quantity}</td></tr>)}</tbody></table>
  <div className="parcel-ticket-totals"><div><span>المنتجات</span><b dir="ltr">{formatPrice(order.subtotal)}</b></div><div><span>التوصيل</span><b dir="ltr">{order.shippingFeeConfirmed?formatPrice(order.shippingFee):'يُؤكد مع الزبون'}</b></div></div>
  <section className="parcel-ticket-payment"><span>{paid?'المبلغ المتبقي':order.payment==='refunded'?'المبلغ للمراجعة':'المبلغ للاستخلاص'}<small>{paid?'PAYÉ':order.payment==='refunded'?'REMBOURSÉ':'À ENCAISSER · CASH'}</small></span><strong dir="ltr">{formatPrice(amount)}</strong></section>
  {!order.shippingFeeConfirmed&&<p className="parcel-ticket-note">ثمن التوصيل مازال غير مؤكد؛ المبلغ أعلاه دون توصيل مؤكد.</p>}
  <div className="parcel-ticket-footer"><strong dir="ltr">www.tamnii.com</strong><span dir="ltr">TAMNI · +212 617 571 113</span></div>
 </article>
}
export default function ParcelTicket({order}){return <><div className="parcel-ticket-preview"><p>معاينة بطاقة الطرد · 10 × 15 سم</p><Ticket order={order}/><small>فالطباعة اختار مقاس 100 × 150 مم وÉchelle 100 %، وحيد En-têtes et pieds de page.</small></div>{createPortal(<div className="parcel-print-root" aria-hidden="true"><Ticket order={order}/></div>,document.body)}</>}
