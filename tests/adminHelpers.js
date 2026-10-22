import {expect} from '@playwright/test';
import fs from 'node:fs';
export const categories=JSON.parse(fs.readFileSync('public/categories.json','utf8'));
export const catalog=JSON.parse(fs.readFileSync('public/catalog.json','utf8'));
export async function mockGithub(page,{denied=false,conflict=false,denyWrite=false,branchRace=false,validationError=false}={}){
 await page.route('**/.netlify/functions/tamni-api?**',route=>{const r=new URL(route.request().url()).searchParams.get('resource');return route.fulfill({json:r==='session'?{user:{login:'redahasnaouy-stack',name:'TAMNI',role:'owner'}}:r==='orders'?{orders:[]}:r==='visits'?{visits:[]}:{members:[{login:'redahasnaouy-stack',role:'owner'}]}})});
 let saved=null,committed=false,liveCatalog=structuredClone(catalog),liveCategories=structuredClone(categories),categoryCommitted=false,currentFile='catalog.json',patchAttempts=0;
 await page.route('https://api.github.com/repos/redahasnaouy-stack/TAMNI/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(denied||(denyWrite&&req.method()!=='GET'))return route.fulfill({status:403,json:{message:'Forbidden'}});
  if(path.includes('/contents/')){const exact=new URL(req.url()).searchParams.get('ref')!=='main',isCategories=path.endsWith('/categories.json');return route.fulfill({json:{sha:exact&&conflict?'changed':isCategories?(categoryCommitted?'new-blob':'categories-original'):(committed?'new-blob':'original'),content:Buffer.from(JSON.stringify(isCategories?liveCategories:liveCatalog)).toString('base64')}})}
  if(path.endsWith('/git/ref/heads/main'))return route.fulfill({json:{object:{sha:'head-original'}}});
  if(path.endsWith('/git/commits/head-original'))return route.fulfill({json:{tree:{sha:'tree-original'}}});
  if(path.endsWith('/git/blobs')){if(validationError)return route.fulfill({status:422,json:{message:'Validation Failed',errors:[{message:'Example validation detail'}]}});saved=JSON.parse(req.postDataJSON().content);return route.fulfill({json:{sha:'new-blob'}})}
  if(path.endsWith('/git/trees')){const body=req.postDataJSON();expect(body.base_tree).toBe('tree-original');currentFile=body.tree[0].path.split('/').at(-1);expect(['catalog.json','categories.json']).toContain(currentFile);expect(body.tree.map(x=>x.path)).toEqual([`public/${currentFile}`,`docs/${currentFile}`]);return route.fulfill({json:{sha:'new-tree'}})}
  if(path.endsWith('/git/commits')){expect(req.postDataJSON().parents).toEqual(['head-original']);return route.fulfill({json:{sha:'new-commit'}})}
  if(path.endsWith('/git/refs/heads/main')){patchAttempts++;if(branchRace&&patchAttempts===1)return route.fulfill({status:422,json:{message:'Update is not a fast forward'}});expect(req.postDataJSON()).toEqual({sha:'new-commit',force:false});if(currentFile==='categories.json'){categoryCommitted=true;liveCategories=structuredClone(saved)}else{committed=true;liveCatalog=structuredClone(saved)}return route.fulfill({json:{object:{sha:'new-commit'}}})}
  throw new Error(`Unexpected route ${path}`);
 });
 return {saved:()=>saved,categoriesSaved:()=>liveCategories,categoryCommitted:()=>categoryCommitted,committed:()=>committed,patchAttempts:()=>patchAttempts};
}
export async function login(page,{products=true}={}){await page.goto('/#admin');await page.getByLabel('Jeton d’accès GitHub').fill('test-only-not-a-real-token');await page.getByRole('button',{name:'Se connecter',exact:true}).click();if(products)await page.getByRole('button',{name:/^المنتجات/}).click()}
