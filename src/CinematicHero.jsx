import React from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {photoUrl} from './catalogStore';
import './cinematic.css';
import {brandLogoUrl} from './Brand';
import {useLocale} from './i18n';
export default function CinematicHero({product}){
 const {t}=useLocale();
 return <section className="cinema" aria-labelledby="cinema-title">
  <div className="cinema-backdrop" aria-hidden="true">{product&&<img src={photoUrl(product)} alt="" fetchPriority="high"/>}</div>
  <div className="cinema-vignette"/><div className="cinema-glow"/><div className="cinema-grain" aria-hidden="true"/>
  <div className="cinema-meta"><span><i/> TAMNI / CUSTOM CLOTHING</span><span>{t('heroMeta')}</span></div>
  <div className="cinema-content"><span className="cinema-overline">{t('heroOverline')}</span><h1 id="cinema-title"><span lang="ar" dir="rtl">تامني</span></h1><p>{t('heroIntro')}</p><div className="cinema-actions"><a className="cinema-primary" href={`${import.meta.env.BASE_URL}?view=catalogues`}>SHOP NOW <ArrowUpRight size={18}/></a></div></div>
  <div className="cinema-brand"><img src={brandLogoUrl} alt="TAMNI — Custom Clothing" width="1254" height="1254" fetchPriority="high"/></div>
  <div className="cinema-bottom"><a href={`${import.meta.env.BASE_URL}?view=catalogues`}><span className="cinema-scroll"><ArrowDown size={14}/></span> {t('heroScroll')}</a><span lang="ar" dir="rtl">البس حكايتك.</span><span>01 / {t('heroBottom')}</span></div>
 </section>
}
