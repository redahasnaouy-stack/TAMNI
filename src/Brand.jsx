import React from 'react';
import './brand.css';
export const brandLogoUrl=`${import.meta.env.BASE_URL}brand/tamni-logo.jpeg`;
export default function Brand({onClick}){return <a className="brand-lockup" href="#" aria-label="TAMNI accueil" onClick={onClick}><img src={brandLogoUrl} alt="Logo TAMNI" width="64" height="64"/><span><strong>TAMNI</strong><small>CUSTOM CLOTHING</small></span></a>}
