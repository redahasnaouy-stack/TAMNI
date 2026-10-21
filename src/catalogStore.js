export const repository='redahasnaouy-stack/TAMNI';
export const formatPrice=n=>`${Number(n).toLocaleString('fr-MA',{maximumFractionDigits:2})} DH`;
export function validateCatalog(value){
 if(!Array.isArray(value)||value.length>100)throw new Error('Le catalogue doit contenir au maximum 100 produits.');
 const ids=new Set();
 for(const p of value){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(p.id)||ids.has(p.id))throw new Error('Identifiant produit invalide ou dupliqué.');ids.add(p.id);
  if(typeof p.name!=='string'||!p.name.trim()||p.name.length>140)throw new Error('Nom produit obligatoire (140 caractères maximum).');
  if(!['tshirts','hoodies','caps'].includes(p.type))throw new Error('Catégorie invalide.');
  if(typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<=0||p.price>100000)throw new Error('Le prix doit être compris entre 0,01 et 100 000 DH.');
  if(!Array.isArray(p.sizes)||!p.sizes.length||p.sizes.some(s=>typeof s!=='string'||s.length>15))throw new Error('Sélectionne au moins une taille.');
  if(!Array.isArray(p.colors)||!p.colors.length||p.colors.some(c=>typeof c!=='string'||c.length>30))throw new Error('Sélectionne au moins une couleur.');
  if(typeof p.image!=='string'||!( /^products\/[a-zA-Z0-9._-]+$/.test(p.image)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(p.image)))throw new Error('Image invalide : utilise une photo JPG, PNG ou WEBP.');
  if(p.description!=null&&(typeof p.description!=='string'||p.description.length>1000))throw new Error('Description trop longue.');
 }
 return value;
}
export function photoUrl(p){return p.image?.startsWith('data:')?p.image:`${import.meta.env.BASE_URL}${p.image||`products/${p.id}.jpeg`}`}
export async function githubRequest(token,path,options={}){
 let response;try{response=await fetch(`https://api.github.com/repos/${repository}/${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...options.headers}})}catch{throw new Error('Connexion à GitHub impossible. Le changement n’a pas été publié. Vérifie ta connexion et réessaie.')}
 if(!response.ok){if(response.status===401||response.status===403)throw new Error('Accès refusé. Vérifie le jeton, le dépôt TAMNI et la permission Contents : lecture et écriture.');if(response.status===409||response.status===422)throw new Error('Le dépôt a changé. Recharge le catalogue avant de publier.');throw new Error(`GitHub ne peut pas terminer cette opération (${response.status}).`)}
 return response.json();
}
export async function loadAdminCatalog(token,ref="main"){
 const file=await githubRequest(token,`contents/public/catalog.json?ref=${encodeURIComponent(ref)}`);
 if(!file.content)throw new Error('Catalogue trop volumineux pour cette méthode de lecture.');
 const bytes=Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
 return {items:validateCatalog(JSON.parse(new TextDecoder().decode(bytes))),sha:file.sha};
}
export async function publishCatalog(token,items,expectedSha){
 validateCatalog(items);
 const content=JSON.stringify(items,null,2)+'\n';
 if(new TextEncoder().encode(content).length>900000)throw new Error('Catalogue trop volumineux : réduis le poids des nouvelles photos. Maximum 900 Ko.');
 const ref=await githubRequest(token,'git/ref/heads/main');
 const current=await loadAdminCatalog(token,ref.object.sha);
 if(current.sha!==expectedSha)throw new Error('Le catalogue a été modifié ailleurs. Recharge-le pour éviter d’écraser les changements.');
 const head=await githubRequest(token,`git/commits/${ref.object.sha}`);
 const post=(path,body)=>githubRequest(token,path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const blob=await post('git/blobs',{content,encoding:'utf-8'});
 const tree=await post('git/trees',{base_tree:head.tree.sha,tree:['public/catalog.json','docs/catalog.json'].map(path=>({path,mode:'100644',type:'blob',sha:blob.sha}))});
 const commit=await post('git/commits',{message:'Update TAMNI catalogue from admin',tree:tree.sha,parents:[ref.object.sha]});
 await githubRequest(token,'git/refs/heads/main',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sha:commit.sha,force:false})});
 return blob.sha;
}
