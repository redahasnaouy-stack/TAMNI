import React from 'react';
import {ArrowUpRight} from 'lucide-react';
import {useLocale} from './i18n';
import {productName} from './productCopy';
import {photoUrl} from './catalogStore';
import './new-arrivals.css';
import ProductChoices from './ProductChoices';
export default function NewArrivals({products,onAdd}){
 const {locale,t,money,label}=useLocale();const items=products.filter(p=>p.active!==false&&p.newArrival===true).sort((a,b)=>(a.newArrivalOrder||99)-(b.newArrivalOrder||99));if(!items.length)return null;
 return <section className="new-arrivals" aria-labelledby="new-arrivals-title"><div className="new-arrivals-heading"><div><span className="eyebrow">TAMNI / {t('newArrivalKicker')}</span><h2 id="new-arrivals-title">{t('newArrivalsTitle')}</h2></div><p>{t('newArrivalsIntro')}</p></div><div className="new-arrivals-grid">{items.map((p,i)=><article className={`new-arrival-card ${i===0?'new-arrival-lead':''}`} key={p.id}><a className="new-arrival-link" href={`${import.meta.env.BASE_URL}?tab=${encodeURIComponent(p.type)}#product-${p.id}`} aria-label={`${t('discoverNewArrival')} ${productName(p,locale)}`}><div className="new-arrival-visual"><span className="new-arrival-badge">{t('newArrivalBadge')}</span><span className="new-arrival-index">{String(i+1).padStart(2,'0')} / TAMNI</span><img src={photoUrl(p)} alt={productName(p,locale)} loading="lazy"/></div><div className="new-arrival-caption"><div><span>{label(p)}</span><h3>{productName(p,locale)}</h3></div><strong>{money(p.price)}</strong><ArrowUpRight size={22}/></div></a><div className="new-arrival-options"><ProductChoices product={p} onAdd={onAdd}/></div></article>)}</div></section>
}
