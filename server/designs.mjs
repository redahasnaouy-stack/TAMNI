import {createHash} from 'node:crypto';
const maxBytes=2*1024*1024;
const types={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','application/pdf':'pdf'};
export async function designRequest({req,url,store,now,authenticate,reply,fail}){
 const method=req.method,id=url.searchParams.get('id');
 if(method==='POST'){
  if(req.headers.get('origin')&&req.headers.get('origin')!==url.origin)fail(403,'مصدر الطلب غير مسموح.');
  const raw=await req.text();if(raw.length>2900000)fail(413,'الملف كبير. الحد الأقصى 2 MB.');let input;try{input=JSON.parse(raw)}catch{fail(400,'صيغة غير صحيحة.');}
  if(!/^[a-f0-9-]{36}$/.test(input.requestId||''))fail(400,'مرجع غير صالح.');
  const customer=input.customer||{},clean=(v,max=80)=>typeof v==='string'?v.trim().slice(0,max):'';
  const name=clean(customer.name),phone=clean(customer.phone,25),city=clean(customer.city);
  if(name.length<2||city.length<2||!/^(?:0[5-7]\d{8}|00212[5-7]\d{8}|\+[1-9]\d{7,14})$/.test(phone.replace(/[\s().-]/g,'')))fail(400,'تأكد من الاسم، الهاتف والمدينة.');
  if(!['tee','hoodie','cap'].includes(input.product)||!(input.product==='cap'?['Unique']:['S','M','L','XL','XXL']).includes(input.size)||!['Noir','Blanc','Marron','Beige','other'].includes(input.color)||!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>20)fail(400,'اختيارات غير صالحة.');
  const f=input.file;if(!f||!types[f.type]||typeof f.base64!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(f.base64))fail(400,'ملف غير صالح.');
  const bytes=Buffer.from(f.base64,'base64');if(!bytes.length||bytes.length>maxBytes)fail(413,'الملف كبير. الحد الأقصى 2 MB.');
  const valid=f.type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):f.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:f.type==='image/webp'?bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP':bytes.toString('ascii',0,5)==='%PDF-';if(!valid)fail(400,'محتوى الملف غير صالح.');
  const key=`designs/${input.requestId}`,existing=await store.get(key,{type:'json'});if(existing)return reply({reference:existing.reference},200);
  const date=now(),ip=req.headers.get('x-nf-client-connection-ip');if(ip){const rateKey=`design-limits/${date.toISOString().slice(0,10)}/${createHash('sha256').update(ip).digest('hex')}`,record=await store.getWithMetadata(rateKey,{type:'json'});if((record?.data.count||0)>=20)fail(429,'وصلت للحد اليومي. تواصل معنا عبر واتساب.');const updated=await store.setJSON(rateKey,{count:(record?.data.count||0)+1},record?{onlyIfMatch:record.etag}:{onlyIfNew:true});if(!updated.modified)fail(429,'حاول من جديد بعد قليل.');}
  const file={name:`design-${input.requestId}.${types[f.type]}`,originalName:clean(f.name,120),type:f.type,size:bytes.length};
  await store.setJSON(`design-files/${input.requestId}`,{...file,base64:f.base64},{onlyIfNew:true});
  const order={id:input.requestId,reference:`TD-${date.toISOString().slice(0,10).replaceAll('-','')}-${input.requestId.slice(0,8).toUpperCase()}`,customer:{name,phone,city},product:input.product,size:input.size,color:input.color,quantity:input.quantity,notes:clean(input.notes,1000),file,status:'new',createdAt:date.toISOString()};
  await store.setJSON(key,order,{onlyIfNew:true});return reply({reference:order.reference},201);
 }
 const user=await authenticate();
 if(method==='GET'&&id){if(!/^[a-f0-9-]{36}$/.test(id))fail(400,'مرجع غير صالح.');const file=await store.get(`design-files/${id}`,{type:'json'});if(!file)fail(404,'الملف غير موجود.');return new Response(Buffer.from(file.base64,'base64'),{headers:{'Content-Type':file.type,'Content-Disposition':`attachment; filename="${file.name}"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}
 if(method==='GET'){const designs=[];for await(const page of store.list({prefix:'designs/',paginate:true})){for(const item of page.blobs){const record=await store.getWithMetadata(item.key,{type:'json'});if(record)designs.push({...record.data,revision:record.etag});}}return reply({designs:designs.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});}
 if(method==='PATCH'){if(user.role==='viewer')fail(403,'صلاحية القراءة فقط.');if(!/^[a-f0-9-]{36}$/.test(id||''))fail(400,'مرجع غير صالح.');let input;try{input=await req.json()}catch{fail(400,'صيغة غير صحيحة.');}if(!['new','contacted','confirmed','completed','cancelled'].includes(input.status))fail(400,'حالة غير صالحة.');const record=await store.getWithMetadata(`designs/${id}`,{type:'json'});if(!record)fail(404,'الطلب غير موجود.');if(input.revision!==record.etag)fail(409,'الطلب تبدل. حدّث اللائحة.');const next={...record.data,status:input.status,updatedAt:now().toISOString()},saved=await store.setJSON(`designs/${id}`,next,{onlyIfMatch:record.etag});if(!saved.modified)fail(409,'الطلب تبدل. حدّث اللائحة.');return reply({design:{...next,revision:saved.etag}});}
 fail(405,'عملية غير متاحة.');
}
