import React from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {photoUrl} from './catalogStore';
import './cinematic.css';
import {brandLogoUrl} from './Brand';
export default function CinematicHero({product}){
 return <section className="cinema" aria-labelledby="cinema-title">
  <div className="cinema-backdrop" aria-hidden="true">{product&&<img src={photoUrl(product)} alt="" fetchPriority="high"/>}</div>
  <div className="cinema-vignette"/><div className="cinema-glow"/><div className="cinema-grain" aria-hidden="true"/>
  <div className="cinema-meta"><span><i/> TAMNI / CUSTOM CLOTHING</span><span>IMAGINÉ AU MAROC · PORTÉ À TA FAÇON</span></div>
  <div className="cinema-content"><span className="cinema-overline">PLUS QU’UNE PIÈCE. UNE SIGNATURE.</span><h1 id="cinema-title">Laisse ton<br/><em>empreinte.</em></h1><p>Ton histoire mérite de se porter.<br/>Streetwear et créations qui ne ressemblent qu’à toi.</p><div className="cinema-actions"><a className="cinema-primary" href="#collection">Découvrir la collection <ArrowUpRight size={18}/></a><a className="cinema-secondary" href="#personnaliser">Créer ma pièce <ArrowUpRight size={16}/></a></div></div>
  <div className="cinema-brand"><img src={brandLogoUrl} alt="TAMNI — Custom Clothing" width="1254" height="1254" fetchPriority="high"/></div>
  <div className="cinema-bottom"><a href="#collection"><span className="cinema-scroll"><ArrowDown size={14}/></span> FAIS DÉFILER POUR EXPLORER</a><span lang="ar" dir="rtl">البس حكايتك.</span><span>01 / L’EXPRESSION COMMENCE ICI</span></div>
 </section>
}
