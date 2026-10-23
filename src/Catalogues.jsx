import React from 'react';
import {ArrowUpRight} from 'lucide-react';
import {photoUrl} from './catalogStore';
import './catalogues.css';
import {useLocale} from './i18n';
export default function Catalogues({products,categories}){
 const {t,locale,category}=useLocale();
 const catalogues=[...categories].sort((a,b)=>Number(!!b.group)-Number(!!a.group)).map(c=>{const matches=products.filter(p=>c.group||p.type===c.id);const photos=c.image?[c]:c.group?[matches.find(p=>p.type==='tshirts')||matches[0],matches.find(p=>p.type==='hoodies')||matches[1]].filter((p,i,a)=>p&&a.findIndex(x=>x?.id===p.id)===i):[matches[0]].filter(Boolean);return {...c,tab:c.id,title:category(c),photos}});
 return <section className="catalogues-section" id="catalogues" aria-labelledby="catalogues-title"><div className="catalogues-heading"><span className="eyebrow">TAMNI / {t('catalogues')}</span><h2 id="catalogues-title">{t('chooseUniverse')}</h2><p>{t('catalogueIntro')}</p></div><div className="catalogues-grid">{catalogues.map((c,i)=>{const url=new URL(location.href);url.search='';url.searchParams.set('tab',c.tab);url.hash='collection';return <a key={c.tab} className="catalogue-card" href={url.pathname+url.search+url.hash} aria-label={`${t('openCatalogue')} ${c.title}`}><div className={`catalogue-visual ${c.photos.length>1?'catalogue-duo':''}`}><span className="catalogue-number">0{i+1} / TAMNI</span>{!c.photos.length&&<span className="catalogue-placeholder">TAMNI</span>}{c.photos.filter(Boolean).map(p=><img key={p.id||c.id} src={photoUrl(p)} alt={c.title} loading="lazy"/>)}</div><div className="catalogue-copy"><h3>{c.title}</h3><p>{c.translations?.[locale]?.description||({all:t('allDescription'),tshirts:t('teeDescription'),hoodies:t('hoodDescription')}[c.id]||c.description)}</p><span>{t('openCatalogue')} <ArrowUpRight size={19}/></span></div></a>})}</div></section>
}
