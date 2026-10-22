import React from 'react';
import {ArrowUpRight} from 'lucide-react';
import {photoUrl} from './catalogStore';
import './catalogues.css';
export default function Catalogues({products}){
 const tshirt=products.find(p=>p.type==='tshirts'),hoodie=products.find(p=>p.type==='hoodies');
 const catalogues=[{tab:'tshirts',title:'T-shirts',description:'Les imprimés qui parlent pour toi.',photos:[tshirt]},{tab:'hoodies',title:'Hoodies',description:'Du caractère, jusque dans les détails.',photos:[hoodie]},{tab:'all',title:'T-shirts & Hoodies',description:'Toutes tes pièces, dans un seul catalogue.',photos:[tshirt,hoodie]}];
 return <section className="catalogues-section" id="catalogues" aria-labelledby="catalogues-title"><div className="catalogues-heading"><span className="eyebrow">TAMNI / NOS CATALOGUES</span><h2 id="catalogues-title">Choisis ton <em>univers.</em></h2><p>Trois façons de trouver ta prochaine pièce.</p></div><div className="catalogues-grid">{catalogues.map((c,i)=>{const url=new URL(location.href);url.search='';url.searchParams.set('tab',c.tab);url.hash='collection';return <a key={c.tab} className="catalogue-card" href={url.pathname+url.search+url.hash} aria-label={`Ouvrir le catalogue ${c.title}`}><div className={`catalogue-visual ${c.photos.length>1?'catalogue-duo':''}`}><span className="catalogue-number">0{i+1} / TAMNI</span>{c.photos.filter(Boolean).map(p=><img key={p.id} src={photoUrl(p)} alt={p.name} loading="lazy"/>)}</div><div className="catalogue-copy"><h3>{c.title}</h3><p>{c.description}</p><span>Ouvrir le catalogue <ArrowUpRight size={19}/></span></div></a>})}</div></section>
}
