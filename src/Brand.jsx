import React from 'react';
import './brand.css';
export const brandLogoUrl=`${import.meta.env.BASE_URL}brand/tamni-logo.jpeg`;
export default function Brand({onClick,transparent=false}){return <a className={`brand-lockup${transparent?' transparent':''}`} href="#" aria-label="TAMNI accueil" onClick={onClick}><img src={transparent?`${import.meta.env.BASE_URL}brand/tamni-logo-transparent.png`:brandLogoUrl} alt="Logo TAMNI" width="64" height="64"/><span><strong>TAMNI</strong><small>CUSTOM CLOTHING</small></span></a>}
