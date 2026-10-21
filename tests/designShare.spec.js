import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const photo=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aoccAAAAASUVORK5CYII=','base64');
async function upload(page){await page.goto('/');await page.locator('#design-upload').setInputFiles({name:'design-original.png',mimeType:'image/png',buffer:photo});await expect(page.getByAltText('Aperçu de votre design')).toBeVisible()}
test('partage natif : inclure le vrai fichier, ses octets originaux et les détails du projet',async({page})=>{
 await upload(page);await page.getByLabel('Le support').selectOption('Hoodie oversize');await page.getByLabel('La taille souhaitée').selectOption('XL');await page.getByPlaceholder('Emplacement du print, quantité, couleur…').fill('Print au dos');
 await page.evaluate(()=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files.length===1&&data.files[0] instanceof File});
  Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__share={text:data.text,files:await Promise.all(data.files.map(async file=>({name:file.name,type:file.type,bytes:Array.from(new Uint8Array(await file.arrayBuffer()))})))}}});
 });
 await page.getByRole('button',{name:'Envoyer mon design (fichier)'}).click();await expect(page.getByRole('status')).toContainText('Vérifie le destinataire');const shared=await page.evaluate(()=>window.__share);expect(shared.files).toHaveLength(1);expect(shared.files[0].bytes).toEqual([...photo]);expect(shared.files[0].name).toBe('design-original.png');expect(shared.files[0].type).toBe('image/png');expect(shared.text).toBe('*Création TAMNI*\nSupport : Hoodie oversize\nTaille : XL · Couleur : Noir\nDétails : Print au dos');expect(shared.text).toBe(await page.getByLabel('Le texte qui accompagne ton design').inputValue());
});
test('sans partage natif : expliquer la pièce jointe et proposer le fichier original téléchargeable',async({page})=>{
 await upload(page);await page.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});window.__opened=false;window.open=()=>{window.__opened=true}});await page.getByRole('button',{name:'Envoyer mon design (fichier)'}).click();
 const manual=page.getByRole('region',{name:'Envoyer le fichier manuellement'});await expect(manual).toContainText('ta photo doit être jointe séparément');expect(await page.evaluate(()=>window.__opened)).toBe(false);
 const waiting=page.waitForEvent('download');await manual.getByRole('link',{name:'Télécharger le fichier sélectionné'}).click();const download=await waiting;expect(download.suggestedFilename()).toBe('design-original.png');expect(await fs.readFile(await download.path())).toEqual(photo);
 await expect(page.getByRole('status')).toHaveCount(0);
});
test('annuler le partage ne prétend pas avoir envoyé le design et conserve le fichier',async({page})=>{
 await upload(page);await page.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError')}})});await page.getByRole('button',{name:'Envoyer mon design (fichier)'}).click();await expect(page.getByRole('status')).toContainText('Partage annulé');await expect(page.getByAltText('Aperçu de votre design')).toBeVisible();await expect(page.getByRole('button',{name:'Envoyer mon design (fichier)'})).toBeEnabled();
});

test('texte associé à la photo : choix actualisés et copie exacte pour sa légende',async({page})=>{
 await upload(page);await page.getByLabel('Le support').selectOption('T-shirt oversize');await page.getByLabel('La taille souhaitée').selectOption('M');await page.getByLabel('La couleur souhaitée').selectOption('Noir');await expect(page.getByLabel('Le texte qui accompagne ton design')).toHaveValue('*Création TAMNI*\nSupport : T-shirt oversize\nTaille : M · Couleur : Noir');
 await page.getByLabel('La couleur souhaitée').selectOption('Marron');await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__caption=text}}})});await page.getByRole('button',{name:'Copier les détails'}).click();await expect(page.getByRole('status')).toContainText('Détails copiés');expect(await page.evaluate(()=>window.__caption)).toBe('*Création TAMNI*\nSupport : T-shirt oversize\nTaille : M · Couleur : Marron');
});
