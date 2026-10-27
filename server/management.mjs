import {designRequest} from './designs.mjs';
import {createHash,randomUUID} from 'node:crypto';
const owner='redahasnaouy-stack';
export const statuses={confirmation:['pending','confirmed','cancelled'],payment:['unpaid','paid','refunded'],shipping:['pending','preparing','shipped','delivered','returned']};
const dateKey=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Casablanca',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class HttpError extends Error{constructor(status,message){super(message);this.status=status}}
const fail=(status,message)=>{throw new HttpError(status,message)};
const string=(value,max=100)=>typeof value==='string'?value.trim().slice(0,max):'';
async function body(req){const text=await req.text();if(text.length>30000)fail(413,'حجم الطلب كبير.');try{return JSON.parse(text)}catch{fail(400,'صيغة الطلب غير صحيحة.')}}
async function list(store,prefix){const result=[];for await(const page of store.list({prefix,paginate:true})){for(const batch of Array.from({length:Math.ceil(page.blobs.length/20)},(_,i)=>page.blobs.slice(i*20,i*20+20))){const records=await Promise.all(batch.map(x=>store.getWithMetadata(x.key,{type:'json'})));result.push(...records.filter(Boolean).map(x=>({...x.data,revision:x.etag})))}}return result}
async function identity(req,store,fetcher){const token=req.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];if(!token)fail(401,'خاص تسجيل الدخول.');let response;try{response=await fetcher('https://api.github.com/user',{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'TAMNI-admin'},signal:AbortSignal.timeout(8000)})}catch{fail(503,'تعذر التحقق من الحساب. حاول من جديد.')}if(!response.ok)fail(401,'توكن GitHub غير صالح أو منتهي.');const user=await response.json(),login=String(user.login||'').toLowerCase();if(login===owner)return {login,name:user.name||user.login,role:'owner',avatar:user.avatar_url};const member=await store.get(`team/${login}`,{type:'json'});if(!member)fail(403,'هاد الحساب ما عندوش صلاحية الدخول للإدارة.');return {login,name:user.name||user.login,role:member.role,avatar:user.avatar_url}}
function orderData(input,catalog,now){
 const customer={name:string(input.customer?.name,80),phone:string(input.customer?.phone,25),city:string(input.customer?.city,80)};
 if(customer.name.length<2||customer.city.length<2||!/^(?:0[5-7]\d{8}|00212[5-7]\d{8}|\+[1-9]\d{7,14})$/.test(customer.phone.replace(/[\s().-]/g,'')))fail(400,'الاسم، الهاتف والمدينة ضروريين.');
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>40)fail(400,'خاص اختيار منتج.');
 const items=input.items.map(x=>{const p=catalog.find(p=>p.id===x.id&&p.active!==false);if(!p||!p.sizes.includes(x.size)||!p.colors.includes(x.color)||!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>20)fail(400,'المنتج أو المقاس أو اللون تبدل. حدّث السلة.');return {id:p.id,name:p.name,label:p.label,size:x.size,color:x.color,quantity:x.quantity,price:p.price,embroidery:!!x.embroidery,text:string(x.text,80)}});
 const subtotal=items.reduce((n,x)=>n+x.price*x.quantity,0);
 return {customer,items,subtotal,total:subtotal,shippingFee:0,shippingFeeConfirmed:true,confirmation:'pending',payment:'unpaid',shipping:'pending',createdAt:now.toISOString(),date:dateKey(now),updatedAt:now.toISOString()};
}
export function createManagementHandler({getStore,catalog,fetcher=fetch,now=()=>new Date()}){
 return async req=>{try{
  const url=new URL(req.url),resource=url.searchParams.get('resource')||'health',method=req.method;
  if(resource==='health'&&method==='GET'){const store=getStore();await store.get('system/health',{type:'json'});return reply({ready:true})}
  const store=getStore();
  if(resource==='designs')return await designRequest({req,url,store,now,authenticate:()=>identity(req,store,fetcher),reply,fail});
  if(method==='POST'&&['orders','visits'].includes(resource)&&!req.headers.has('authorization')){
   const origin=req.headers.get('origin');if(origin&&origin!==url.origin)fail(403,'مصدر الطلب غير مسموح.');
   const input=await body(req);
   if(resource==='visits'){
    if(!/^[a-f0-9-]{36}$/.test(input.session||''))fail(400,'جلسة غير صالحة.');
    const date=dateKey(now()),key=`visits/${date}/${createHash('sha256').update(input.session).digest('hex')}`,previous=await store.getWithMetadata(key,{type:'json'}),device=['mobile','tablet','desktop'].includes(input.device)?input.device:'desktop';
    const data={date,device:previous?.data.device||device,views:(previous?.data.views||0)+1};await store.setJSON(key,data,previous?{onlyIfMatch:previous.etag}:{onlyIfNew:true});return reply({recorded:true});
   }
   if(!/^[a-f0-9-]{36}$/.test(input.requestId||''))fail(400,'مرجع المحاولة غير صالح.');
   const key=`orders/${input.requestId}`,existing=await store.get(key,{type:'json'});if(existing)return reply({reference:existing.reference,total:existing.total});
   const date=now(),order={...orderData(input,catalog,date),id:input.requestId,reference:`TM-${dateKey(date).replaceAll('-','')}-${input.requestId.slice(0,6).toUpperCase()}`,source:'website'};
   const saved=await store.setJSON(key,order,{onlyIfNew:true});const result=saved.modified?order:await store.get(key,{type:'json'});return reply({reference:result.reference,total:result.total},201);
  }
  const user=await identity(req,store,fetcher);
  if(resource==='session'&&method==='GET')return reply({user});
  if(resource==='orders'){
   if(method==='GET')return reply({orders:(await list(store,'orders/')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
   if(user.role==='viewer')fail(403,'هاد الحساب عندو غير صلاحية القراءة.');
   if(method==='POST'){const input=await body(req),id=randomUUID(),date=now(),order={...orderData(input,catalog,date),id,reference:`TM-${dateKey(date).replaceAll('-','')}-${id.slice(0,6).toUpperCase()}`,source:'admin'};await store.setJSON(`orders/${id}`,order,{onlyIfNew:true});return reply({order},201)}
   if(method==='PATCH'){
    const id=url.searchParams.get('id');if(!/^[a-f0-9-]{36}$/.test(id||''))fail(400,'طلب غير صالح.');
    const record=await store.getWithMetadata(`orders/${id}`,{type:'json'});if(!record)fail(404,'الطلب ما بقاش موجود.');const input=await body(req);if(input.revision!==record.etag)fail(409,'الطلب تبدل فجلسة أخرى. حدّث اللائحة.');
    const next={...record.data};for(const field of Object.keys(statuses)){if(input[field]!==undefined){if(!statuses[field].includes(input[field]))fail(400,'حالة غير صالحة.');next[field]=input[field]}}
    if(input.shippingFee!==undefined)fail(400,'أثمنة المنتجات نهائية. ما يمكنش تزيد مصاريف على الطلب.');
    next.updatedAt=now().toISOString();const saved=await store.setJSON(`orders/${id}`,next,{onlyIfMatch:record.etag});if(!saved.modified)fail(409,'الطلب تبدل. حدّث اللائحة.');return reply({order:{...next,revision:saved.etag}});
   }
  }
  if(resource==='visits'&&method==='GET')return reply({visits:await list(store,'visits/')});
  if(resource==='team'){
   if(user.role!=='owner')fail(403,'غير صاحب المتجر يقدر يدبر الفريق.');
   if(method==='GET')return reply({members:[{login:owner,role:'owner'},...await list(store,'team/')]});
   const input=await body(req),login=string(input.login,39).toLowerCase();if(!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/.test(login)||login===owner)fail(400,'اسم حساب GitHub غير صالح.');
   if(method==='POST'){if(!['editor','viewer'].includes(input.role))fail(400,'صلاحية غير صالحة.');await store.setJSON(`team/${login}`,{login,role:input.role,createdAt:now().toISOString()});return reply({saved:true})}
   if(method==='DELETE'){await store.delete(`team/${login}`);return reply({removed:true})}
  }
  fail(404,'الخدمة غير موجودة.');
 }catch(e){return reply({error:e instanceof HttpError?e.message:'خدمة التخزين غير متاحة دابا. تأكد من تفعيل Netlify Blobs بعد النشر.'},e instanceof HttpError?e.status:503)}};
}
