export const repository='redahasnaouy-stack/TAMNI';
export const formatPrice=n=>`${Number(n).toLocaleString('fr-MA',{maximumFractionDigits:2})} DH`;
function validateTranslations(value){
 if(value===undefined)return;
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Traductions invalides.');
 for(const [locale,fields] of Object.entries(value)){
  if(!['fr','en','ar'].includes(locale)||!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Langue de traduction invalide.');
  for(const [key,text] of Object.entries(fields))if(!['name','description','tag','label'].includes(key)||typeof text!=='string'||text.length>(key==='description'?1000:140))throw new Error('Texte de traduction invalide ou trop long.');
 }
}
export function validateCatalog(value){
 if(!Array.isArray(value)||value.length>100)throw new Error('Le catalogue doit contenir au maximum 100 produits.');
 const ids=new Set();
 for(const p of value){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(p.id)||ids.has(p.id))throw new Error('Identifiant produit invalide ou dupliqué.');ids.add(p.id);
  if(typeof p.name!=='string'||!p.name.trim()||p.name.length>140)throw new Error('Nom produit obligatoire (140 caractères maximum).');
  if(typeof p.type!=='string'||!/^[a-z0-9-]{1,80}$/.test(p.type)||p.type==='all')throw new Error('Catégorie invalide.');
  if(typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<=0||p.price>100000)throw new Error('Le prix doit être compris entre 0,01 et 100 000 DH.');
  if(!Array.isArray(p.sizes)||!p.sizes.length||p.sizes.some(s=>typeof s!=='string'||s.length>15))throw new Error('Sélectionne au moins une taille.');
  if(!Array.isArray(p.colors)||!p.colors.length||p.colors.some(c=>typeof c!=='string'||c.length>30))throw new Error('Sélectionne au moins une couleur.');
  if(typeof p.image!=='string'||!( /^products\/[a-zA-Z0-9._-]+$/.test(p.image)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(p.image)))throw new Error('Image invalide : utilise une photo JPG, PNG ou WEBP.');
  if(p.newArrival!==undefined&&typeof p.newArrival!=='boolean')throw new Error('Option nouveauté invalide.');
  if(p.newArrivalOrder!==undefined&&(!Number.isInteger(p.newArrivalOrder)||p.newArrivalOrder<1||p.newArrivalOrder>99))throw new Error('L’ordre de nouveauté doit être compris entre 1 et 99.');
  validateTranslations(p.translations);
  if(p.description!=null&&(typeof p.description!=='string'||p.description.length>1000))throw new Error('Description trop longue.');
 }
 return value;
}
export function photoUrl(p){return p.image?.startsWith('data:')?p.image:`${import.meta.env.BASE_URL}${p.image||`products/${p.id}.jpeg`}`}
export async function githubRequest(token,path,options={}){
 let response;try{response=await fetch(`https://api.github.com/repos/${repository}/${path}`,{...options,cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...options.headers}})}catch{throw new Error('Connexion à GitHub impossible. Le changement n’a pas été publié. Vérifie ta connexion et réessaie.')}
 if(!response.ok){
  let data={};try{data=await response.json()}catch{}
  const detail=[data.message,...(Array.isArray(data.errors)?data.errors.map(e=>typeof e==='string'?e:e.message||[e.field,e.code].filter(Boolean).join(': ')):[])].filter(Boolean).join(' · ').replaceAll(token,'[masqué]').slice(0,450);
  if(response.status===401||response.status===403)throw new Error('Accès refusé. Vérifie le jeton, le dépôt TAMNI et la permission Contents : lecture et écriture.');
  if(path==='git/refs/heads/main'&&[409,422].includes(response.status)&&/not a fast forward|fast.forward|reference update failed/i.test(detail)){
   const error=new Error('La branche a été mise à jour pendant l’enregistrement. Réessaie sans fermer le formulaire.');error.code='BRANCH_MOVED';throw error;
  }
  throw new Error(`GitHub a refusé l’opération (${response.status}, ${path.split('?')[0]}). ${detail||'Réessaie en conservant le formulaire ouvert.'}`);
 }
 return response.json();
}
export function validateCategories(value){
 if(!Array.isArray(value)||!value.length||value.length>30)throw new Error('Prévois entre 1 et 30 catégories.');
 const ids=new Set();
 for(const c of value){
  if(!c||typeof c.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(c.id)||ids.has(c.id))throw new Error('Identifiant catégorie invalide ou dupliqué.');ids.add(c.id);
  if(typeof c.name!=='string'||!c.name.trim()||c.name.length>80)throw new Error('Nom de catégorie obligatoire (80 caractères maximum).');
  validateTranslations(c.translations);
  if(c.description!=null&&(typeof c.description!=='string'||c.description.length>240))throw new Error('Description de catégorie trop longue.');
  if((c.group!==undefined&&typeof c.group!=='boolean')||(c.id==='all'&&!c.group)||(c.group&&c.id!=='all'))throw new Error('Le catalogue complet doit garder son identifiant all.');
  if(c.image!=null&&(typeof c.image!=='string'||(c.image&&!(/^products\/[a-zA-Z0-9._-]+$/.test(c.image)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(c.image)))))throw new Error('Photo de catégorie invalide.');
 }
 return value;
}
export function productCategories(categories,products=[]){
 const list=categories.filter(c=>!c.group);const known=new Set(list.map(c=>c.id));
 for(const p of products)if(!known.has(p.type)){list.push({id:p.type,name:{tshirts:'T-shirts',hoodies:'Hoodies',caps:'Casquettes'}[p.type]||p.type});known.add(p.type)}
 return list;
}
async function loadDocument(token,ref,file,validate){
 const data=await githubRequest(token,`contents/public/${file}?ref=${encodeURIComponent(ref)}`);
 if(!data.content)throw new Error('Fichier trop volumineux pour cette méthode de lecture.');
 const bytes=Uint8Array.from(atob(data.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
 return {items:validate(JSON.parse(new TextDecoder().decode(bytes))),sha:data.sha};
}
export const loadAdminCatalog=(token,ref='main')=>loadDocument(token,ref,'catalog.json',validateCatalog);
export const loadAdminCategories=(token,ref='main')=>loadDocument(token,ref,'categories.json',validateCategories);
export const publishCatalog=(token,items,expectedSha)=>publishDocument(token,items,expectedSha,'catalog.json',validateCatalog);
export const publishCategories=(token,items,expectedSha)=>publishDocument(token,items,expectedSha,'categories.json',validateCategories);
async function publishDocument(token,items,expectedSha,file,validate){
 validate(items);
 const content=JSON.stringify(items,null,2)+'\n';
 if(new TextEncoder().encode(content).length>900000)throw new Error('Fichier trop volumineux : réduis le poids des nouvelles photos. Maximum 900 Ko.');
 for(let attempt=0;attempt<2;attempt++){
  const ref=await githubRequest(token,'git/ref/heads/main');
  const current=await loadDocument(token,ref.object.sha,file,validate);
  if(current.sha!==expectedSha)throw new Error('Le catalogue a été modifié ailleurs. Tes saisies sont conservées dans le formulaire. Recharge le catalogue avant de reprendre la modification.');
  if(JSON.stringify(current.items)===JSON.stringify(items))return current.sha;
  const head=await githubRequest(token,`git/commits/${ref.object.sha}`);
  const post=(path,body)=>githubRequest(token,path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const blob=await post('git/blobs',{content,encoding:'utf-8'});
  const tree=await post('git/trees',{base_tree:head.tree.sha,tree:[`public/${file}`,`docs/${file}`].map(path=>({path,mode:'100644',type:'blob',sha:blob.sha}))});
  const commit=await post('git/commits',{message:'Update TAMNI '+(file==='categories.json'?'categories':'catalogue')+' from admin',tree:tree.sha,parents:[ref.object.sha]});
  try{
   await githubRequest(token,'git/refs/heads/main',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sha:commit.sha,force:false})});
   return blob.sha;
  }catch(error){if(error.code!=='BRANCH_MOVED'||attempt===1)throw error}
 }
}
